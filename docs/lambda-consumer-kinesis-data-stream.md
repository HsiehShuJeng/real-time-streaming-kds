# Notes
* The logic of the Lambda function
    1. It inspects the incoming message for unclean records with missing fields and filters them out
    2. It then sends the clean records to DynamoDB.
    3. If it receives a throttling error, it determines if all the records received failed or if some records failed.
    4. If all records failed, it raises an exception, so the Lambda service can retry with the same payload (the service keeps retrying with the same payload until it receives a success).
    5. If any of the retries are successful, it returns a success. If none of the retries are successful, it raises an exception, so the Lambda service can retry with the same payload.
* [Amazon Kinesis configuration parameters](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-params)


# Steps
1. Download the Kinesis Client Library (KCL) [examples](https://static.us-east-1.prod.workshops.aws/public/0fc79666-ba4a-4159-9df9-579e78032115/static/code/kcl/kinesis-immersionday-kcl-main.zip).
    ```bash
    curl -o kinesis-immersionday-kcl-main.zip https://static.us-east-1.prod.workshops.aws/public/0fc79666-ba4a-4159-9df9-579e78032115/static/code/kcl/kinesis-immersionday-kcl-main.zip
    ```
2. Extract files from the zip file onto the Cloud 9 instance.
    ```bash
    unzip kinesis-immersionday-kcl-main.zip
    # in case you don't have the command, the following can resuce you from the situation
    # sudo yum install unzip
    ```
3. 