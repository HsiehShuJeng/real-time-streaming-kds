import * as glue from '@aws-cdk/aws-glue-alpha';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface GlueDatabaseProps {
    readonly kdaDatabaseName?: string;
}

export class GlueDatabase extends Construct {
    public readonly entity: glue.Database;
    constructor(scope: Construct, id: string, props?: GlueDatabaseProps) {
        super(scope, id);
        const databaseName = props?.kdaDatabaseName ?? 'kinesislab';
        this.entity = new glue.Database(this, 'Database', {
            databaseName: databaseName,
            description: 'Database for KDA Application Source and Target Tables',
        })
        new cdk.CfnOutput(this, 'GlueDatabaseName', {value: this.entity.databaseArn, description: 'The ARN of the Glue database.'})
    }
}