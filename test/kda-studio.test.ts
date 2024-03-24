import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Buckets } from '../lib/buckets';
import { KinesisAnalyticsRole } from '../lib/iam-entities';
import { KdaStudio } from '../lib/kda-studio';
import { GlueDatabase } from '../lib/metadata';

describe("Tests the creation of IAM roles", () => {
    const app = new cdk.App();
        // WHEN
    const stack = new cdk.Stack(app, 'TestStack');
    const requiredBuckets = new Buckets(stack, 'Required');
    const eeAssetsBucketName = 'ee-assets-prod-us-east-1';
    const glueDatabase = new GlueDatabase(stack, 'Glue')
    const kinesisAnalyticsRole = new KinesisAnalyticsRole(stack, 'KDA', {
        taxiTripDataSetBucket: requiredBuckets.taxiTripDataSet,
        curatedDataSetBucket: requiredBuckets.curatedDataSet,
        eeAssetsBucketName: eeAssetsBucketName
    })
    new KdaStudio(stack, 'KdaStudio', {
        glueDatabase: glueDatabase.entity,
        serviceRole: kinesisAnalyticsRole.entity,
        eeAssetsBucketName: eeAssetsBucketName
    })
    const template = Template.fromStack(stack);
    test('Checks the number of the KDA studio application', () => {
        const kdaV2ApplicationResources = template.findResources('AWS::KinesisAnalyticsV2::Application');
        let kdaV2ApplicationNumber = 0
        Object.keys(kdaV2ApplicationResources).forEach(key => {
            if (kdaV2ApplicationResources[key].Type === "AWS::KinesisAnalyticsV2::Application") {
                kdaV2ApplicationNumber++;
            }
        });
        expect(kdaV2ApplicationNumber).toBe(1);
    })
    test('Checks the KDA studio application.', () => {
        // THEN
        template.hasResourceProperties('AWS::KinesisAnalyticsV2::Application', Match.objectEquals({
            "ApplicationConfiguration": {
              "FlinkApplicationConfiguration": {
                "ParallelismConfiguration": {
                  "ConfigurationType": "CUSTOM",
                  "Parallelism": 4,
                  "ParallelismPerKPU": 1
                }
              },
              "ZeppelinApplicationConfiguration": {
                "CatalogConfiguration": {
                  "GlueDataCatalogConfiguration": {
                    "DatabaseARN": {
                      "Fn::Join": [
                        "",
                        [
                          "arn:",
                          {
                            "Ref": "AWS::Partition"
                          },
                          ":glue:",
                          {
                            "Ref": "AWS::Region"
                          },
                          ":",
                          {
                            "Ref": "AWS::AccountId"
                          },
                          ":database/",
                          {
                            "Ref": "GlueDatabaseCD4C42E8"
                          }
                        ]
                      ]
                    }
                  }
                },
                "CustomArtifactsConfiguration": [
                  {
                    "ArtifactType": "DEPENDENCY_JAR",
                    "MavenReference": {
                      "ArtifactId": "flink-sql-connector-kinesis_2.12",
                      "GroupId": "org.apache.flink",
                      "Version": "1.13.2"
                    }
                  },
                  {
                    "ArtifactType": "DEPENDENCY_JAR",
                    "MavenReference": {
                      "ArtifactId": "flink-connector-kafka_2.12",
                      "GroupId": "org.apache.flink",
                      "Version": "1.13.2"
                    }
                  },
                  {
                    "ArtifactType": "DEPENDENCY_JAR",
                    "MavenReference": {
                      "ArtifactId": "aws-msk-iam-auth",
                      "GroupId": "software.amazon.msk",
                      "Version": "1.1.0"
                    }
                  },
                  {
                    "ArtifactType": "DEPENDENCY_JAR",
                    "S3ContentLocation": {
                      "BucketARN": "arn:aws:s3:::ee-assets-prod-us-east-1",
                      "FileKey": "modules/599e7c685a254c2b892cdbf58a7b3b4f/v1/flink-sql-connector-elasticsearch7_2.11-1.13.2.jar"
                    }
                  }
                ]
              }
            },
            "ApplicationDescription": "Kinesis Flink Sql Demo",
            "ApplicationMode": "INTERACTIVE",
            "ApplicationName": {
              "Fn::Join": [
                "",
                [
                  "KDA-studio-1-",
                  {
                    "Ref": "AWS::StackName"
                  }
                ]
              ]
            },
            "RuntimeEnvironment": "ZEPPELIN-FLINK-2_0",
            "ServiceExecutionRole": {
              "Fn::GetAtt": [
                "KDAKinesisAnalyticsRole2818507F",
                "Arn"
              ]
            }
          }))
    });
})