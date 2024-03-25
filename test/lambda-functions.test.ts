import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { KdsConsumerRole, StartKdaLambdaRole } from '../lib/iam-entities';
import { DataTransformer, KdsStartLambdaFunction } from '../lib/lambda-functions';

describe("Tests the creation of the Data Tranfomer as a Lambda function", () => {
    const app = new cdk.App();
        // WHEN
    const stack = new cdk.Stack(app, 'TestStack');
    const kdsConsumerRole = new KdsConsumerRole(stack, 'KdsConsumerRole')
    const kdsStartRole = new StartKdaLambdaRole(stack, 'StartKds', {
      functionName: `StartKDA-${cdk.Aws.STACK_NAME}`
    })
    new DataTransformer(stack, 'DataTransformer', {
        baseRole: kdsConsumerRole.entity})
    new KdsStartLambdaFunction(stack, 'KdsStart', {
        baseRole: kdsStartRole.entity,
        applicationName: `KDA-studio-1-${cdk.Aws.STACK_NAME}`
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
        expect(iamRoleNumber).toBe(2);
    })
    test('Checks the number of Lambda functions', () => {
        const lambdaResources = template.findResources('AWS::Lambda::Function');
        let lambdaNumber = 0
        Object.keys(lambdaResources).forEach(key => {
            if (lambdaResources[key].Type === 'AWS::Lambda::Function') {
                lambdaNumber++;
            }
        });
        expect(lambdaNumber).toBe(3);
    })
    test('Checks the number of custom resource', () => {
      const customResources = template.findResources('Custom::StartKDA');
      let crNumber = 0
      Object.keys(customResources).forEach(key => {
          if (customResources[key].Type === 'Custom::StartKDA') {
              crNumber++;
          }
      });
      expect(crNumber).toBe(1);
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
    test('Checks the kds-starting Lambda function', () => {
      // THEN
      template.hasResourceProperties('AWS::Lambda::Function', Match.objectEquals({
        "Code": {
            "ZipFile": "import json\r\nimport boto3\r\nimport cfnresponse\r\n\r\nclient = boto3.client(\"kinesisanalyticsv2\")\r\n\r\n\r\ndef lambda_handler(event, context):\r\n    print(event)\r\n    response_data = {}\r\n    if event[\"RequestType\"] == \"Delete\":\r\n        cfnresponse.send(\r\n            event,\r\n            context,\r\n            cfnresponse.SUCCESS,\r\n            response_data,\r\n            \"CustomResourcePhysicalID\",\r\n        )\r\n        return\r\n    application_name = event[\"ResourceProperties\"][\"ApplicationName\"]\r\n    try:\r\n        response = client.start_application(ApplicationName=application_name)\r\n        print(json.dumps(response, indent=4))\r\n        response_value = \"Started the Application\"\r\n        response_data[\"Data\"] = response_value\r\n    except:\r\n        response_value = (\r\n            \"Failed Starting the Application, Please start the application manually\"\r\n        )\r\n        response_data[\"Data\"] = response_value\r\n    cfnresponse.send(\r\n        event, context, cfnresponse.SUCCESS, response_data, \"CustomResourcePhysicalID\"\r\n    )\r\n"
        },
        "FunctionName": {
            "Fn::Join": [
                "",
                [
                    "StartKDA-",
                    {
                        "Ref": "AWS::StackName"
                    }
                ]
            ]
        },
        "Handler": "kds-start.lambda_handler",
        "Role": {
            "Fn::GetAtt": [
                "StartKdsLambdaRole85DB0D4C",
                "Arn"
            ]
        },
        "Runtime": "python3.12",
        "Timeout": 10
    }))
    });
    test('Checks the provider for the kds-starting Lambda function', () => {
      template.hasResourceProperties('AWS::Lambda::Function', Match.objectEquals({
        "Code": {
            "S3Bucket": {
                "Fn::Sub": "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}"
            },
            "S3Key": Match.stringLikeRegexp('.*\\.zip')
        },
        "Description": "AWS CDK resource provider framework - onEvent (TestStack/KdsStart/Provider)",
        "Environment": {
            "Variables": {
                "USER_ON_EVENT_FUNCTION_ARN": {
                    "Fn::GetAtt": [
                        "KdsStartLambdaEC4B249E",
                        "Arn"
                    ]
                }
            }
        },
        "Handler": "framework.onEvent",
        "LoggingConfig": {
            "LogGroup": {
                "Ref": "KdsStartLogGroup3ADB0B77"
            }
        },
        "Role": {
            "Fn::GetAtt": [
                "StartKdsLambdaRole85DB0D4C",
                "Arn"
            ]
        },
        "Runtime": "nodejs18.x",
        "Timeout": 900
      }))
    });
    test('Checks the custom resource as Custom::StartKDA', () => {
      template.hasResourceProperties('Custom::StartKDA', Match.objectEquals({
        "ServiceToken": {
            "Fn::GetAtt": [
                "KdsStartProviderframeworkonEvent414F2966",
                "Arn"
            ]
        },
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
        }
      }))
    });
})