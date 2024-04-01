# The Kinesis Producer Library (KPL)
## Write to one or more Kinesis Data Streams with automatic and configurable retries.
1. Collects records and utilizes `PutRecords` API to write multiple records to multiple shards per request.
2. Aggregate records to increase payload size and throughput.*
3. Integrate with the Kinesis Client Library (KCL) to de-aggregate batch records on the consuming side.
4. Integrates with Amazon CloudWatch metrics to provide visibility into the KPL Performance.

## Shard Utilization
* Kinesis Producer Library's Capabilities.
    1. Aggregates records to increase payload size and throughput.
    2. Optimizes throughput for each shard in a Kinesis Data Stream.
* Data Throughput and Limits
    1. A Kinesis Data Stream can handle 1MiB of data per second per shard.
    2. Individual records often smaller than 1MiB, usually in the range of tens of kilobytes.
* KPL's Operational Mechanism
    1. Buffers records to approach the 1MiB per second limit as closely as possible.
    2. Waits for either a configured time or data amount to optimize throughput.
* Considerations for Usage
    1. Not ideal for applications requiring low latency.
    2. Kinesis Producer Library can introduce additional processing delays due to `RecordMaxBufferedTime` setting.


## A Simple Producer
1. Example [downloaded](https://static.us-east-1.prod.workshops.aws/public/ad5d7b4f-9c68-4ada-a4c0-0cb9b5ae550d/static/code/kpl/kinesis-producer-library-examples-master.zip).
    * If you were afarid of the link, you could anaylze the link via some prestigous scanning website before opening it up. 😉
2. Upload the whole directory unzipped from downloading under the root directory of the Cloud 9 instance.  
    ![](../images/[Lab%201]%20A%20Simple%20Producer%20as%20KPL.png)
3. Configuration of the KPL
    ```java
    import com.amazonaws.services.kinesis.producer.KinesisProducer;
    import com.amazonaws.services.kinesis.producer.KinesisProducerConfiguration;
    .
    .
    KinesisProducerConfiguration config = new KinesisProducerConfiguration()
                .setRecordMaxBufferedTime(3000)
                .setMaxConnections(1)
                .setRequestTimeout(60000)
                .setRegion(region);
    final KinesisProducer kinesis = new KinesisProducer(config);
    ```
    * `RecordMaxBufferedTime`
        1. controls the amount of time (milliseconds) a record may spend being buffered before it gets produced to one or more Kinesis Data Streams. 
        2. Records could be produced sooner than this time depending on other settings we will cover. Buffered time can also include retries and failures to produce to the stream.  
        > ⚠️ Setting this value too high may impact latency and consume additional resources in the producing application without increasing throughput.

        > The default value for `RecordMaxBufferedTime` is 100 milliseconds.
    * `MaxConnections`  
        1. The maximum amount of connections to open to the backend. 
        2. HTTP requests to Kinesis Data Streams will be sent in parallel over multiple connections.
        > The default value for MaxConnections is 24.
    * `RequestTimeout`
        1. The maximum total time (milliseconds) between when an HTTP request is sent and receiving all responses from sent messages. If the request waiting time goes over this value, the request will be considered timed out.
        > ⚠️ A timed-out record may still have been successfully published to Kinesis Data Streams, and retrying can lead to duplicates. Therefore, by setting this value too low, a data stream increases the likelihood of duplicates.

        > The default value for `RequestTimeout` is 6000 milliseconds.

## Run the program
1. Move to proper directory
    ```bash
    cd kinesis-producer-library-examples-master/
    ```
2. Build the package
    ```bash
    mvn clean compile package
    ```
3. Execute the program
    ```java
    java -cp target/amazon-kinesis-replay-1.0-SNAPSHOT.jar A_SimpleProducer
    ```