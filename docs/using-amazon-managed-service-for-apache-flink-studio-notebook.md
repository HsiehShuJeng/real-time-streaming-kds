1. Upload data file into the S3 bucket.
    ```bash
    # As of me, my bucket name is curateddata-630778274080-ap-southeast-1-c424f300, yours will be different to this. Mind the information after the CDK deployment.  
    BUCKET_NAME="nyctaxitrips-630778274080-ap-southeast-1-c424f300"
    FILE_NAME="taxi-trips.csv"
    curl -o taxi-trips.csv https://static.us-east-1.prod.workshops.aws/public/ad5d7b4f-9c68-4ada-a4c0-0cb9b5ae550d/static/code/studio/data/${FILE_NAME} && \
    aws s3 cp taxi-trips.csv s3://$BUCKET_NAME/${FILE_NAME} && \
    rm ${FILE_NAME}
    ```
    OR you can download the [file](https://static.us-east-1.prod.workshops.aws/public/ad5d7b4f-9c68-4ada-a4c0-0cb9b5ae550d/static/code/studio/data/taxi-trips.csv) and upload it via the AWS Console.  
2. Check whether the data set was uploaded into the bucket.
    ![Check data set](../images/[Lab%202]%20Data%20Set.png)
3. Run Studio application
    ![Run KDA application](../images/[Lab%202]%20Run%20the%20notebook.png)
4. Import Zeppelin Notebook
    ```bash
    curl -o Taxi\ Trips\ Data\ Loading\ from\ S3\ to\ Kinesis-1.zpln https://static.us-east-1.prod.workshops.aws/public/ad5d7b4f-9c68-4ada-a4c0-0cb9b5ae550d/static/code/studio/notebook/Taxi%20Trips%20Data%20Loading%20from%20S3%20to%20Kinesis-1.zpln
    ```
    OR you can download the Zeppelin [notebook](https://static.us-east-1.prod.workshops.aws/public/ad5d7b4f-9c68-4ada-a4c0-0cb9b5ae550d/static/code/studio/notebook/Taxi%20Trips%20Data%20Loading%20from%20S3%20to%20Kinesis-1.zpln) here and upload it onto the interactive environment.
    ![import Zeppelin notebook](../images/[Lab%202]%20Import%20Zeppelin%20Notebook.png)
    * Command for cleaning up
    ```bash
    rm Taxi\ Trips\ Data\ Loading\ from\ S3\ to\ Kinesis-1.zpln
    ```
5. Run the Notebook step by step
    * UI of Apache Flink
        ![Apache Flink](../images/[Lab%202]%20Apache%20Flink.png)
    * 