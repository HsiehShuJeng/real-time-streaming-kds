# Steps
1. Download the sample consumer.
    ```bash
    curl -O https://static.us-east-1.prod.workshops.aws/public/0fc79666-ba4a-4159-9df9-579e78032115/static/code/kcl/kinesis-immersionday-kcl-main.zip
    ```
2. Before starting the consuming application
    ```bash
    export STREAM_NAME='input_stream'
    export AWS_REGION='ap-southeast-1'
    export APPLICATION_NAME='ImmersiondayKCLConsumer'
    ```
    ![Running Snapshot of the KCL consumer](../images/[Lab%206]%20Launching%20the%20KCL%20consumer.png)

# Monitoring
1. After building the KCL consumer with success, you should be able to see the following DDB table, which is created by te KCL consumer.  
    ![DDB for KCL](../images/[Lab%206]%20DDB%20for%20KCL.png)
2. You should be able to get the namespace named `
ImmersiondayKCLConsumer` in Amazon CloudWatch.  
    ![CloudWatch Logs](../images/[Lab%206]%20CloudWatch%20metrics.png)