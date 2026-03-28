# Cloudflare Workers -- Study Guide

A practical, beginner-friendly guide for Node.js developers getting started with Cloudflare Workers.

---

## 1. What is Cloudflare Workers?

Cloudflare Workers lets you run JavaScript/TypeScript code on Cloudflare's global network -- over 300 edge locations worldwide. Think of it as deploying a tiny server that automatically runs as close to your users as possible, no matter where they are.

Here is what makes Workers different:

- **Serverless** -- You don't manage servers, containers, or infrastructure. You write code, deploy it, and Cloudflare handles everything else.
- **V8 Isolates, not containers** -- Instead of spinning up a full container or VM for each request (like AWS Lambda does), Workers use V8 isolates -- the same engine that powers Chrome and Node.js. Each request gets its own lightweight isolate, which starts in microseconds instead of milliseconds.
- **0ms cold starts** -- Because V8 isolates are so lightweight, there is effectively no cold start penalty. Your code is ready to run immediately.
- **Edge-first** -- Your code runs at whichever Cloudflare data center is closest to the user making the request. A user in Tokyo hits a server in Tokyo; a user in London hits a server in London.

### Workers vs AWS Lambda (Quick Comparison)

| Feature              | Cloudflare Workers          | AWS Lambda                    |
|----------------------|-----------------------------|-------------------------------|
| Cold starts          | ~0ms                        | 100ms - several seconds       |
| Runtime              | V8 isolates                 | Containers (microVMs)         |
| Edge locations       | 300+                        | ~30 regions (pick one)        |
| Language             | JS/TS (WASM also supported) | Many (Node, Python, Go, etc.) |
| Free tier            | 100k requests/day           | 1M requests/month             |
| Max execution time   | 10ms (free) / 30s (paid)    | Up to 15 minutes              |

Lambda is more flexible in terms of languages and execution time, but Workers wins on latency, cold starts, and global distribution out of the box.

---

## 2. When to Use It

Workers are a great fit for workloads that need to be fast, globally distributed, and relatively short-lived:

- **REST APIs** -- Build lightweight JSON APIs that respond in milliseconds from the nearest edge.
- **Middleware / Auth** -- Validate JWTs, check API keys, or enforce rate limits before requests ever reach your origin server.
- **A/B Testing** -- Route users to different versions of a page at the edge, with no client-side flicker.
- **URL Redirects** -- Manage redirect rules programmatically without touching your origin config.
- **Edge-Side Rendering** -- Generate or transform HTML at the edge for faster page loads.
- **Webhooks** -- Receive and process webhook payloads (Stripe, GitHub, Slack, etc.) quickly and reliably.
- **API Gateway / Proxy** -- Sit in front of multiple backend services, aggregate responses, rewrite headers, or add caching.

---

## 3. Prerequisites

Before you start, make sure you have:

- **Node.js 18+** -- Check with `node --version`
- **npm** -- Comes with Node.js. Check with `npm --version`
- **A Cloudflare account** -- Free at [dash.cloudflare.com](https://dash.cloudflare.com). No credit card required.
- **Wrangler CLI** -- Cloudflare's official CLI tool for Workers development. We will install it in the next section.

---

## 4. Step-by-Step Setup

### Install Wrangler

Wrangler is the CLI you will use for everything -- creating projects, local development, deploying, managing secrets, and viewing logs.

```bash
npm install -g wrangler
```

Verify the installation:

```bash
wrangler --version
```

### Log In to Cloudflare

This opens your browser and asks you to authorize Wrangler with your Cloudflare account:

```bash
wrangler login
```

### Create a New Project

The scaffolding command sets up a new Worker project with sensible defaults:

```bash
npm create cloudflare@latest my-worker
```

You will be prompted to choose a template. For learning purposes, pick **"Hello World" worker**. Choose **TypeScript** when asked.

Then:

```bash
cd my-worker
```

### Project Structure

After scaffolding, your project looks like this:

```
my-worker/
  src/
    index.ts          <-- Your Worker code lives here
  wrangler.toml       <-- Configuration file (name, routes, bindings, etc.)
  package.json        <-- Dependencies and scripts
  tsconfig.json       <-- TypeScript config
  node_modules/
```

The two files you will work with the most are `src/index.ts` (your code) and `wrangler.toml` (your config).

### Understanding wrangler.toml

This is the configuration file for your Worker. Here is a minimal example:

```toml
name = "my-worker"              # The name of your Worker (used in the deploy URL)
main = "src/index.ts"           # Entry point for your code
compatibility_date = "2024-12-01"  # Which Workers runtime APIs to use

# Optional: bind to other Cloudflare services
# [[kv_namespaces]]
# binding = "MY_KV"
# id = "abc123"
```

Key fields:

- **name** -- Your Worker's name. It becomes part of the deploy URL: `my-worker.<your-subdomain>.workers.dev`
- **main** -- The entry file Wrangler will build and deploy.
- **compatibility_date** -- Locks your Worker to a specific version of the Workers runtime APIs. This prevents breaking changes from affecting your deployed code. Set it to today's date when creating a new project, and update it deliberately when you are ready.

---

## 5. Code Examples

### Basic "Hello World" Worker

The simplest possible Worker. It responds to every request with plain text.

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response("Hello World!", {
      headers: { "Content-Type": "text/plain" },
    });
  },
};
```

Every Worker exports a `fetch` handler. It receives:
- `request` -- The incoming HTTP request (standard Web API `Request` object)
- `env` -- Your environment variables, secrets, and bindings (KV, D1, R2, etc.)
- `ctx` -- Execution context, mainly used for `ctx.waitUntil()` to do background work after sending a response

### REST API with Routing

Workers do not come with a built-in router, but you can build simple routing with `URL` and `switch/case`:

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Simple router
    switch (true) {
      case method === "GET" && path === "/":
        return new Response(JSON.stringify({ message: "Welcome to the API" }), {
          headers: { "Content-Type": "application/json" },
        });

      case method === "GET" && path === "/users":
        return handleGetUsers(env);

      case method === "GET" && path.startsWith("/users/"):
        const id = path.split("/")[2];
        return handleGetUser(id, env);

      case method === "POST" && path === "/users":
        return handleCreateUser(request, env);

      case method === "DELETE" && path.startsWith("/users/"):
        const deleteId = path.split("/")[2];
        return handleDeleteUser(deleteId, env);

      default:
        return new Response(JSON.stringify({ error: "Not Found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
    }
  },
};

async function handleGetUsers(env: Env): Promise<Response> {
  // In a real app, you would fetch from D1 or KV here
  const users = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ];

  return new Response(JSON.stringify(users), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleGetUser(id: string, env: Env): Promise<Response> {
  // Simulated lookup
  const user = { id, name: "Alice" };

  return new Response(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleCreateUser(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { name: string };

  // In a real app, you would insert into D1 here
  const newUser = { id: crypto.randomUUID(), name: body.name };

  return new Response(JSON.stringify(newUser), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleDeleteUser(id: string, env: Env): Promise<Response> {
  // In a real app, you would delete from D1 here
  return new Response(JSON.stringify({ message: `User ${id} deleted` }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

For more complex routing, consider using a lightweight library like `itty-router` or Cloudflare's own `Hono` framework.

### Fetching Data from an External API

Workers can make outbound HTTP requests using the standard `fetch` API:

```typescript
interface GitHubUser {
  login: string;
  name: string;
  public_repos: number;
  bio: string | null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const username = url.searchParams.get("username") || "cloudflare";

    // Fetch data from GitHub's API
    const githubResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        "User-Agent": "Cloudflare-Worker",
      },
    });

    if (!githubResponse.ok) {
      return new Response(JSON.stringify({ error: "GitHub user not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userData: GitHubUser = await githubResponse.json();

    // Return only the fields we care about
    const result = {
      username: userData.login,
      name: userData.name,
      repos: userData.public_repos,
      bio: userData.bio,
    };

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

### Setting Headers and Handling CORS

CORS (Cross-Origin Resource Sharing) is essential when your Worker API is called from a browser on a different domain:

```typescript
// Reusable CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",                             // Or specify your domain
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",                              // Cache preflight for 24 hours
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Your actual logic
    const data = { message: "This response includes CORS headers" };
    return jsonResponse(data);
  },
};
```

### Using Environment Variables and Secrets

You define environment variables in `wrangler.toml` and secrets via the CLI. Both are accessed through the `env` parameter.

In `wrangler.toml`:

```toml
[vars]
API_URL = "https://api.example.com"
ENVIRONMENT = "production"
```

For sensitive values (API keys, tokens), use secrets instead -- they are encrypted and never visible in plaintext:

```bash
wrangler secret put API_KEY
# You will be prompted to enter the value
```

Then use them in your code:

```typescript
// Define the Env interface so TypeScript knows what is available
interface Env {
  API_URL: string;      // From [vars] in wrangler.toml
  ENVIRONMENT: string;  // From [vars] in wrangler.toml
  API_KEY: string;      // From wrangler secret put
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Access environment variables and secrets through env
    const response = await fetch(env.API_URL + "/data", {
      headers: {
        "Authorization": `Bearer ${env.API_KEY}`,
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify({
      environment: env.ENVIRONMENT,
      data,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

---

## 6. How the Flow Works

Here is what happens when a user makes a request to your Worker:

```
                         Cloudflare's Global Network
                        +---------------------------+
                        |                           |
  User Request          |   Nearest Edge Location   |
  (e.g., from Tokyo)   |   (e.g., Tokyo PoP)       |
        |               |                           |
        v               |   +-------------------+   |
   DNS resolves to  --->|   |   V8 Isolate      |   |
   Cloudflare           |   |                   |   |
                        |   |   Your Worker     |   |
                        |   |   code runs here  |   |
                        |   |                   |   |
                        |   +--------+----------+   |
                        |            |              |
                        +------------|--------------|
                                     |              |
                            +--------v--+     +-----v--------+
                            |  Response  |     | Origin Server|
                            |  (direct)  |     | (if needed)  |
                            +--------+---+     +-----+--------+
                                     |               |
                                     v               v
                              Back to user     Fetch data, then
                                               respond to user
```

**The key takeaway:** Your Worker runs at the edge, close to the user. It can respond directly (for things like cached data, computed responses, or redirects) or it can reach out to an origin server or external API when it needs to. Either way, the user gets a response from the nearest edge location -- not from a single region halfway around the world.

---

## 7. Key Concepts

### V8 Isolates vs Containers

Traditional serverless (Lambda, Cloud Functions) spins up a container or microVM for your code. That container includes an OS, a runtime, your dependencies -- the whole stack. This is why cold starts exist: it takes time to boot all of that up.

Workers use V8 isolates instead. An isolate is a lightweight execution context within the V8 JavaScript engine. It shares the engine with other isolates but has its own memory and global scope -- so it is still secure and sandboxed. Starting one takes microseconds, not seconds.

The tradeoff: you can only run JavaScript, TypeScript, or WebAssembly. No Python, no Go, no arbitrary binaries.

### Bindings

Bindings are how your Worker connects to other Cloudflare services. Instead of using connection strings or SDKs, you declare bindings in `wrangler.toml` and they appear as properties on the `env` object.

Common bindings:

| Service | What It Is                     | Binding Example          |
|---------|-------------------------------|--------------------------|
| KV      | Key-value storage             | `env.MY_KV.get("key")`  |
| D1      | SQLite database at the edge   | `env.DB.prepare("SELECT * FROM users").all()` |
| R2      | Object storage (like S3)      | `env.BUCKET.put("file.png", data)` |
| Queues  | Message queues                | `env.MY_QUEUE.send(message)` |
| Durable Objects | Stateful, single-instance actors | `env.COUNTER.get(id)` |

Example binding in `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "MY_KV"
id = "your-kv-namespace-id"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "your-d1-database-id"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "my-bucket"
```

### Environment Variables and Secrets

- **Variables** (`[vars]` in `wrangler.toml`) -- For non-sensitive config. Visible in plaintext in your config file.
- **Secrets** (`wrangler secret put SECRET_NAME`) -- For sensitive values like API keys, tokens, and passwords. Encrypted at rest, never shown in logs or dashboards.

Both are accessed the same way in code: `env.VARIABLE_NAME`.

### Routes and Custom Domains

By default, your Worker is available at `<name>.<subdomain>.workers.dev`. You can also attach it to your own domain:

```toml
# In wrangler.toml
routes = [
  { pattern = "api.example.com/*", zone_name = "example.com" }
]

# Or use custom domains (simpler)
# Set up in the Cloudflare dashboard under Workers > your worker > Triggers
```

### Request/Response API (Web Standards)

Workers use the standard Web APIs you may already know from browser JavaScript:

- `Request` -- The incoming request object with `.url`, `.method`, `.headers`, `.json()`, `.text()`, etc.
- `Response` -- What you return. Constructed with `new Response(body, options)`.
- `Headers` -- Standard `Headers` object for reading and setting HTTP headers.
- `URL` -- For parsing URLs, query parameters, etc.
- `fetch()` -- For making outbound HTTP requests.

If you have used the Fetch API in the browser, you already know how Workers work. No proprietary request/response formats to learn.

### Limits

| Resource         | Free Plan          | Paid Plan (Workers Paid - $5/mo) |
|------------------|--------------------|----------------------------------|
| Requests         | 100,000/day        | 10 million/month included        |
| CPU time         | 10ms per request   | 30 seconds per request           |
| Memory           | 128 MB             | 128 MB                           |
| Worker size      | 1 MB               | 10 MB                            |
| Subrequests      | 50 per request     | 1,000 per request                |
| Environment vars | 64 per Worker      | 128 per Worker                   |

The CPU time limit is wall-clock CPU time, not total duration. Waiting on a `fetch()` call does not count against it -- only actual computation does.

---

## 8. Common Patterns

### Workers + D1 (Full-Stack API)

D1 is Cloudflare's edge SQLite database. Combined with Workers, you get a full-stack API with zero infrastructure to manage.

```typescript
interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/users") {
      const { results } = await env.DB.prepare(
        "SELECT id, name, email FROM users ORDER BY created_at DESC"
      ).all();

      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "POST" && url.pathname === "/users") {
      const body = await request.json() as { name: string; email: string };

      const result = await env.DB.prepare(
        "INSERT INTO users (name, email) VALUES (?, ?) RETURNING id, name, email"
      )
        .bind(body.name, body.email)
        .first();

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
```

### Workers + R2 (File Uploads)

R2 is Cloudflare's object storage (S3-compatible, but with zero egress fees). Great for handling file uploads.

```typescript
interface Env {
  BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1); // Remove leading slash

    // Upload a file
    if (request.method === "PUT" && key) {
      await env.BUCKET.put(key, request.body, {
        httpMetadata: {
          contentType: request.headers.get("Content-Type") || "application/octet-stream",
        },
      });

      return new Response(JSON.stringify({ message: `Uploaded ${key}` }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Download a file
    if (request.method === "GET" && key) {
      const object = await env.BUCKET.get(key);

      if (!object) {
        return new Response("Not Found", { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        },
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};
```

### Workers + KV (Caching / Key-Value Store)

KV is a globally distributed key-value store. It is eventually consistent (reads are fast everywhere, writes propagate globally within ~60 seconds). Perfect for caching, feature flags, and config.

```typescript
interface Env {
  CACHE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cacheKey = `api-response:${url.pathname}`;

    // Check cache first
    const cached = await env.CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    // Cache miss -- fetch from origin
    const originResponse = await fetch(`https://api.example.com${url.pathname}`);
    const data = await originResponse.text();

    // Store in KV with a 5-minute TTL
    await env.CACHE.put(cacheKey, data, { expirationTtl: 300 });

    return new Response(data, {
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  },
};
```

### Workers as API Gateway / Proxy

Use a Worker to sit in front of multiple backend services, aggregate responses, add auth, or rewrite requests:

```typescript
interface Env {
  AUTH_TOKEN: string;
}

const SERVICE_MAP: Record<string, string> = {
  "/api/users":    "https://users-service.internal.example.com",
  "/api/orders":   "https://orders-service.internal.example.com",
  "/api/products": "https://products-service.internal.example.com",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Verify auth
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Route to the correct backend
    const url = new URL(request.url);
    const matchedPrefix = Object.keys(SERVICE_MAP).find((prefix) =>
      url.pathname.startsWith(prefix)
    );

    if (!matchedPrefix) {
      return new Response(JSON.stringify({ error: "Service not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Forward the request to the backend service
    const backendUrl = SERVICE_MAP[matchedPrefix] + url.pathname.slice(matchedPrefix.length);
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Return the backend response to the client
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: backendResponse.headers,
    });
  },
};
```

---

## 9. Useful Commands

Here are the Wrangler commands you will use most often:

### Local Development

```bash
wrangler dev
```

Starts a local development server (usually on `localhost:8787`). It simulates the Workers runtime locally, so you can test your code without deploying. Supports hot reloading -- save a file and it picks up changes automatically.

### Deploy to Production

```bash
wrangler deploy
```

Builds your Worker and deploys it to Cloudflare's global network. Within seconds, your code is running at 300+ edge locations. The command outputs the URL where your Worker is live.

### View Live Logs

```bash
wrangler tail
```

Streams real-time logs from your deployed Worker. You will see every request, along with any `console.log` output. Invaluable for debugging production issues without adding a logging service.

### Manage Secrets

```bash
# Add or update a secret
wrangler secret put API_KEY
# You will be prompted to enter the value securely

# List all secrets (names only, values are hidden)
wrangler secret list

# Delete a secret
wrangler secret delete API_KEY
```

### Other Handy Commands

```bash
# Check your current Wrangler and account status
wrangler whoami

# List all your deployed Workers
wrangler deployments list

# Create a KV namespace
wrangler kv namespace create "MY_KV"

# Create a D1 database
wrangler d1 create my-database

# Create an R2 bucket
wrangler r2 bucket create my-bucket

# Run D1 SQL migrations
wrangler d1 execute my-database --file=./schema.sql
```

---

## Quick Reference

| What you want to do                | Command / Approach                     |
|------------------------------------|----------------------------------------|
| Create a new Worker project        | `npm create cloudflare@latest`         |
| Run locally                        | `wrangler dev`                         |
| Deploy                             | `wrangler deploy`                      |
| Add a secret                       | `wrangler secret put SECRET_NAME`      |
| View live logs                     | `wrangler tail`                        |
| Connect to a database              | Add D1 binding in `wrangler.toml`      |
| Store files                        | Add R2 binding in `wrangler.toml`      |
| Cache data at the edge             | Add KV binding in `wrangler.toml`      |
| Set environment variables          | `[vars]` section in `wrangler.toml`    |
| Use a custom domain                | Add route in `wrangler.toml` or dashboard |

---

That covers the essentials. Start with the Hello World example, run `wrangler dev` to see it locally, then build up from there. The feedback loop is fast -- deploy takes seconds, and `wrangler tail` gives you instant visibility into what is happening in production.
