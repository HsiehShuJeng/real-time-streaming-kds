# Make content table
* [Working with the SDK](#working-with-the-sdk)
* [Run the program](#run-the-program)
* [Notes](#notes)
    * [Amazon Kinese Data Streams](#amazon-kinesis-data-streams)
    * [`PutRecord` API](#putrecord-api)
    * [`PutRecourds` API](#putrecords-api)
1. Create a Kinesis Data Stream (if one does not already exist).
2. Learn about the concepts of writing to a Kinesis Data Stream using the Kinesis Data Streams API.
3. Write Data to a Kinesis Data Stream.
Optimize our code for low latency writes to the Kinesis Data Stream.
4. Ensure data is published in order per shard

# Working with the SDK
1. Create a new python script on the Cloud9 instance.
    ```python
    import json
    import boto3
    import csv
    import datetime
    import random
    from datetime import timedelta

    kdsname='input_stream'
    region='ap-southeast-1'
    i=0
    clientkinesis = boto3.client('kinesis',region_name=region)


    def getlatlon():
        a=["-73.98174286,40.71915817", "-73.98508453, 40.74716568", "-73.97333527,40.76407242", "-73.99310303,40.75263214",
            "-73.98229218,40.75133133", "-73.96527863,40.80104065", "-73.97010803,40.75979996", "-73.99373627,40.74176025", "-73.98544312,	40.73571014",
            "-73.97686005,40.68337631", "-73.9697876,40.75758362", "-73.99397278,40.74086761", "-74.00531769,40.72866058", "-73.99013519, 40.74885178",
            "-73.9595108, 40.76280975", "-73.99025726,	40.73703384", "-73.99495697,40.745121", "-73.93579865,40.70730972", "-73.99046326,40.75100708",
            "-73.9536438,40.77526093", "-73.98226166,40.75159073", "-73.98831177,40.72318649", "-73.97222137,40.67683029", "-73.98626709,40.73276901",
            "-73.97852325,	40.78910065", "-73.97612, 40.74908066", "-73.98240662,	40.73148727", "-73.98776245,40.75037384", "-73.97187042,40.75840378",
            "-73.87303925,	40.77410507", "-73.9921875,	40.73451996", "-73.98435974,40.74898529", "-73.98092651,40.74196243", "-74.00701904,40.72573853",
            "-74.00798798,	40.74022675", "-73.99419403,40.74555969", "-73.97737885,40.75883865", "-73.97051239,40.79664993", "-73.97693634,40.7599144",
            "-73.99306488,	40.73812866", "-74.00775146,40.74528885", "-73.98532867,40.74198914", "-73.99037933,40.76152802", "-73.98442078,40.74978638",
            "-73.99173737,	40.75437927", "-73.96742249,40.78820801", "-73.97813416,40.72935867", "-73.97171021,40.75943375", "-74.00737,40.7431221",
            "-73.99498749,	40.75517654", "-73.91600037,40.74634933", "-73.99924469,40.72764587", "-73.98488617,40.73621368", "-73.98627472,40.74737167"
            ]
        randomnum = random.randint(0, 53)
        b=a[randomnum]
        return b	
                
    def getstore():
        taxi=['Y','N']
        randomnum = random.randint(0, 1)
        return randomnum

    #@JsonPropertyOrder({"id", "vendorId", "pickupDate", "dropoffDate", "passengerCount", "pickupLongitude", "pickupLatitude", "dropoffLongitude", "dropoffLatitude", "storeAndFwdFlag", "gcDistance", 
    #"tripDuration", "googleDistance", "googleDuration"})


    while True:
        i=int(i)+1
        id='id' + str(random.randint(1665586, 8888888))
        vendorId=random.randint(1, 2)
        pickupDate= datetime.datetime.now().isoformat()
        dropoffDate= datetime.datetime.now() + timedelta(minutes=random.randint(30, 100))
        dropoffDate=dropoffDate.isoformat()
        passengerCount=random.randint(1, 9)
        location=getlatlon()
        location=location.split(",")
        pickupLongitude=location[0]
        pickupLatitude=location[1]
        location=getlatlon()
        location=location.split(",")
        dropoffLongitude=location[0]
        dropoffLatitude=location[1]	
        storeAndFwdFlag=getstore()
        gcDistance=random.randint(1, 7)
        tripDuration=random.randint(8, 10000)
        googleDistance=gcDistance
        googleDuration=tripDuration
        
        new_dict={}
        new_dict["id"]=id
        new_dict["vendorId"]=vendorId
        new_dict["pickupDate"]=pickupDate
        new_dict["dropoffDate"]=dropoffDate
        new_dict["passengerCount"]=passengerCount
        new_dict["pickupLongitude"]=pickupLongitude
        new_dict["pickupLatitude"]=pickupLatitude
        new_dict["dropoffLongitude"]=dropoffLongitude
        new_dict["dropoffLatitude"]=dropoffLatitude
        new_dict["storeAndFwdFlag"]=storeAndFwdFlag
        new_dict["gcDistance"]=gcDistance
        new_dict["tripDuration"]=tripDuration
        new_dict["googleDistance"]=googleDistance
        new_dict["googleDuration"]=googleDuration
        
        response=clientkinesis.put_record(StreamName=kdsname, Data=json.dumps(new_dict), PartitionKey=id)
        print("Total ingested:"+str(i) +",ReqID:"+ response['ResponseMetadata']['RequestId'] + ",HTTPStatusCode:"+ str(response['ResponseMetadata']['HTTPStatusCode']))
    ```

2. Save the file in the root of your Cloud9 Instance and call it `lab1.py`.
    ![](../images/[Lab1]%20save%20a%20file.png)


# Run the program
1. Install the `boto3` library on the Cloud 9 instance.
    ```bash
    pip install boto3
    ```
2. Once you finish uploading the python script on your Cloud9 environment, run the program by entering the following command in Cloud9 terminal. The script will start ingesting records to your Kinesis Data Stream and print request ID and successful HTTP response code (200).
    ```bash
    python lab1.py
    ```
    ![](../images/[Lab1]%20Ingestion%20Screenshot.png)

# Notes
## Amazon Kinesis Data Streams
- Kinesis Data Streams is a service that captures, stores, and transports data in real-time.
- It segregates data records into multiple shards, using the partition key associated with each record.
- If **ordering is important**, you must **specify `partitionKey`** in your request.

## `PutRecord` API
- The `PutRecord` API writes a single data record into an Amazon Kinesis data stream.
- When using `PutRecord`, you must specify the stream name, partition key, and the data blob (in JSON format, base64-encoded).
- The total size of the data blob and partition key must not exceed the maximum record size (1 MiB).
- Records cannot be modified or reordered after being written to the stream.

## `PutRecords` API
- The PutRecords operation sends multiple records to Kinesis Data Streams in a single request.
- Each PutRecords request can support up to 500 records, with each record up to 1 MiB in size, up to a total limit of 5 MiB for the entire request.
- `PutRecords` is useful for achieving higher throughput when ordering of records is not required, such as for _ingesting application logs_, _service logs_, or _click stream data_.

Choosing between `PutRecord` and `PutRecords`:
- Use `PutRecord` when strict ordering of records within a shard is required, such as for ingesting ticker data or transactional data.
- Use `PutRecords` to achieve higher throughput when **ordering of records is not a concern**.

## KPL
- Consider using the Kinesis Producer Library (KPL) if the additional processing delay introduced by the library can be tolerated, as it can improve performance through better packing efficiency.
- Using KPL  can incur an additional processing delay of up to `RecordMaxBufferedTime` within the library (user-configurable).
- Larger values of `RecordMaxBufferedTime` result in higher packing efficiencies and better performance.