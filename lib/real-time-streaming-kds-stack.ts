import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Buckets } from './buckets';
import { Cloud9Instance } from './cloud9';
import { KdsConsumerRole, KinesisAnalyticsRole, StartKdaLambdaRole } from './iam-entities';
import { KdaStudio } from './kda-studio';
import { DataTransformer, KdsStartLambdaFunction } from './lambda-functions';
import { GlueDatabase } from './metadata';
import { OpenSearch } from './search-engine';

export class RealTimeStreamingKdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const requiredBuckets = new Buckets(this, 'Demo')
    const glueDatabase = new GlueDatabase(this, 'Glue');
    const eeAssetsBucketName = 'ee-assets-prod-us-east-1';
    const applicationName = `KDA-studio-1-${cdk.Aws.STACK_NAME}`
    new Cloud9Instance(this, 'OperationEnvironment')
    const kineseAnalyticsRole = new KinesisAnalyticsRole(this, 'KinesisAnalytics', {
      taxiTripDataSetBucket: requiredBuckets.taxiTripDataSet,
      curatedDataSetBucket: requiredBuckets.curatedDataSet,
      eeAssetsBucketName: eeAssetsBucketName
    });
    const kdsConsumerRole = new KdsConsumerRole(this, 'KdsConsumer')
    new DataTransformer(this, 'DataTransformer', {
      baseRole: kdsConsumerRole.entity
    });
    const kdsStudio = new KdaStudio(this, 'KdaStudio', {
      glueDatabase: glueDatabase.entity,
      serviceRole: kineseAnalyticsRole.entity,
      eeAssetsBucketName: eeAssetsBucketName,
      applicationName: applicationName
    })

    const kdsStartLambdaRole = new StartKdaLambdaRole(this, 'StartKdaLambda', {
      functionName: `StartKDA-${cdk.Aws.STACK_NAME}`
    });
    const kdsStartLambda = new KdsStartLambdaFunction(this, 'KdsStartLambda', {
      baseRole: kdsStartLambdaRole.entity,
      applicationName: applicationName
    })
    kdsStartLambda.node.addDependency(kdsStudio);
    new OpenSearch(this, 'OpenSearch')
  }
}
