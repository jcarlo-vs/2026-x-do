# Cloudflare Workers AI -- Study Guide

A beginner-friendly, Node.js/TypeScript-focused guide to running AI and ML models on Cloudflare's edge network.

---

## Table of Contents

1. [What is Workers AI?](#1-what-is-workers-ai)
2. [When to Use It](#2-when-to-use-it)
3. [Prerequisites](#3-prerequisites)
4. [Step-by-Step Setup](#4-step-by-step-setup)
5. [Code Examples](#5-code-examples)
6. [How the Flow Works](#6-how-the-flow-works)
7. [Key Concepts](#7-key-concepts)
8. [Available Model Categories](#8-available-model-categories)
9. [Common Patterns](#9-common-patterns)

---

## 1. What is Workers AI?

Workers AI lets you run AI and ML models **directly on Cloudflare's edge network**. Instead of calling out to an external AI provider (OpenAI, Replicate, etc.), you invoke models that run on Cloudflare-managed GPUs -- right alongside your Worker code.

What it supports:

- **Text generation** -- Large language models like Meta's Llama 3.1 for chat, completion, summarization, and more.
- **Text-to-image** -- Models like Stable Diffusion XL for generating images from text prompts.
- **Text embeddings** -- Turn text into vector representations for semantic search, RAG pipelines, and clustering.
- **Speech-to-text** -- Transcribe audio with OpenAI's Whisper model.
- **Translation** -- Translate text between languages.
- **Image classification** -- Identify objects and categories in images.
- **Sentiment analysis, text classification, and more.**

Pricing is **pay-as-you-go** with a generous **free tier** (10,000 neurons/day at no cost). You do not need to provision GPUs, manage infrastructure, or worry about scaling.

Think of it this way: your Worker handles the HTTP request, calls the AI model as if it were a local function, gets the result, and sends it back. All within the Cloudflare network.

---

## 2. When to Use It

Workers AI is a great fit when you want to:

- **Add an AI chatbot to your app** -- Use an LLM to power conversational features without managing an external API key or dealing with rate limits from another provider.
- **Generate images on the fly** -- Create avatars, thumbnails, illustrations, or any visual content from text descriptions.
- **Create embeddings for search or RAG** -- Convert documents and queries into vectors, store them in Vectorize, and build retrieval-augmented generation pipelines.
- **Summarize text** -- Condense long articles, emails, or documents into brief summaries.
- **Translate content** -- Serve your app in multiple languages by translating user-facing text at the edge.
- **Classify images** -- Detect what is in an uploaded image (objects, scenes, categories).
- **Run sentiment analysis** -- Determine whether user feedback, reviews, or comments are positive, negative, or neutral.

The key advantage is **simplicity and proximity**: the model runs in the same network as your Worker, so there are no extra hops, no external API keys to manage, and no cold-start latency from a third-party service.

---

## 3. Prerequisites

Before you start, make sure you have:

| Requirement | Details |
|---|---|
| **Node.js** | Version 18 or higher. Check with `node -v`. |
| **Wrangler** | Cloudflare's CLI tool. Install globally: `npm install -g wrangler`. |
| **Cloudflare account** | Free tier is fine. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com). |

Log in to your account via Wrangler:

```bash
wrangler login
```

This opens a browser window for OAuth. Once authorized, Wrangler stores your credentials locally.

---

## 4. Step-by-Step Setup

### Step 1: Create a Worker Project

```bash
npm create cloudflare@latest my-ai-worker -- --type=hello-world --ts
cd my-ai-worker
```

This scaffolds a new Worker project with TypeScript support.

### Step 2: Add the AI Binding in `wrangler.toml`

Open `wrangler.toml` and add the AI binding:

```toml
name = "my-ai-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[ai]
binding = "AI"
```

The `[ai]` section tells Wrangler to inject an `AI` object into your Worker's `env`. This binding is what you use to call models -- no API keys, no SDK installs, no configuration beyond this line.

### Step 3: Define Your Environment Type

In your `src/index.ts` (or a separate `env.d.ts` file), define the environment interface so TypeScript knows about the AI binding:

```typescript
export interface Env {
  AI: Ai;
}
```

The `Ai` type is provided automatically by Cloudflare's Workers types.

### Step 4: Use the AI Binding in Your Worker

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is Cloudflare Workers AI?" },
      ],
    });

    return Response.json(result);
  },
} satisfies ExportedHandler<Env>;
```

### Step 5: Run Locally and Deploy

```bash
# Local development
npx wrangler dev

# Deploy to Cloudflare
npx wrangler deploy
```

That is it. Your Worker is now calling an LLM on Cloudflare's GPUs.

---

## 5. Code Examples

### Text Generation (Chat with Llama)

The most common use case. Send a conversation history, get a response.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const body = await request.json<{
      messages: Array<{ role: string; content: string }>;
    }>();

    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: body.messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    return Response.json(result);
  },
} satisfies ExportedHandler<Env>;
```

The response looks like:

```json
{
  "response": "Workers AI is a service that lets you run AI models..."
}
```

### Text-to-Image (Stable Diffusion)

Generate an image from a text prompt. The model returns raw image bytes.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const result = await env.AI.run(
      "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      {
        prompt: "A cyberpunk city at sunset, neon lights reflecting off wet streets",
      }
    );

    return new Response(result, {
      headers: { "Content-Type": "image/png" },
    });
  },
} satisfies ExportedHandler<Env>;
```

The response is a `ReadableStream` of PNG image data. You return it directly as the HTTP response body with the appropriate content type.

### Text Embeddings

Convert text into numerical vectors. Essential for semantic search and RAG.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const result = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: [
        "Cloudflare Workers run at the edge.",
        "Machine learning models can generate text.",
        "JavaScript is a programming language.",
      ],
    });

    // result.data is an array of embedding vectors
    // Each vector is an array of 768 floating-point numbers
    return Response.json({
      shape: result.shape,       // e.g., [3, 768]
      vectors: result.data,      // the actual embeddings
    });
  },
} satisfies ExportedHandler<Env>;
```

### Speech-to-Text (Whisper)

Transcribe audio files. Accepts raw audio data (WAV, MP3, etc.).

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Expect the audio file as the request body
    const audioData = await request.arrayBuffer();

    const result = await env.AI.run("@cf/openai/whisper", {
      audio: [...new Uint8Array(audioData)],
    });

    return Response.json({
      text: result.text,
      // result also includes word-level timestamps if available
    });
  },
} satisfies ExportedHandler<Env>;
```

### Translation

Translate text between languages.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const result = await env.AI.run("@cf/meta/m2m100-1.2b", {
      text: "Hello, how are you today?",
      source_lang: "english",
      target_lang: "spanish",
    });

    return Response.json(result);
    // { "translated_text": "Hola, como estas hoy?" }
  },
} satisfies ExportedHandler<Env>;
```

---

### Full Example: AI Chatbot API Endpoint

A more complete chatbot that accepts POST requests with a conversation and returns the AI response.

```typescript
interface ChatRequest {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Only accept POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse the request body
    let body: ChatRequest;
    try {
      body = await request.json<ChatRequest>();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    // Validate that messages exist
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json(
        { error: "messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Prepend a system message if the caller did not include one
    const messages = body.messages[0]?.role === "system"
      ? body.messages
      : [
          { role: "system" as const, content: "You are a helpful, friendly assistant." },
          ...body.messages,
        ];

    try {
      const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages,
        max_tokens: body.max_tokens ?? 1024,
        temperature: body.temperature ?? 0.7,
      });

      return Response.json({
        success: true,
        response: result.response,
      });
    } catch (error) {
      return Response.json(
        { success: false, error: "AI inference failed" },
        { status: 500 }
      );
    }
  },
} satisfies ExportedHandler<Env>;
```

Call it with:

```bash
curl -X POST https://my-ai-worker.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Explain quantum computing in simple terms." }
    ]
  }'
```

---

### Full Example: Image Generation Endpoint

An endpoint that takes a prompt and returns the generated image directly.

```typescript
export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const prompt = url.searchParams.get("prompt");

    if (!prompt) {
      return Response.json(
        { error: "A 'prompt' query parameter is required." },
        { status: 400 }
      );
    }

    try {
      const imageData = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        { prompt }
      );

      return new Response(imageData, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (error) {
      return Response.json(
        { error: "Image generation failed." },
        { status: 500 }
      );
    }
  },
} satisfies ExportedHandler<Env>;
```

Use it in a browser:

```
https://my-ai-worker.<your-subdomain>.workers.dev?prompt=a+cat+wearing+a+top+hat
```

---

### Streaming Responses for LLMs

For chat completions, streaming is almost always what you want in production. It sends tokens to the client as they are generated rather than waiting for the full response.

```typescript
export interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const body = await request.json<{
      messages: Array<{ role: string; content: string }>;
    }>();

    // Pass stream: true to get a ReadableStream of server-sent events
    const stream = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: body.messages,
      stream: true,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  },
} satisfies ExportedHandler<Env>;
```

The client receives server-sent events (SSE) like:

```
data: {"response":"Workers"}
data: {"response":" AI"}
data: {"response":" lets"}
data: {"response":" you"}
data: [DONE]
```

On the client side, you can consume this with the `EventSource` API or the `fetch` API reading the stream manually.

---

## 6. How the Flow Works

Here is what happens when a request reaches your AI-powered Worker:

```
                    Cloudflare Network
                    ==================

  Client           Worker (Edge)          AI Inference (GPU)
    |                    |                        |
    |--- HTTP Request -->|                        |
    |                    |--- env.AI.run() ------>|
    |                    |                        |
    |                    |    (model executes     |
    |                    |     on Cloudflare GPU) |
    |                    |                        |
    |                    |<--- result/stream -----|
    |<-- HTTP Response --|                        |
    |                    |                        |
```

Step by step:

1. **Client sends a request** -- A browser, mobile app, or another service hits your Worker's URL.
2. **Worker receives the request** -- Your `fetch` handler runs on Cloudflare's edge, close to the user.
3. **Worker calls `env.AI.run()`** -- This sends the input to Cloudflare's GPU infrastructure. The call stays within Cloudflare's network -- it does not leave to a third-party API.
4. **Model executes on Cloudflare GPUs** -- The selected model processes the input (generates text, creates an image, produces embeddings, etc.).
5. **Result returns to the Worker** -- The inference result comes back as a JSON object, a binary stream (for images), or an SSE stream (for streaming text).
6. **Worker sends the response** -- Your code formats the result and returns it to the client.

The entire round trip stays within Cloudflare's infrastructure. There is no external network hop to a third-party AI provider.

---

## 7. Key Concepts

### Models Catalog and the `@cf/` Prefix

Every model available on Workers AI has a name that starts with `@cf/`, followed by the organization and model name:

```
@cf/meta/llama-3.1-8b-instruct
@cf/stabilityai/stable-diffusion-xl-base-1.0
@cf/baai/bge-base-en-v1.5
@cf/openai/whisper
@cf/meta/m2m100-1.2b
```

You can browse the full catalog at [developers.cloudflare.com/workers-ai/models](https://developers.cloudflare.com/workers-ai/models/).

### AI Binding

The `AI` binding is the interface between your Worker code and the inference engine. You configure it once in `wrangler.toml`:

```toml
[ai]
binding = "AI"
```

Then access it via `env.AI` in your Worker. The binding handles authentication, routing to the right GPU, and returning the result. You never deal with API keys, base URLs, or HTTP headers.

### Input and Output Schemas

Each model has its own input/output schema. For example:

| Model Type | Input | Output |
|---|---|---|
| Text generation | `{ messages: [...] }` | `{ response: "..." }` |
| Text-to-image | `{ prompt: "..." }` | Binary PNG data (`ReadableStream`) |
| Embeddings | `{ text: ["..."] }` | `{ data: [[0.1, 0.2, ...]], shape: [1, 768] }` |
| Speech-to-text | `{ audio: [...] }` | `{ text: "..." }` |
| Translation | `{ text: "...", source_lang, target_lang }` | `{ translated_text: "..." }` |

Always check the model's documentation page for the exact schema.

### Streaming Responses

Text generation models support `stream: true`. When enabled, `env.AI.run()` returns a `ReadableStream` that emits server-sent events. Each event contains a small chunk of the generated text. This is critical for chat UIs where you want to display tokens as they arrive.

### Neurons (Billing Unit)

Workers AI bills in **neurons**, an abstract unit that normalizes cost across different model types and sizes. A small text generation call uses fewer neurons than a large image generation call.

- **Free tier**: 10,000 neurons per day.
- **Paid tier**: Billed per neuron beyond the free tier.

The number of neurons consumed depends on the model, input size, and output size. Check the pricing page for per-model neuron costs.

### Rate Limits

Workers AI enforces per-model rate limits. These vary by model and account plan. If you exceed the limit, you will receive a 429 status code. For production workloads, monitor your usage and implement retry logic with exponential backoff.

---

## 8. Available Model Categories

Workers AI offers models across several categories. Here are the main ones with example models:

### Text Generation (LLMs)

Chat, completion, summarization, code generation, reasoning.

| Model | Notes |
|---|---|
| `@cf/meta/llama-3.1-8b-instruct` | Great general-purpose model, good balance of speed and quality. |
| `@cf/meta/llama-3.1-70b-instruct` | Larger, more capable, but slower and costs more neurons. |
| `@cf/mistral/mistral-7b-instruct-v0.2` | Fast, capable alternative. |
| `@cf/google/gemma-7b-it` | Google's open model. |
| `@cf/qwen/qwen1.5-14b-chat-awq` | Strong multilingual capabilities. |

### Text-to-Image

Generate images from text descriptions.

| Model | Notes |
|---|---|
| `@cf/stabilityai/stable-diffusion-xl-base-1.0` | High-quality image generation. |
| `@cf/bytedance/stable-diffusion-xl-lightning` | Faster variant, fewer steps needed. |

### Text Embeddings

Convert text into vectors for semantic search, clustering, RAG.

| Model | Notes |
|---|---|
| `@cf/baai/bge-base-en-v1.5` | 768-dimensional embeddings, strong performance. |
| `@cf/baai/bge-large-en-v1.5` | 1024-dimensional, higher quality, slower. |
| `@cf/baai/bge-small-en-v1.5` | 384-dimensional, fastest, good for prototyping. |

### Speech-to-Text

Transcribe audio to text.

| Model | Notes |
|---|---|
| `@cf/openai/whisper` | Multilingual speech recognition. |
| `@cf/openai/whisper-tiny-en` | English-only, faster, lower resource usage. |

### Translation

Translate between languages.

| Model | Notes |
|---|---|
| `@cf/meta/m2m100-1.2b` | Supports 100+ language pairs. |

### Image Classification

Identify objects and categories in images.

| Model | Notes |
|---|---|
| `@cf/microsoft/resnet-50` | Classic image classification model. |

### Text Classification / Sentiment

Classify text into categories or determine sentiment.

| Model | Notes |
|---|---|
| `@cf/huggingface/distilbert-sst-2-int8` | Sentiment analysis (positive/negative). |

---

## 9. Common Patterns

### Workers AI + D1 for RAG (Retrieval-Augmented Generation)

Store your knowledge base in D1, generate embeddings with Workers AI, store the vectors in Vectorize, and retrieve relevant context before calling the LLM.

```typescript
export interface Env {
  AI: Ai;
  VECTORIZE: VectorizeIndex;
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { query } = await request.json<{ query: string }>();

    // 1. Generate an embedding for the user's query
    const queryEmbedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: [query],
    });

    // 2. Search Vectorize for similar documents
    const matches = await env.VECTORIZE.query(queryEmbedding.data[0], {
      topK: 5,
    });

    // 3. Fetch the matched documents from D1
    const ids = matches.matches.map((m) => m.id);
    const placeholders = ids.map(() => "?").join(",");
    const docs = await env.DB.prepare(
      `SELECT content FROM documents WHERE id IN (${placeholders})`
    )
      .bind(...ids)
      .all<{ content: string }>();

    const context = docs.results.map((d) => d.content).join("\n\n");

    // 4. Call the LLM with the retrieved context
    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: `Answer the user's question based on this context:\n\n${context}`,
        },
        { role: "user", content: query },
      ],
    });

    return Response.json({ response: result.response });
  },
} satisfies ExportedHandler<Env>;
```

### Workers AI + R2 for Generated Image Storage

Generate images and store them in R2 for later retrieval, so you do not regenerate the same image twice.

```typescript
export interface Env {
  AI: Ai;
  IMAGES: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const prompt = url.searchParams.get("prompt");

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    // Use the prompt as a cache key
    const cacheKey = `images/${encodeURIComponent(prompt)}.png`;

    // Check if we already generated this image
    const existing = await env.IMAGES.get(cacheKey);
    if (existing) {
      return new Response(existing.body, {
        headers: { "Content-Type": "image/png" },
      });
    }

    // Generate the image
    const imageData = await env.AI.run(
      "@cf/stabilityai/stable-diffusion-xl-base-1.0",
      { prompt }
    );

    // Store it in R2 for future requests
    // We need to tee the stream: one copy for R2, one for the response
    const imageBytes = new Uint8Array(await new Response(imageData).arrayBuffer());
    await env.IMAGES.put(cacheKey, imageBytes, {
      httpMetadata: { contentType: "image/png" },
    });

    return new Response(imageBytes, {
      headers: { "Content-Type": "image/png" },
    });
  },
} satisfies ExportedHandler<Env>;
```

### Workers AI + Queues for Batch Inference

Use Cloudflare Queues to process AI tasks asynchronously. Good for bulk operations like embedding an entire document library or generating many images.

```typescript
export interface Env {
  AI: Ai;
  VECTORIZE: VectorizeIndex;
  EMBEDDING_QUEUE: Queue<{ id: string; text: string }>;
}

export default {
  // HTTP handler: accept documents and enqueue them
  async fetch(request: Request, env: Env): Promise<Response> {
    const { documents } = await request.json<{
      documents: Array<{ id: string; text: string }>;
    }>();

    // Send each document to the queue for processing
    for (const doc of documents) {
      await env.EMBEDDING_QUEUE.send(doc);
    }

    return Response.json({
      message: `${documents.length} documents queued for embedding.`,
    });
  },

  // Queue consumer: process each document
  async queue(
    batch: MessageBatch<{ id: string; text: string }>,
    env: Env
  ): Promise<void> {
    const texts = batch.messages.map((msg) => msg.body.text);
    const ids = batch.messages.map((msg) => msg.body.id);

    // Generate embeddings for the entire batch
    const result = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: texts,
    });

    // Insert the vectors into Vectorize
    const vectors = result.data.map((values, i) => ({
      id: ids[i],
      values,
    }));

    await env.VECTORIZE.upsert(vectors);
  },
} satisfies ExportedHandler<Env>;
```

---

## Quick Reference

| Task | Model | Key Input |
|---|---|---|
| Chat / text generation | `@cf/meta/llama-3.1-8b-instruct` | `{ messages: [...] }` |
| Image generation | `@cf/stabilityai/stable-diffusion-xl-base-1.0` | `{ prompt: "..." }` |
| Text embeddings | `@cf/baai/bge-base-en-v1.5` | `{ text: ["..."] }` |
| Speech-to-text | `@cf/openai/whisper` | `{ audio: [...] }` |
| Translation | `@cf/meta/m2m100-1.2b` | `{ text, source_lang, target_lang }` |
| Sentiment analysis | `@cf/huggingface/distilbert-sst-2-int8` | `{ text: "..." }` |
| Image classification | `@cf/microsoft/resnet-50` | `{ image: [...] }` |

---

## Further Reading

- [Workers AI documentation](https://developers.cloudflare.com/workers-ai/)
- [Models catalog](https://developers.cloudflare.com/workers-ai/models/)
- [Pricing and neurons](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Vectorize (for storing embeddings)](https://developers.cloudflare.com/vectorize/)
- [D1 (serverless SQL database)](https://developers.cloudflare.com/d1/)
- [R2 (object storage)](https://developers.cloudflare.com/r2/)
