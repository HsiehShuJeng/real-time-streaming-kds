import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Buckets } from '../lib/buckets';
import { KdsConsumerRole, KinesisAnalyticsRole, StartKdaLambdaRole } from '../lib/iam-entities';
describe("Tests the creation of IAM roles", () => {
    const app = new cdk.App();
        // WHEN
    const stack = new cdk.Stack(app, 'TestStack');
    const requiredBuckets = new Buckets(stack, 'RequiredBuckets');
    new KinesisAnalyticsRole(stack, 'KinesisAnalyticsRole', {
        curatedDataSetBucket: requiredBuckets.curatedDataSet,
        taxiTripDataSetBucket: requiredBuckets.taxiTripDataSet
    });
    new KdsConsumerRole(stack, 'KdsConsumerRole')
    new StartKdaLambdaRole(stack, 'KDALambda', {
        functionName: `StartKDA-${cdk.Aws.STACK_NAME}`
    })
    const template = Template.fromStack(stack);
    test('Checks the number of IAM roles', () => {
        const iamResources = template.findResources('AWS::IAM::Role');
        let iamRoleNumber = 0
        Object.keys(iamResources).forEach(key => {
            if (iamResources[key].Type === "AWS::IAM::Role") {
                iamRoleNumber++;
            }
        });
        expect(iamRoleNumber).toBe(3);
    })
    test('Checks the KDA role', () => {
        // THEN
        template.hasResourceProperties('AWS::IAM::Role', Match.objectEquals({
            "AssumeRolePolicyDocument": {
                "Statement": [
                    {
                        "Action": "sts:AssumeRole",
                        "Effect": "Allow",
                        "Principal": {
                            "Service": "kinesisanalytics.amazonaws.com"
                        }
                    }
                ],
                "Version": "2012-10-17"
            },
            "ManagedPolicyArns": [
                {
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            {
                                "Ref": "AWS::Partition"
                            },
                            ":iam::aws:policy/AmazonS3ReadOnlyAccess"
                        ]
                    ]
                }
            ],
            "Policies": [
                {
                    "PolicyDocument": {
                        "Statement": [
                            {
                                "Action": [
                                    "ec2:DescribeVpcs",
                                    "ec2:DescribeDhcpOptions",
                                    "ec2:DescribeSubnets",
                                    "ec2:DescribeSecurityGroups"
                                ],
                                "Effect": "Allow",
                                "Resource": "*",
                                "Sid": "ReadOnlySid"
                            },
                            {
                                "Action": [
                                    "logs:CreateLogGroup",
                                    "logs:CreateLogStream",
                                    "logs:PutLogEvents",
                                    "logs:AssociateKmsKey"
                                ],
                                "Effect": "Allow",
                                "Resource": [
                                    "arn:aws:logs:*:*:/aws-glue/*",
                                    "arn:aws:logs:*:*:log-group/aws/kinesis-analytics/*"
                                ],
                                "Sid": "LogGroupSid"
                            },
                            {
                                "Action": [
                                    "glue:GetConnection",
                                    "glue:GetTable",
                                    "glue:GetTables",
                                    "glue:CreateTable",
                                    "glue:UpdateTable",
                                    "glue:GetUserDefinedFunction",
                                    "glue:GetPartitions",
                                    "glue:DeleteTable",
                                    "glue:GetDatabase",
                                    "glue:GetDatabases"
                                ],
                                "Effect": "Allow",
                                "Resource": "*",
                                "Sid": "GlueTableSid"
                            },
                            {
                                "Action": [
                                    "kinesis:DescribeStreamConsumer",
                                    "kinesis:SubscribeToShard"
                                ],
                                "Effect": "Allow",
                                "Resource": {
                                    "Fn::Join": [
                                        "",
                                        [
                                            "arn:aws:kinesis:",
                                            {
                                                "Ref": "AWS::Region"
                                            },
                                            ":",
                                            {
                                                "Ref": "AWS::AccountId"
                                            },
                                            ":stream/",
                                            {
                                                "Ref": "AWS::StackName"
                                            },
                                            "-KDAKinesisStreamName/consumer/*"
                                        ]
                                    ]
                                },
                                "Sid": "KinesisEfoConsumer"
                            },
                            {
                                "Action": [
                                    "kinesis:GetShardIterator",
                                    "kinesis:GetRecords",
                                    "kinesis:PutRecords",
                                    "kinesis:DescribeStream",
                                    "kinesis:DescribeStreamSummary",
                                    "kinesis:RegisterStreamConsumer",
                                    "kinesis:DeregisterStreamConsumer"
                                ],
                                "Effect": "Allow",
                                "Resource": {
                                    "Fn::Join": [
                                        "",
                                        [
                                            "arn:aws:kinesis:",
                                            {
                                                "Ref": "AWS::Region"
                                            },
                                            ":",
                                            {
                                                "Ref": "AWS::AccountId"
                                            },
                                            ":stream/input-stream"
                                        ]
                                    ]
                                },
                                "Sid": "KinesisStreamSid"
                            },
                            {
                                "Action": "kinesis:*",
                                "Effect": "Allow",
                                "Resource": "*",
                                "Sid": "KinesisStreamListShardsID"
                            },
                            {
                                "Action": "s3:*",
                                "Effect": "Allow",
                                "Resource": [
                                    {
                                        "Fn::GetAtt": [
                                            "RequiredBucketsTaxiTripDataSetA1CE66AA",
                                            "Arn"
                                        ]
                                    },
                                    {
                                        "Fn::Join": [
                                            "",
                                            [
                                                {
                                                    "Fn::GetAtt": [
                                                        "RequiredBucketsTaxiTripDataSetA1CE66AA",
                                                        "Arn"
                                                    ]
                                                },
                                                "/*"
                                            ]
                                        ]
                                    },
                                    {
                                        "Fn::GetAtt": [
                                            "RequiredBucketsCuratedDataSet1BA3E91E",
                                            "Arn"
                                        ]
                                    },
                                    {
                                        "Fn::Join": [
                                            "",
                                            [
                                                {
                                                    "Fn::GetAtt": [
                                                        "RequiredBucketsCuratedDataSet1BA3E91E",
                                                        "Arn"
                                                    ]
                                                },
                                                "/*"
                                            ]
                                        ]
                                    }
                                ],
                                "Sid": "S3DataAccessSid"
                            },
                            {
                                "Action": "kinesisanalytics:DescribeApplication",
                                "Effect": "Allow",
                                "Resource": {
                                    "Fn::Join": [
                                        "",
                                        [
                                            "arn:aws:kinesisanalytics:",
                                            {
                                                "Ref": "AWS::Region"
                                            },
                                            ":",
                                            {
                                                "Ref": "AWS::AccountId"
                                            },
                                            ":application/KDA-studio-1-*"
                                        ]
                                    ]
                                },
                                "Sid": "KinesisAnalyticsSid"
                            },
                            {
                                "Action": [
                                    "s3:GetObject",
                                    "s3:GetObjectVersion"
                                ],
                                "Effect": "Allow",
                                "Resource": [
                                    "arn:aws:s3:::ee-assets-prod-us-east-1/",
                                    "arn:aws:s3:::ee-assets-prod-us-east-1/*"
                                ],
                                "Sid": "S3AssetsBucket"
                            }
                        ],
                        "Version": "2012-10-17"
                    },
                    "PolicyName": "KinesisAnalyticsSid"
                }
            ],
            "RoleName": {
                "Fn::Join": [
                    "",
                    [
                        "Kinesis-analytics-KDA-",
                        {
                            "Ref": "AWS::StackName"
                        }
                    ]
                ]
            }
        }))
    });
    test('Checks the KDA starting Lambda role', () =>{
        template.findResources('AWS::IAM::Role', Match.objectEquals({
            "AssumeRolePolicyDocument": {
              "Statement": [
                {
                  "Action": "sts:AssumeRole",
                  "Effect": "Allow",
                  "Principal": {
                    "Service": "lambda.amazonaws.com"
                  }
                }
              ],
              "Version": "2012-10-17"
            },
            "Path": "/",
            "Policies": [
              {
                "PolicyDocument": {
                  "Statement": [
                    {
                      "Action": "logs:CreateLogGroup",
                      "Effect": "Allow",
                      "Resource": {
                        "Fn::Join": [
                          "",
                          [
                            "arn:aws:logs:",
                            {
                              "Ref": "AWS::Region"
                            },
                            ":",
                            {
                              "Ref": "AWS::AccountId"
                            },
                            ":*"
                          ]
                        ]
                      },
                      "Sid": "0"
                    },
                    {
                      "Action": [
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                      ],
                      "Effect": "Allow",
                      "Resource": {
                        "Fn::Join": [
                          "",
                          [
                            "arn:aws:logs:",
                            {
                              "Ref": "AWS::Region"
                            },
                            ":",
                            {
                              "Ref": "AWS::AccountId"
                            },
                            ":log-group:/aws/lambda/StartKDA-*"
                          ]
                        ]
                      },
                      "Sid": "1"
                    },
                    {
                      "Action": "kinesisanalytics:StartApplication",
                      "Effect": "Allow",
                      "Resource": {
                        "Fn::Join": [
                          "",
                          [
                            "arn:aws:kinesisanalytics:",
                            {
                              "Ref": "AWS::Region"
                            },
                            ":",
                            {
                              "Ref": "AWS::AccountId"
                            },
                            ":application/KDA-studio-*"
                          ]
                        ]
                      },
                      "Sid": "2"
                    },
                    {
                      "Action": "lambda:InvokeFunction",
                      "Effect": "Allow",
                      "Resource": {
                        "Fn::Join": [
                          "",
                          [
                            "arn:",
                            {
                              "Ref": "AWS::Partition"
                            },
                            ":lambda:",
                            {
                              "Ref": "AWS::Region"
                            },
                            ":",
                            {
                              "Ref": "AWS::AccountId"
                            },
                            ":function:StartKDA-",
                            {
                              "Ref": "AWS::StackName"
                            }
                          ]
                        ]
                      },
                      "Sid": "3"
                    }
                  ],
                  "Version": "2012-10-17"
                },
                "PolicyName": "LambdaFunctionPolicy"
              }
            ],
            "RoleName": {
              "Fn::Join": [
                "",
                [
                  "KDA-Lambda-",
                  {
                    "Ref": "AWS::StackName"
                  }
                ]
              ]
            }
          }))
    })
    test('Checks the KDS consumer role', () =>{
        template.hasResourceProperties('AWS::IAM::Role', Match.objectEquals({
            "AssumeRolePolicyDocument": {
                "Statement": [
                    {
                        "Action": "sts:AssumeRole",
                        "Effect": "Allow",
                        "Principal": {
                            "Service": "lambda.amazonaws.com"
                        }
                    }
                ],
                "Version": "2012-10-17"
            },
            "ManagedPolicyArns": [
                {
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            {
                                "Ref": "AWS::Partition"
                            },
                            ":iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole"
                        ]
                    ]
                },
                {
                    "Fn::Join": [
                        "",
                        [
                            "arn:",
                            {
                                "Ref": "AWS::Partition"
                            },
                            ":iam::aws:policy/service-role/AWSLambdaDynamoDBExecutionRole"
                        ]
                    ]
                }
            ],
            "Path": "/",
            "Policies": [
                {
                    "PolicyDocument": {
                        "Statement": [
                            {
                                "Action": "logs:CreateLogGroup",
                                "Effect": "Allow",
                                "Resource": {
                                    "Fn::Join": [
                                        "",
                                        [
                                            "arn:aws:logs:",
                                            {
                                                "Ref": "AWS::Region"
                                            },
                                            ":",
                                            {
                                                "Ref": "AWS::AccountId"
                                            },
                                            ":*"
                                        ]
                                    ]
                                },
                                "Sid": "0"
                            },
                            {
                                "Action": [
                                    "logs:CreateLogStream",
                                    "logs:PutLogEvents"
                                ],
                                "Effect": "Allow",
                                "Resource": {
                                    "Fn::Join": [
                                        "",
                                        [
                                            "arn:aws:logs:",
                                            {
                                                "Ref": "AWS::Region"
                                            },
                                            ":",
                                            {
                                                "Ref": "AWS::AccountId"
                                            },
                                            ":log-group:/aws/lambda/NYCTaxiTrips-DataTransformation-*:*"
                                        ]
                                    ]
                                },
                                "Sid": "1"
                            },
                            {
                                "Action": [
                                    "dynamodb:PutItem",
                                    "dynamodb:UpdateItem",
                                    "dynamodb:UpdateTable"
                                ],
                                "Effect": "Allow",
                                "Resource": {
                                    "Fn::Join": [
                                        "",
                                        [
                                            "arn:aws:dynamodb:",
                                            {
                                                "Ref": "AWS::Region"
                                            },
                                            ":",
                                            {
                                                "Ref": "AWS::AccountId"
                                            },
                                            ":table/kinesisAggs"
                                        ]
                                    ]
                                },
                                "Sid": "2"
                            },
                            {
                                "Action": [
                                    "dynamodb:ListBackups",
                                    "dynamodb:ListContributorInsights",
                                    "dynamodb:ListExports",
                                    "dynamodb:ListGlobalTables",
                                    "dynamodb:ListTables"
                                ],
                                "Effect": "Allow",
                                "Resource": "*",
                                "Sid": "3"
                            }
                        ],
                        "Version": "2012-10-17"
                    },
                    "PolicyName": "LambdaFunctionPolicy"
                }
            ],
            "RoleName": {
                "Fn::Join": [
                    "",
                    [
                        "KinesisLambdaConsumerRole-",
                        {
                            "Ref": "AWS::StackName"
                        }
                    ]
                ]
            }
        }))
    })
})