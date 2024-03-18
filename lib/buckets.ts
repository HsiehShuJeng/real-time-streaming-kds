// import s3 from cdk v2
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';


// create a consutrct to include 2 buckets
export class Buckets extends Construct {
    public readonly taxiTripDataSet: s3.Bucket;
    public readonly curatedDataSet: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    /**
     * BucketName:
        !Sub
          - 'nyctaxitrips-${AWS::AccountId}-${AWS::Region}-${RandomGUID}'
          - { RandomGUID: !Select [0, !Split ["-", !Select [2, !Split ["/", !Ref AWS::StackId ]]]] }
     */
    // Get the cdk v2 version of the above CFN template
    const randomGUID = cdk.Fn.select(0, cdk.Fn.split('-', cdk.Fn.select(2, cdk.Fn.split('/', cdk.Aws.STACK_ID))));


    this.taxiTripDataSet = new s3.Bucket(this, 'TaxiTripDataSet', {
        bucketName: `nyctaxitrips-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}-${randomGUID}`,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });
      
      this.curatedDataSet = new s3.Bucket(this, 'CuratedDataSet', {
        bucketName: `curateddata-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}-${randomGUID}`,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });
}}