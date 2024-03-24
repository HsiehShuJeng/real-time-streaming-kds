import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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