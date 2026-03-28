# Cloudflare Durable Objects -- A Comprehensive Study Guide

## Table of Contents

1. [What are Durable Objects?](#1-what-are-durable-objects)
2. [When to Use Durable Objects](#2-when-to-use-durable-objects)
3. [Prerequisites](#3-prerequisites)
4. [Step-by-Step Setup](#4-step-by-step-setup)
5. [Code Examples](#5-code-examples)
6. [How the Flow Works](#6-how-the-flow-works)
7. [Key Concepts](#7-key-concepts)
8. [Common Patterns](#8-common-patterns)

---

## 1. What are Durable Objects?

Regular Cloudflare Workers are **stateless**. Every time a request comes in, a Worker spins up, does its job, and forgets everything. If you need to remember something, you have to reach out to an external database or KV store. That works fine for many use cases, but it falls apart when you need **strong consistency** or **real-time coordination**.

**Durable Objects (DOs)** solve this by giving you **stateful serverless computing**. Each Durable Object is like a tiny, dedicated server for one specific "thing" -- a chat room, a user session, a collaborative document, a game match, a counter.

Here is what makes them special:

- **Single-instance guarantee.** For any given Durable Object ID, there is exactly **one** instance running in the entire world at any time. Two requests for the same object always go to the same instance.
- **In-memory state.** Because it is a single instance, you can hold JavaScript variables in memory between requests. No need for a round-trip to a database for every read.
- **Built-in persistent storage.** Each DO gets its own transactional key-value store that survives restarts. Think of it as a private SQLite-like store embedded right in your object.
- **Strong consistency.** Since only one instance handles all requests, there are no race conditions or stale reads. If two users update the same counter simultaneously, the requests are serialized automatically.

### The Mental Model

Think of a traditional server application where you have one process managing a chat room. All users connect to that one process, which keeps the list of connected clients in memory and broadcasts messages. Durable Objects give you that exact model, but in a serverless environment -- no servers to manage, no scaling to worry about, no infrastructure to maintain.

```
Traditional:    Server Process (stateful, single instance per chat room)
Durable Object: Same concept, but serverless, globally distributed, auto-scaled
```

### Durable Objects vs. Workers KV vs. D1

| Feature | Workers KV | D1 | Durable Objects |
|---|---|---|---|
| Consistency | Eventually consistent | Strong (single region) | Strong (single instance) |
| Use case | Read-heavy config/cache | Relational data | Real-time coordination |
| State model | Global KV | SQL database | Per-object KV + in-memory |
| WebSocket support | No | No | Yes (native) |
| Concurrency model | Many instances | Many connections | Single instance per ID |

---

## 2. When to Use Durable Objects

Durable Objects shine when you need **coordination** between multiple requests or users with **strong consistency**. Here are the classic use cases:

### Perfect Fit

- **Real-time collaboration** -- Google Docs-style editing where multiple users modify the same document simultaneously. The DO serializes all edits and broadcasts changes.
- **Chat rooms** -- Each chat room is a DO that manages WebSocket connections and message broadcasting.
- **Multiplayer games** -- A game match is a DO that tracks game state and coordinates player actions.
- **Rate limiters** -- A DO per API key or IP that accurately counts requests without race conditions.
- **Counters and leaderboards** -- Accurate, strongly-consistent counters that never double-count or lose increments.
- **WebSocket servers** -- DOs have first-class WebSocket support with the Hibernation API, making them ideal for any persistent-connection use case.
- **Distributed locks and coordination** -- When you need a single source of truth to coordinate multiple Workers.
- **User sessions** -- A DO per user that holds session state, preferences, and recent activity.

### Not the Best Fit

- **Read-heavy, rarely-changing data** -- Use Workers KV instead.
- **Relational queries across many records** -- Use D1 or an external database.
- **Large file storage** -- Use R2.
- **Simple caching** -- Use the Cache API or Workers KV.

The rule of thumb: if multiple requests need to **coordinate** around a shared piece of state with **zero tolerance for stale reads**, Durable Objects are your tool.

---

## 3. Prerequisites

Before you start, make sure you have:

- **Node.js 18+** -- Check with `node --version`. Install from [nodejs.org](https://nodejs.org) if needed.
- **Wrangler CLI** -- Cloudflare's development tool. Install it globally:

```bash
npm install -g wrangler
```

- **Cloudflare account with a paid Workers plan** -- Durable Objects are not available on the free plan. You need at least the Workers Paid plan ($5/month as of this writing).
- **Wrangler authenticated** -- Run `wrangler login` and follow the browser flow to connect your Cloudflare account.

Verify your setup:

```bash
node --version      # v18.x or higher
wrangler --version  # 3.x or higher
wrangler whoami     # Should show your Cloudflare account
```

---

## 4. Step-by-Step Setup

Let's build a simple counter Durable Object from scratch.

### Step 1: Create a Worker Project

```bash
npm create cloudflare@latest my-do-project -- --type=hello-world --ts
cd my-do-project
```

This scaffolds a basic Worker project with TypeScript support.

### Step 2: Configure wrangler.toml

Open `wrangler.toml` and add the Durable Object configuration:

```toml
name = "my-do-project"
main = "src/index.ts"
compatibility_date = "2024-12-01"

# Declare the Durable Object binding
[durable_objects]
bindings = [
  { name = "COUNTER", class_name = "Counter" }
]

# Migrations tell Cloudflare about new or renamed DO classes
[[migrations]]
tag = "v1"
new_classes = ["Counter"]
```

There are two critical pieces here:

- **`[durable_objects] bindings`** -- This creates a binding named `COUNTER` in your Worker's environment. When your Worker code accesses `env.COUNTER`, it gets a namespace that can create or look up `Counter` Durable Objects.
- **`[[migrations]]`** -- This tells Cloudflare that the `Counter` class is new. Migrations are needed whenever you add, remove, or rename DO classes. Each migration gets a `tag` (like a version label) that must be unique and should increase over time.

### Step 3: Define the Durable Object Class

Create or edit `src/index.ts`:

```typescript
export class Counter implements DurableObject {
  private count: number = 0;

  constructor(
    private ctx: DurableObjectState,
    private env: Env
  ) {}

  // Called when the DO is first created or wakes from hibernation
  async fetch(request: Request): Promise<Response> {
    // Load persisted count from storage on first access
    const stored = await this.ctx.storage.get<number>("count");
    if (stored !== undefined) {
      this.count = stored;
    }

    const url = new URL(request.url);

    switch (url.pathname) {
      case "/increment": {
        this.count++;
        await this.ctx.storage.put("count", this.count);
        return new Response(JSON.stringify({ count: this.count }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      case "/decrement": {
        this.count--;
        await this.ctx.storage.put("count", this.count);
        return new Response(JSON.stringify({ count: this.count }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      case "/": {
        return new Response(JSON.stringify({ count: this.count }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      default:
        return new Response("Not found", { status: 404 });
    }
  }
}
```

### Step 4: Write the Worker That Uses the Durable Object

In the same file, add the Worker that routes requests to the DO:

```typescript
// Type definitions for your environment bindings
interface Env {
  COUNTER: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Use a named ID -- all requests with the same name go to the same DO
    const id = env.COUNTER.idFromName("global-counter");

    // Get a stub (a proxy/handle to the DO instance)
    const stub = env.COUNTER.get(id);

    // Forward the request to the Durable Object
    return stub.fetch(request);
  },
};

// Don't forget to export the DO class!
export { Counter };
```

Wait -- the `Counter` class was already exported above. The key point is: **you must export the DO class from your main entry point** so the runtime can find it.

### Step 5: Run Locally

```bash
wrangler dev
```

Test it:

```bash
curl http://localhost:8787/              # {"count": 0}
curl http://localhost:8787/increment     # {"count": 1}
curl http://localhost:8787/increment     # {"count": 2}
curl http://localhost:8787/decrement     # {"count": 1}
curl http://localhost:8787/              # {"count": 1}
```

### Step 6: Deploy

```bash
wrangler deploy
```

Your counter is now live on Cloudflare's global network with persistent state.

---

## 5. Code Examples

### Example 1: Simple Counter (Complete File)

This is the full, copy-paste-ready version of what we built above:

```typescript
// src/index.ts

interface Env {
  COUNTER: DurableObjectNamespace;
}

export class Counter implements DurableObject {
  private count: number | null = null;

  constructor(
    private ctx: DurableObjectState,
    private env: Env
  ) {}

  private async getCount(): Promise<number> {
    if (this.count === null) {
      this.count = (await this.ctx.storage.get<number>("count")) ?? 0;
    }
    return this.count;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    let count = await this.getCount();

    switch (url.pathname) {
      case "/increment":
        count = ++this.count!;
        await this.ctx.storage.put("count", count);
        break;
      case "/decrement":
        count = --this.count!;
        await this.ctx.storage.put("count", count);
        break;
      case "/reset":
        this.count = 0;
        count = 0;
        await this.ctx.storage.put("count", 0);
        break;
      case "/":
        break;
      default:
        return new Response("Not found", { status: 404 });
    }

    return Response.json({ count });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // You can use the query string to select different counters
    const counterName = url.searchParams.get("name") ?? "default";
    const id = env.COUNTER.idFromName(counterName);
    const stub = env.COUNTER.get(id);

    return stub.fetch(request);
  },
};
```

Now you can have multiple independent counters:

```bash
curl "http://localhost:8787/increment?name=page-views"   # {"count": 1}
curl "http://localhost:8787/increment?name=api-calls"     # {"count": 1}
curl "http://localhost:8787/increment?name=page-views"    # {"count": 2}
curl "http://localhost:8787/?name=api-calls"              # {"count": 1}
```

### Example 2: Accessing a Durable Object by ID or Name

There are two ways to get a reference to a Durable Object:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Method 1: Named ID -- deterministic, same name always gives same DO
    const namedId = env.MY_DO.idFromName("room-42");

    // Method 2: Unique ID -- generates a new globally unique ID
    const uniqueId = env.MY_DO.newUniqueId();

    // Method 3: Reconstruct from a previously-generated unique ID string
    const existingId = env.MY_DO.idFromString(
      "0000000000000000000000000000000000000000000000000000000000000001"
    );

    // All three return a DurableObjectId, which you use to get a stub
    const stub = env.MY_DO.get(namedId);
    return stub.fetch(request);
  },
};
```

**When to use which:**

- `idFromName("something")` -- When the ID is derived from a natural key (a room name, a user ID, a document slug). Deterministic: the same name always produces the same DO.
- `newUniqueId()` -- When you need a brand-new, unique DO (like creating a new game match). You will need to store the ID string somewhere so you can find it again.
- `idFromString(hex)` -- When you previously generated a unique ID and stored its hex representation, and now need to reconnect to that same DO.

### Example 3: WebSocket Chat Room

This is where Durable Objects really shine. Each chat room is a DO instance that manages WebSocket connections:

```typescript
// wrangler.toml additions:
// [durable_objects]
// bindings = [{ name = "CHAT_ROOM", class_name = "ChatRoom" }]
// [[migrations]]
// tag = "v1"
// new_classes = ["ChatRoom"]

interface Env {
  CHAT_ROOM: DurableObjectNamespace;
}

export class ChatRoom implements DurableObject {
  // Track all connected WebSocket clients
  private sessions: Map<WebSocket, { name: string }> = new Map();

  constructor(
    private ctx: DurableObjectState,
    private env: Env
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/websocket") {
      return this.handleWebSocketUpgrade(request);
    }

    if (url.pathname === "/history") {
      const history =
        (await this.ctx.storage.get<string[]>("history")) ?? [];
      return Response.json({ messages: history });
    }

    return new Response("Expected /websocket or /history", { status: 400 });
  }

  private handleWebSocketUpgrade(request: Request): Response {
    // Verify the request is a WebSocket upgrade
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    // Create the WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the server side of the connection
    this.ctx.acceptWebSocket(server);

    const url = new URL(request.url);
    const name = url.searchParams.get("name") ?? "Anonymous";

    // Tag the WebSocket so we can identify it later
    // Tags survive hibernation
    server.serializeAttachment({ name });

    // Broadcast that someone joined
    this.broadcast(`${name} joined the chat`, null);

    return new Response(null, { status: 101, webSocket: client });
  }

  // Called when a WebSocket message is received (Hibernation API)
  async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer
  ): Promise<void> {
    const attachment = ws.deserializeAttachment() as { name: string };
    const text = typeof message === "string" ? message : "(binary)";
    const fullMessage = `${attachment.name}: ${text}`;

    // Save to history (keep last 100 messages)
    let history =
      (await this.ctx.storage.get<string[]>("history")) ?? [];
    history.push(fullMessage);
    if (history.length > 100) {
      history = history.slice(-100);
    }
    await this.ctx.storage.put("history", history);

    // Broadcast to all connected clients
    this.broadcast(fullMessage, ws);
  }

  // Called when a WebSocket connection closes (Hibernation API)
  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ): Promise<void> {
    const attachment = ws.deserializeAttachment() as { name: string };
    this.broadcast(`${attachment.name} left the chat`, null);
    ws.close();
  }

  // Called when a WebSocket encounters an error
  async webSocketError(ws: WebSocket, error: unknown): Promise<void> {
    ws.close(1011, "Unexpected error");
  }

  private broadcast(message: string, sender: WebSocket | null): void {
    // getWebSockets() returns all accepted WebSockets (Hibernation API)
    const sockets = this.ctx.getWebSockets();
    for (const ws of sockets) {
      try {
        if (ws !== sender) {
          ws.send(message);
        }
      } catch {
        // Socket is probably closed, it will be cleaned up
      }
    }
  }
}

// The Worker that routes to the correct chat room DO
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Extract room name from the URL: /rooms/my-room/websocket
    const match = url.pathname.match(/^\/rooms\/([^/]+)(\/.*)?$/);
    if (!match) {
      return new Response("Use /rooms/{room-name}/websocket", {
        status: 400,
      });
    }

    const roomName = match[1];
    const subPath = match[2] ?? "/websocket";

    const id = env.CHAT_ROOM.idFromName(roomName);
    const stub = env.CHAT_ROOM.get(id);

    // Rewrite the URL to just the sub-path for the DO
    const doUrl = new URL(request.url);
    doUrl.pathname = subPath;

    return stub.fetch(new Request(doUrl.toString(), request));
  },
};
```

**Key points about the WebSocket Hibernation API:**

- Use `this.ctx.acceptWebSocket(ws)` instead of manually handling `ws.addEventListener`.
- Implement `webSocketMessage()`, `webSocketClose()`, and `webSocketError()` as class methods.
- Use `ws.serializeAttachment()` and `ws.deserializeAttachment()` to attach metadata to sockets that survives hibernation.
- Use `this.ctx.getWebSockets()` to get all connected sockets.
- The Hibernation API allows the DO to go to sleep when no messages are being processed, saving costs. It wakes up when a new message arrives.

### Example 4: The Storage API

Each Durable Object has a built-in transactional key-value store. Here is how to use it:

```typescript
export class StorageDemo implements DurableObject {
  constructor(
    private ctx: DurableObjectState,
    private env: Env
  ) {}

  async fetch(request: Request): Promise<Response> {
    const storage = this.ctx.storage;

    // --- Basic Operations ---

    // Put a single value (any serializable type)
    await storage.put("username", "alice");
    await storage.put("score", 42);
    await storage.put("settings", { theme: "dark", lang: "en" });

    // Get a single value
    const username = await storage.get<string>("username");       // "alice"
    const score = await storage.get<number>("score");             // 42
    const settings = await storage.get<{ theme: string }>("settings");

    // Delete a single key
    await storage.delete("username");

    // Check if a key was deleted (returns true if the key existed)
    const existed: boolean = await storage.delete("maybe-key");

    // --- Batch Operations (more efficient) ---

    // Put multiple values at once
    await storage.put({
      player1: { name: "Alice", score: 10 },
      player2: { name: "Bob", score: 7 },
      player3: { name: "Carol", score: 15 },
    });

    // Get multiple values at once
    const players = await storage.get(["player1", "player2", "player3"]);
    // Returns Map<string, any>: Map { "player1" => {...}, "player2" => {...}, ... }

    // Delete multiple keys at once
    const deleteCount = await storage.delete(["player1", "player2"]);
    // Returns number of keys deleted

    // --- Listing Keys ---

    // List all keys (returns a Map)
    const allEntries = await storage.list();

    // List with a prefix
    const playerEntries = await storage.list({ prefix: "player" });

    // List with pagination
    const page1 = await storage.list({ limit: 10 });
    const lastKey = [...page1.keys()].pop();
    const page2 = await storage.list({ limit: 10, startAfter: lastKey });

    // List in reverse order
    const reversed = await storage.list({ reverse: true, limit: 5 });

    // --- Transactions ---

    // Use a transaction for atomic read-modify-write
    await this.ctx.storage.transaction(async (txn) => {
      const balance = (await txn.get<number>("balance")) ?? 0;
      if (balance >= 100) {
        await txn.put("balance", balance - 100);
        await txn.put("purchased", true);
      }
      // If an exception is thrown, the transaction is rolled back
    });

    // --- Delete Everything ---

    // Nuclear option: delete all stored data for this DO
    await storage.deleteAll();

    return Response.json({ message: "Storage demo complete" });
  }
}
```

**Storage limits and characteristics:**

- Keys are strings, up to 2,048 bytes.
- Values can be any type serializable with the structured clone algorithm (objects, arrays, Maps, Sets, Dates, ArrayBuffers, etc.). Max 128 KiB per value.
- Each DO can store up to 10 GiB of data (across all keys).
- Reads from storage are fast because recently-accessed data is cached in memory.
- Writes are durable -- once `put()` resolves, the data is persisted even if the DO crashes immediately after.

### Example 5: The Alarm API

Alarms let a Durable Object schedule itself to wake up at a specific time. This is useful for deferred work, cleanup tasks, reminders, or anything that needs to happen "later."

```typescript
export class ReminderService implements DurableObject {
  constructor(
    private ctx: DurableObjectState,
    private env: Env
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/schedule" && request.method === "POST") {
      const body = await request.json<{
        message: string;
        delaySeconds: number;
      }>();

      // Store the reminder message
      await this.ctx.storage.put("reminder", body.message);

      // Schedule the alarm
      const alarmTime = Date.now() + body.delaySeconds * 1000;
      await this.ctx.storage.setAlarm(alarmTime);

      return Response.json({
        scheduled: true,
        willFireAt: new Date(alarmTime).toISOString(),
      });
    }

    if (url.pathname === "/check") {
      const alarm = await this.ctx.storage.getAlarm();
      if (alarm) {
        return Response.json({
          alarmScheduled: true,
          firesAt: new Date(alarm).toISOString(),
        });
      }
      return Response.json({ alarmScheduled: false });
    }

    if (url.pathname === "/cancel") {
      await this.ctx.storage.deleteAlarm();
      return Response.json({ cancelled: true });
    }

    return new Response("Use /schedule, /check, or /cancel", {
      status: 400,
    });
  }

  // This method is called when the alarm fires
  async alarm(): Promise<void> {
    const message = await this.ctx.storage.get<string>("reminder");
    console.log(`ALARM FIRED: ${message}`);

    // Do whatever you need: send a notification, clean up data,
    // trigger a webhook, etc.

    // You can schedule the next alarm from within alarm() for
    // recurring tasks:
    // await this.ctx.storage.setAlarm(Date.now() + 60_000); // repeat in 1 min

    // Clean up
    await this.ctx.storage.delete("reminder");
  }
}
```

**Alarm API notes:**

- Each DO can have at most **one** alarm scheduled at a time. Setting a new alarm replaces the previous one.
- The `alarm()` method is guaranteed to run at least once. If the DO crashes during `alarm()`, it will be retried.
- Alarms have roughly second-level precision. Don't rely on them for sub-second timing.
- Alarms are persisted -- they survive DO restarts and hibernation.
- You can schedule recurring work by calling `setAlarm()` again inside `alarm()`.

---

## 6. How the Flow Works

Here is the full lifecycle of a request to a Durable Object:

```
                    Cloudflare's Global Network
                    ===========================

  User A ──┐
            │
  User B ──┼── Request ──> Worker (stateless)
            │                  │
  User C ──┘                   │
                               ├── env.COUNTER.idFromName("room-42")
                               │   (Determines which DO instance)
                               │
                               ├── env.COUNTER.get(id)
                               │   (Gets a stub / proxy)
                               │
                               └── stub.fetch(request)
                                   (Forwards request to the DO)
                                        │
                                        v
                            ┌─────────────────────┐
                            │   Durable Object     │
                            │   "room-42"          │
                            │                      │
                            │   - Single instance  │
                            │   - In-memory state  │
                            │   - Private storage  │
                            │   - WebSocket mgmt   │
                            │                      │
                            │   Processes request   │
                            │   sequentially        │
                            └──────────┬───────────┘
                                       │
                                       v
                                   Response
                                 (back to user)
```

### Step-by-Step Breakdown

1. **Request arrives at the edge.** A user's HTTP request hits the nearest Cloudflare data center.

2. **Worker receives the request.** Your stateless Worker code runs and determines which Durable Object should handle this request.

3. **Worker gets a DO ID.** Using `idFromName()` or `idFromString()`, the Worker identifies which specific DO instance is needed. This ID is globally unique and deterministic (for named IDs).

4. **Worker gets a stub.** Calling `namespace.get(id)` returns a stub -- a proxy object that knows how to communicate with the actual DO instance, wherever it is running.

5. **Request is forwarded.** When you call `stub.fetch(request)`, the request is forwarded to the single instance of that DO. If the DO is not currently running, Cloudflare creates it. If it is running (maybe in a data center on the other side of the world), the request is routed there.

6. **DO processes the request.** The DO instance receives the request, accesses its in-memory state and/or storage, does its work, and returns a response.

7. **Response flows back.** The response goes back through the stub to the Worker and then to the user.

### Multiple Users, Same Durable Object

```
  User A (New York)    ──> Worker (NYC edge)    ─┐
                                                  │
  User B (London)      ──> Worker (LDN edge)    ─┼──> Durable Object instance
                                                  │   (running in, say, Iowa)
  User C (Tokyo)       ──> Worker (TYO edge)    ─┘
                                                      Single instance handles
                                                      ALL three requests,
                                                      serialized in order.
```

All three users' requests are routed to the **same** DO instance. The DO processes them one at a time (or concurrently for WebSockets, with the event loop), ensuring strong consistency. This is the core value proposition.

### Where Does the DO Run?

Cloudflare automatically places each DO instance close to where it was first created (or where it gets the most traffic). You don't choose a region -- Cloudflare handles placement and can relocate DOs for optimal performance. You can optionally provide a location hint:

```typescript
const id = env.COUNTER.idFromName("eu-counter");
const stub = env.COUNTER.get(id, { locationHint: "eeur" });
```

---

## 7. Key Concepts

### Single-Instance Guarantee (Strong Consistency)

This is the foundational concept. For any given Durable Object ID, Cloudflare guarantees that there is **at most one instance** running globally. All requests for that ID are routed to that single instance.

This means:
- No distributed consensus needed. The DO **is** the single source of truth.
- No stale reads. You read from memory or storage, and it is always the latest state.
- No write conflicts. Requests are serialized, so two concurrent writes are processed one after the other.
- If the DO crashes, Cloudflare recreates it. The new instance reads state from durable storage and picks up where it left off.

### Object IDs

Every Durable Object has a globally unique ID. There are two flavors:

**Named IDs** (`idFromName(name: string)`):
- Deterministic: the same name always produces the same ID.
- Great for objects tied to a natural key (room names, user IDs, document slugs).
- You can always get back to the same DO by using the same name.

**Unique IDs** (`newUniqueId()`):
- Randomly generated, globally unique.
- You must store the ID string (via `id.toString()`) somewhere if you want to find this DO again.
- Use when there is no natural key (e.g., creating a new game match and storing the match ID in a database).

### Stubs

A stub is a local proxy for a remote Durable Object. You get one by calling `namespace.get(id)`. The stub has a `fetch()` method that forwards requests to the actual DO instance. Think of it like an HTTP client pointed at your specific DO.

```typescript
const id = env.MY_DO.idFromName("example");
const stub = env.MY_DO.get(id);  // stub is a DurableObjectStub

// stub.fetch() works just like the global fetch(), but routes to the DO
const response = await stub.fetch("https://dummy-url/some-path", {
  method: "POST",
  body: JSON.stringify({ action: "do-something" }),
});
```

The URL host doesn't matter -- only the path and other request properties are used. The routing is handled by the stub, not by DNS.

### The Storage API

Each DO has a private, transactional key-value store accessed via `this.ctx.storage`. It is NOT shared between different DOs. Key characteristics:

- **Transactional.** You can wrap multiple reads and writes in `storage.transaction()` for atomicity.
- **Durable.** Data survives DO restarts, crashes, and hibernation.
- **Fast.** Recently accessed data is cached in memory. Reads often hit the cache.
- **Automatic.** No setup, no connection strings, no schema. Just `get()` and `put()`.

See Example 4 above for the full API.

### WebSocket Hibernation API

The Hibernation API is the recommended way to handle WebSockets in Durable Objects. It lets the DO "sleep" when no WebSocket messages are being processed, saving costs (you are not billed for idle wall-clock time with hibernation).

Key methods:
- `this.ctx.acceptWebSocket(ws)` -- Accept a WebSocket and register it with the DO.
- `this.ctx.getWebSockets()` -- Get all currently connected WebSockets.
- `webSocketMessage(ws, message)` -- Called when a message arrives.
- `webSocketClose(ws, code, reason, wasClean)` -- Called when a socket closes.
- `webSocketError(ws, error)` -- Called when a socket errors.
- `ws.serializeAttachment(data)` / `ws.deserializeAttachment()` -- Attach metadata that survives hibernation.

### Alarms

Each DO can schedule a single alarm -- a future point in time when the `alarm()` method will be called. Useful for:
- Cleanup and garbage collection
- Delayed processing
- Recurring tasks (re-schedule inside `alarm()`)
- Timeout detection (e.g., "if no activity in 5 minutes, close the room")

See Example 5 above for the full API.

### Migrations

Whenever you add, remove, or rename a Durable Object class, you need a migration entry in `wrangler.toml`. Migrations are processed in order by their `tag`.

```toml
# First migration: create the Counter class
[[migrations]]
tag = "v1"
new_classes = ["Counter"]

# Second migration: add ChatRoom, rename Counter to AdvancedCounter
[[migrations]]
tag = "v2"
new_classes = ["ChatRoom"]
renamed_classes = [{ from = "Counter", to = "AdvancedCounter" }]

# Third migration: remove the old Logger class
[[migrations]]
tag = "v3"
deleted_classes = ["Logger"]
```

**Important:** Once a migration has been deployed, do not modify or remove it. Only append new migrations.

### Lifecycle

1. **Creation.** A DO is created the first time a stub sends a request to it (via `stub.fetch()`). The constructor runs, and then `fetch()` is called.
2. **Active.** The DO stays in memory as long as it is receiving requests or has active WebSocket connections.
3. **Hibernation.** If using the Hibernation API and there are no active requests (only idle WebSocket connections), the DO hibernates. In-memory JavaScript state is lost, but WebSocket connections and storage persist. The DO wakes up when a WebSocket message arrives.
4. **Eviction.** If a DO is idle (no requests, no WebSockets, no pending alarms), Cloudflare may evict it from memory. The next request recreates it. Stored data is preserved.
5. **Alarm wake-up.** If an alarm fires, the DO is woken up (or created) and `alarm()` is called.

---

## 8. Common Patterns

### Pattern 1: DO per Chat Room

Each chat room gets its own Durable Object. The room name maps to the DO ID.

```typescript
// Worker routing
const roomName = url.pathname.split("/")[2]; // /rooms/general/ws -> "general"
const id = env.CHAT_ROOM.idFromName(roomName);
const stub = env.CHAT_ROOM.get(id);
```

The DO manages WebSocket connections, message history, and user presence. Scaling is natural: 1,000 chat rooms means 1,000 independent DOs, each handling only their own room's traffic.

### Pattern 2: DO per Document (Collaborative Editing)

Each document gets a DO that acts as the authoritative state holder:

```typescript
export class Document implements DurableObject {
  private content: string = "";

  constructor(private ctx: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    if (this.content === "") {
      this.content =
        (await this.ctx.storage.get<string>("content")) ?? "";
    }

    const url = new URL(request.url);

    if (request.method === "GET") {
      return Response.json({ content: this.content });
    }

    if (request.method === "PATCH") {
      const { operations } = await request.json<{
        operations: Array<{ type: string; position: number; text?: string }>;
      }>();

      // Apply operational transforms or CRDT operations
      for (const op of operations) {
        if (op.type === "insert" && op.text) {
          this.content =
            this.content.slice(0, op.position) +
            op.text +
            this.content.slice(op.position);
        } else if (op.type === "delete") {
          this.content =
            this.content.slice(0, op.position) +
            this.content.slice(op.position + 1);
        }
      }

      await this.ctx.storage.put("content", this.content);

      // Broadcast changes to all connected WebSocket clients
      for (const ws of this.ctx.getWebSockets()) {
        ws.send(JSON.stringify({ type: "update", operations }));
      }

      return Response.json({ content: this.content });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}
```

### Pattern 3: DO as a Rate Limiter

A DO per API key (or IP address) that enforces rate limits with perfect accuracy:

```typescript
export class RateLimiter implements DurableObject {
  constructor(private ctx: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const now = Date.now();
    const windowMs = 60_000; // 1-minute window
    const maxRequests = 100; // 100 requests per minute

    // Get existing timestamps
    let timestamps =
      (await this.ctx.storage.get<number[]>("timestamps")) ?? [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter((t) => t > now - windowMs);

    if (timestamps.length >= maxRequests) {
      const retryAfter = Math.ceil(
        (timestamps[0] + windowMs - now) / 1000
      );
      return new Response("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
        },
      });
    }

    // Record this request
    timestamps.push(now);
    await this.ctx.storage.put("timestamps", timestamps);

    return Response.json({
      allowed: true,
      remaining: maxRequests - timestamps.length,
      limit: maxRequests,
    });
  }
}

// Worker usage
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const apiKey = request.headers.get("X-API-Key") ?? "anonymous";
    const limiterId = env.RATE_LIMITER.idFromName(apiKey);
    const limiter = env.RATE_LIMITER.get(limiterId);

    const limitCheck = await limiter.fetch(
      new Request("https://dummy/check")
    );

    if (limitCheck.status === 429) {
      return limitCheck; // Pass through the 429
    }

    // Request is allowed -- do the actual work
    return new Response("OK");
  },
};
```

### Pattern 4: DO for Distributed Locks / Coordination

Use a DO as a lock manager to coordinate work across many Workers:

```typescript
export class LockManager implements DurableObject {
  constructor(private ctx: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const lockName = url.searchParams.get("lock") ?? "default";

    if (url.pathname === "/acquire") {
      const ttlMs = parseInt(url.searchParams.get("ttl") ?? "30000");
      const owner = url.searchParams.get("owner") ?? "unknown";

      const existing = await this.ctx.storage.get<{
        owner: string;
        expires: number;
      }>(`lock:${lockName}`);

      // Check if lock is held and not expired
      if (existing && existing.expires > Date.now()) {
        return Response.json(
          {
            acquired: false,
            heldBy: existing.owner,
            expiresIn: existing.expires - Date.now(),
          },
          { status: 409 }
        );
      }

      // Acquire the lock
      const lockData = { owner, expires: Date.now() + ttlMs };
      await this.ctx.storage.put(`lock:${lockName}`, lockData);

      // Set an alarm to auto-release if not explicitly released
      await this.ctx.storage.setAlarm(Date.now() + ttlMs);

      return Response.json({ acquired: true, expires: lockData.expires });
    }

    if (url.pathname === "/release") {
      const owner = url.searchParams.get("owner") ?? "unknown";
      const existing = await this.ctx.storage.get<{
        owner: string;
        expires: number;
      }>(`lock:${lockName}`);

      if (existing && existing.owner === owner) {
        await this.ctx.storage.delete(`lock:${lockName}`);
        return Response.json({ released: true });
      }

      return Response.json(
        { released: false, reason: "Not the lock owner" },
        { status: 403 }
      );
    }

    return new Response("Use /acquire or /release", { status: 400 });
  }

  async alarm(): Promise<void> {
    // Clean up any expired locks
    const entries = await this.ctx.storage.list({ prefix: "lock:" });
    const now = Date.now();
    for (const [key, value] of entries) {
      const lock = value as { owner: string; expires: number };
      if (lock.expires <= now) {
        await this.ctx.storage.delete(key);
      }
    }
  }
}
```

### Pattern 5: DO with Auto-Cleanup via Alarms

A session manager that cleans up idle sessions automatically:

```typescript
export class SessionManager implements DurableObject {
  private static SESSION_TTL = 30 * 60 * 1000; // 30 minutes

  constructor(private ctx: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    // Refresh the session TTL on every request
    await this.ctx.storage.put("lastActivity", Date.now());
    await this.ctx.storage.setAlarm(
      Date.now() + SessionManager.SESSION_TTL
    );

    const url = new URL(request.url);

    if (url.pathname === "/set") {
      const data = await request.json();
      await this.ctx.storage.put("session", data);
      return Response.json({ saved: true });
    }

    if (url.pathname === "/get") {
      const session = await this.ctx.storage.get("session");
      return Response.json({ session: session ?? null });
    }

    return new Response("Use /set or /get", { status: 400 });
  }

  async alarm(): Promise<void> {
    const lastActivity =
      (await this.ctx.storage.get<number>("lastActivity")) ?? 0;

    if (Date.now() - lastActivity >= SessionManager.SESSION_TTL) {
      // Session expired -- clean up all data
      await this.ctx.storage.deleteAll();
      console.log("Session expired and cleaned up");
    } else {
      // Activity happened since the alarm was set -- reschedule
      const nextCheck =
        lastActivity + SessionManager.SESSION_TTL - Date.now();
      await this.ctx.storage.setAlarm(Date.now() + nextCheck);
    }
  }
}
```

---

## Quick Reference Cheat Sheet

```typescript
// --- Getting a DO reference ---
const id = env.MY_DO.idFromName("name");     // Deterministic ID from a name
const id = env.MY_DO.newUniqueId();           // Random unique ID
const id = env.MY_DO.idFromString("hex...");  // Reconstruct from string
const stub = env.MY_DO.get(id);               // Get a stub (proxy)
const resp = await stub.fetch(request);        // Send request to the DO

// --- Inside a DO class ---
await this.ctx.storage.get("key");             // Read a value
await this.ctx.storage.put("key", value);      // Write a value
await this.ctx.storage.delete("key");          // Delete a value
await this.ctx.storage.list({ prefix: "p" });  // List entries
await this.ctx.storage.transaction(async (txn) => { ... }); // Transaction
await this.ctx.storage.deleteAll();            // Delete everything

// --- Alarms ---
await this.ctx.storage.setAlarm(Date.now() + 60000);  // Set alarm
await this.ctx.storage.getAlarm();                      // Check alarm
await this.ctx.storage.deleteAlarm();                   // Cancel alarm

// --- WebSocket Hibernation API ---
this.ctx.acceptWebSocket(ws);                  // Accept a WebSocket
this.ctx.getWebSockets();                      // Get all connected sockets
ws.serializeAttachment(data);                  // Attach metadata
ws.deserializeAttachment();                    // Read metadata
```

---

## Further Reading

- [Cloudflare Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [WebSocket Hibernation API](https://developers.cloudflare.com/durable-objects/api/websockets/)
- [Durable Objects Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)
- [Workers TypeScript Types](https://github.com/cloudflare/workers-types)
