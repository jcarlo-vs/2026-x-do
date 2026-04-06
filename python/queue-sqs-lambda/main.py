import json
import boto3

from fastapi import FastAPI

app = FastAPI()

# Connect to LocalStack SQS (not real AWS)
sqs = boto3.client(
    "sqs",
    endpoint_url="http://localhost:4566",
    region_name="ap-southeast-1",
    aws_access_key_id="test",
    aws_secret_access_key="test",
)

QUEUE_URL = "http://sqs.ap-southeast-1.localhost.localstack.cloud:4566/000000000000/report-queue"


@app.post("/report")
def create_report(user_id: int):
    # Send message to SQS queue
    sqs.send_message(
        QueueUrl=QUEUE_URL,
        MessageBody=json.dumps({"user_id": user_id}),
    )
    return {"status": "processing", "message": f"Report for user {user_id} sent to queue"}


@app.get("/messages")
def check_messages():
    # Peek at messages in the queue (for debugging)
    response = sqs.receive_message(
        QueueUrl=QUEUE_URL,
        MaxNumberOfMessages=10,
        WaitTimeSeconds=1,
    )
    messages = response.get("Messages", [])
    return {"count": len(messages), "messages": [json.loads(m["Body"]) for m in messages]}
