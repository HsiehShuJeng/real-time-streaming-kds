import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { GlueDatabase } from '../lib/metadata';

describe("Tests the creation of the Glue database", () => {
    const app = new cdk.App();
        // WHEN
    const stack = new cdk.Stack(app, 'TestStack');
    new GlueDatabase(stack, 'Glue');
    const template = Template.fromStack(stack);
    test('Checks the number of Glue database', () => {
        const glueDatabaseResources = template.findResources('AWS::Glue::Database');
        let glueDatabaseNumber = 0
        Object.keys(glueDatabaseResources).forEach(key => {
            if (glueDatabaseResources[key].Type === 'AWS::Glue::Database') {
                glueDatabaseNumber++;
            }
        });
        expect(glueDatabaseNumber).toBe(1);
    })
    test('Checks the Glue database', () => {
        // THEN
        template.hasResourceProperties('AWS::Glue::Database', Match.objectEquals({
            "CatalogId": {
              "Ref": "AWS::AccountId"
            },
            "DatabaseInput": {
              "Description": "Database for KDA Application Source and Target Tables",
              "Name": "kinesislab"
            }
          }))
    });
})