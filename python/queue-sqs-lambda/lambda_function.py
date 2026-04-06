import json
import time


def handler(event, context):
    for record in event["Records"]:
        body = json.loads(record["body"])
        user_id = body["user_id"]

        print(f"Starting report for user {user_id}...")

        # Simulate heavy computation
        time.sleep(5)

        result = {
            "user_id": user_id,
            "total_revenue": 150000,
            "total_orders": 3200,
            "top_product": "Widget Pro",
        }

        print(f"Report done for user {user_id}: {json.dumps(result)}")

    return {"statusCode": 200}
