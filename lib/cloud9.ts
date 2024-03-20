import * as cdk from 'aws-cdk-lib';
import * as cloud9 from 'aws-cdk-lib/aws-cloud9';
import { Construct } from 'constructs';

/*
 * Cloud9:
    Type: AWS::Cloud9::EnvironmentEC2
    Properties:
      AutomaticStopTimeMinutes: 30
      Description: Real Time Streaming with Amazon Kinesis Cloud9 IDE 
      InstanceType: m5.large
      Name: !Sub "KinesisRealTimeStreaming-${AWS::StackName}"
      ImageId: amazonlinux-2-x86_64
    I need a cdk v2 version of the above resource using Typescript
*/
export class Cloud9Instance extends Construct {
    public readonly entity: cloud9.CfnEnvironmentEC2;
    constructor(scope: Construct, id: string){
        super(scope, id)
        this.entity = new cloud9.CfnEnvironmentEC2(this, 'Cloud9Instance', {
            automaticStopTimeMinutes: 30,
            description: 'Real Time Streaming with Amazon Kinesis Cloud9 IDE',
            instanceType: 'm5.large',
            name: `KinesisRealTimeStreaming-${cdk.Aws.STACK_NAME}`,
            imageId: 'amazonlinux-2-x86_64'
        })
    }
}