# Notes
* The logic of the Lambda function
    1. It inspects the incoming message for unclean records with missing fields and filters them out
    2. It then sends the clean records to DynamoDB.
    3. If it receives a throttling error, it determines if all the records received failed or if some records failed.
    4. If all records failed, it raises an exception, so the Lambda service can retry with the same payload (the service keeps retrying with the same payload until it receives a success).
    5. If any of the retries are successful, it returns a success. If none of the retries are successful, it raises an exception, so the Lambda service can retry with the same payload.
* [Amazon Kinesis configuration parameters](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-params)