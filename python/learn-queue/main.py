from fastapi import FastAPI
from celery_app import generate_report, test_check, failing_task, celery
from celery.result import AsyncResult

app = FastAPI()


# Step 1: User requests a report → API sends job to queue → returns immediately
@app.post("/report")
def create_report(user_id: int):
    task = generate_report.delay(user_id)  # .delay() sends to Redis queue
    print('report generated...')
    return {
        "task_id": task.id,
        "status": "processing",
        "message": "Your report is being generated. Poll /report/{task_id} to check status.",
    }


# Step 2: Frontend polls this endpoint to check if the report is done
@app.get("/report/{task_id}")
def get_report(task_id: str):
    result = AsyncResult(task_id, app=celery)

    if result.state == "PENDING":
        return {"task_id": task_id, "status": "processing"}

    if result.state == "SUCCESS":
        return {
            "task_id": task_id,
            "status": "done",
            "result": result.result,  # the actual report data
        }

    if result.state == "FAILURE":
        return {"task_id": task_id, "status": "failed", "error": str(result.info)}

    return {"task_id": task_id, "status": result.state}

@app.get('/test')
def get_test_check():
    task = test_check.delay('Message from queue')

    print('test check')

    return 'test check is happening'

@app.post('/fail')
def trigger_fail():
    task = failing_task.delay()
    return {"task_id": task.id, "status": "this will fail in 2 seconds"}