import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { OpenSearch } from '../lib/search-engine';
describe("Tests the creation of Open Search instances", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'TestStack');
    new OpenSearch(stack, 'OpenSearch');
    const template = Template.fromStack(stack);
    let resuorceType = 'AWS::OpenSearchService::Domain'
    test('Checks the number of OpenSearch instances', () => {
        const openSearchResources = template.findResources(resuorceType);
        let openSearchNumber = 0
        Object.keys(openSearchResources).forEach(key => {
            if (openSearchResources[key].Type === resuorceType) {
                openSearchNumber++;
            }
        });
        expect(openSearchNumber).toBe(1);
    })
    test('Checks the instance of Open Search', () => {
        template.hasResourceProperties(resuorceType, Match.objectEquals({
            "AdvancedSecurityOptions": {
              "Enabled": true,
              "InternalUserDatabaseEnabled": true,
              "MasterUserOptions": {
                "MasterUserName": {
                  "Fn::Join": [
                    "",
                    [
                      "{{resolve:secretsmanager:",
                      {
                        "Ref": "OpenSearchPasswordF9095365"
                      },
                      ":SecretString:username::}}"
                    ]
                  ]
                },
                "MasterUserPassword": {
                  "Fn::Join": [
                    "",
                    [
                      "{{resolve:secretsmanager:",
                      {
                        "Ref": "OpenSearchPasswordF9095365"
                      },
                      ":SecretString:password::}}"
                    ]
                  ]
                }
              }
            },
            "ClusterConfig": {
              "DedicatedMasterEnabled": false,
              "InstanceCount": 1,
              "InstanceType": "t3.medium.search",
              "ZoneAwarenessEnabled": false
            },
            "DomainEndpointOptions": {
              "EnforceHTTPS": true,
              "TLSSecurityPolicy": "Policy-Min-TLS-1-0-2019-07"
            },
            "DomainName": "os-domain",
            "EBSOptions": {
              "EBSEnabled": true,
              "VolumeSize": 10,
              "VolumeType": "gp2"
            },
            "EncryptionAtRestOptions": {
              "Enabled": true
            },
            "EngineVersion": "OpenSearch_1.2",
            "LogPublishingOptions": {},
            "NodeToNodeEncryptionOptions": {
              "Enabled": true
            }
          }))
    });
})