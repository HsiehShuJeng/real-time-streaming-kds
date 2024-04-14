import * as cdk from 'aws-cdk-lib';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from "constructs";

export class DdbTable extends Construct {
    public readonly entity: ddb.Table;
    constructor(scope: Construct, id: string) {
    super(scope, id);
    this.entity = new ddb.Table(this, 'Table', {
        tableName: 'kinesisAggs',
        partitionKey: {name: 'vendorId', type: ddb.AttributeType.NUMBER}
    });
    new cdk.CfnOutput(this, 'TableArn', {value: this.entity.tableArn, description: 'The ARN of the DDB Table.'})
  }
}