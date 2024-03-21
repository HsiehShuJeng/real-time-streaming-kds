import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface KinesisAnalyticsRoleProps {
    kdaKinesisStreamName?: string;
    taxiTripDataSetBucket: s3.Bucket;
    curatedDataSetBucket: s3.Bucket;
    eeAssetsBucketName?: string;
}
export class KinesisAnalyticsRole extends Construct {
    public readonly entity: iam.Role;
    constructor(scope: Construct, id: string, props: KinesisAnalyticsRoleProps) {
        super(scope, id);
        const kdaKinesisStreamName = props.kdaKinesisStreamName ?? 'input-stream';
        const taxiTripDataSetBucket = props.taxiTripDataSetBucket;
        const curatedDataSetBucket = props.curatedDataSetBucket;
        const eeAssetsBucketName = props.eeAssetsBucketName ?? 'ee-assets-prod-us-east-1';
        this.entity = new iam.Role(this, 'KinesisAnalyticsRole', {
            roleName: `Kinesis-analytics-KDA-${cdk.Aws.STACK_NAME}`,
            assumedBy: new iam.ServicePrincipal('kinesisanalytics.amazonaws.com'),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')],
            inlinePolicies: {
                'KinesisAnalyticsSid': new iam.PolicyDocument({
                    assignSids: true,
                    statements: [
                        new iam.PolicyStatement({
                            sid: 'ReadOnlySid',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'ec2:DescribeVpcs',
                                'ec2:DescribeDhcpOptions',
                                'ec2:DescribeSubnets',
                                'ec2:DescribeSecurityGroups'
                            ],
                            resources: ['*'],
                        }),
                        new iam.PolicyStatement({
                            sid: 'LogGroupSid',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'logs:CreateLogGroup',
                                'logs:CreateLogStream',
                                'logs:PutLogEvents',
                                'logs:AssociateKmsKey'
                            ],
                            resources:[
                                'arn:aws:logs:*:*:/aws-glue/*',
                                'arn:aws:logs:*:*:log-group/aws/kinesis-analytics/*'
                            ]
                        }),
                        new iam.PolicyStatement({
                            sid: 'GlueTableSid',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'glue:GetConnection',
                                'glue:GetTable',
                                'glue:GetTables',
                                'glue:CreateTable',
                                'glue:UpdateTable',
                                'glue:GetUserDefinedFunction',
                                'glue:GetPartitions',
                                'glue:DeleteTable',
                                'glue:GetDatabase',
                                'glue:GetDatabases',
                                'glue:GetUserDefinedFunction'
                            ],
                            resources: ['*']
                        }),
                        new iam.PolicyStatement({
                            sid: 'KinesisEfoConsumer',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kinesis:DescribeStreamConsumer',
                                'kinesis:SubscribeToShard'
                            ],
                            resources: [
                                `arn:aws:kinesis:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:stream/${cdk.Aws.STACK_NAME}-KDAKinesisStreamName/consumer/*`,
                            ]
                        }),
                        new iam.PolicyStatement({
                            sid: 'KinesisStreamSid',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kinesis:GetShardIterator',
                                'kinesis:GetRecords',
                                'kinesis:PutRecords',
                                'kinesis:DescribeStream',
                                'kinesis:DescribeStreamSummary',
                                'kinesis:RegisterStreamConsumer',
                                'kinesis:DeregisterStreamConsumer'
                            ],
                            resources: [
                                `arn:aws:kinesis:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:stream/${kdaKinesisStreamName}`,
                            ]
                        }),
                        new iam.PolicyStatement({
                            sid: 'KinesisStreamListShardsID',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kinesis:*'
                            ],
                            resources: [
                                '*'
                            ]
                        }),
                        new iam.PolicyStatement({
                            sid: 'S3DataAccessSid',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                's3:*'
                            ],
                            resources: [
                                taxiTripDataSetBucket.bucketArn,
                                `${taxiTripDataSetBucket.bucketArn}/*`,
                                curatedDataSetBucket.bucketArn,
                                `${curatedDataSetBucket.bucketArn}/*`
                            ]
                        }),
                        new iam.PolicyStatement({
                            sid: 'KinesisAnalyticsSid',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'kinesisanalytics:DescribeApplication'
                            ],
                            resources: [
                                `arn:aws:kinesisanalytics:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:application/KDA-studio-1-*`
                            ]
                        }),
                        new iam.PolicyStatement({
                            sid: 'S3AssetsBucket',
                            effect: iam.Effect.ALLOW,
                            actions: [
                                's3:GetObject',
                                's3:GetObjectVersion'
                            ],
                            resources: [
                                `arn:aws:s3:::${eeAssetsBucketName}/`,
                                `arn:aws:s3:::${eeAssetsBucketName}/*`
                            ]
                        })
                    ]
                })
            }
      })
}}