from celery import Celery
from celery.signals import task_failure
import time

# Connect Celery to Redis
# Redis acts as the broker (holds the jobs) and backend (stores results)
celery = Celery(
    "tasks",
    broker="redis://localhost:6379/0",    # where jobs are queued
    backend="redis://localhost:6379/0",   # where results are stored
)


# This is the heavy task that runs in the Celery worker (NOT in your API)
@celery.task
def generate_report(user_id: int):
    print(f"Starting report for user {user_id}...")

    # Simulate heavy computation (10 seconds)
    time.sleep(10)

    result = {
        "user_id": user_id,
        "total_revenue": 150000,
        "total_orders": 3200,
        "top_product": "Widget Pro",
    }

    print(f"Report done for user {user_id}")    
    return result

@celery.task
def test_check(message):
    

    time.sleep(20)
    print(f"{message} received")
    return message


@celery.task(throws=(Exception,))
def failing_task():
    time.sleep(2)
    raise Exception("Something went wrong!")


@task_failure.connect
def handle_task_failure(sender=None, exception=None, args=None, kwargs=None, **rest):
    print(f"Task {sender.name} failed!")
    print(f"Error: {exception}")
    print(f"Args: {args}")
    # add your notification logic here: slack, email, save to DB, etc.