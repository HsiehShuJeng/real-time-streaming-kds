import * as glue from '@aws-cdk/aws-glue-alpha';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kds from 'aws-cdk-lib/aws-kinesis';
import * as kinesisanalytics from 'aws-cdk-lib/aws-kinesisanalyticsv2';
import * as kfh from 'aws-cdk-lib/aws-kinesisfirehose';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface KdaStudioProps {
    readonly serviceRole: iam.IRole;
    readonly glueDatabase: glue.Database;
    readonly eeAssetsBucketName: string;
    readonly eeAssetsBUcketPrefix?: string;
    readonly applicationName?: string;
}

export class KdaStudio extends Construct {
    public readonly entity: kinesisanalytics.CfnApplication;
    constructor(scope: Construct, id: string, props: KdaStudioProps) {
        super(scope, id);
        const eeAssetsBucketName = props.eeAssetsBucketName ?? 'ee-assets-prod-us-east-1';
        const eeAssetsBUcketPrefix = props.eeAssetsBUcketPrefix ?? 'modules/599e7c685a254c2b892cdbf58a7b3b4f/v1/';
        const applicationName = props.applicationName ?? `KDA-studio-1-${cdk.Aws.STACK_NAME}`
        this.entity = new kinesisanalytics.CfnApplication(this, 'Application', {
            applicationName: applicationName,
            applicationDescription: 'Kinesis Flink Sql Demo',
            runtimeEnvironment: 'ZEPPELIN-FLINK-2_0',
            applicationMode: 'INTERACTIVE',
            serviceExecutionRole: props.serviceRole.roleArn,
            applicationConfiguration: {
                flinkApplicationConfiguration: {
                    parallelismConfiguration: {
                        configurationType: 'CUSTOM',
                        parallelism: 4,
                        parallelismPerKpu: 1
                    }
                },
                zeppelinApplicationConfiguration: {
                    catalogConfiguration: {
                        glueDataCatalogConfiguration: {
                            databaseArn: props.glueDatabase.databaseArn
                        }
                    },
                    customArtifactsConfiguration: [
                        {
                            artifactType: 'DEPENDENCY_JAR',
                            mavenReference: {
                                groupId: 'org.apache.flink',
                                artifactId: 'flink-sql-connector-kinesis_2.12',
                                version: '1.13.2'
                            }
                        },
                        {
                            artifactType: 'DEPENDENCY_JAR',
                            mavenReference: {
                                groupId: 'org.apache.flink',
                                artifactId: 'flink-connector-kafka_2.12',
                                version: '1.13.2'
                            }
                        },
                        {
                            artifactType: 'DEPENDENCY_JAR',
                            mavenReference: {
                                groupId: 'software.amazon.msk',
                                artifactId: 'aws-msk-iam-auth',
                                version: '1.1.0'
                            }
                        },
                        {
                            artifactType: 'DEPENDENCY_JAR',
                            s3ContentLocation: {
                                bucketArn: `arn:aws:s3:::${eeAssetsBucketName}`,
                                fileKey: `${eeAssetsBUcketPrefix}flink-sql-connector-elasticsearch7_2.11-1.13.2.jar` 
                            }
                        }
                    ]
                }
            }
        });
        new cdk.CfnOutput(this, 'KdaStudioApplicationName', {value: this.entity.applicationName!, description: 'The name of the KDA Studio application.'})
        new cdk.CfnOutput(this, 'KdaStudioApplicatioRef', {value: this.entity.ref, description: 'The ARN of the KDA Studio application.'})
    }
}


interface BaseKinesisDataStreamPorps{
    readonly streamName: string;
}
export class BaseKinesisDataStream extends Construct {
    public readonly entity: kds.Stream;
    constructor(scope: Construct, id: string, props?: BaseKinesisDataStreamPorps) {
        super(scope, id);
        const streamName: string = props?.streamName ?? 'input_stream';
        if (!props?.streamName){
            console.log('ℹ️ `streamName` as property for BaseKinesisDataStream is not specified, using default stream name: `input_stream`.')
        }
        this.entity = new kds.Stream(this, 'Stream', {
            streamName: streamName,
            streamMode: kds.StreamMode.ON_DEMAND
        });
        new cdk.CfnOutput(this, 'KinesisDataStreamArn', {value: this.entity.streamArn, description: 'The ARN of the Kinesis Data Stream.'});
    }
}

interface Lab3KinesisFirehoseProps {
    sourceKinesisStream: kds.IStream;
    destinationBucket: s3.IBucket;
    deliveryStreamName?: string,
}
export class Lab3KinesisFirehose extends Construct {
    public readonly entity: kfh.CfnDeliveryStream;
    constructor(scope: Construct, id: string, props: Lab3KinesisFirehoseProps) {
        super(scope, id);
        const deliveryStreamName = props.deliveryStreamName ?? 'nyc-taxi-trips';
        if (!props.deliveryStreamName){
            console.log('ℹ️ `deliveryStreamName` as property for Lab3KinesisFirehose is not specified, using default delivery stream name: `nyc-taxi-trips`.')
        }
        // Enter a unique name for the Delivery stream name, eg, nyc-taxi-trips. Select data transformation Enabled. Select NYCTaxiTrips-DataTransformation Lambda. The Lambda will add new column called source in the incoming data and populate with NYCTAXI value.
        this.entity = new kfh.CfnDeliveryStream(this, 'DeliveryStream', {
            deliveryStreamName: deliveryStreamName,
            kinesisStreamSourceConfiguration: {
                kinesisStreamArn: props.sourceKinesisStream.streamArn,
            },
            s3DestinationConfiguration: {
                bucketArn: props.destinationBucket.bucketArn,
            }

        })
    }
}