import * as glue from '@aws-cdk/aws-glue-alpha';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kinesisanalytics from 'aws-cdk-lib/aws-kinesisanalyticsv2';
import { Construct } from 'constructs';

interface KdaStudioProps {
    readonly serviceRole: iam.IRole;
    readonly glueDatabase: glue.Database;
    readonly eeAssetsBucketName: string;
    readonly eeAssetsBUcketPrefix?: string;
}

export class KdaStudio extends Construct {
    public readonly entity: kinesisanalytics.CfnApplication;
    constructor(scope: Construct, id: string, props: KdaStudioProps) {
        super(scope, id);
        const eeAssetsBucketName = props.eeAssetsBucketName ?? 'ee-assets-prod-us-east-1';
        const eeAssetsBUcketPrefix = props.eeAssetsBUcketPrefix ?? 'modules/599e7c685a254c2b892cdbf58a7b3b4f/v1/';
        this.entity = new kinesisanalytics.CfnApplication(this, 'Application', {
            applicationName: `KDA-studio-1-${cdk.Aws.STACK_NAME}`,
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