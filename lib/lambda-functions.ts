import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kinesis from 'aws-cdk-lib/aws-kinesis';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from "constructs";
import * as path from 'path';


interface DataTransformerProp {
    baseRole: iam.Role;
}
/**
 * The `DataTransformer` construct defines an AWS Lambda function specifically for data transformation purposes.
 * 
 * This construct sets up a Lambda function using the Python 3.12 runtime. The function's source code is
 * expected to be located in the `resources` directory relative to the location of this construct.
 * A unique function name is generated based on the stack name.
 * 
 * Example Usage:
 * ```
 * const dataTransformer = new DataTransformer(this, 'MyDataTransformer');
 * ```
 * 
 * Properties:
 * - `entity`: lambda.Function - The Lambda function entity created by this construct.
 * 
 * Constructs an instance of `DataTransformer`.
 * 
 * @param scope - The parent creating construct (usually a `cdk.Stack`).
 * @param id - The unique identifier for this construct within its parent scope.
 * 
 * The Lambda function created includes the following configurations:
 * - Function Name: Generated based on the stack name with a prefix of 'NYCTaxiTrips-DataTransformation-'.
 * - Runtime: Python 3.12.
 * - Handler: Specifies the function within your code that Lambda calls to begin execution ('data-transformer.lambda_handler').
 * - Code Source: Loaded from the `resources` directory.
 * - Timeout: Set to 10 seconds.
 * 
 * Outputs:
 * - `DataTransformerArn`: The Amazon Resource Name (ARN) of the Lambda function.
 */
export class DataTransformer extends Construct {
    public readonly entity: lambda.Function;
    constructor(scope: Construct, id: string, props: DataTransformerProp) {
        super(scope, id);
        this.entity = new lambda.Function(this, 'Lambda', {
            functionName: `NYCTaxiTrips-DataTransformation-${cdk.Aws.STACK_NAME}`,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: 'data-transformer.lambda_handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../resources')),
            timeout: cdk.Duration.seconds(10),
            role: props.baseRole
        });
        new cdk.CfnOutput(this, 'DataTransformerArn', {value: this.entity.functionArn, description: 'The ARN of the data transformer as a Lambda function.'})
    }
}

/**
 * Represents the properties for configuring the KDS Start Lambda Function.
 */
interface KdsStartLambdaFunctionProps {
    /**
     * The base IAM role for the Lambda function.
     */
    baseRole: iam.Role;
    /**
     * The name of the Kinesis Data Analytics (KDA) application to start.
     */
    applicationName: string;
}

/**
 * A construct that creates a Lambda function to start a Kinesis Data Analytics (KDA) application.
 */
export class KdsStartLambdaFunction extends Construct {
    public readonly entity: lambda.Function;
    constructor(scope: Construct, id: string, props: KdsStartLambdaFunctionProps) {
        super(scope, id);
        const functionScript = 'import json\r\nimport boto3\r\nimport cfnresponse\r\n\r\nclient = boto3.client("kinesisanalyticsv2")\r\n\r\n\r\ndef lambda_handler(event, context):\r\n    print(event)\r\n    response_data = {}\r\n    if event["RequestType"] == "Delete":\r\n        cfnresponse.send(\r\n            event,\r\n            context,\r\n            cfnresponse.SUCCESS,\r\n            response_data,\r\n            "CustomResourcePhysicalID",\r\n        )\r\n        return\r\n    application_name = event["ResourceProperties"]["ApplicationName"]\r\n    try:\r\n        response = client.start_application(ApplicationName=application_name)\r\n        print(json.dumps(response, indent=4))\r\n        response_value = "Started the Application"\r\n        response_data["Data"] = response_value\r\n    except:\r\n        response_value = (\r\n            "Failed Starting the Application, Please start the application manually"\r\n        )\r\n        response_data["Data"] = response_value\r\n    cfnresponse.send(\r\n        event, context, cfnresponse.SUCCESS, response_data, "CustomResourcePhysicalID"\r\n    )\r\n'
        this.entity = new lambda.Function(this, 'Lambda', {
            functionName: `StartKDA-${cdk.Aws.STACK_NAME}`,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: 'index.lambda_handler',
            code: lambda.Code.fromInline(functionScript),
            timeout: cdk.Duration.seconds(10),
            role: props.baseRole.withoutPolicyUpdates()
        });
        const provider = new cr.Provider(this, 'Provider', {
            onEventHandler: this.entity,
            logGroup: new logs.LogGroup(this, 'LogGroup', {
                retention: logs.RetentionDays.ONE_WEEK
            }),
            role: props.baseRole.withoutPolicyUpdates()
        })
        new cdk.CustomResource(this, 'StartKds', {
            serviceToken: provider.serviceToken,
            resourceType: 'Custom::StartKDA',
            properties: {
                ApplicationName: props.applicationName
            }
        })
    }
}

/**
 * Represents the properties for configuring the KDS Consumer Lambda Function.
 */
interface KdsConsumerFunctionProps {
    /**
     * The name of the DynamoDB table to use.
     */
    ddbTableName: string;
    /**
     * The IAM role for the consumer Lambda function.
     */
    consumerRole: iam.IRole;
    /**
     * The Kinesis stream that triggers the consumer Lambda function.
     */
    triggeredStream: kinesis.IStream;
}

/**
 * A construct that creates a Lambda function to consume data from a Kinesis Data Stream.
 */
export class KdsConsumerFunction extends Construct {
    public readonly entity: lambda.Function;
    constructor(scope: Construct, id: string, props: KdsConsumerFunctionProps) {
        super(scope, id);
        this.entity = new PythonFunction(this, 'Lambda', {
            role: props.consumerRole,
            entry: path.join(__dirname, '../resources/consumer'),
            index: 'kds-consumer.py',
            architecture: lambda.Architecture.ARM_64,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: 'lambda_handler',
            environment: {
              dynamoDBTableName: props.ddbTableName
            },
            memorySize: 1024,
            ephemeralStorageSize: cdk.Size.mebibytes(512),
            timeout: cdk.Duration.minutes(1)
          });
        this.entity.addEventSource(new eventsources.KinesisEventSource(props.triggeredStream, {
            batchSize: 1000,
            maxBatchingWindow: cdk.Duration.seconds(120),
            startingPosition: lambda.StartingPosition.LATEST,
            retryAttempts: 2,
            parallelizationFactor: 1,
            tumblingWindow: cdk.Duration.minutes(5)
        }))
        new cdk.CfnOutput(this, 'KdsConsumerFunctionArn', {value: this.entity.functionArn, description: 'The ARN of the KDS consumer as a Lambda function.'})
    }
}