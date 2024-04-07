import * as glue from '@aws-cdk/aws-glue-alpha';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kds from 'aws-cdk-lib/aws-kinesis';
import * as kinesisanalytics from 'aws-cdk-lib/aws-kinesisanalyticsv2';
import * as kfh from 'aws-cdk-lib/aws-kinesisfirehose';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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
    glueTable: glue.S3Table,
    transformingFunction: lambda.IFunction,
    dataFirehoseIamRoleName?: string,
    deliveryStreamName?: string,
}
/**
 * Represents a Kinesis Firehose delivery stream that ingests data from a Kinesis Data Stream, transforms the data using a Lambda function, and stores the transformed data in an S3 bucket.
 *
 * @param scope - The parent construct.
 * @param id - The ID of the construct.
 * @param props - The properties for the Kinesis Firehose delivery stream.
 */
export class Lab3KinesisFirehose extends Construct {
     /**
     * The Kinesis Firehose delivery stream.
     */
    public readonly entity: kfh.CfnDeliveryStream;
    constructor(scope: Construct, id: string, props: Lab3KinesisFirehoseProps) {
        super(scope, id);
        const deliveryStreamName = props.deliveryStreamName ?? 'nyc-taxi-trips';
        if (!props.deliveryStreamName){
            console.log('ℹ️ `deliveryStreamName` as property for Lab3KinesisFirehose is not specified, using default delivery stream name: `nyc-taxi-trips`.')
        }
        const timestamp = new Date().getTime();
        const randomInfix = '0lKoC';
        const defaultDeliveryStreamRole = new iam.Role(this, 'Role', {
            assumedBy: new iam.ServicePrincipal('firehose.amazonaws.com'),
            roleName: `KinesisFirehoseServiceRole-KDS-S3-0-${cdk.Aws.REGION}-${timestamp}`,
            inlinePolicies: {
                [`KinesisFirehoseServicePolicy-KDS-S3-${randomInfix}-${cdk.Aws.REGION}`]: new iam.PolicyDocument({
                    assignSids: true,
                    minimize: true,
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'glue:GetTable',
                                'glue:GetTableVersion',
                                'glue:GetTableVersions'
                            ],
                            resources: [
                                `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:catalog`,
                                `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:database/${props.glueTable.database.databaseName}`,
                                `arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${props.glueTable.database.databaseName}/${props.glueTable.tableName}`
                            ]
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kafka:GetBootstrapBrokers',
                                'kafka:DescribeCluster',
                                'kafka:DescribeClusterV2',
                                'kafka-cluster:Connect'
                            ],
                            resources: [
                                `arn:aws:kafka:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:cluster/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%`
                            ]
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kafka-cluster:DescribeTopic',
                                'kafka-cluster:DescribeTopicDynamicConfiguration',
                                'kafka-cluster:ReadData'
                            ],
                            resources: [
                                `arn:aws:kafka:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:topic/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%/%FIREHOSE_POLICY_TEMPLATE_PLACE`
                            ]
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kafka-cluster:DescribeGroup'
                            ],
                            resources: [
                                `arn:aws:kafka:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:group/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%/*`
                            ]
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'lambda:InvokeFunction',
                                'lambda:GetFunctionConfiguration'
                            ],
                            resources: [
                                `${props.transformingFunction.functionArn}`
                            ]
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kms:GenerateDataKey',
                                'kms:Decrypt'
                            ],
                            resources: [
                                `arn:aws:kms:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:key/%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%`
                            ],
                            conditions: {
                                StringEquals: {
                                    'kms:ViaService': `s3.${cdk.Aws.REGION}.amazonaws.com`
                                },
                                StringLike: {
                                    'kms:EncryptionContext:aws:s3:arn': [
                                        'arn:aws:s3:::%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%/*',
                                        'arn:aws:s3:::%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%'
                                    ]
                                }
                            }
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'logs:PutLogEvents'
                            ],
                            resources: [
                                `arn:aws:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:/aws/kinesisfirehose/KDS-S3-${randomInfix}:log-stream:*`,
                                `arn:aws:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:%FIREHOSE_POLICY_TEMPLATE_PLACEHOLDER%:log-stream:*`
                            ]
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kinesis:DescribeStream',
                                'kinesis:GetShardIterator',
                                'kinesis:GetRecords',
                                'kinesis:ListShards'
                            ],
                            resources: [
                                props.sourceKinesisStream.streamArn
                            ]
                        }),
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kms:Decrypt'
                            ],
                            resources: [
                                kms.Alias.fromAliasName(this, 'KmsKeyAlias', 'alias/aws/kinesis').keyArn
                            ],
                            conditions: {
                                StringEquals: {
                                    'kms:ViaService': `kinesis.${cdk.Aws.REGION}.amazonaws.com`
                                },
                                StringLike: {
                                    'kms:EncryptionContext:aws:kinesis:arn': props.sourceKinesisStream.streamArn,
                                }
                            }
                        })
                    ]
                })
            }
        });
        const deliveryStreamType = 'KinesisStreamAsSource';
        const kinesisStreamSourceConfiguration: kfh.CfnDeliveryStream.KinesisStreamSourceConfigurationProperty = {
            kinesisStreamArn: props.sourceKinesisStream.streamArn,
            roleArn: defaultDeliveryStreamRole.roleArn
        }
        if (deliveryStreamType === 'KinesisStreamAsSource'){
            if (!kinesisStreamSourceConfiguration){
                console.log('⚠️ `kinesisStreamSourceConfiguration` needs to be specified since `deliveryStreamType` is \'KinesisStreamAsSource\'')
            }
        }
        const deliveryStreamRole = props.deliveryStreamName ? iam.Role.fromRoleArn(this, 'DeliveryStreamRole', `arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:role/${props.deliveryStreamName}`): defaultDeliveryStreamRole;
        this.entity = new kfh.CfnDeliveryStream(this, 'DeliveryStream', {
            deliveryStreamName: deliveryStreamName,
            deliveryStreamType: 'KinesisStreamAsSource',
            kinesisStreamSourceConfiguration: kinesisStreamSourceConfiguration,
            extendedS3DestinationConfiguration: {
                roleArn: deliveryStreamRole.roleArn,
                bucketArn: props.destinationBucket.bucketArn,
                bufferingHints: {
                    sizeInMBs: 128,
                    intervalInSeconds: 60
                },
                customTimeZone: 'Asia/Taipei',
                prefix: 'nyctaxitrips/year=!{timestamp:YYYY}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/',
                errorOutputPrefix: 'nyctaxitripserror/!{firehose:error-output-type}/year=!{timestamp:YYYY}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/',
                dataFormatConversionConfiguration: {
                    enabled: true,
                    inputFormatConfiguration: {
                        deserializer: {
                            openXJsonSerDe: {}
                        }
                    },
                    outputFormatConfiguration: {
                        serializer: {
                            parquetSerDe: {
                                writerVersion: 'V2',
                            }
                        }
                    },
                    schemaConfiguration: {
                        region: cdk.Aws.REGION,
                        databaseName: props.glueTable.database.databaseName,
                        tableName: props.glueTable.tableName,
                        roleArn: defaultDeliveryStreamRole.roleArn
                    }
                },
                processingConfiguration: {
                    enabled: true,
                    processors: [
                        {
                            type: 'Lambda',
                            parameters: [
                                {
                                    parameterName: 'LambdaArn',
                                    parameterValue: props.transformingFunction.functionArn,
                                }
                            ]
                        }
                    ]
                }
            }
        })

        new cdk.CfnOutput(this, 'DeliveryStreamArn', {value: this.entity.attrArn, exportName: 'DeliveryStreamArn'})
    }
}