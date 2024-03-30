import * as cdk from 'aws-cdk-lib';
import * as cloud9 from 'aws-cdk-lib/aws-cloud9';
import { Construct } from 'constructs';

interface Cloud9InstanceProps {
    ownerArn: string;
}
export class Cloud9Instance extends Construct {
    public readonly entity: cloud9.CfnEnvironmentEC2;
    constructor(scope: Construct, id: string, props?: Cloud9InstanceProps){
        super(scope, id)
        const ownerArn = props?.ownerArn ?? `arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:user/Administrator`;
        if (!props?.ownerArn){
            console.log(`ownerArn as property for Cloud9Instance is not specificed. The default value, i.e., ${ownerArn} will be assigned to ownerArn.`)
        }
        this.entity = new cloud9.CfnEnvironmentEC2(this, 'Cloud9Instance', {
            automaticStopTimeMinutes: 30,
            description: 'Real Time Streaming with Amazon Kinesis Cloud9 IDE',
            instanceType: 'm5.large',
            name: `KinesisRealTimeStreaming-${cdk.Aws.STACK_NAME}`,
            imageId: 'amazonlinux-2-x86_64',
            ownerArn: ownerArn
        })
        new cdk.CfnOutput(this, 'Cloud9Url', {value: `https://${cdk.Aws.REGION}.console.aws.amazon.com/cloud9/ide/${this.entity.ref}`, description: 'The Cloud9 environment.'})
    }
}