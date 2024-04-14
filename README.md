# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Learning Objectives
<details>
<summary>Produce data to Kinesis Data Streams</summary>

![](images/Lab%20Architecture%201.png)  
* [Amazon SDK](docs/using-amazon-sdk-with-kinesis.md)
* [Kinesis Producer Library](docs/using-kinesis-producer-library.md)

</details>

<details>
<summary>Write data to a Kinesis Data Stream using Amazon Managed Service for Apache Flink Studio Notebook</summary>

</details>

<details>
<summary>Lambda with Amazon Data Firehose</summary>

![Lab Architecture 3](images/Lab%20Architecture%203.png)
* [Detail for Lab 3](docs/lambda-with-amazon-kfh.md)

</details>

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

# TBD
## Cloud 9
![](images/Cloud%209%20Launch.png)
```bash
# Step 1
sudo yum install maven -y
# Point to Java 11
sudo update-alternatives --config java
sudo update-alternatives --config javac
```
![](images/Point%20to%20Java%2011.png)

## Using the Amazon SDK with Kinesis
Goal
1. Create a Kinesis Data Stream (if one does not already exist).
2. Learn about the concepts of writing to a Kinesis Data Stream using the Kinesis Data Streams API.
3. Write Data to a Kinesis Data Stream.
Optimize our code for low latency writes to the Kinesis Data Stream.
4. Ensure data is published in order per shard