import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { KdsConsumerRole } from '../lib/iam-entities';
import { DataTransformer } from '../lib/lambda-functions';

describe("Tests the creation of the Data Tranfomer as a Lambda function", () => {
    const app = new cdk.App();
        // WHEN
    const stack = new cdk.Stack(app, 'TestStack');
    const kdsConsumerRole = new KdsConsumerRole(stack, 'KdsConsumerRole')
    new DataTransformer(stack, 'DataTransformer', {
        baseRole: kdsConsumerRole.entity})
    const template = Template.fromStack(stack);
    test('Checks the number of IAM roles', () => {
        const iamResources = template.findResources('AWS::IAM::Role');
        let iamRoleNumber = 0
        Object.keys(iamResources).forEach(key => {
            if (iamResources[key].Type === "AWS::IAM::Role") {
                iamRoleNumber++;
            }
        });
        expect(iamRoleNumber).toBe(1);
    })
    test('Checks the number of Lambda functions', () => {
        const lambdaResources = template.findResources('AWS::Lambda::Function');
        let lambdaNumber = 0
        Object.keys(lambdaResources).forEach(key => {
            if (lambdaResources[key].Type === 'AWS::Lambda::Function') {
                lambdaNumber++;
            }
        });
        expect(lambdaNumber).toBe(1);
    })
    test('Checks the consumer role', () => {
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
    });
    test('Checks the data transformer', () => {
        // THEN
        template.hasResourceProperties('AWS::Lambda::Function', Match.objectEquals({
            "Code": {
              "S3Bucket": {
                "Fn::Sub": "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}"
              },
              "S3Key": Match.stringLikeRegexp('.*\\.zip')
            },
            "FunctionName": {
              "Fn::Join": [
                "",
                [
                  "NYCTaxiTrips-DataTransformation-",
                  {
                    "Ref": "AWS::StackName"
                  }
                ]
              ]
            },
            "Handler": "data-transformer.lambda_handler",
            "Role": {
              "Fn::GetAtt": [
                "KdsConsumerRoleEF621563",
                "Arn"
              ]
            },
            "Runtime": "python3.12",
            "Timeout": 10
          }))
    });
})