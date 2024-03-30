import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface OpenSearchProps {
    domainName?: string
}

export class OpenSearch extends Construct {
    public readonly entity: opensearch.Domain;
    constructor(scope: Construct, id: string, props?: OpenSearchProps){
        super(scope, id)
        const pwdSecret = new secretsmanager.Secret(this, 'Password', {
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: 'admin'
                }),
                generateStringKey: 'password',
                passwordLength: 16,
                excludeCharacters: "\"@/\\"
            }
        });
        const domainName = props?.domainName ?? 'os-domain'
        this.entity = new opensearch.Domain(this, 'Domain', {
            domainName: domainName,
            version: opensearch.EngineVersion.OPENSEARCH_1_2,
            capacity: {
                dataNodes: 1,
                dataNodeInstanceType: 't3.medium.search',
                multiAzWithStandbyEnabled: false
            },
            zoneAwareness: {
                enabled: false
            },
            accessPolicies: [
                new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    principals: [new iam.AnyPrincipal()],
                    actions: ['es:*'],
                    resources: [`arn:aws:es:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:domain/${domainName}/*`]
                })
            ],
            fineGrainedAccessControl: {
                masterUserName: pwdSecret.secretValueFromJson('username').toString(),
                masterUserPassword: pwdSecret.secretValueFromJson('password')
            },
            nodeToNodeEncryption: true,
            encryptionAtRest: {
                enabled: true
            },
            enforceHttps: true,
            ebs: {
                volumeSize: 10,
                volumeType: ec2.EbsDeviceVolumeType.GP2
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
        new cdk.CfnOutput(this, 'PasswordSecret', {
            value: pwdSecret.secretArn,
            description: 'The ARN of the OpenSearch password secret.'
        });
        new cdk.CfnOutput(this, 'DomainEndpointArn', {
            value: this.entity.domainArn, 
            description: 'The ARN of the OpenSearch domain.' });
        new cdk.CfnOutput(this, 'DomainNameEndpoint', {
            value: this.entity.domainEndpoint,
            description: 'The endpoint of the OpenSearch domain.'
        });
    }
}