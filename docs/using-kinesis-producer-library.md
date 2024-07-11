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
    The content of `POM.xml` when I was learning for reference:
    ```xml
    <!--
    ~ Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    ~
    ~ Permission is hereby granted, free of charge, to any person obtaining a copy of
    ~ this software and associated documentation files (the "Software"), to deal in
    ~ the Software without restriction, including without limitation the rights to
    ~ use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
    ~ the Software, and to permit persons to whom the Software is furnished to do so.
    ~
    ~ THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    ~ IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    ~ FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
    ~ COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
    ~ IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
    ~ CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    -->

    <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.amazonaws.samples.kinesis.replay</groupId>
    <artifactId>amazon-kinesis-replay</artifactId>
    <version>1.0-SNAPSHOT</version>
    <name>amazon-kinesis-replay</name>

    <packaging>jar</packaging>

    <properties>
        <java.version>11</java.version>
        <aws.java-sdk.version>2.25.21</aws.java-sdk.version>
        <aws.kpl.version>0.15.10</aws.kpl.version>
        <slf4j.version>2.0.12</slf4j.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
        <groupId>com.amazonaws</groupId>
        <artifactId>amazon-kinesis-producer</artifactId>
        <version>${aws.kpl.version}</version>
        <exclusions>
            <exclusion>
            <!-- Exclude an old version of jackson-dataformat-cbor that is being pulled in by a transitive dependency -->
            <groupId>com.fasterxml.jackson.dataformat</groupId>
            <artifactId>jackson-dataformat-cbor</artifactId>
            </exclusion>
            <exclusion>
            <!-- Exclude an old version of httpcomponents that is being pulled in by a transitive dependency -->
            <groupId>org.apache.httpcomponents</groupId>
            <artifactId>httpclient</artifactId>
            </exclusion>
        </exclusions>
        </dependency>

        <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>kinesis</artifactId>
        <version>${aws.java-sdk.version}</version>
        </dependency>

        <dependency>
        <groupId>software.amazon.awssdk</groupId>
        <artifactId>s3</artifactId>
        <version>${aws.java-sdk.version}</version>
        </dependency>

        <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>${slf4j.version}</version>
        </dependency>

        <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-log4j12</artifactId>
        <version>${slf4j.version}</version>
        </dependency>

        <dependency>
        <groupId>commons-cli</groupId>
        <artifactId>commons-cli</artifactId>
        <version>1.6.0</version>
        </dependency>

        <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-compress</artifactId>
        <version>1.26.1</version>
        </dependency>


        <!-- https://mvnrepository.com/artifact/com.fasterxml.jackson.dataformat/jackson-dataformat-csv -->
        <dependency>
            <groupId>com.fasterxml.jackson.dataformat</groupId>
            <artifactId>jackson-dataformat-csv</artifactId>
            <version>2.17.0</version>
        </dependency>

        <dependency>
        <groupId>org.json</groupId>
        <artifactId>json</artifactId>
        <version>20240303</version>
        </dependency>

    </dependencies>

    <build>
        <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.7.0</version>
            <configuration>
            <source>${java.version}</source>
            <target>${java.version}</target>
            </configuration>
        </plugin>

        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>3.2.4</version>
            <executions>
            <execution>
                <phase>package</phase>
                <goals>
                <goal>shade</goal>
                </goals>
                <configuration>
                <createDependencyReducedPom>false</createDependencyReducedPom>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                    <mainClass>C_AsyncProducer</mainClass>
                    </transformer>
                </transformers>
                </configuration>
            </execution>
            </executions>
        </plugin>
        </plugins>
    </build>

    </project>
    ```
3. Execute the program
    ```java
    java -cp target/amazon-kinesis-replay-1.0-SNAPSHOT.jar A_SimpleProducer
    ```

![KPL with success](../images/[Lab%201]%20KPL%20with%20success.png)