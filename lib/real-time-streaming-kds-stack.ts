import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Buckets } from './buckets';
import { Cloud9Instance } from './cloud9';

export class RealTimeStreamingKdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const requiredBuckets = new Buckets(this, 'Demo')
    const cloud9Environment = new Cloud9Instance(this, 'OperationEnvironment')
    new cdk.CfnOutput(this, 'TaxiTripBucketArn', { value: requiredBuckets.taxiTripDataSet.bucketArn });
    new cdk.CfnOutput(this, 'CuratedBucketArn', { value: requiredBuckets.curatedDataSet.bucketArn });
    new cdk.CfnOutput(this, 'Cloud9EnvironmentUrl', { value: cloud9Environment.entity.attrArn});
  }
}
