import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DdbTable } from '../lib/ddb';
describe("Tests the creation of the DynamoDB table", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    new DdbTable(stack, 'DynamoDB');
    const template = Template.fromStack(stack);
    test('Checks the number of the DDB table', ()=>{
        const ddbTableResources = template.findResources('AWS::DynamoDB::Table');
        let ddbTableNumber = 0;
        Object.keys(ddbTableResources).forEach(key => {
            if (ddbTableResources[key].Type === 'AWS::DynamoDB::Table') {
                ddbTableNumber++;
            }
        });
        expect(ddbTableNumber).toBe(1);
    })
})