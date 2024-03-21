import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Buckets } from '../lib/buckets';
import { KinesisAnalyticsRole } from '../lib/iam-entities';
test('KDA role created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new cdk.Stack(app, 'TestStack');
    const requiredBuckets = new Buckets(stack, 'RequiredBuckets');
    new KinesisAnalyticsRole(stack, 'KinesisAnalyticsRole', {
        curatedDataSetBucket: requiredBuckets.curatedDataSet,
        taxiTripDataSetBucket: requiredBuckets.taxiTripDataSet
    });
    // THEN
    const template = Template.fromStack(stack);
    const iamResources = template.findResources('AWS::IAM::Role');
    let iamRoleNumber = 0
    Object.keys(iamResources).forEach(key => {
        if (iamResources[key].Type === "AWS::IAM::Role") {
            iamRoleNumber++;
        }
    });
    expect(iamRoleNumber).toBe(1);
    template.hasResourceProperties('AWS::IAM::Role', Match.objectLike({
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