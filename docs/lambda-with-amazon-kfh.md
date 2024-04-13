# Prerequisites
1. Create a Glue Table for this lab.  
    The construct `Lab3Table` in [metadata.ts](../lib/metadata.ts) will create the table for you.  
    You can also control not to create the table via CDK but manulally create the table on the Athena console like a tough guy.  
    ```sql
    CREATE EXTERNAL TABLE `nyctaxitrips`
    (
    `id` string,
    `vendorId` int,
    `pickupDate` string,
    `dropoffDate` string,
    `passengerCount` int,
    `pickupLongitude` double,
    `pickupLatitude` double,
    `dropoffLongitude` double,
    `dropoffLatitude` double,
    `storeAndFwdFlag` string,
    `gcDistance` double,
    `tripDuration` int,
    `googleDistance`int,
    `googleDuration`int,
    `source`string
    )
    PARTITIONED BY ( `year` string, `month` string, `day` string, `hour` string)
    ROW FORMAT SERDE 'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe'
    STORED AS INPUTFORMAT 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat'
    OUTPUTFORMAT 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat'
    LOCATION 's3://<<BUCKET-NAME>>/nyctaxitrips/'
    ```

# Streaming Progress
1. Start the simluation streaming application.
    ![start the simulation streaming application](../images/[Lab3]%20Start%20a%20simulation%20streaming%20application.png)
    ```bash
    cd kinesis-producer-library-examples-master/
    java -cp target/amazon-kinesis-replay-1.0-SNAPSHOT.jar A_SimpleProducer
    ```
2. Check the reading status of the delivery Firehose stream.
    ![Monitoring on the Firehose stream](../images/[Lab%203]%20Monitoring%20on%20DFH.png)
    ℹ️ You can click the URL revealed with `Lab3KinesisFirehoseDataFirehoseStreamMonitoring` aslo, which you can get after the CDK deployment.
3. Check the transformation function. (Optional)
    ![Configuration tab of the transformation function](../images/[Lab%203]%20transformation%20function.png)
    ℹ️ You can click the URL revealed with `Lab3KinesisFirehoseTransformationFunctionUrl` aslo, which you can get after the CDK deployment.
4. Check output files from the Firehose delivery stream in the destination bucket.
    ![files in the destination bucket](../images/[Lab%203]%20output%20files%20in%20destination%20bucket.png)
5. Check output results via Amazon Athena.
    ![check results via Athena](../images/[Lab%203]%20Check%20output%20results.png)
    ```sql
    SELECT *
    FROM kinesislab.nyctaxitrips
    ```
    ℹ️ You might need to set up where query results are going to store within some S3 bucket before running the query on Amazon Athena.