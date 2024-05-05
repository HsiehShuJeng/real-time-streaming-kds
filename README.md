![Lab Architecture](images/Lab%20Architecture%20Whole.png)
# Real-Time Streaming with Amazon Kinesis

This repository contains a stack construct that includes every resources you need for the workshop of [Real Time Streaming with Amazon Kinesis](https://catalog.workshops.aws/real-time-streaming-with-kinesis/en-US).  
You can just fork this repository and check the structure of the construct of `RealTimeStreamingKdsStack` located at [real-time-streaming-kds-stack.ts](lib/real-time-streaming-kds-stack.ts). In Lab 4, there is an action to create an OpenSearch cluster, that means it takes somewhat more time to complete the deployment. If you don't mind waiting a bit, just deploy it with the CDK commands.
```bash
# Assume you have set everything needed in an AWS profile named 'default'
cdk synth
cdk diff
cdk deploy
```

- [Lab 1] [Producing data to Kinesis Data Streams](docs/using-amazon-sdk-with-kinesis.md)
- [Lab 2] [Writing data to a Kinesis Data Stream using Amazon Managed Service for Apache Flink Studio Notebook](docs/using-amazon-managed-service-for-apache-flink-studio-notebook.md)
- [Lab 3] [Transforming and Delivering Streaming Data with Kinesis Data Firehose](docs/lambda-with-amazon-kfh.md)
- [Lab 4] [Cleaning, aggregating, and enriching events with Amazon Managed Service for Apache Flink](docs/clean-aggregate-enrich-events-with-amazon-managed-service-for-apache-flink.md)
- [Lab 5] [Consuming data from Kinesis Data Streams using AWS Lambda](docs/lambda-consumer-kinesis-data-stream.md)
- [Lab 6] [Consuming data from Kinesis Data Streams using Amazon Kinesis Client Library (KCL)](docs/consuimg-with-amazon-kcl.md)

## Getting Started
It is expected that using this repositroy, i.e, deploying the resources via the stack constrcut, will help you assimilate concepts delivered by the [workshop](https://catalog.workshops.aws/real-time-streaming-with-kinesis/en-US/lab-3-kdf) with hands-on experience more quickly.  
Of course, you still can follow all the instructions depicted in the [workshop](https://catalog.workshops.aws/real-time-streaming-with-kinesis/en-US/lab-3-kdf).
![Resources Presented in the Applicaiton Composer](images/Resource%20Presented%20by%20Application%20Composer.png)

## Lab Modules

1. **Data Ingestion with Kinesis Data Streams**: Learn how to ingest high-volume data streams and scale your data intake with Kinesis Data Streams.

2. **Real-Time Analytics with Kinesis Data Analytics**: Perform real-time analytics and gain actionable insights from your streaming data using SQL queries or Apache Flink.

3. **Streaming Data Storage with OpenSearch**: Deliver streaming data to Amazon OpenSearch to enable near real-time analytics and visualization of your data.

4. **Data Transformation with Kinesis Data Firehose**: Transform and enrich streaming data on the fly and deliver it to data lakes, data stores and analytics services.

5. **Change Data Capture with DynamoDB Streams**: Capture and respond to data modification events in Amazon DynamoDB tables in real-time.

6. **Kinesis Services Integration**: Orchestrate Kinesis Data Streams, Kinesis Data Analytics, Kinesis Data Firehose and DynamoDB Streams for an end-to-end streaming solution.

Refer to the `docs` directory for detailed and concise instructions and architecture diagrams for each lab module.