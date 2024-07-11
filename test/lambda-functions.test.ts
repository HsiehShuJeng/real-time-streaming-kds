import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { KdsConsumerRole, StartKdaLambdaRole } from '../lib/iam-entities';
import { BaseKinesisDataStream } from '../lib/kda-studio';
import { DataTransformer, KdsConsumerFunction, KdsStartLambdaFunction } from '../lib/lambda-functions';

describe('Tests the creation of the Data Tranfomer as a Lambda function', () => {
    const ddbTableName = 'kinesisAggs';
    test('Checks the creation of DataTransformer construct', () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack');
      const kdsConsumerRole = new KdsConsumerRole(stack, 'KdsConsumerRole', {
        ddbTableName: ddbTableName
      });
      new DataTransformer(stack, 'DataTransformer', {
        baseRole: kdsConsumerRole.entity})
      Template.fromStack(stack).resourceCountIs('AWS::IAM::Role', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', Match.objectEquals({
          'AssumeRolePolicyDocument': {
              'Statement': [
                  {
                      'Action': 'sts:AssumeRole',
                      'Effect': 'Allow',
                      'Principal': {
                          'Service': 'lambda.amazonaws.com'
                      }
                  }
              ],
              'Version': '2012-10-17'
          },
          'ManagedPolicyArns': [
              {
                  'Fn::Join': [
                      '',
                      [
                          'arn:',
                          {
                              'Ref': 'AWS::Partition'
                          },
                          ':iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole'
                      ]
                  ]
              },
              {
                  'Fn::Join': [
                      '',
                      [
                          'arn:',
                          {
                              'Ref': 'AWS::Partition'
                          },
                          ':iam::aws:policy/service-role/AWSLambdaDynamoDBExecutionRole'
                      ]
                  ]
              }
          ],
          'Path': '/',
          'Policies': [
              {
                  'PolicyDocument': {
                      'Statement': [
                          {
                              'Action': 'logs:CreateLogGroup',
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:logs:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':*'
                                      ]
                                  ]
                              },
                              'Sid': '0'
                          },
                          {
                              'Action': [
                                  'logs:CreateLogStream',
                                  'logs:PutLogEvents'
                              ],
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:logs:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':log-group:/aws/lambda/NYCTaxiTrips-DataTransformation-*:*'
                                      ]
                                  ]
                              },
                              'Sid': '1'
                          },
                          {
                              'Action': [
                                  'dynamodb:PutItem',
                                  'dynamodb:UpdateItem',
                                  'dynamodb:UpdateTable'
                              ],
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:dynamodb:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':table/kinesisAggs'
                                      ]
                                  ]
                              },
                              'Sid': '2'
                          },
                          {
                              'Action': [
                                  'dynamodb:ListBackups',
                                  'dynamodb:ListContributorInsights',
                                  'dynamodb:ListExports',
                                  'dynamodb:ListGlobalTables',
                                  'dynamodb:ListTables'
                              ],
                              'Effect': 'Allow',
                              'Resource': '*',
                              'Sid': '3'
                          }
                      ],
                      'Version': '2012-10-17'
                  },
                  'PolicyName': 'LambdaFunctionPolicy'
              }
          ],
          'RoleName': {
              'Fn::Join': [
                  '',
                  [
                      'KinesisLambdaConsumerRole-',
                      {
                          'Ref': 'AWS::StackName'
                      }
                  ]
              ]
          }
      }))
      Template.fromStack(stack).resourceCountIs('AWS::Lambda::Function', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', Match.objectLike({
          'Code': {
              'S3Bucket': {
                  'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}'
              },
              'S3Key': Match.stringLikeRegexp('.*\\.zip')
          },
          'FunctionName': {
              'Fn::Join': [
                  '',
                  [
                      'NYCTaxiTrips-DataTransformation-',
                      {
                          'Ref': 'AWS::StackName'
                      }
                  ]
              ]
          },
          'Handler': 'data-transformer.lambda_handler',
          'Role': {
              'Fn::GetAtt': [
                  'KdsConsumerRoleEF621563',
                  'Arn'
              ]
          },
          'Runtime': 'python3.12',
          'Timeout': 10
      }))
    })
    test('Checks the creation of KdsStartLambdaFunction construct', () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack');
      const kdsStartRole = new StartKdaLambdaRole(stack, 'StartKds', {
        functionName: `StartKDA-${cdk.Aws.STACK_NAME}`
      })
      new KdsStartLambdaFunction(stack, 'KdsStart', {
          baseRole: kdsStartRole.entity,
          applicationName: `KDA-studio-1-${cdk.Aws.STACK_NAME}`
      })
      Template.fromStack(stack).resourceCountIs('AWS::IAM::Role', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', Match.objectEquals({
          'AssumeRolePolicyDocument': {
              'Statement': [
                  {
                      'Action': 'sts:AssumeRole',
                      'Effect': 'Allow',
                      'Principal': {
                          'Service': 'lambda.amazonaws.com'
                      }
                  }
              ],
              'Version': '2012-10-17'
          },
          'Path': '/',
          'Policies': [
              {
                  'PolicyDocument': {
                      'Statement': [
                          {
                              'Action': 'logs:CreateLogGroup',
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:logs:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':*'
                                      ]
                                  ]
                              },
                              'Sid': '0'
                          },
                          {
                              'Action': [
                                  'logs:CreateLogStream',
                                  'logs:PutLogEvents'
                              ],
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:logs:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':log-group:/aws/lambda/StartKDA-*'
                                      ]
                                  ]
                              },
                              'Sid': '1'
                          },
                          {
                              'Action': 'kinesisanalytics:StartApplication',
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:kinesisanalytics:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':application/KDA-studio-*'
                                      ]
                                  ]
                              },
                              'Sid': '2'
                          },
                          {
                              'Action': 'lambda:InvokeFunction',
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:',
                                          {
                                              'Ref': 'AWS::Partition'
                                          },
                                          ':lambda:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':function:StartKDA-',
                                          {
                                              'Ref': 'AWS::StackName'
                                          }
                                      ]
                                  ]
                              },
                              'Sid': '3'
                          }
                      ],
                      'Version': '2012-10-17'
                  },
                  'PolicyName': 'LambdaFunctionPolicy'
              }
          ],
          'RoleName': {
              'Fn::Join': [
                  '',
                  [
                      'KDA-Lambda-',
                      {
                          'Ref': 'AWS::StackName'
                      }
                  ]
              ]
          }
      }))
      Template.fromStack(stack).resourceCountIs('AWS::Lambda::Function', 2);
      Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', Match.objectLike({
          'Code': {
              'ZipFile': 'import json\r\nimport boto3\r\nimport cfnresponse\r\n\r\nclient = boto3.client(\"kinesisanalyticsv2\")\r\n\r\n\r\ndef lambda_handler(event, context):\r\n    print(event)\r\n    response_data = {}\r\n    if event[\"RequestType\"] == \"Delete\":\r\n        cfnresponse.send(\r\n            event,\r\n            context,\r\n            cfnresponse.SUCCESS,\r\n            response_data,\r\n            \"CustomResourcePhysicalID\",\r\n        )\r\n        return\r\n    application_name = event[\"ResourceProperties\"][\"ApplicationName\"]\r\n    try:\r\n        response = client.start_application(ApplicationName=application_name)\r\n        print(json.dumps(response, indent=4))\r\n        response_value = \"Started the Application\"\r\n        response_data[\"Data\"] = response_value\r\n    except:\r\n        response_value = (\r\n            \"Failed Starting the Application, Please start the application manually\"\r\n        )\r\n        response_data[\"Data\"] = response_value\r\n    cfnresponse.send(\r\n        event, context, cfnresponse.SUCCESS, response_data, \"CustomResourcePhysicalID\"\r\n    )\r\n'
          },
          'FunctionName': {
              'Fn::Join': [
                  '',
                  [
                      'StartKDA-',
                      {
                          'Ref': 'AWS::StackName'
                      }
                  ]
              ]
          },
          'Handler': 'index.lambda_handler',
          'Role': {
              'Fn::GetAtt': [
                  'StartKdsLambdaRole85DB0D4C',
                  'Arn'
              ]
          },
          'Runtime': 'python3.12',
          'Timeout': 10
      }))
      Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', Match.objectLike({
          'Code': {
              'S3Bucket': {
                  'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}'
              },
              'S3Key': Match.stringLikeRegexp('.*\\.zip')
          },
          'Description': 'AWS CDK resource provider framework - onEvent (TestStack/KdsStart/Provider)',
          'Environment': {
              'Variables': {
                  'USER_ON_EVENT_FUNCTION_ARN': {
                      'Fn::GetAtt': [
                          'KdsStartLambdaEC4B249E',
                          'Arn'
                      ]
                  }
              }
          },
          'Handler': 'framework.onEvent',
          'LoggingConfig': {
              'LogGroup': {
                  'Ref': 'KdsStartLogGroup3ADB0B77'
              }
          },
          'Role': {
              'Fn::GetAtt': [
                  'StartKdsLambdaRole85DB0D4C',
                  'Arn'
              ]
          },
          'Runtime': 'nodejs18.x',
          'Timeout': 900
      }))
      Template.fromStack(stack).resourceCountIs('AWS::Logs::LogGroup', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::Logs::LogGroup', Match.objectEquals({
          'RetentionInDays': 7
      }))
      Template.fromStack(stack).resourceCountIs('Custom::StartKDA', 1);
      Template.fromStack(stack).hasResourceProperties('Custom::StartKDA', Match.objectLike({
          'ServiceToken': {
              'Fn::GetAtt': [
                  Match.stringLikeRegexp('KdsStartProviderframeworkonEvent'),
                  'Arn'
              ]
          },
          'ApplicationName': {
              'Fn::Join': [
                  '',
                  [
                      'KDA-studio-1-',
                      {
                          'Ref': 'AWS::StackName'
                      }
                  ]
              ]
          }
      }))
    })
    test('Checks the creation of KdsConsumerFunction constrcut', () => {
      const app = new cdk.App();
      const stack = new cdk.Stack(app, 'TestStack');
      const baseKinesisStream = new BaseKinesisDataStream(stack, 'Base')
      const kdsConsumerRole = new KdsConsumerRole(stack, 'KdsConsumerRole', {
        ddbTableName: ddbTableName
      });
      new KdsConsumerFunction(stack, 'KdsConsumer', {
        ddbTableName: ddbTableName,
        consumerRole: kdsConsumerRole.entity,
        triggeredStream: baseKinesisStream.entity
      })
      Template.fromStack(stack).resourceCountIs('AWS::Kinesis::Stream', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::Kinesis::Stream', Match.objectEquals({
          'Name': 'input_stream',
          'RetentionPeriodHours': 24,
          'StreamEncryption': {
              'Fn::If': [
                  'AwsCdkKinesisEncryptedStreamsUnsupportedRegions',
                  {
                      'Ref': 'AWS::NoValue'
                  },
                  {
                      'EncryptionType': 'KMS',
                      'KeyId': 'alias/aws/kinesis'
                  }
              ]
          },
          'StreamModeDetails': {
              'StreamMode': 'ON_DEMAND'
          }
      }))
      Template.fromStack(stack).resourceCountIs('AWS::IAM::Policy', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', Match.objectEquals({
          'PolicyDocument': {
              'Statement': [
                  {
                      'Action': [
                          'kinesis:DescribeStreamSummary',
                          'kinesis:GetRecords',
                          'kinesis:GetShardIterator',
                          'kinesis:ListShards',
                          'kinesis:SubscribeToShard',
                          'kinesis:DescribeStream',
                          'kinesis:ListStreams',
                          'kinesis:DescribeStreamConsumer'
                      ],
                      'Effect': 'Allow',
                      'Resource': {
                          'Fn::GetAtt': [
                              'BaseStreamD5E35171',
                              'Arn'
                          ]
                      }
                  },
                  {
                      'Action': 'kinesis:DescribeStream',
                      'Effect': 'Allow',
                      'Resource': {
                          'Fn::GetAtt': [
                              'BaseStreamD5E35171',
                              'Arn'
                          ]
                      }
                  }
              ],
              'Version': '2012-10-17'
          },
          'PolicyName': 'KdsConsumerRoleDefaultPolicy1D1CD555',
          'Roles': [
              {
                  'Ref': 'KdsConsumerRoleEF621563'
              }
          ]
      }))
      Template.fromStack(stack).resourceCountIs('AWS::IAM::Role', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', Match.objectEquals({
          'AssumeRolePolicyDocument': {
              'Statement': [
                  {
                      'Action': 'sts:AssumeRole',
                      'Effect': 'Allow',
                      'Principal': {
                          'Service': 'lambda.amazonaws.com'
                      }
                  }
              ],
              'Version': '2012-10-17'
          },
          'ManagedPolicyArns': [
              {
                  'Fn::Join': [
                      '',
                      [
                          'arn:',
                          {
                              'Ref': 'AWS::Partition'
                          },
                          ':iam::aws:policy/service-role/AWSLambdaKinesisExecutionRole'
                      ]
                  ]
              },
              {
                  'Fn::Join': [
                      '',
                      [
                          'arn:',
                          {
                              'Ref': 'AWS::Partition'
                          },
                          ':iam::aws:policy/service-role/AWSLambdaDynamoDBExecutionRole'
                      ]
                  ]
              }
          ],
          'Path': '/',
          'Policies': [
              {
                  'PolicyDocument': {
                      'Statement': [
                          {
                              'Action': 'logs:CreateLogGroup',
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:logs:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':*'
                                      ]
                                  ]
                              },
                              'Sid': '0'
                          },
                          {
                              'Action': [
                                  'logs:CreateLogStream',
                                  'logs:PutLogEvents'
                              ],
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:logs:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':log-group:/aws/lambda/NYCTaxiTrips-DataTransformation-*:*'
                                      ]
                                  ]
                              },
                              'Sid': '1'
                          },
                          {
                              'Action': [
                                  'dynamodb:PutItem',
                                  'dynamodb:UpdateItem',
                                  'dynamodb:UpdateTable'
                              ],
                              'Effect': 'Allow',
                              'Resource': {
                                  'Fn::Join': [
                                      '',
                                      [
                                          'arn:aws:dynamodb:',
                                          {
                                              'Ref': 'AWS::Region'
                                          },
                                          ':',
                                          {
                                              'Ref': 'AWS::AccountId'
                                          },
                                          ':table/kinesisAggs'
                                      ]
                                  ]
                              },
                              'Sid': '2'
                          },
                          {
                              'Action': [
                                  'dynamodb:ListBackups',
                                  'dynamodb:ListContributorInsights',
                                  'dynamodb:ListExports',
                                  'dynamodb:ListGlobalTables',
                                  'dynamodb:ListTables'
                              ],
                              'Effect': 'Allow',
                              'Resource': '*',
                              'Sid': '3'
                          }
                      ],
                      'Version': '2012-10-17'
                  },
                  'PolicyName': 'LambdaFunctionPolicy'
              }
          ],
          'RoleName': {
              'Fn::Join': [
                  '',
                  [
                      'KinesisLambdaConsumerRole-',
                      {
                          'Ref': 'AWS::StackName'
                      }
                  ]
              ]
          }
      }))
      Template.fromStack(stack).resourceCountIs('AWS::Lambda::EventSourceMapping', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::Lambda::EventSourceMapping', Match.objectEquals({
          'BatchSize': 1000,
          'EventSourceArn': {
              'Fn::GetAtt': [
                  'BaseStreamD5E35171',
                  'Arn'
              ]
          },
          'FunctionName': {
              'Ref': 'KdsConsumerLambda11E31C03'
          },
          'MaximumBatchingWindowInSeconds': 120,
          'MaximumRetryAttempts': 2,
          'ParallelizationFactor': 1,
          'StartingPosition': 'LATEST',
          'TumblingWindowInSeconds': 300
      }))
      Template.fromStack(stack).resourceCountIs('AWS::Lambda::Function', 1);
      Template.fromStack(stack).hasResourceProperties('AWS::Lambda::Function', Match.objectLike({
          'Architectures': [
              'arm64'
          ],
          'Code': {
              'S3Bucket': {
                  'Fn::Sub': 'cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}'
              },
              'S3Key': Match.stringLikeRegexp('.*\\.zip')
          },
          'Environment': {
              'Variables': {
                  'dynamoDBTableName': ddbTableName
              }
          },
          'EphemeralStorage': {
              'Size': 512
          },
          'Handler': 'kds-consumer.lambda_handler',
          'MemorySize': 1024,
          'Role': {
              'Fn::GetAtt': [
                  'KdsConsumerRoleEF621563',
                  'Arn'
              ]
          },
          'Runtime': 'python3.12',
          'Timeout': 60
      }))
    })
})