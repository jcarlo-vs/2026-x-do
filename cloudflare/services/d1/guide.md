# Cloudflare D1 — Comprehensive Study Guide

A beginner-friendly, Node.js/TypeScript-focused guide to Cloudflare's serverless SQL database.

---

## 1. What is D1?

D1 is Cloudflare's serverless SQLite database that runs at the edge. Here is the short version:

- **SQL-based** — not NoSQL. You write real SQL queries (SELECT, INSERT, UPDATE, DELETE).
- **Built on SQLite** — the most widely deployed database engine in the world. If you have used SQLite before, you already know how D1 works under the hood.
- **Serverless** — no database servers to provision, patch, scale, or maintain. Cloudflare handles all of that.
- **Edge-native** — your data lives close to your users via read replicas distributed across Cloudflare's network.
- **Pairs perfectly with Workers** — D1 is designed to be called directly from Cloudflare Workers. A Worker receives a request, queries D1, and returns a response. That is the entire architecture.

Think of D1 as "your app's database without managing any database servers." You get the full power of relational SQL without any of the operational burden of running Postgres, MySQL, or even a managed database service.

---

## 2. When to Use D1

D1 is a great fit when you need:

- **CRUD applications** — any app that creates, reads, updates, and deletes records.
- **User data storage** — profiles, preferences, sessions, authentication records.
- **Blog or CMS backends** — posts, pages, categories, tags, comments.
- **SaaS applications** — multi-tenant data, subscription records, feature flags.
- **Any app that needs relational data** — if your data has relationships (users have posts, posts have comments), SQL is the right tool and D1 is the right database.
- **Prototyping and side projects** — D1's generous free tier and zero-config setup make it ideal for getting something running fast.

**When NOT to use D1:**

- You need a database larger than 10 GB (D1's current max per database).
- You need extremely high write throughput (D1 has a single primary writer).
- You need features specific to Postgres/MySQL (stored procedures, advanced extensions, etc.).

The sweet spot: you want SQL without managing Postgres or MySQL servers.

---

## 3. Prerequisites

Before you start, make sure you have:

1. **Node.js 18+** — check with `node --version`.
2. **Wrangler CLI** — Cloudflare's CLI tool for Workers and D1.
   ```bash
   npm install -g wrangler
   ```
3. **A Cloudflare account** — sign up at [dash.cloudflare.com](https://dash.cloudflare.com). The free plan includes D1.
4. **Authenticate Wrangler** — run `wrangler login` and follow the browser prompt.

---

## 4. Step-by-Step Setup

### 4.1 Create a new Worker project

```bash
npm create cloudflare@latest my-d1-app -- --type worker-typescript
cd my-d1-app
```

### 4.2 Create a D1 database

```bash
wrangler d1 create my-database
```

This outputs something like:

```
Created D1 database 'my-database'

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy that block — you need it in the next step.

### 4.3 Add the binding to wrangler.toml

Open `wrangler.toml` and paste the D1 binding configuration:

```toml
name = "my-d1-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

The `binding` is the variable name you use in your Worker code to access this database. You can name it anything, but `DB` is the convention.

### 4.4 Create your first migration

```bash
wrangler d1 migrations create my-database init
```

This creates a file at `migrations/0001_init.sql`. Open it and write your schema.

### 4.5 Write the SQL schema

Edit `migrations/0001_init.sql`:

```sql
-- Create the todos table
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed with sample data
INSERT INTO todos (title) VALUES ('Learn Cloudflare D1');
INSERT INTO todos (title) VALUES ('Build a REST API');
INSERT INTO todos (title, completed) VALUES ('Set up Wrangler', 1);
```

### 4.6 Apply the migration locally (for development)

```bash
wrangler d1 migrations apply my-database --local
```

The `--local` flag applies the migration to your local SQLite file so you can develop without touching production.

### 4.7 Apply the migration to production

```bash
wrangler d1 migrations apply my-database --remote
```

This runs the migration against your actual D1 database on Cloudflare's network.

---

## 5. Code Examples

### 5.1 TypeScript types for the environment

First, define the `Env` interface so TypeScript knows about your D1 binding:

```typescript
// src/index.ts (or a separate env.d.ts file)

export interface Env {
  DB: D1Database;
}
```

Cloudflare provides the `D1Database` type globally when you use their types package. If you need it explicitly:

```bash
npm install --save-dev @cloudflare/workers-types
```

### 5.2 Creating tables (migration SQL)

You already saw this above, but here is a more complete example with multiple tables and a foreign key:

```sql
-- migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
```

### 5.3 INSERT — Adding records

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Insert a single record
    const result = await env.DB.prepare(
      "INSERT INTO users (name, email) VALUES (?, ?)"
    )
      .bind("Alice", "alice@example.com")
      .run();

    return Response.json({
      success: result.success,
      meta: result.meta, // includes last_row_id, changes, etc.
    });
  },
} satisfies ExportedHandler<Env>;
```

The `.bind()` method safely parameterizes your query — more on that in section 5.7.

### 5.4 SELECT — Querying data

**Get a single row with `.first()`:**

```typescript
const user = await env.DB.prepare(
  "SELECT * FROM users WHERE id = ?"
)
  .bind(1)
  .first();

// user is the row object or null if not found
// { id: 1, name: "Alice", email: "alice@example.com", created_at: "..." }
```

**Get multiple rows with `.all()`:**

```typescript
const { results } = await env.DB.prepare(
  "SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC"
)
  .bind(1)
  .all();

// results is an array of row objects
// [{ id: 1, title: "Learn D1", completed: 0, ... }, ...]
```

**Get a single value with `.first(columnName)`:**

```typescript
const count = await env.DB.prepare(
  "SELECT COUNT(*) as total FROM users"
).first("total");

// count is just the number, e.g. 42
```

### 5.5 UPDATE — Modifying records

```typescript
const result = await env.DB.prepare(
  "UPDATE todos SET completed = 1 WHERE id = ? AND user_id = ?"
)
  .bind(todoId, userId)
  .run();

// result.meta.changes tells you how many rows were affected
```

### 5.6 DELETE — Removing records

```typescript
const result = await env.DB.prepare(
  "DELETE FROM todos WHERE id = ? AND user_id = ?"
)
  .bind(todoId, userId)
  .run();

if (result.meta.changes === 0) {
  return new Response("Todo not found", { status: 404 });
}
```

### 5.7 Parameterized queries (preventing SQL injection)

Never concatenate user input into SQL strings. Always use `.bind()`:

```typescript
// DANGEROUS — never do this
const bad = await env.DB.prepare(
  `SELECT * FROM users WHERE name = '${userInput}'`
).all();

// SAFE — always do this
const good = await env.DB.prepare(
  "SELECT * FROM users WHERE name = ?"
)
  .bind(userInput)
  .all();
```

`.bind()` accepts multiple parameters. They map to `?` placeholders in order:

```typescript
await env.DB.prepare(
  "INSERT INTO todos (user_id, title, completed) VALUES (?, ?, ?)"
)
  .bind(userId, title, 0)
  .run();
```

You can also use numbered placeholders like `?1`, `?2`, `?3` if you prefer to be explicit.

### 5.8 Batch operations

When you need to run multiple queries in a single round trip, use `.batch()`. This is faster than running queries one at a time because it sends them all to D1 at once:

```typescript
const results = await env.DB.batch([
  env.DB.prepare("INSERT INTO users (name, email) VALUES (?, ?)").bind(
    "Bob",
    "bob@example.com"
  ),
  env.DB.prepare("INSERT INTO users (name, email) VALUES (?, ?)").bind(
    "Carol",
    "carol@example.com"
  ),
  env.DB.prepare("SELECT * FROM users"),
]);

// results is an array of D1Result objects, one per statement
const allUsers = results[2].results;
```

Batch operations run inside a transaction — if one statement fails, they all roll back. This makes batch ideal for operations that need to be atomic.

### 5.9 Full REST API Worker with D1

Here is a complete, working CRUD API for a "todos" table:

```typescript
// src/index.ts

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Simple router
    try {
      // GET /todos — list all todos
      if (method === "GET" && path === "/todos") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM todos ORDER BY created_at DESC"
        ).all();

        return Response.json(results);
      }

      // GET /todos/:id — get a single todo
      if (method === "GET" && path.startsWith("/todos/")) {
        const id = path.split("/")[2];
        const todo = await env.DB.prepare(
          "SELECT * FROM todos WHERE id = ?"
        )
          .bind(id)
          .first();

        if (!todo) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        return Response.json(todo);
      }

      // POST /todos — create a new todo
      if (method === "POST" && path === "/todos") {
        const body = await request.json<{ title: string }>();

        if (!body.title) {
          return Response.json(
            { error: "title is required" },
            { status: 400 }
          );
        }

        const result = await env.DB.prepare(
          "INSERT INTO todos (title) VALUES (?) RETURNING *"
        )
          .bind(body.title)
          .first();

        return Response.json(result, { status: 201 });
      }

      // PUT /todos/:id — update a todo
      if (method === "PUT" && path.startsWith("/todos/")) {
        const id = path.split("/")[2];
        const body = await request.json<{
          title?: string;
          completed?: boolean;
        }>();

        const todo = await env.DB.prepare(
          `UPDATE todos
           SET title = COALESCE(?, title),
               completed = COALESCE(?, completed)
           WHERE id = ?
           RETURNING *`
        )
          .bind(body.title ?? null, body.completed ? 1 : 0, id)
          .first();

        if (!todo) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        return Response.json(todo);
      }

      // DELETE /todos/:id — delete a todo
      if (method === "DELETE" && path.startsWith("/todos/")) {
        const id = path.split("/")[2];

        const result = await env.DB.prepare(
          "DELETE FROM todos WHERE id = ?"
        )
          .bind(id)
          .run();

        if (result.meta.changes === 0) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        return Response.json({ deleted: true });
      }

      return Response.json({ error: "Not found" }, { status: 404 });
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
```

Test it locally:

```bash
wrangler dev
```

Then use curl or any HTTP client:

```bash
# List all todos
curl http://localhost:8787/todos

# Create a new todo
curl -X POST http://localhost:8787/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Write D1 study guide"}'

# Update a todo
curl -X PUT http://localhost:8787/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a todo
curl -X DELETE http://localhost:8787/todos/1
```

---

## 6. How the Flow Works

### Request flow

```
Client Request
     |
     v
Cloudflare Worker (your code)
     |
     v
env.DB.prepare("SELECT ...").bind(...).all()
     |
     v
D1 Database (SQLite at the edge)
     |
     v
Query results returned
     |
     v
Worker builds JSON Response
     |
     v
Client receives Response
```

Every request follows the same pattern:

1. A request hits your Worker.
2. Your Worker code prepares a SQL statement using the D1 binding (`env.DB`).
3. D1 executes the query against the SQLite database.
4. The results come back as JavaScript objects.
5. Your Worker formats the results and returns an HTTP response.

### Migration workflow

```
You write SQL
     |
     v
wrangler d1 migrations create my-database <name>
     |
     v
Edit the generated .sql file
     |
     v
wrangler d1 migrations apply my-database --local    (test locally first)
     |
     v
wrangler d1 migrations apply my-database --remote   (deploy to production)
```

Migrations are applied in order (0001, 0002, 0003...). D1 tracks which migrations have been applied and only runs new ones. This means you can safely run `migrations apply` multiple times — it will not re-run old migrations.

---

## 7. Key Concepts

### Migrations

Migrations are numbered SQL files that define how your database schema changes over time. Each migration is applied once and tracked by D1.

```bash
# Create a new migration
wrangler d1 migrations create my-database add-users-table

# This creates migrations/0002_add-users-table.sql
# Write your SQL in that file, then apply it
```

Never edit a migration after it has been applied to production. Instead, create a new migration.

### Bindings

A binding is the connection between your Worker and a D1 database. You define it in `wrangler.toml` and access it via the `env` parameter in your Worker's fetch handler. The binding name (e.g. `DB`) becomes a property on the `env` object.

You can bind multiple D1 databases to a single Worker:

```toml
[[d1_databases]]
binding = "DB"
database_name = "main-db"
database_id = "xxx"

[[d1_databases]]
binding = "ANALYTICS_DB"
database_name = "analytics"
database_id = "yyy"
```

### Prepared statements with .bind()

Every query should be a prepared statement. You write the SQL with `?` placeholders and then call `.bind()` with the values. This prevents SQL injection and lets D1 optimize repeated queries.

```typescript
const stmt = env.DB.prepare("SELECT * FROM users WHERE id = ?");

// Reuse the same prepared statement with different values
const user1 = await stmt.bind(1).first();
const user2 = await stmt.bind(2).first();
```

### .first() vs .all() vs .run()

These are the three methods you call to execute a prepared statement:

| Method | Use when... | Returns |
|--------|-------------|---------|
| `.first()` | You expect one row (or none) | The row object, or `null` |
| `.first("column")` | You want a single value | The value from that column |
| `.all()` | You expect multiple rows | `{ results: [...], success, meta }` |
| `.run()` | You are doing INSERT/UPDATE/DELETE and do not need rows back | `{ success, meta }` |
| `.raw()` | You want arrays instead of objects | Array of arrays |

### Batch queries

`env.DB.batch([...])` sends multiple prepared statements in a single round trip. All statements run inside a transaction. Use this for:

- Inserting multiple records at once.
- Running queries that depend on each other.
- Any time you want atomicity (all succeed or all fail).

### Local development with --local

When you run `wrangler dev`, D1 automatically uses a local SQLite file. You can also apply migrations locally:

```bash
wrangler d1 migrations apply my-database --local
```

And execute raw SQL locally:

```bash
wrangler d1 execute my-database --local --command "SELECT * FROM todos"
```

The local database lives in `.wrangler/state/`. This means your local data is separate from production — exactly what you want.

### Read replicas at the edge

D1 has a single primary database (the "writer") but automatically creates read replicas close to your users. When your Worker runs a SELECT query, D1 routes it to the nearest replica. Writes always go to the primary. This happens transparently — you do not need to change your code.

### Database size limit

Each D1 database can hold up to **10 GB**. You can create multiple databases if you need more space.

---

## 8. Common Patterns

### Workers + D1 for a REST API

This is the most common pattern. You saw the full example in section 5.9. The idea is simple: one Worker, one D1 database, route HTTP methods to SQL queries.

For larger projects, consider splitting your routes into separate files or using a lightweight router like `itty-router`:

```typescript
import { Router } from "itty-router";

const router = Router();

router.get("/todos", async (request, env: Env) => {
  const { results } = await env.DB.prepare(
    "SELECT * FROM todos ORDER BY created_at DESC"
  ).all();
  return Response.json(results);
});

router.post("/todos", async (request, env: Env) => {
  const body = await request.json<{ title: string }>();
  const result = await env.DB.prepare(
    "INSERT INTO todos (title) VALUES (?) RETURNING *"
  )
    .bind(body.title)
    .first();
  return Response.json(result, { status: 201 });
});

export default {
  fetch: (request: Request, env: Env) => router.handle(request, env),
} satisfies ExportedHandler<Env>;
```

### D1 + Cloudflare Pages Functions

If you are using Cloudflare Pages (for a frontend framework like React, Next.js, Astro, etc.), you can access D1 from Pages Functions. These are serverless functions that live in a `functions/` directory.

```typescript
// functions/api/todos.ts

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB.prepare(
    "SELECT * FROM todos"
  ).all();

  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await context.request.json<{ title: string }>();
  const result = await context.env.DB.prepare(
    "INSERT INTO todos (title) VALUES (?) RETURNING *"
  )
    .bind(body.title)
    .first();

  return Response.json(result, { status: 201 });
};
```

You bind D1 to Pages in the Cloudflare dashboard under your Pages project settings, or in `wrangler.toml` for your Pages project.

### D1 migrations workflow for teams

A solid workflow for production apps:

1. Create a migration: `wrangler d1 migrations create my-database descriptive-name`
2. Write the SQL in the generated file.
3. Test locally: `wrangler d1 migrations apply my-database --local`
4. Run your app locally: `wrangler dev`
5. When it works, apply to production: `wrangler d1 migrations apply my-database --remote`
6. Deploy your Worker: `wrangler deploy`

Keep migrations in version control. Never edit a migration after it has been applied remotely.

---

## 9. Useful Commands

Here is a quick reference for the Wrangler D1 commands you will use most:

```bash
# Create a new D1 database
wrangler d1 create my-database

# Get info about a database (size, table count, etc.)
wrangler d1 info my-database

# Create a new migration file
wrangler d1 migrations create my-database migration-name

# List all migrations and their status
wrangler d1 migrations list my-database

# Apply pending migrations locally
wrangler d1 migrations apply my-database --local

# Apply pending migrations to production
wrangler d1 migrations apply my-database --remote

# Run a raw SQL command against your local database
wrangler d1 execute my-database --local --command "SELECT * FROM users"

# Run a raw SQL command against production
wrangler d1 execute my-database --remote --command "SELECT * FROM users"

# Run a SQL file against your database
wrangler d1 execute my-database --remote --file ./seed.sql

# List all your D1 databases
wrangler d1 list

# Start local development (D1 works automatically)
wrangler dev

# Deploy your Worker to production
wrangler deploy
```

---

## Quick Reference: D1 API Cheatsheet

```typescript
// Prepare a statement
const stmt = env.DB.prepare("SQL with ? placeholders");

// Bind parameters (prevents SQL injection)
const bound = stmt.bind(value1, value2, value3);

// Execute and get results
const row = await bound.first();              // single row or null
const value = await bound.first("column");    // single value
const { results } = await bound.all();        // array of rows
const info = await bound.run();               // for INSERT/UPDATE/DELETE
const arrays = await bound.raw();             // rows as arrays

// Batch multiple statements (runs in a transaction)
const results = await env.DB.batch([
  env.DB.prepare("...").bind(...),
  env.DB.prepare("...").bind(...),
]);

// Execute raw SQL (no binding, use carefully)
const { results } = await env.DB.exec("CREATE TABLE ...");
```

---

That covers everything you need to go from zero to a working D1 application. Start with a simple CRUD API, get comfortable with migrations and bindings, and build from there.
