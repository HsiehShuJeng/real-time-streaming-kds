import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Buckets } from './buckets';
import { Cloud9Instance } from './cloud9';
import { KdsConsumerRole, KinesisAnalyticsRole, StartKdaLambdaRole } from './iam-entities';
import { BaseKinesisDataStream, KdaStudio, Lab3KinesisFirehose } from './kda-studio';
import { DataTransformer, KdsStartLambdaFunction } from './lambda-functions';
import { GlueDatabase, Lab3Table } from './metadata';
import { OpenSearch } from './search-engine';

interface RealTimeStreamingKdsStackProps extends cdk.StackProps {
  readonly createKdsStreamOrNot?: boolean;
  readonly createLab3TableOrNot?: boolean;
}

export class RealTimeStreamingKdsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: RealTimeStreamingKdsStackProps) {
    super(scope, id, props);
    const createKdsStreamOrNot = props?.createKdsStreamOrNot ?? true;
    const createLab3TableOrNot = props?.createLab3TableOrNot ?? true;
    let baseStream: BaseKinesisDataStream;
    if (!props?.createKdsStreamOrNot){
      console.log('ℹ️ `createKdsStreamOrNot` as stack property for RealTimeStreamingKdsStack is not specified, using default value, i.e., true.')
    }
    if (!props?.createLab3TableOrNot){
      console.log('ℹ️ `createLab3TableOrNot` as stack property for RealTimeStreamingKdsStack is not specified, using default value, i.e., true.')
    }
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
    const dataTransformer = new DataTransformer(this, 'DataTransformer', {
      baseRole: kdsConsumerRole.entity
    });
    if (createKdsStreamOrNot){
      baseStream = new BaseKinesisDataStream(this, 'Beginner');
    }
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
    if (createLab3TableOrNot){
      const lab3Table = new Lab3Table(this, 'Lab3', {
        database: glueDatabase.entity,
        bucket: requiredBuckets.taxiTripDataSet
      })
      new Lab3KinesisFirehose(this, 'Lab3KinesisFirehose', {
        sourceKinesisStream: baseStream!.entity,
        destinationBucket: requiredBuckets.taxiTripDataSet,
        glueTable: lab3Table.entity,
        transformingFunction: dataTransformer.entity,
      })
    }
  }
}
