![Architecture 4](../images/Lab%20Architecture%204.png)

# Steps
1. Setup managed Apache Flink Notebook
    The construct, `KdaStudio`, in [kda-studio.ts](../lib/kda-studio.ts) will create a Studio notebook for you.  
    If you want to create the Studio notebook like a tough guy, i.e., through the AWS Console, you can refer to [here](https://catalog.workshops.aws/real-time-streaming-with-kinesis/en-US/lab-5-kda-studio).

2. Stream the data into OpenSearch
    * Run the notebook instance
        ![Run the notebook instance](../images/[Lab%204]%20Run%20the%20notebook%20instance.png)
    * Download the [Zeppelin notebook file](https://static.us-east-1.prod.workshops.aws/public/ad5d7b4f-9c68-4ada-a4c0-0cb9b5ae550d/static/code/studio/notebook/KDA-OpenSearch.zpln) and import it into the Studio notebook.  
        ℹ️ Remember to check the stream name and the AWS region in the imported notebook whether they match the ones from your deployment.  
        ℹ️ The password for the account of `admin` in OpenSearch is created by the construct of `OpenSearch` in [search-engine.ts](../lib/search-engine.ts). To create a table for OpenSearch in this managed Apache Flink application built on the Studio notebook with success, you need to go to the corresponding secret to check the password for the `admin` account.    
        <details><summary>magical content</summary>

        ```json
        {
        "paragraphs": [
            {
            "text": "%md\n1. Run the following cell to create a Table called \"taxi_trips\" to hold \nKinesis Stream Data\n\n### Don't forget to edit the line which reads `aws.region` if your region differs from the one listed in the notebook!",
            "user": "anonymous",
            "dateUpdated": "2021-12-21T15:31:33+0000",
            "progress": 0,
            "config": {
                "tableHide": false,
                "editorSetting": {
                "language": "markdown",
                "editOnDblClick": true,
                "completionKey": "TAB",
                "completionSupport": false
                },
                "colWidth": 12,
                "editorMode": "ace/mode/markdown",
                "fontSize": 15,
                "editorHide": true,
                "results": {},
                "enabled": false
            },
            "settings": {
                "params": {},
                "forms": {}
            },
            "apps": [],
            "runtimeInfos": {},
            "progressUpdateIntervalMs": 500,
            "jobName": "paragraph_1640100538532_209633894",
            "id": "paragraph_1636309021523_1733557593",
            "dateCreated": "2021-12-21T15:28:58+0000",
            "status": "FINISHED",
            "focus": true,
            "$$hashKey": "object:277",
            "dateFinished": "2021-12-21T15:31:14+0000",
            "dateStarted": "2021-12-21T15:31:11+0000",
            "results": {
                "code": "SUCCESS",
                "msg": [
                {
                    "type": "HTML",
                    "data": "<div class=\"markdown-body\">\n<ol>\n<li>Run the following cell to create a Table called &ldquo;taxi_trips&rdquo; to hold<br />\nKinesis Stream Data</li>\n</ol>\n<h3>Don&rsquo;t forget to edit the line which reads <code>aws.region</code> if your region differs from the one listed in the notebook!</h3>\n\n</div>"
                }
                ]
            }
            },
            {
            "text": "%flink.ssql(type=update)\ndrop table if exists taxi_trips;\n\nCREATE TABLE taxi_trips (\nid STRING,\nvendorId INTEGER, \npickupDate STRING, \ndropoffDate STRING, \npassengerCount INTEGER, \npickupLongitude DOUBLE, \npickupLatitude DOUBLE, \ndropoffLongitude DOUBLE, \ndropoffLatitude DOUBLE, \nstoreAndFwdFlag STRING, \ngcDistance DOUBLE, \ntripDuration INTEGER, \ngoogleDistance INTEGER,\ngoogleDuration INTEGER\n )\n WITH (\n'connector' = 'kinesis',\n'stream' = 'input-stream',\n'aws.region' = 'us-west-2',\n'scan.stream.initpos' = 'LATEST',\n'format' = 'json'\n);",
            "user": "anonymous",
            "dateUpdated": "2021-12-21T15:28:58+0000",
            "progress": 0,
            "config": {
                "editorSetting": {
                "language": "sql",
                "editOnDblClick": false
                },
                "colWidth": 12,
                "editorMode": "ace/mode/sql",
                "fontSize": 9,
                "results": {},
                "enabled": true
            },
            "settings": {
                "params": {},
                "forms": {}
            },
            "apps": [],
            "runtimeInfos": {},
            "progressUpdateIntervalMs": 500,
            "jobName": "paragraph_1640100538533_2007222515",
            "id": "paragraph_1636275311941_413563307",
            "dateCreated": "2021-12-21T15:28:58+0000",
            "status": "READY",
            "$$hashKey": "object:278"
            },
            {
            "text": "%md\n2. Run the following cell to show Kinesis Stream Data",
            "user": "anonymous",
            "dateUpdated": "2021-12-21T15:31:46+0000",
            "progress": 0,
            "config": {
                "tableHide": false,
                "editorSetting": {
                "language": "markdown",
                "editOnDblClick": true,
                "completionKey": "TAB",
                "completionSupport": false
                },
                "colWidth": 12,
                "editorMode": "ace/mode/markdown",
                "fontSize": 15,
                "editorHide": true,
                "results": {},
                "enabled": false
            },
            "settings": {
                "params": {},
                "forms": {}
            },
            "apps": [],
            "runtimeInfos": {},
            "progressUpdateIntervalMs": 500,
            "jobName": "paragraph_1640100538534_1267420750",
            "id": "paragraph_1636309308825_1127289714",
            "dateCreated": "2021-12-21T15:28:58+0000",
            "status": "FINISHED",
            "$$hashKey": "object:279",
            "dateFinished": "2021-12-21T15:31:41+0000",
            "dateStarted": "2021-12-21T15:31:41+0000",
            "results": {
                "code": "SUCCESS",
                "msg": [
                {
                    "type": "HTML",
                    "data": "<div class=\"markdown-body\">\n<ol start=\"2\">\n<li>Run the following cell to show Kinesis Stream Data</li>\n</ol>\n\n</div>"
                }
                ]
            }
            },
            {
            "text": "%flink.ssql(type=update)\nselect * from taxi_trips;\n",
            "user": "anonymous",
            "dateUpdated": "2021-12-21T15:28:58+0000",
            "progress": 0,
            "config": {
                "editorSetting": {
                "language": "sql",
                "editOnDblClick": false,
                "completionKey": "TAB",
                "completionSupport": true
                },
                "colWidth": 12,
                "editorMode": "ace/mode/sql",
                "fontSize": 9,
                "results": {
                "0": {
                    "graph": {
                    "mode": "table",
                    "height": 300,
                    "optionOpen": false,
                    "setting": {
                        "table": {
                        "tableGridState": {},
                        "tableColumnTypeState": {
                            "names": {
                            "id": "string",
                            "vendorId": "string",
                            "pickupDate": "string",
                            "dropoffDate": "string",
                            "passengerCount": "string",
                            "pickupLongitude": "string",
                            "pickupLatitude": "string",
                            "dropoffLongitude": "string",
                            "dropoffLatitude": "string",
                            "storeAndFwdFlag": "string",
                            "gcDistance": "string",
                            "tripDuratio": "string",
                            "googleDistance": "string",
                            "googleDuration": "string"
                            },
                            "updated": false
                        },
                        "tableOptionSpecHash": "[{\"name\":\"useFilter\",\"valueType\":\"boolean\",\"defaultValue\":false,\"widget\":\"checkbox\",\"description\":\"Enable filter for columns\"},{\"name\":\"showPagination\",\"valueType\":\"boolean\",\"defaultValue\":false,\"widget\":\"checkbox\",\"description\":\"Enable pagination for better navigation\"},{\"name\":\"showAggregationFooter\",\"valueType\":\"boolean\",\"defaultValue\":false,\"widget\":\"checkbox\",\"description\":\"Enable a footer for displaying aggregated values\"}]",
                        "tableOptionValue": {
                            "useFilter": false,
                            "showPagination": false,
                            "showAggregationFooter": false
                        },
                        "updated": false,
                        "initialized": false
                        }
                    },
                    "commonSetting": {}
                    }
                },
                "2": {
                    "graph": {
                    "mode": "table",
                    "height": 300,
                    "optionOpen": false,
                    "setting": {
                        "table": {
                        "tableGridState": {},
                        "tableColumnTypeState": {
                            "names": {
                            "id": "string",
                            "vendorId": "string",
                            "pickupDate": "string",
                            "dropoffDate": "string",
                            "passengerCount": "string",
                            "pickupLongitude": "string",
                            "pickupLatitude": "string",
                            "dropoffLongitude": "string",
                            "dropoffLatitude": "string",
                            "storeAndFwdFlag": "string",
                            "gcDistance": "string",
                            "tripDuration": "string",
                            "googleDistance": "string",
                            "googleDuration": "string"
                            },
                            "updated": true
                        },
                        "tableOptionSpecHash": "[{\"name\":\"useFilter\",\"valueType\":\"boolean\",\"defaultValue\":false,\"widget\":\"checkbox\",\"description\":\"Enable filter for columns\"},{\"name\":\"showPagination\",\"valueType\":\"boolean\",\"defaultValue\":false,\"widget\":\"checkbox\",\"description\":\"Enable pagination for better navigation\"},{\"name\":\"showAggregationFooter\",\"valueType\":\"boolean\",\"defaultValue\":false,\"widget\":\"checkbox\",\"description\":\"Enable a footer for displaying aggregated values\"}]",
                        "tableOptionValue": {
                            "useFilter": false,
                            "showPagination": false,
                            "showAggregationFooter": false
                        },
                        "updated": false,
                        "initialized": false
                        }
                    },
                    "commonSetting": {}
                    }
                }
                },
                "enabled": true
            },
            "settings": {
                "params": {},
                "forms": {}
            },
            "apps": [],
            "runtimeInfos": {},
            "progressUpdateIntervalMs": 500,
            "jobName": "paragraph_1640100538534_375622844",
            "id": "paragraph_1636275676491_1544476499",
            "dateCreated": "2021-12-21T15:28:58+0000",
            "status": "READY",
            "$$hashKey": "object:280"
            },
            {
            "text": "%md\n3. Run the following cell to create Taxi Statistics Table to \nhold aggregated data in Amazon OpenSearch. Check OSEndpoint,OSUsername and OSPassword value and update hosts,username and password respectively. \nThe hosts should be in below format\n\n`<OSEndpoint>:443`",
            "user": "anonymous",
            "dateUpdated": "2021-12-21T15:32:05+0000",
            "progress": 0,
            "config": {
                "tableHide": false,
                "editorSetting": {
                "language": "markdown",
                "editOnDblClick": true,
                "completionKey": "TAB",
                "completionSupport": false
                },
                "colWidth": 12,
                "editorMode": "ace/mode/markdown",
                "fontSize": 15,
                "editorHide": true,
                "results": {},
                "enabled": false
            },
            "settings": {
                "params": {},
                "forms": {}
            },
            "apps": [],
            "runtimeInfos": {},
            "progressUpdateIntervalMs": 500,
            "jobName": "paragraph_1640100538534_1119699175",
            "id": "paragraph_1636309367470_216824265",
            "dateCreated": "2021-12-21T15:28:58+0000",
            "status": "FINISHED",
            "$$hashKey": "object:281",
            "dateFinished": "2021-12-21T15:32:01+0000",
            "dateStarted": "2021-12-21T15:32:01+0000",
            "results": {
                "code": "SUCCESS",
                "msg": [
                {
                    "type": "HTML",
                    "data": "<div class=\"markdown-body\">\n<ol start=\"3\">\n<li>Run the following cell to create Taxi Statistics Table to<br />\nhold aggregated data in Amazon OpenSearch. Check OSEndpoint,OSUsername and OSPassword value and update hosts,username and password respectively.<br />\nThe hosts should be in below format</li>\n</ol>\n<p><code>&lt;OSEndpoint&gt;:443</code></p>\n\n</div>"
                }
                ]
            }
            },
            {
            "text": "%flink.ssql(type=update)\ndrop TABLE if exists trip_statistics;\n\nCREATE TABLE trip_statistics (\n        trip_count          BIGINT,\n        passenger_count     INTEGER,\n        total_trip_duration  INTEGER\n    ) WITH (\n  'connector' = 'elasticsearch-7',\n  'hosts' = 'https://search-os-domain-a4ik3ugazthyjce23v6suantxy.us-west-2.es.amazonaws.com:443',\n  'index' = 'trip_statistics',\n  'username' = 'admin',\n  'password' = 'Test123$'\n);\n    ",
            "user": "anonymous",
            "dateUpdated": "2021-12-21T15:28:58+0000",
            "progress": 0,
            "config": {
                "editorSetting": {
                "language": "sql",
                "editOnDblClick": false,
                "completionKey": "TAB",
                "completionSupport": true
                },
                "colWidth": 12,
                "editorMode": "ace/mode/sql",
                "fontSize": 9,
                "results": {},
                "enabled": true
            },
            "settings": {
                "params": {},
                "forms": {}
            },
            "apps": [],
            "runtimeInfos": {},
            "progressUpdateIntervalMs": 500,
            "jobName": "paragraph_1640100538534_1480574682",
            "id": "paragraph_1636275718999_1813355402",
            "dateCreated": "2021-12-21T15:28:58+0000",
            "status": "READY",
            "$$hashKey": "object:282"
            },
            {
            "text": "%md\n4. Run the following cell to aggregate taxi data \nfrom taxi_trip table and save aggreagted data in OpenSearch\n",
            "user": "anonymous",
            "dateUpdated": "2021-12-21T15:32:24+0000",
            "progress": 0,
            "config": {
                "tableHide": false,
                "editorSetting": {
                "language": "markdown",
                "editOnDblClick": true,
                "completionKey": "TAB",
                "completionSupport": false
                },
                "colWidth": 12,
                "editorMode": "ace/mode/markdown",
                "fontSize": 15,
                "editorHide": true,
                "results": {},
                "enabled": false
            },
            "settings": {
                "params": {},
                "forms": {}
            },
            "apps": [],
            "runtimeInfos": {},
            "progressUpdateIntervalMs": 500,
            "jobName": "paragraph_1640100538542_382805227",
            "id": "paragraph_1636309522821_446867177",
            "dateCreated": "2021-12-21T15:28:58+0000",
            "status": "FINISHED",
            "$$hashKey": "object:283",
            "dateFinished": "2021-12-21T15:32:17+0000",
            "dateStarted": "2021-12-21T15:32:17+0000",
            "results": {
                "code": "SUCCESS",
                "msg": [
                {
                    "type": "HTML",
                    "data": "<div class=\"markdown-body\">\n<ol start=\"4\">\n<li>Run the following cell to aggregate taxi data<br />\nfrom taxi_trip table and save aggreagted data in OpenSearch</li>\n</ol>\n\n</div>"
                }
                ]
            }
            },
            {
            "text": "%flink.ssql(type=update)\nINSERT INTO trip_statistics\nSELECT \n        COUNT(1) as trip_count, \n        SUM(taxi_trips.passengerCount) as passenger_count, \n        SUM(taxi_trips.tripDuration) as total_trip_duration\nFROM taxi_trips\nWHERE taxi_trips.pickupLatitude <> 0 AND taxi_trips.pickupLongitude <> 0 AND taxi_trips.dropoffLatitude <> 0 AND taxi_trips.dropoffLongitude <> 0;",
            "user": "anonymous",
            "dateUpdated": "2021-12-21T15:28:58+0000",
            "progress": 0,
            "config": {
                "editorSetting": {
                "language": "sql",
                "editOnDblClick": false,
                "completionKey": "TAB",
                "completionSupport": true
                },
                "colWidth": 12,
                "editorMode": "ace/mode/sql",
                "fontSize": 9,
                "results": {},
                "enabled": true
            },
            "settings": {
                "params": {},
                "forms": {}
            },
            "apps": [],
            "runtimeInfos": {},
            "progressUpdateIntervalMs": 500,
            "jobName": "paragraph_1640100538542_1297276322",
            "id": "paragraph_1636298408031_1171400124",
            "dateCreated": "2021-12-21T15:28:58+0000",
            "status": "READY",
            "$$hashKey": "object:284"
            }
        ],
        "name": "KDA-OpenSearch",
        "id": "2GR6UDPKA",
        "defaultInterpreterGroup": "flink",
        "version": "0.9.0",
        "noteParams": {},
        "noteForms": {},
        "angularObjects": {},
        "config": {
            "isZeppelinNotebookCronEnable": false,
            "looknfeel": "default",
            "personalizedMode": "false"
        },
        "info": {},
        "path": "/KDA-OpenSearch"
        }```
        
        </details>


3. Check related results.
    * Check the table defined on a Kinesis data stream.
        ![](../images/[Lab%204]%20Check%20table%20on%20KDS.png)
    * Check streaming to an OpenSearch index.
        ![](../images/[Lab%204]%20Check%20Flink%20application%20to%20OpenSearch.png)
    * Check aggregation results on OpenSearch.
        ![](../images/[Lab%204]%20Check%20aggreagtion%20results%20on%20OpenSearch.png)
        ```sql
        SELECT * FROM trip_statistics
        ```