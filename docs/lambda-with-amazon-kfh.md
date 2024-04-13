# Steps
1. Create Glue Table
2. Create Amazon Data Firehose Delivery Stream

# Streaming Progress
1. Start the simluation streaming application.
    ![start the simulation streaming application](../images/[Lab3]%20Start%20a%20simulation%20streaming%20application.png)
    ```bash
    cd kinesis-producer-library-examples-master/
    java -cp target/amazon-kinesis-replay-1.0-SNAPSHOT.jar A_SimpleProducer
    ```
2. Check the reading status of the delivery Firehose stream.
    ![Monitoring on the Firehose stream](../images/[Lab%203]%20Monitoring%20on%20DFH.png)
3. 