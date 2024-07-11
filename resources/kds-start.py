import json

import boto3
import cfnresponse

client = boto3.client("kinesisanalyticsv2")


def lambda_handler(event, context):
    print(event)
    response_data = {}
    if event["RequestType"] == "Delete":
        cfnresponse.send(
            event,
            context,
            cfnresponse.SUCCESS,
            response_data,
            "CustomResourcePhysicalID",
        )
        return
    application_name = event["ResourceProperties"]["ApplicationName"]
    try:
        response = client.start_application(ApplicationName=application_name)
        print(json.dumps(response, indent=4))
        response_value = "Started the Application"
        response_data["Data"] = response_value
    except:
        response_value = (
            "Failed Starting the Application, Please start the application manually"
        )
        response_data["Data"] = response_value
    cfnresponse.send(
        event, context, cfnresponse.SUCCESS, response_data, "CustomResourcePhysicalID"
    )
