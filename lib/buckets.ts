import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';


export class Buckets extends Construct {
    public readonly taxiTripDataSet: s3.Bucket;
    public readonly curatedDataSet: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    const randomGUID = cdk.Fn.select(0, cdk.Fn.split('-', cdk.Fn.select(2, cdk.Fn.split('/', cdk.Aws.STACK_ID))));


    this.taxiTripDataSet = new s3.Bucket(this, 'TaxiTripDataSet', {
      bucketName: `nyctaxitrips-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}-${randomGUID}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
      
    this.curatedDataSet = new s3.Bucket(this, 'CuratedDataSet', {
      bucketName: `curateddata-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}-${randomGUID}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, 'TaxiTripBucketArn', { value: this.taxiTripDataSet.bucketArn });
    new cdk.CfnOutput(this, 'CuratedBucketArn', { value: this.curatedDataSet.bucketArn });
}}