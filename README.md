# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template



# Experimental Migration from CFN to CDK
```bash
❌  Migrate failed for `test-stack`: TestStackStack could not be generated because Resources.Mamamiya.Properties.BucketName[1].RandomGUID: untagged and internally tagged enums do not support enum input at line 68 column 27

TestStackStack could not be generated because Resources.Mamamiya.Properties.BucketName[1].RandomGUID: untagged and internally tagged enums do not support enum input at line 68 column 27
```