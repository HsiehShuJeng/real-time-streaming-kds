import * as glue from '@aws-cdk/aws-glue-alpha';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
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

interface Lab3TableProps {
    readonly database: glue.IDatabase;
    readonly bucket: s3.IBucket;
    readonly tableName?: string;
}

export class Lab3Table extends Construct {
    public readonly entity: glue.S3Table;
    constructor(scope: Construct, id: string, props: Lab3TableProps) {
        super(scope, id);
        const tableName = props?.tableName ?? 'nyctaxitrips';
        if (!props?.tableName){
            console.log('ℹ️ `tableName` as property for Lab3Table is not specified, using default table name: `nyctaxitrips`.')
        }
        this.entity = new glue.S3Table(this, 'Table', {
            bucket: props.bucket,
            s3Prefix: 'nyctaxitrips',
            database: props.database,
            tableName: tableName,
            columns: [
                {name: 'id', type: glue.Schema.STRING},
                {name: 'vendorId', type: glue.Schema.INTEGER},
                {name: 'pickupDate', type: glue.Schema.STRING},
                {name: 'dropoffDate', type: glue.Schema.STRING},
                {name: 'passengerCount', type: glue.Schema.INTEGER},
                {name: 'pickupLongitude', type: glue.Schema.DOUBLE},
                {name: 'pickupLatitude', type: glue.Schema.DOUBLE},
                {name: 'dropoffLongitude', type: glue.Schema.DOUBLE},
                {name: 'dropoffLatitude', type: glue.Schema.DOUBLE},
                {name: 'storeAndFwdFlag', type: glue.Schema.STRING},
                {name: 'gcDistance', type: glue.Schema.DOUBLE},
                {name: 'tripDuration', type: glue.Schema.INTEGER},
                {name: 'googleDistance', type: glue.Schema.INTEGER},
                {name: 'googleDuration', type: glue.Schema.INTEGER},
                {name: 'source', type: glue.Schema.STRING},
            ],
            dataFormat: glue.DataFormat.PARQUET,
        })
        new cdk.CfnOutput(this, 'TableArn', {value: this.entity.tableArn, description: 'The ARN of the S3 Table.'})
    }
}