import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Buckets } from './buckets';

export class RealTimeStreamingKdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const requiredBuckets = new Buckets(this, 'Demo')
    new cdk.CfnOutput(this, 'TaxiTripBucketArn', { value: requiredBuckets.taxiTripDataSet.bucketArn });
    new cdk.CfnOutput(this, 'CuratedBucketArn', { value: requiredBuckets.curatedDataSet.bucketArn });
  }
}
