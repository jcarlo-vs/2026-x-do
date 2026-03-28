# Cloudflare Workers KV -- Study Guide

A beginner-friendly, comprehensive guide to Cloudflare's global key-value store.

---

## 1. What is KV?

Workers KV (Key-Value) is a **globally distributed key-value data store** built into Cloudflare's edge network. If you have used Redis before, the mental model is similar -- but instead of living on a single server, your data is replicated across **300+ data centers worldwide**.

Here is what makes it tick:

- **Super fast reads.** When someone reads a key, the value is served from the Cloudflare edge location closest to them. This means sub-millisecond read latency in most cases.
- **Slower writes.** When you write a key, the value has to propagate across all those edge locations. This takes roughly **~60 seconds** to become globally consistent.
- **Eventually consistent.** If you write a value in New York and someone reads it in Tokyo one second later, they might still get the old value. After about 60 seconds, everyone sees the new value. This is called *eventual consistency*.
- **Read-heavy optimization.** KV is purpose-built for workloads where you read data far more often than you write it. Think "write once, read a million times."

In short: KV gives you a dead-simple key-value API with global distribution baked in. You put data in, and it becomes available everywhere, fast.

---

## 2. When to Use It

### Great use cases for KV

| Use Case | Why KV Works |
|---|---|
| **Caching API responses** | Store expensive API call results; serve them instantly from the edge |
| **Session storage** | Store user sessions globally so any edge location can authenticate a request |
| **Feature flags** | Toggle features on/off without redeploying; reads are instant, changes propagate in ~60s |
| **Configuration data** | App config that changes infrequently but is read on every request |
| **URL shorteners** | Map short codes to long URLs -- classic read-heavy workload |
| **Small, frequently read data** | Anything you write occasionally and read constantly |

### When NOT to use KV

- **Frequently updated data.** If you are updating the same key many times per second, KV is the wrong tool. Writes are rate-limited and slow to propagate.
- **Strong consistency requirements.** If your app absolutely cannot tolerate reading stale data (even for 60 seconds), KV is not the right fit. Look at Durable Objects instead.
- **Large or relational datasets.** If you need SQL queries, joins, or are storing megabytes of structured data, use **D1** (Cloudflare's SQL database) instead.
- **Counters or real-time collaboration.** Use Durable Objects for anything that needs atomic read-modify-write operations.

---

## 3. Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed (`node --version` to check)
- **Wrangler** (Cloudflare's CLI) installed globally:
  ```bash
  npm install -g wrangler
  ```
- A **Cloudflare account** (free tier works fine for learning)
- Logged in to Wrangler:
  ```bash
  wrangler login
  ```

That is it. No databases to provision, no servers to spin up.

---

## 4. Step-by-Step Setup

### Step 1: Create a new Worker project

```bash
npm create cloudflare@latest my-kv-app
cd my-kv-app
```

Choose "Hello World" as your starter template when prompted.

### Step 2: Create a KV namespace

A **namespace** is just a container for your key-value pairs (like a database). You need at least one.

```bash
wrangler kv namespace create "MY_KV"
```

This will output something like:

```
Add the following to your wrangler.toml:

[[kv_namespaces]]
binding = "MY_KV"
id = "abc123def456"
```

For local development, also create a preview namespace:

```bash
wrangler kv namespace create "MY_KV" --preview
```

### Step 3: Add the binding to wrangler.toml

Open `wrangler.toml` and add the binding output from the previous step:

```toml
name = "my-kv-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "MY_KV"
id = "abc123def456"            # your actual ID from step 2
preview_id = "789ghi012jkl"    # your preview ID from step 2
```

The `binding` is the variable name you will use in your Worker code to access KV. The `id` is the unique identifier for your namespace.

### Step 4: Define the environment type

Create or update `src/env.d.ts` (or add to your Worker file):

```typescript
export interface Env {
  MY_KV: KVNamespace;
}
```

### Step 5: Write your Worker

Replace the contents of `src/index.ts`:

```typescript
export interface Env {
  MY_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // PUT a value
    if (url.pathname === "/put") {
      await env.MY_KV.put("greeting", "Hello from KV!");
      return new Response("Value stored successfully.");
    }

    // GET a value
    if (url.pathname === "/get") {
      const value = await env.MY_KV.get("greeting");
      return new Response(value ?? "Key not found.");
    }

    return new Response("Try /put or /get");
  },
};
```

### Step 6: Run it locally

```bash
wrangler dev
```

Visit `http://localhost:8787/put` to store a value, then `http://localhost:8787/get` to read it back.

### Step 7: Deploy

```bash
wrangler deploy
```

Your Worker is now live on Cloudflare's edge, with KV available globally.

---

## 5. Code Examples

Every example below assumes you have the `MY_KV` binding configured in `wrangler.toml` and the `Env` interface defined.

### PUT -- Store a value

```typescript
// Store a simple string
await env.MY_KV.put("username", "alice");

// Store with metadata (any JSON-serializable object)
await env.MY_KV.put("username", "alice", {
  metadata: { createdAt: Date.now(), role: "admin" },
});
```

### GET -- Read a value

```typescript
// Read a string (default)
const username = await env.MY_KV.get("username");
// username = "alice" or null if the key does not exist

// Read with metadata
const { value, metadata } = await env.MY_KV.getWithMetadata("username");
// value = "alice"
// metadata = { createdAt: 1711612800000, role: "admin" }
```

### DELETE -- Remove a value

```typescript
await env.MY_KV.delete("username");
// The key is gone. Reading it now returns null.
```

### Store and retrieve JSON

KV stores everything as strings under the hood. For JSON, you stringify on write and parse on read:

```typescript
// Writing JSON
const user = { name: "Alice", age: 30, plan: "pro" };
await env.MY_KV.put("user:alice", JSON.stringify(user));

// Reading JSON -- use the "json" type to auto-parse
const userData = await env.MY_KV.get("user:alice", { type: "json" });
// userData = { name: "Alice", age: 30, plan: "pro" }

// You can also read as other types:
// "text"       -> string (default)
// "json"       -> parsed JSON object
// "arrayBuffer"-> ArrayBuffer
// "stream"     -> ReadableStream
```

### Set expiration (TTL)

You can make keys automatically expire after a certain time. Useful for caching.

```typescript
// Expire in 1 hour (3600 seconds)
await env.MY_KV.put("cache:api-response", jsonString, {
  expirationTtl: 3600,
});

// Expire at a specific Unix timestamp
await env.MY_KV.put("cache:api-response", jsonString, {
  expiration: Math.floor(Date.now() / 1000) + 3600,
});
```

- `expirationTtl` -- number of **seconds** from now until the key expires (minimum 60).
- `expiration` -- a specific Unix **timestamp** (in seconds) when the key should expire.

After expiration, the key is automatically deleted and `get()` returns `null`.

### List keys with prefix

KV supports listing keys, optionally filtered by prefix. This is how you "query" KV.

```typescript
// List all keys
const allKeys = await env.MY_KV.list();
// allKeys.keys = [{ name: "cache:api-response" }, { name: "user:alice" }, ...]

// List keys with a prefix
const userKeys = await env.MY_KV.list({ prefix: "user:" });
// userKeys.keys = [{ name: "user:alice" }, { name: "user:bob" }, ...]

// Paginated listing (KV returns max 1000 keys per call)
let cursor: string | undefined = undefined;
let allResults: string[] = [];

do {
  const result = await env.MY_KV.list({ prefix: "user:", cursor });
  allResults.push(...result.keys.map((k) => k.name));
  cursor = result.list_complete ? undefined : result.cursor;
} while (cursor);
```

Each key in the list result includes:
- `name` -- the key name
- `expiration` -- Unix timestamp if set, or undefined
- `metadata` -- the metadata object if set, or undefined

---

### Full Example: URL Shortener

A classic KV use case. Short codes map to long URLs -- you write once and read millions of times.

```typescript
export interface Env {
  MY_KV: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // POST /shorten -- Create a short URL
    if (request.method === "POST" && url.pathname === "/shorten") {
      const body = await request.json<{ url: string; code?: string }>();

      if (!body.url) {
        return Response.json({ error: "url is required" }, { status: 400 });
      }

      // Generate a random code or use the one provided
      const code = body.code || crypto.randomUUID().slice(0, 8);

      // Store the mapping with metadata
      await env.MY_KV.put(`short:${code}`, body.url, {
        metadata: { createdAt: Date.now(), originalUrl: body.url },
      });

      return Response.json({
        shortUrl: `${url.origin}/${code}`,
        code,
      });
    }

    // GET /:code -- Redirect to the original URL
    const code = url.pathname.slice(1); // remove leading "/"
    if (code) {
      const longUrl = await env.MY_KV.get(`short:${code}`);

      if (longUrl) {
        return Response.redirect(longUrl, 302);
      }

      return Response.json({ error: "Short URL not found" }, { status: 404 });
    }

    return Response.json({ message: "URL Shortener API. POST /shorten to create." });
  },
};
```

**Usage:**

```bash
# Create a short URL
curl -X POST https://your-worker.dev/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://developers.cloudflare.com/kv/", "code": "cf-kv"}'

# Response: { "shortUrl": "https://your-worker.dev/cf-kv", "code": "cf-kv" }

# Visit https://your-worker.dev/cf-kv -> redirects to the Cloudflare KV docs
```

---

### Full Example: Feature Flag System

Use KV to store feature flags that your Worker checks on every request. Update flags without redeploying.

```typescript
export interface Env {
  MY_KV: KVNamespace;
}

// Type for a feature flag
interface FeatureFlag {
  enabled: boolean;
  rolloutPercentage?: number; // 0-100, for gradual rollouts
  description?: string;
  updatedAt: number;
}

// Helper: Check if a flag is enabled
async function isFeatureEnabled(
  kv: KVNamespace,
  flagName: string,
  userId?: string
): Promise<boolean> {
  const flag = await kv.get<FeatureFlag>(`flag:${flagName}`, { type: "json" });

  if (!flag || !flag.enabled) {
    return false;
  }

  // If there is a rollout percentage and a userId, do a deterministic check
  if (flag.rolloutPercentage !== undefined && userId) {
    const hash = await hashUserId(userId);
    return hash % 100 < flag.rolloutPercentage;
  }

  return true;
}

// Simple deterministic hash for rollout bucketing
async function hashUserId(userId: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return hashArray[0]!; // 0-255, we use mod 100 for percentage
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Admin endpoint: Set a feature flag
    // POST /flags/:name
    if (request.method === "POST" && url.pathname.startsWith("/flags/")) {
      const flagName = url.pathname.split("/")[2];
      const body = await request.json<Partial<FeatureFlag>>();

      const flag: FeatureFlag = {
        enabled: body.enabled ?? false,
        rolloutPercentage: body.rolloutPercentage,
        description: body.description,
        updatedAt: Date.now(),
      };

      await env.MY_KV.put(`flag:${flagName}`, JSON.stringify(flag));
      return Response.json({ ok: true, flag });
    }

    // Admin endpoint: List all flags
    // GET /flags
    if (url.pathname === "/flags") {
      const list = await env.MY_KV.list({ prefix: "flag:" });
      const flags: Record<string, FeatureFlag> = {};

      for (const key of list.keys) {
        const flag = await env.MY_KV.get<FeatureFlag>(key.name, { type: "json" });
        if (flag) {
          flags[key.name.replace("flag:", "")] = flag;
        }
      }

      return Response.json(flags);
    }

    // App endpoint: Check a flag for a user
    // GET /check/:flagName?userId=abc
    if (url.pathname.startsWith("/check/")) {
      const flagName = url.pathname.split("/")[2];
      const userId = url.searchParams.get("userId") ?? undefined;

      const enabled = await isFeatureEnabled(env.MY_KV, flagName!, userId);
      return Response.json({ flag: flagName, enabled });
    }

    return Response.json({
      endpoints: [
        "POST /flags/:name   -- set a flag",
        "GET  /flags          -- list all flags",
        "GET  /check/:name    -- check if a flag is enabled",
      ],
    });
  },
};
```

**Usage:**

```bash
# Create a flag (enabled for 50% of users)
curl -X POST https://your-worker.dev/flags/new-dashboard \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "rolloutPercentage": 50, "description": "New dashboard UI"}'

# Check if a specific user gets the feature
curl https://your-worker.dev/check/new-dashboard?userId=user-123
# Response: { "flag": "new-dashboard", "enabled": true }

# List all flags
curl https://your-worker.dev/flags
```

---

## 6. How the Flow Works

Understanding the read/write flow is key to using KV correctly.

### Write Flow

```
Your Worker (any location)
    |
    v
[KV Write API] -----> Value stored in central data store
    |
    |   ~60 seconds (background propagation)
    |
    v
[Edge Location 1] [Edge Location 2] [Edge Location 3] ... [Edge Location 300+]
    (cached)           (cached)           (cached)              (cached)
```

1. Your Worker calls `put()`.
2. The value is written to Cloudflare's central store.
3. Over the next ~60 seconds, the value propagates to all 300+ edge locations worldwide.
4. Until propagation completes, some edge locations may still serve the old value.

### Read Flow

```
User in Tokyo
    |
    v
[Nearest Edge: Tokyo] ---> Cache HIT? ---> Return value instantly (~1ms)
                               |
                           Cache MISS?
                               |
                               v
                       [Central Data Store] ---> Fetch, cache at edge, return
```

1. User makes a request. It hits the nearest Cloudflare edge location.
2. If the value is cached at that edge: instant response (sub-millisecond).
3. If not cached (cold read): fetches from central store, caches it, then returns. Slightly slower on the first read, instant on subsequent reads.

### The Consistency Timeline

```
T+0s    Write happens ("greeting" = "Hello v2")
T+1s    Edge locations near the write see the new value
T+5s    Some nearby regions have updated
T+30s   Most regions have updated
T+60s   All 300+ edge locations are consistent
```

This is why KV is called "eventually consistent." The data gets everywhere, it just takes a moment.

---

## 7. Key Concepts

### Namespaces

A namespace is an isolated container for key-value pairs. Think of it like a separate database. You can have multiple namespaces per Worker (e.g., one for cache, one for config).

```toml
# wrangler.toml -- multiple namespaces
[[kv_namespaces]]
binding = "CACHE"
id = "abc123"

[[kv_namespaces]]
binding = "CONFIG"
id = "def456"
```

```typescript
// In your Worker
await env.CACHE.put("key", "cached value");
await env.CONFIG.put("key", "config value");
```

### Keys

- Maximum length: **512 bytes**
- Can be any string (including `/`, `:`, etc.)
- Common convention: use prefixes with a delimiter like `user:alice`, `cache:api:/users`
- Keys are case-sensitive: `"User"` and `"user"` are different keys

### Values

- Maximum size: **25 MB** per value
- Can be: strings, JSON (as string), binary data (ArrayBuffer), streams
- For most use cases, values are well under 1 MB

### Metadata

- Optional JSON object attached to a key (separate from the value)
- Maximum size: **1024 bytes** (1 KB)
- Returned when listing keys (without reading the value) -- useful for filtering
- Example: `{ createdAt: 1711612800000, contentType: "application/json" }`

### Expiration and TTL

- `expirationTtl`: seconds from now until the key expires (minimum: 60 seconds)
- `expiration`: exact Unix timestamp (in seconds) when the key expires
- Expired keys are automatically deleted and return `null` on read
- If you do not set an expiration, the key lives forever (until you delete it)

### Eventual Consistency Model

- Writes are **centralized** then **propagated** to edge locations
- Reads are served from the **nearest edge** (cached copy)
- After a write, it takes **~60 seconds** for all edges to see the new value
- If you write and immediately read from a different location, you may get the old value
- Within the **same location**, reads after writes are usually consistent

### List Operations

- `list()` returns up to **1000 keys** per call
- Use `cursor` for pagination through large sets
- Use `prefix` to filter keys (e.g., all keys starting with `"user:"`)
- List results include key names, expiration times, and metadata

### Limits (Free Plan)

| Resource | Free Tier | Paid (Workers Paid) |
|---|---|---|
| Read operations | 100,000 / day | Unlimited (first 10M free/month) |
| Write operations | 1,000 / day | Unlimited (first 1M free/month) |
| Delete operations | 1,000 / day | Unlimited (first 1M free/month) |
| List operations | 1,000 / day | Unlimited (first 1M free/month) |
| Stored data | 1 GB total | Unlimited (first 1 GB free) |
| Key size | 512 bytes | 512 bytes |
| Value size | 25 MB | 25 MB |
| Namespaces | 100 | 100 |

---

## 8. Common Patterns

### Pattern 1: KV as a Cache Layer

Cache expensive API calls or database queries. Set a TTL so stale data expires automatically.

```typescript
async function getCachedData(env: Env, cacheKey: string): Promise<any> {
  // Try cache first
  const cached = await env.MY_KV.get(cacheKey, { type: "json" });
  if (cached) {
    return cached; // Cache hit -- instant response
  }

  // Cache miss -- fetch fresh data
  const freshData = await fetchFromExpensiveAPI();

  // Store in KV with 5-minute TTL
  await env.MY_KV.put(cacheKey, JSON.stringify(freshData), {
    expirationTtl: 300,
  });

  return freshData;
}
```

### Pattern 2: KV for Configuration and Feature Flags

Store app configuration that you update occasionally via the dashboard or API. Every Worker instance reads from its nearest edge.

```typescript
interface AppConfig {
  maintenanceMode: boolean;
  maxUploadSizeMb: number;
  allowedOrigins: string[];
}

async function getConfig(env: Env): Promise<AppConfig> {
  const config = await env.MY_KV.get<AppConfig>("app:config", { type: "json" });

  // Return config or sensible defaults
  return config ?? {
    maintenanceMode: false,
    maxUploadSizeMb: 10,
    allowedOrigins: ["https://example.com"],
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const config = await getConfig(env);

    if (config.maintenanceMode) {
      return new Response("We are down for maintenance. Check back soon.", {
        status: 503,
      });
    }

    // Normal request handling...
    return new Response("App is running.");
  },
};
```

### Pattern 3: KV + Workers as a Simple API

For small projects, KV can serve as your entire "database." Perfect for prototypes, personal tools, and simple public APIs.

```typescript
// A simple bookmarks API
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    switch (request.method) {
      case "GET":
        if (id && id !== "bookmarks") {
          const bookmark = await env.MY_KV.get(`bookmark:${id}`, { type: "json" });
          return bookmark
            ? Response.json(bookmark)
            : Response.json({ error: "Not found" }, { status: 404 });
        }
        // List all bookmarks
        const list = await env.MY_KV.list({ prefix: "bookmark:" });
        return Response.json(list.keys.map((k) => k.name.replace("bookmark:", "")));

      case "POST":
        const body = await request.json();
        const newId = crypto.randomUUID().slice(0, 8);
        await env.MY_KV.put(`bookmark:${newId}`, JSON.stringify(body));
        return Response.json({ id: newId }, { status: 201 });

      case "DELETE":
        if (id) {
          await env.MY_KV.delete(`bookmark:${id}`);
          return Response.json({ deleted: true });
        }
        return Response.json({ error: "ID required" }, { status: 400 });

      default:
        return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
  },
};
```

---

## 9. Useful Wrangler Commands

### Namespace Management

```bash
# Create a new namespace
wrangler kv namespace create "MY_KV"

# Create a preview namespace (for local dev)
wrangler kv namespace create "MY_KV" --preview

# List all namespaces in your account
wrangler kv namespace list

# Delete a namespace (irreversible!)
wrangler kv namespace delete --namespace-id <NAMESPACE_ID>
```

### Key Management (from the command line)

```bash
# Put a value
wrangler kv key put "greeting" "Hello, world!" --namespace-id <NAMESPACE_ID>

# Put a value using the binding name (reads from wrangler.toml)
wrangler kv key put "greeting" "Hello, world!" --binding MY_KV

# Put from a file
wrangler kv key put "config" --path ./config.json --binding MY_KV

# Get a value
wrangler kv key get "greeting" --binding MY_KV

# List all keys
wrangler kv key list --binding MY_KV

# List keys with a prefix
wrangler kv key list --prefix "user:" --binding MY_KV

# Delete a key
wrangler kv key delete "greeting" --binding MY_KV
```

### Bulk Operations

```bash
# Bulk put from a JSON file
# The file should be an array: [{"key": "a", "value": "1"}, {"key": "b", "value": "2"}]
wrangler kv bulk put ./data.json --binding MY_KV

# Bulk delete from a JSON file
# The file should be an array of key names: ["a", "b", "c"]
wrangler kv bulk delete ./keys-to-delete.json --binding MY_KV
```

### Local Development

```bash
# Start dev server (KV works locally with --local flag, which is the default)
wrangler dev

# Start dev server using remote KV (reads/writes to your actual namespace)
wrangler dev --remote
```

---

## Quick Reference

| Operation | Code | Notes |
|---|---|---|
| Write | `await env.MY_KV.put(key, value)` | Value is a string or ArrayBuffer |
| Read | `await env.MY_KV.get(key)` | Returns `null` if key missing |
| Read JSON | `await env.MY_KV.get(key, { type: "json" })` | Auto-parses JSON |
| Read + Metadata | `await env.MY_KV.getWithMetadata(key)` | Returns `{ value, metadata }` |
| Delete | `await env.MY_KV.delete(key)` | No error if key missing |
| List | `await env.MY_KV.list({ prefix })` | Max 1000 keys per call |
| TTL | `await env.MY_KV.put(key, val, { expirationTtl: 3600 })` | Minimum 60 seconds |
| Metadata | `await env.MY_KV.put(key, val, { metadata: {...} })` | Max 1024 bytes |

---

That covers everything you need to get started with Cloudflare Workers KV. The key takeaway: KV is your go-to for simple, read-heavy data that does not need real-time consistency. Pair it with Workers for globally distributed apps with minimal effort.
