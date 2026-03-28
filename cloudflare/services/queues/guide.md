# Cloudflare Queues -- Study Guide

A beginner-friendly, Node.js/TypeScript-focused guide to understanding and using Cloudflare Queues.

---

## 1. What is Cloudflare Queues?

Cloudflare Queues is a **message queue service** built directly into the Cloudflare Workers platform. If you have used AWS SQS, RabbitMQ, or Google Cloud Pub/Sub, the idea is the same -- but Queues lives natively inside the Cloudflare ecosystem, so there is no extra infrastructure to manage.

The mental model is simple:

- A **Producer** Worker puts messages onto a queue.
- A **Consumer** Worker picks messages off the queue and processes them.

The queue sits in between, acting as a buffer. The producer does not wait for the consumer to finish. This decoupling is the entire point: it lets you turn synchronous, blocking work into asynchronous, background work.

**Why does this matter?** Imagine your API receives a request that triggers an email. Without a queue, the user has to wait while you talk to an email provider. With a queue, you drop a message saying "send this email" and respond to the user immediately. The consumer picks it up moments later and actually sends the email. The user never waits.

---

## 2. When to Use It

Queues shine whenever the work **does not need an immediate response**. Some common scenarios:

- **Background job processing** -- Sending emails, generating PDFs, resizing thumbnails, running reports.
- **Decoupling services** -- Your API layer should not care about the internals of your notification system. Toss a message on a queue and let the notification worker handle it.
- **Handling traffic spikes** -- If you get a sudden burst of requests, the queue absorbs them. Your consumer processes messages at a steady, controlled pace instead of falling over.
- **Batch processing** -- Collect many small events and process them together in chunks for efficiency (analytics writes, log aggregation).
- **Webhook processing** -- Receive a webhook, acknowledge it immediately (return 200), and process the payload in the background via the queue.
- **Anything that can be "eventually consistent"** -- If the caller does not need the result right now, a queue is probably the right tool.

**When NOT to use it:** If the user needs the result of the work in the same HTTP response (e.g., "show me my profile"), a queue adds unnecessary complexity. Use it for fire-and-forget or delayed work.

---

## 3. Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed (`node --version` to check).
- **Wrangler** (the Cloudflare CLI) installed globally:
  ```bash
  npm install -g wrangler
  ```
- A **Cloudflare account** -- Queues requires a **paid Workers plan** (the free tier does not include Queues).
- Authenticated with Wrangler:
  ```bash
  wrangler login
  ```

---

## 4. Step-by-Step Setup

### 4.1 Create a Queue

```bash
wrangler queues create my-queue
```

That is it. The queue now exists in your Cloudflare account. You can verify with:

```bash
wrangler queues list
```

### 4.2 Configure Your Worker as a Producer

In your `wrangler.toml`, add a producer binding. This gives your Worker code access to the queue via an environment variable.

```toml
name = "my-producer-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[queues.producers]]
queue = "my-queue"
binding = "MY_QUEUE"
```

The `binding` is the name you will use in code (`env.MY_QUEUE`). The `queue` is the name of the queue you created in step 4.1.

### 4.3 Configure Your Worker as a Consumer

The consumer can be the same Worker or a different one. Add a consumer section to `wrangler.toml`:

```toml
name = "my-consumer-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[queues.consumers]]
queue = "my-queue"
max_batch_size = 10
max_batch_timeout = 30
max_retries = 3
dead_letter_queue = "my-dlq"
```

Key settings:

| Setting              | What it does                                                    | Default |
|----------------------|-----------------------------------------------------------------|---------|
| `max_batch_size`     | Max messages delivered to the consumer at once                  | 10      |
| `max_batch_timeout`  | Seconds to wait before delivering a partial batch               | 5       |
| `max_retries`        | How many times a failed message is retried before being dropped | 3       |
| `dead_letter_queue`  | Queue to send messages to after all retries are exhausted       | none    |

### 4.4 A Single Worker Can Be Both Producer and Consumer

This is a common pattern. One `wrangler.toml` can have both sections:

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[queues.producers]]
queue = "my-queue"
binding = "MY_QUEUE"

[[queues.consumers]]
queue = "my-queue"
max_batch_size = 10
max_retries = 3
```

### 4.5 Deploy

```bash
wrangler deploy
```

Your Worker is now wired up to the queue. Time to write some code.

---

## 5. Code Examples

### 5.1 TypeScript Environment Types

First, define the types for your environment so TypeScript knows about the queue binding:

```typescript
export interface Env {
  MY_QUEUE: Queue;
}
```

The `Queue` type is provided globally by the Workers runtime. You do not need to import it.

### 5.2 Producer: Send a Single Message

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Send a single message to the queue
    await env.MY_QUEUE.send({
      type: "email",
      to: "user@example.com",
      subject: "Welcome!",
      body: "Thanks for signing up.",
    });

    return new Response("Message queued!", { status: 202 });
  },
};
```

The `send()` method accepts any JSON-serializable value. It returns a Promise that resolves once the message has been accepted by the queue (not when it is processed).

### 5.3 Producer: Send a Batch of Messages

When you have multiple messages to send, `sendBatch()` is more efficient than calling `send()` in a loop:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const users = ["alice@example.com", "bob@example.com", "carol@example.com"];

    const messages = users.map((email) => ({
      body: {
        type: "welcome-email",
        to: email,
      },
    }));

    await env.MY_QUEUE.sendBatch(messages);

    return new Response(`Queued ${messages.length} messages`, { status: 202 });
  },
};
```

Each item in the array passed to `sendBatch()` must have a `body` property. You can optionally include a `contentType` property (`"json"` or `"text"`).

### 5.4 Consumer: Process Messages

The consumer is defined by exporting a `queue()` handler. The runtime calls this function with a batch of messages.

```typescript
export default {
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      console.log(`Processing message ${message.id}:`, message.body);

      // Do your work here...

      // Acknowledge the message (mark it as successfully processed)
      message.ack();
    }
  },
};
```

Important details:

- `batch.messages` is an array. The consumer always receives a **batch**, even if there is only one message.
- Each `message` has an `id`, a `body` (your payload), and a `timestamp`.
- You must call `message.ack()` to confirm processing, or `message.retry()` to send it back to the queue.
- If your handler throws an error (or you never ack/retry), **all unacknowledged messages in the batch are automatically retried**.

### 5.5 Full Example: Email Notification Queue

This is a complete, realistic example. One Worker handles both producing and consuming.

```typescript
// src/index.ts

interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface Env {
  MY_QUEUE: Queue;
  EMAIL_API_KEY: string;
}

export default {
  // ---- PRODUCER: HTTP handler receives requests and enqueues work ----
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);

    if (url.pathname === "/send-notification") {
      const payload: EmailMessage = await request.json();

      // Validate
      if (!payload.to || !payload.subject || !payload.body) {
        return new Response("Missing required fields: to, subject, body", {
          status: 400,
        });
      }

      // Enqueue -- do NOT send the email here. Let the consumer handle it.
      await env.MY_QUEUE.send(payload);

      return Response.json(
        { success: true, message: "Notification queued" },
        { status: 202 }
      );
    }

    return new Response("Not found", { status: 404 });
  },

  // ---- CONSUMER: Processes messages from the queue ----
  async queue(
    batch: MessageBatch<EmailMessage>,
    env: Env
  ): Promise<void> {
    for (const message of batch.messages) {
      const { to, subject, body } = message.body;

      try {
        // Call your email provider (Mailgun, SendGrid, Resend, etc.)
        const response = await fetch("https://api.emailprovider.com/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.EMAIL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ to, subject, body }),
        });

        if (!response.ok) {
          console.error(`Email API returned ${response.status} for ${to}`);
          message.retry(); // Try again later
        } else {
          console.log(`Email sent to ${to}`);
          message.ack(); // Done
        }
      } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        message.retry(); // Network error -- try again
      }
    }
  },
};
```

### 5.6 Full Example: Image Processing Pipeline

A slightly more advanced pattern where you chain work through the queue.

```typescript
// src/index.ts

interface ImageJob {
  imageUrl: string;
  userId: string;
  sizes: number[]; // e.g., [128, 256, 512]
}

interface ResizeTask {
  imageUrl: string;
  userId: string;
  targetSize: number;
}

export interface Env {
  IMAGE_QUEUE: Queue;
  RESIZE_QUEUE: Queue;
  THUMBNAILS_BUCKET: R2Bucket;
}

export default {
  // API endpoint: user uploads image, we fan out resize tasks
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const job: ImageJob = await request.json();

    // Fan out: create one message per size
    const tasks = job.sizes.map((size) => ({
      body: {
        imageUrl: job.imageUrl,
        userId: job.userId,
        targetSize: size,
      } satisfies ResizeTask,
    }));

    await env.RESIZE_QUEUE.sendBatch(tasks);

    return Response.json({
      success: true,
      message: `Queued ${tasks.length} resize tasks`,
    });
  },

  // Consumer: process each resize task
  async queue(
    batch: MessageBatch<ResizeTask>,
    env: Env
  ): Promise<void> {
    for (const message of batch.messages) {
      const { imageUrl, userId, targetSize } = message.body;

      try {
        // Fetch the original image
        const imageResponse = await fetch(imageUrl);
        const imageData = await imageResponse.arrayBuffer();

        // In a real app you would use a library or service to resize.
        // For illustration, we just store the original at the target path.
        const key = `${userId}/thumb-${targetSize}.jpg`;

        await env.THUMBNAILS_BUCKET.put(key, imageData, {
          httpMetadata: { contentType: "image/jpeg" },
        });

        console.log(`Stored thumbnail: ${key}`);
        message.ack();
      } catch (error) {
        console.error(
          `Failed to process ${targetSize}px for ${userId}:`,
          error
        );
        message.retry();
      }
    }
  },
};
```

### 5.7 Error Handling and Retries

You have fine-grained control over what happens when things go wrong.

```typescript
export default {
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        await processMessage(message.body);
        message.ack();
      } catch (error) {
        if (isTransientError(error)) {
          // Transient failure (network timeout, rate limit) -- retry later
          message.retry({
            delaySeconds: 60, // Wait 60 seconds before retrying
          });
        } else {
          // Permanent failure (bad data, validation error) -- no point retrying
          console.error("Permanent failure, acknowledging to discard:", error);
          message.ack(); // Ack to remove from queue (or let it go to DLQ)
        }
      }
    }
  },
};

function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("timeout") ||
      error.message.includes("rate limit") ||
      error.message.includes("503")
    );
  }
  return false;
}

async function processMessage(body: any): Promise<void> {
  // Your processing logic here
}
```

**Retry behavior:**

- If you call `message.retry()`, the message goes back onto the queue and will be delivered again.
- You can pass `{ delaySeconds: N }` to delay the retry.
- Each message tracks how many times it has been retried (`message.attempts`).
- After `max_retries` (set in `wrangler.toml`) is exceeded, the message is either **dropped** or sent to a **dead letter queue** if one is configured.

### 5.8 Dead Letter Queues (DLQ)

A dead letter queue catches messages that have failed too many times. This lets you inspect and debug failures without losing data.

Set it up in `wrangler.toml`:

```toml
# First, create the DLQ
# wrangler queues create my-dlq

[[queues.consumers]]
queue = "my-queue"
max_retries = 3
dead_letter_queue = "my-dlq"

# You can also consume from the DLQ to log or alert
[[queues.consumers]]
queue = "my-dlq"
```

Then write a consumer for the DLQ:

```typescript
export default {
  // Main queue consumer
  async queue(batch: MessageBatch<any>, env: Env): Promise<void> {
    const queueName = batch.queue;

    if (queueName === "my-queue") {
      // Normal processing
      for (const message of batch.messages) {
        await handleMainMessage(message);
      }
    } else if (queueName === "my-dlq") {
      // Dead letter processing -- log failures for investigation
      for (const message of batch.messages) {
        console.error("DLQ message:", {
          id: message.id,
          body: message.body,
          attempts: message.attempts,
          timestamp: message.timestamp,
        });
        // Maybe write to a logging service, send an alert, etc.
        message.ack(); // Ack so it does not loop forever
      }
    }
  },
};
```

---

## 6. How the Flow Works

Here is the full lifecycle of a message, from HTTP request to side effect.

### The Happy Path

```
  Client                Producer Worker          Queue           Consumer Worker         Side Effect
    |                        |                     |                    |                     |
    |--- HTTP Request ------>|                     |                    |                     |
    |                        |--- send() --------->|                    |                     |
    |<-- 202 Accepted -------|                     |                    |                     |
    |                        |                     |--- deliver ------->|                     |
    |                        |                     |   (batch)          |                     |
    |                        |                     |                    |--- process --------->|
    |                        |                     |                    |   (DB write, email,  |
    |                        |                     |                    |    API call, etc.)   |
    |                        |                     |<-- ack() ---------|                     |
    |                        |                     |   (remove msg)     |                     |
```

### With Retries

```
  Consumer Worker          Queue              Dead Letter Queue
       |                     |                       |
       |<--- deliver --------|                       |
       |    (attempt 1)      |                       |
       |--- retry() -------->|                       |
       |                     |                       |
       |<--- deliver --------|                       |
       |    (attempt 2)      |                       |
       |--- retry() -------->|                       |
       |                     |                       |
       |<--- deliver --------|                       |
       |    (attempt 3)      |                       |
       |--- retry() -------->|                       |
       |                     |                       |
       |                     |--- max retries ------>|
       |                     |   exceeded, move to   |
       |                     |   dead letter queue   |
```

### Summary in Words

1. A client sends an HTTP request to your Producer Worker.
2. The Producer Worker calls `env.MY_QUEUE.send(data)` to put a message on the queue.
3. The Producer immediately responds to the client (typically `202 Accepted`). The work has not been done yet.
4. Cloudflare delivers messages to your Consumer Worker in **batches** (controlled by `max_batch_size` and `max_batch_timeout`).
5. The Consumer Worker processes each message and calls `message.ack()` on success or `message.retry()` on failure.
6. If a message exceeds `max_retries`, it is either dropped or moved to a dead letter queue.

---

## 7. Key Concepts

### Producers and Consumers

- A **producer** is any Worker with a `[[queues.producers]]` binding. It can call `send()` and `sendBatch()`.
- A **consumer** is any Worker with a `[[queues.consumers]]` entry. It exports a `queue()` handler.
- A single Worker can be both a producer and a consumer (of the same or different queues).

### Messages

A message is a unit of work. It has:

- `id` -- Unique identifier assigned by the queue.
- `body` -- Your payload. Any JSON-serializable value (object, string, number, array).
- `timestamp` -- When the message was sent (as a `Date`).
- `attempts` -- How many times this message has been delivered.

### Batching

Consumers receive messages in **batches**, not one at a time. This is a performance optimization. Cloudflare groups messages together and delivers them as an array.

- `max_batch_size` -- The maximum number of messages in one batch (default: 10, max: 100).
- `max_batch_timeout` -- How many seconds to wait for a full batch before delivering a partial one (default: 5 seconds).

If messages arrive slowly, the consumer might receive a batch of 1 or 2 messages after the timeout expires. If messages arrive quickly, batches will be full.

### Retries

- Call `message.retry()` to send a message back to the queue.
- Call `message.retry({ delaySeconds: 30 })` to add a delay before the retry.
- `max_retries` in `wrangler.toml` controls how many times a message can be retried before it is considered permanently failed.
- If you do NOT call `ack()` or `retry()` on a message, and your handler completes without error, unacknowledged messages are **automatically retried**.
- If your handler throws an error, **all** messages in the batch that were not explicitly acknowledged are retried.

### Message Acknowledgment

- `message.ack()` -- "I have processed this message successfully. Remove it from the queue."
- `message.retry()` -- "I could not process this message. Put it back on the queue to try again."
- Always be explicit. Call one or the other for every message.

### Content Types

By default, messages are JSON. You can also send plain text:

```typescript
await env.MY_QUEUE.send("plain text message", { contentType: "text" });
```

Or with `sendBatch()`:

```typescript
await env.MY_QUEUE.sendBatch([
  { body: { key: "value" } },                          // JSON (default)
  { body: "just a string", contentType: "text" },       // Plain text
]);
```

### Delay

You can delay the initial delivery of a message:

```typescript
await env.MY_QUEUE.send(
  { type: "scheduled-task", taskId: "abc123" },
  { delaySeconds: 300 } // Deliver after 5 minutes
);
```

This is useful for scheduling future work without needing a separate scheduler.

---

## 8. Common Patterns

### Pattern 1: API + Queue for Background Processing

The most common pattern. Your API validates the request, responds immediately, and offloads work to the queue.

```typescript
// Producer (API handler)
async fetch(request: Request, env: Env): Promise<Response> {
  const order = await request.json();

  // Validate synchronously
  if (!order.items || order.items.length === 0) {
    return new Response("No items", { status: 400 });
  }

  // Save order to database (fast)
  await env.DB.prepare("INSERT INTO orders (data) VALUES (?)")
    .bind(JSON.stringify(order))
    .run();

  // Offload heavy work to queue
  await env.ORDER_QUEUE.send({
    type: "process-order",
    orderId: order.id,
  });

  return Response.json({ status: "accepted", orderId: order.id }, { status: 202 });
}
```

### Pattern 2: Fan-Out

One event triggers multiple independent tasks. Send multiple messages, each handled separately.

```typescript
async fetch(request: Request, env: Env): Promise<Response> {
  const event = await request.json();

  // One event fans out to multiple queues
  await Promise.all([
    env.EMAIL_QUEUE.send({ type: "welcome-email", userId: event.userId }),
    env.ANALYTICS_QUEUE.send({ type: "signup", userId: event.userId }),
    env.ONBOARDING_QUEUE.send({ type: "create-defaults", userId: event.userId }),
  ]);

  return new Response("OK", { status: 202 });
}
```

### Pattern 3: Pipeline (Queue Chains)

One consumer's output becomes another queue's input. This creates a multi-step processing pipeline.

```
  Upload Queue          Resize Queue          Notify Queue
       |                     |                     |
  [validate image] --> [resize to sizes] --> [notify user]
```

```typescript
// Step 1 consumer: validate, then send to next queue
async queue(batch: MessageBatch<UploadJob>, env: Env): Promise<void> {
  for (const message of batch.messages) {
    const { imageUrl, userId } = message.body;

    const isValid = await validateImage(imageUrl);
    if (!isValid) {
      console.error(`Invalid image from ${userId}`);
      message.ack(); // Discard invalid
      continue;
    }

    // Pass to the next stage
    await env.RESIZE_QUEUE.send({ imageUrl, userId });
    message.ack();
  }
}

// Step 2 consumer: resize, then send to next queue
async queue(batch: MessageBatch<ResizeJob>, env: Env): Promise<void> {
  for (const message of batch.messages) {
    const { imageUrl, userId } = message.body;

    await resizeAndStore(imageUrl, userId, env.BUCKET);

    // Pass to the next stage
    await env.NOTIFY_QUEUE.send({
      userId,
      message: "Your image has been processed!",
    });
    message.ack();
  }
}
```

This keeps each step focused and independently scalable. If resizing is slow, only the resize consumer backs up -- the validation and notification steps are unaffected.

---

## 9. Useful Commands

All queue management happens through Wrangler.

### Create a Queue

```bash
wrangler queues create my-queue
```

### List All Queues

```bash
wrangler queues list
```

### Delete a Queue

```bash
wrangler queues delete my-queue
```

### Deploy Your Worker

```bash
wrangler deploy
```

### View Logs (Real-Time)

```bash
wrangler tail
```

This streams live logs from your Worker, including `console.log` output from your queue consumer. Extremely useful for debugging.

### Local Development

```bash
wrangler dev
```

Wrangler's local dev mode supports Queues. You can send messages via `fetch` to your local Worker, and the consumer will process them locally.

---

## Quick Reference

| Task                  | Code / Command                                              |
|-----------------------|-------------------------------------------------------------|
| Create a queue        | `wrangler queues create my-queue`                           |
| Send one message      | `await env.MY_QUEUE.send({ key: "value" })`                |
| Send many messages    | `await env.MY_QUEUE.sendBatch([{ body: data }, ...])`       |
| Acknowledge a message | `message.ack()`                                             |
| Retry a message       | `message.retry()`                                           |
| Retry with delay      | `message.retry({ delaySeconds: 60 })`                      |
| Delay initial send    | `await env.MY_QUEUE.send(data, { delaySeconds: 300 })`     |
| Check attempts        | `message.attempts`                                          |
| Get queue name        | `batch.queue`                                               |
| List queues           | `wrangler queues list`                                      |
| Delete a queue        | `wrangler queues delete my-queue`                           |
| View live logs        | `wrangler tail`                                             |

---

That covers the fundamentals. Cloudflare Queues is intentionally simple: produce messages, consume them in batches, ack or retry. The power comes from how you compose it with the rest of the Workers ecosystem -- R2 for storage, D1 for databases, KV for caching, and other Workers for orchestration.
