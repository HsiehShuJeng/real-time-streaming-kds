import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Buckets } from './buckets';
import { KdsConsumerRole, KinesisAnalyticsRole } from './iam-entities';
import { KdaStudio } from './kda-studio';
import { DataTransformer } from './lambda-functions';
import { GlueDatabase } from './metadata';

export class RealTimeStreamingKdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const requiredBuckets = new Buckets(this, 'Demo')
    const glueDatabase = new GlueDatabase(this, 'Glue');
    const eeAssetsBucketName = 'ee-assets-prod-us-east-1';
    // const cloud9Environment = new Cloud9Instance(this, 'OperationEnvironment')
    const kineseAnalyticsRole = new KinesisAnalyticsRole(this, 'KinesisAnalytics', {
      taxiTripDataSetBucket: requiredBuckets.taxiTripDataSet,
      curatedDataSetBucket: requiredBuckets.curatedDataSet,
      eeAssetsBucketName: eeAssetsBucketName
    })
    const kdsConsumerRole = new KdsConsumerRole(this, 'KdsConsumer')
    new DataTransformer(this, 'DataTransformer', {
      baseRole: kdsConsumerRole.entity
    })
    new KdaStudio(this, 'KdaStudio', {
      glueDatabase: glueDatabase.entity,
      serviceRole: kineseAnalyticsRole.entity,
      eeAssetsBucketName: eeAssetsBucketName
    })
    new cdk.CfnOutput(this, 'TaxiTripBucketArn', { value: requiredBuckets.taxiTripDataSet.bucketArn });
    new cdk.CfnOutput(this, 'CuratedBucketArn', { value: requiredBuckets.curatedDataSet.bucketArn });
    // new cdk.CfnOutput(this, 'Cloud9EnvironmentUrl', { value: cloud9Environment.entity.attrArn});
  }
}
