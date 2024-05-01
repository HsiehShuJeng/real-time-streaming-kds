![Lab Architecture 5](../images/Lab%20Architecture%205.png)
# Notes
* The logic of the Lambda function
    1. It inspects the incoming message for unclean records with missing fields and filters them out
    2. It then sends the clean records to DynamoDB.
    3. If it receives a throttling error, it determines if all the records received failed or if some records failed.
    4. If all records failed, it raises an exception, so the Lambda service can retry with the same payload (the service keeps retrying with the same payload until it receives a success).
    5. If any of the retries are successful, it returns a success. If none of the retries are successful, it raises an exception, so the Lambda service can retry with the same payload.
* [Amazon Kinesis configuration parameters](https://docs.aws.amazon.com/lambda/latest/dg/with-kinesis.html#services-kinesis-params)


# Steps
If you want to experience how ti feels like to create a DynamoDB, a Lambda function based on a zip file with an event source triggered by a Kinesis stream **via the AWS Console**, you can just follow the steps revealed [here](https://catalog.workshops.aws/real-time-streaming-with-kinesis/en-US/lab-6-lambda-consumer/runlab).  
  
When you deploy the stack constrcut defined in [real-time-streaming-kds-stack.ts](../lib/real-time-streaming-kds-stack.ts) without specifying the argument of `createLab5ResourcesOrNot`, you will get the resources directly.  
  
Either you choose the console or CDK to deploy the resources, you will need to start the data flow to the Kinesis stream named `input_stream`, which is defined by the construct of `BaseKinesisDataStream` located at [kds-studio.ts](../lib/kda-studio.ts).
```bash
# Go to the Cloud 9 page, whose URL can be clicked on a terminal session where you deploy the stack.

# Method 1
python -m pip install boto3
python lab1.py

# Method 2
cd kinesis-producer-library-examples-master/
    java -cp target/amazon-kinesis-replay-1.0-SNAPSHOT.jar A_SimpleProducer
```

# Monitoring
1. You should be able to see the aggreagation results in the DynamoDB table named `kinesisAggs`, defined by the constrcut of `DdbTable` located at [ddb.ts](../lib/ddb.ts).
    ![DDB table check](../images/[Lab%205]%20DDB%20Lookup%20After%20Consuming.png)
2. You should be able to see some logs for the consuming Lambda function, which is defined by the construct of `KdsConsumerFunction` located at [lambda-functions.ts](../lib/lambda-functions.ts).
    ![Consuming Lambda Logs](../images/[Lab%205]%20Logs%20of%20Consuming%20Lambda.png)
    ![Detail in logs of consuming Lambda](../images/[Lab%205]%20Detail%20in%20Logs%20of%20Consuimg%20Lambda.png)
3. Also, there are some metrics you will see some peaks after the launch of the streaming flow for some miutes.