# Cloudflare Pages -- Comprehensive Study Guide

A beginner-friendly guide for developers working with Node.js who want to deploy sites and full-stack apps on Cloudflare Pages.

---

## 1. What is Cloudflare Pages?

Cloudflare Pages is a **JAMstack deployment platform** built on top of Cloudflare's global edge network. Think of it as Cloudflare's answer to Vercel or Netlify.

Here is what it gives you out of the box:

- **Deploy static sites and full-stack apps directly from Git.** Connect your GitHub or GitLab repo, and Pages handles the rest.
- **Auto-deploy on every push.** Push to `main` and your production site updates. Push to any other branch and you get a unique **preview URL** -- perfect for reviewing PRs before merging.
- **Preview URLs for every PR/branch.** Each pull request gets its own isolated deployment at a URL like `abc123.my-site.pages.dev`. Share it with teammates, QA it, then merge with confidence.
- **Global edge deployment.** Your site is served from Cloudflare's 300+ data centers worldwide. Fast everywhere, no CDN configuration needed.
- **Serverless functions built in.** With Pages Functions, you can add API routes and server-side logic without spinning up a separate backend.

In short: you write code, push to Git, and Cloudflare builds and deploys it globally in seconds.

---

## 2. When to Use It

Cloudflare Pages is a great fit for:

| Use Case | Why Pages Works Well |
|---|---|
| **Portfolio sites** | Fast, free tier is generous, custom domains are easy |
| **Blogs** | Works with static site generators (Astro, Hugo, 11ty, etc.) |
| **React / Vue / Svelte / Next.js apps** | First-class framework support with optimized build presets |
| **Documentation sites** | Deploy Docusaurus, VitePress, or MkDocs effortlessly |
| **Landing pages** | Quick deploys, preview URLs for stakeholder review |
| **Full-stack apps with Functions** | Add serverless API routes alongside your frontend |

If your project is a static site, a single-page app, or a full-stack app that fits within the serverless model, Pages is worth considering.

---

## 3. Prerequisites

Before you start, make sure you have:

- **Node.js 18+** -- Check with `node --version`. Download from [nodejs.org](https://nodejs.org) if needed.
- **Git** -- Check with `git --version`.
- **A GitHub or GitLab account** -- Pages integrates directly with both.
- **A Cloudflare account** -- Free at [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
- **Wrangler (optional but recommended)** -- Cloudflare's CLI tool. Install it globally:

```bash
npm install -g wrangler
```

Verify it works:

```bash
wrangler --version
```

Then log in to your Cloudflare account:

```bash
wrangler login
```

This opens a browser window where you authorize Wrangler to act on your behalf.

---

## 4. Step-by-Step Setup

There are two ways to get a project onto Cloudflare Pages. Both are valid -- pick whichever fits your workflow.

### Method A: Git Integration (Recommended for Teams)

This is the "connect and forget" approach. Once set up, every push triggers a build automatically.

**Step 1:** Go to the [Cloudflare Dashboard](https://dash.cloudflare.com) and navigate to **Workers & Pages**.

**Step 2:** Click **Create** > **Pages** > **Connect to Git**.

**Step 3:** Select your GitHub or GitLab account and pick the repository.

**Step 4:** Configure the build settings:

| Setting | Example (React/Vite) | Example (Next.js) |
|---|---|---|
| **Build command** | `npm run build` | `npx @cloudflare/next-on-pages@1` |
| **Build output directory** | `dist` | `.vercel/output/static` |
| **Root directory** | `/` (or subfolder for monorepos) | `/` |
| **Node.js version** | Set `NODE_VERSION=18` in env vars | Same |

**Step 5:** Click **Save and Deploy**. Cloudflare pulls your code, runs the build command, and deploys the output. You will get a URL like `my-site.pages.dev` within a minute or two.

From now on, every push to `main` updates production. Every push to a feature branch creates a preview deployment.

---

### Method B: CLI with Wrangler (Recommended for Solo Devs / Quick Starts)

Wrangler lets you scaffold, develop, and deploy from the terminal. No dashboard clicks required.

#### Full React App Walkthrough

**Step 1: Scaffold a new project**

```bash
npm create cloudflare@latest my-site -- --framework=react
```

This command uses Cloudflare's `create-cloudflare` (C3) tool. It scaffolds a React app (Vite-based) pre-configured for Pages. You can swap `react` for other frameworks:

```bash
# Other framework options
npm create cloudflare@latest my-site -- --framework=vue
npm create cloudflare@latest my-site -- --framework=svelte
npm create cloudflare@latest my-site -- --framework=astro
npm create cloudflare@latest my-site -- --framework=next
```

**Step 2: Explore the project structure**

```
my-site/
  public/            # Static assets (favicon, images, etc.)
  src/
    App.tsx          # Main React component
    index.css        # Global styles
    main.tsx         # Entry point
  functions/         # Pages Functions (serverless API routes)
    api/
      hello.ts       # Example: /api/hello endpoint
  wrangler.toml      # Wrangler/Pages configuration
  package.json
  vite.config.ts
```

The key things to notice:

- `functions/` is where your serverless API routes live. The file path maps to the URL path.
- `wrangler.toml` holds your project configuration (name, compatibility date, bindings, etc.).

**Step 3: Run the local dev server**

```bash
cd my-site
npm run dev
```

Or use Wrangler directly (this also runs your Pages Functions locally):

```bash
wrangler pages dev
```

Your site is now running at `http://localhost:8788` (Wrangler) or the Vite port. Changes hot-reload.

**Step 4: Deploy**

```bash
wrangler pages deploy dist
```

On first run, Wrangler asks you to create or select a Pages project. After that, it uploads your `dist` folder and gives you a live URL.

You can also set up a deploy script in `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "dev": "wrangler pages dev",
    "deploy": "npm run build && wrangler pages deploy dist"
  }
}
```

Then just run:

```bash
npm run deploy
```

---

## 5. Code Examples

### 5.1 Basic Static Site Deployment

You do not need a framework at all. A plain HTML/CSS/JS site works fine.

Create a folder with an `index.html`:

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Static Site</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
  </style>
</head>
<body>
  <h1>Hello from Cloudflare Pages</h1>
  <p>This site is deployed on Cloudflare's edge network.</p>
</body>
</html>
```

Deploy it:

```bash
wrangler pages deploy public
```

That is it. The `public` folder is uploaded and served globally.

---

### 5.2 React App with Pages Functions (Full-Stack)

This is the most common pattern: a React frontend with serverless API routes.

**Frontend -- calling the API:**

```tsx
// src/App.tsx
import { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to load"));
  }, []);

  return (
    <div>
      <h1>My Full-Stack Pages App</h1>
      <p>API says: {message}</p>
    </div>
  );
}

export default App;
```

**Backend -- the Pages Function:**

```typescript
// functions/api/hello.ts

export const onRequestGet: PagesFunction = async (context) => {
  return Response.json({
    message: "Hello from Pages Functions!",
    timestamp: new Date().toISOString(),
  });
};
```

That is all you need. The `functions/api/hello.ts` file automatically becomes the `/api/hello` endpoint. No routing configuration, no server setup.

---

### 5.3 Pages Functions in Depth

Pages Functions live in the `functions/` directory at your project root. The file path determines the URL route:

```
functions/
  api/
    hello.ts        ->  /api/hello
    users/
      index.ts      ->  /api/users
      [id].ts       ->  /api/users/:id
  health.ts         ->  /health
```

**Available request handlers:**

```typescript
// functions/api/users/index.ts

// Handle GET /api/users
export const onRequestGet: PagesFunction = async (context) => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];
  return Response.json(users);
};

// Handle POST /api/users
export const onRequestPost: PagesFunction = async (context) => {
  const body = await context.request.json();
  // ... create user logic
  return Response.json({ created: true, user: body }, { status: 201 });
};
```

**Dynamic route parameters:**

```typescript
// functions/api/users/[id].ts

export const onRequestGet: PagesFunction = async (context) => {
  const userId = context.params.id;

  return Response.json({
    id: userId,
    name: `User ${userId}`,
  });
};
```

**Middleware (runs before your function):**

```typescript
// functions/_middleware.ts
// This middleware applies to ALL routes under functions/

export const onRequest: PagesFunction = async (context) => {
  // Example: add CORS headers to every response
  const response = await context.next();

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
};
```

---

### 5.4 Using Environment Variables

Environment variables keep secrets out of your code. There are two ways to set them.

**In the Cloudflare Dashboard:**

Go to your Pages project > **Settings** > **Environment Variables**. You can set different values for Production and Preview environments.

**In `wrangler.toml`:**

```toml
# wrangler.toml

[vars]
API_URL = "https://api.example.com"
APP_ENV = "production"
```

> Do NOT put secrets (API keys, tokens) in `wrangler.toml` since it gets committed to Git. Use the dashboard or `wrangler pages secret put SECRET_NAME` for sensitive values.

**Accessing environment variables in Pages Functions:**

```typescript
// functions/api/data.ts

interface Env {
  API_URL: string;
  API_KEY: string; // set via dashboard or wrangler secret
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const apiUrl = context.env.API_URL;
  const apiKey = context.env.API_KEY;

  const response = await fetch(`${apiUrl}/data`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await response.json();
  return Response.json(data);
};
```

**Accessing environment variables at build time (for frontend code):**

Vite-based projects use the `VITE_` prefix:

```bash
# Set in Cloudflare Dashboard under Environment Variables
VITE_APP_TITLE=My App
```

```tsx
// src/App.tsx
const title = import.meta.env.VITE_APP_TITLE;
```

---

### 5.5 Redirects and Headers Configuration

Pages supports `_redirects` and `_headers` files placed in your build output directory.

**`_redirects` -- URL redirects:**

```
# Plain redirect (301 by default)
/old-page  /new-page

# Explicit status code
/blog/*  /news/:splat  301

# Proxy (200 status, acts like a rewrite -- the URL does not change in the browser)
/api/*  https://my-backend.example.com/api/:splat  200

# Redirect with a placeholder
/users/:id  /profile/:id  301
```

**`_headers` -- Custom HTTP headers:**

```
# Apply to all pages
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

# Apply only to API routes
/api/*
  Access-Control-Allow-Origin: *
  Cache-Control: no-cache

# Cache static assets aggressively
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

Place these files in your `public/` directory (so they end up in the build output) or configure your build tool to copy them into the output.

---

## 6. How the Flow Works

### Static Site / SPA Flow

```
You push code to Git
        |
        v
Cloudflare detects the push
        |
        v
Build environment spins up (Node.js)
        |
        v
Runs your build command (npm run build)
        |
        v
Uploads build output to Cloudflare's edge (300+ locations)
        |
        v
Site is live at your-project.pages.dev
        |
        v
(Optional) Custom domain points to the same deployment
```

Every push to `main` follows this flow for **production**. Pushes to other branches create **preview deployments** at unique URLs like `<commit-hash>.your-project.pages.dev`.

### Pages Functions Flow

When a request hits a route that matches a file in your `functions/` directory, the flow changes:

```
Browser sends request to /api/hello
        |
        v
Request hits Cloudflare's edge (nearest data center)
        |
        v
Edge identifies this as a Functions route
        |
        v
Pages Function executes (functions/api/hello.ts)
        |
        v
Function returns a Response
        |
        v
Response is sent back to the browser
```

Key thing to understand: Pages Functions run **on the edge**, not in a single region. Your API code runs close to the user, just like your static assets. This is different from traditional serverless (AWS Lambda, etc.) where functions run in one region.

### Combined Flow (Full-Stack)

```
Browser requests /              -> Serves index.html (static, from edge cache)
Browser requests /about         -> Serves index.html (SPA client-side routing)
Browser requests /api/users     -> Runs functions/api/users/index.ts (on the edge)
Browser requests /images/cat.png -> Serves static file (from edge cache)
```

Static assets are served directly from cache. Function routes execute code. The router figures out which is which automatically based on your `functions/` directory structure.

---

## 7. Key Concepts

### Build Configuration

Every Pages project needs a build command and an output directory. Common presets:

| Framework | Build Command | Output Directory |
|---|---|---|
| React (Vite) | `npm run build` | `dist` |
| Next.js | `npx @cloudflare/next-on-pages@1` | `.vercel/output/static` |
| Vue (Vite) | `npm run build` | `dist` |
| Svelte (SvelteKit) | `npm run build` | `.svelte-kit/cloudflare` |
| Astro | `npm run build` | `dist` |
| Plain HTML | (none) | `/` or `public` |

You can also set the **Node.js version** by adding `NODE_VERSION` as an environment variable (e.g., `NODE_VERSION=18`).

### Preview Deployments

Every non-production branch gets its own deployment. This is incredibly useful for:

- **Code review**: Share a preview URL in your PR so reviewers can see the changes live.
- **QA testing**: Test against a real deployment, not just localhost.
- **Stakeholder feedback**: Send a link to a designer or PM without deploying to production.

Preview URLs look like: `<branch-name>.<project-name>.pages.dev` or `<commit-hash>.<project-name>.pages.dev`.

### Production vs. Preview Branches

- **Production branch**: Defaults to `main`. Deployments from this branch go live at `your-project.pages.dev` and your custom domain.
- **Preview branches**: Every other branch. Each gets an isolated deployment. You can configure which branches trigger preview deployments in the dashboard.

You can change which branch is the production branch in project settings.

### Pages Functions (`/functions` Directory)

As covered above, the `functions/` directory is where your serverless backend lives. Key points:

- File-based routing (path maps to URL).
- Supports `onRequest`, `onRequestGet`, `onRequestPost`, `onRequestPut`, `onRequestDelete`, etc.
- `_middleware.ts` files run before the matched function.
- Functions execute on the edge (V8 isolates, not Node.js containers). This means you use Web APIs (`fetch`, `Request`, `Response`, `crypto`, etc.) rather than Node.js APIs (`fs`, `path`, etc.).

### Bindings (D1, R2, KV in Functions)

Bindings connect your Pages Functions to other Cloudflare services. Think of them as "injected dependencies" that Cloudflare wires up for you.

**Configure bindings in `wrangler.toml`:**

```toml
# wrangler.toml

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "my-bucket"

[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Use them in your Functions:**

```typescript
// functions/api/notes.ts

interface Env {
  DB: D1Database;       // SQL database
  STORAGE: R2Bucket;    // Object storage (like S3)
  CACHE: KVNamespace;   // Key-value store
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  // Query D1 (SQL database)
  const { results } = await context.env.DB
    .prepare("SELECT * FROM notes ORDER BY created_at DESC LIMIT 10")
    .all();

  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { title, content } = await context.request.json();

  // Insert into D1
  await context.env.DB
    .prepare("INSERT INTO notes (title, content) VALUES (?, ?)")
    .bind(title, content)
    .run();

  // Also store in KV for fast lookups
  await context.env.CACHE.put(`note:${title}`, content);

  return Response.json({ success: true }, { status: 201 });
};
```

### Custom Domains

You can attach a custom domain to your Pages project:

1. Go to your Pages project in the dashboard.
2. Click **Custom domains** > **Set up a custom domain**.
3. Enter your domain (e.g., `www.mysite.com`).
4. Cloudflare handles the DNS and SSL automatically (if the domain is on Cloudflare).

Your site is then accessible at both `your-project.pages.dev` and `www.mysite.com`.

### Build Cache

Cloudflare Pages caches your `node_modules` and other build dependencies between deploys. This makes subsequent builds faster since it does not need to `npm install` from scratch every time.

If you run into stale cache issues, you can clear the build cache from the project settings in the dashboard.

---

## 8. Common Patterns

### Pattern 1: Pages + Functions for Full-Stack Apps

This is the bread-and-butter pattern. Your React/Vue/Svelte frontend is a static build, and your API lives in `functions/`.

```
my-app/
  src/               # Frontend code
  functions/
    api/
      auth/
        login.ts     # POST /api/auth/login
        logout.ts    # POST /api/auth/logout
        me.ts        # GET /api/auth/me
      posts/
        index.ts     # GET /api/posts, POST /api/posts
        [id].ts      # GET /api/posts/:id, PUT, DELETE
    _middleware.ts    # Auth check, CORS, logging
  wrangler.toml
  package.json
```

Everything deploys together as one unit. No separate backend repo, no separate deploy pipeline.

### Pattern 2: Pages + D1 for Database-Backed Sites

Add a SQL database to any Pages project with D1.

**Step 1: Create a D1 database:**

```bash
wrangler d1 create my-database
```

This outputs a database ID. Add it to your `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "paste-the-id-here"
```

**Step 2: Create a schema:**

```sql
-- schema.sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Apply it:

```bash
wrangler d1 execute my-database --file=schema.sql
```

**Step 3: Query it from a Pages Function:**

```typescript
// functions/api/posts/index.ts

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { results } = await context.env.DB
    .prepare("SELECT * FROM posts ORDER BY created_at DESC")
    .all();

  return Response.json(results);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { title, content } = await context.request.json();

  const result = await context.env.DB
    .prepare("INSERT INTO posts (title, content) VALUES (?, ?) RETURNING *")
    .bind(title, content)
    .first();

  return Response.json(result, { status: 201 });
};
```

You now have a full-stack app with a SQL database, all running on Cloudflare's edge.

### Pattern 3: Monorepo Setup

If your frontend and other packages live in a monorepo, set the **Root directory** in your Pages build configuration to point to the frontend package.

```
my-monorepo/
  packages/
    web/             # <-- Set this as the root directory in Pages
      src/
      functions/
      package.json
      wrangler.toml
    shared/
      src/
      package.json
  package.json       # Root package.json (workspaces)
```

In the Cloudflare dashboard (or `wrangler.toml`), set:

- **Root directory**: `packages/web`
- **Build command**: `npm run build` (runs inside `packages/web`)
- **Output directory**: `dist`

If your monorepo uses npm/yarn/pnpm workspaces, the build system will resolve workspace dependencies automatically.

### Pattern 4: Pages + R2 for File Uploads

Handle file uploads by storing them in R2 (Cloudflare's object storage):

```typescript
// functions/api/upload.ts

interface Env {
  STORAGE: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const formData = await context.request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const key = `uploads/${Date.now()}-${file.name}`;
  await context.env.STORAGE.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return Response.json({ key, size: file.size });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return Response.json({ error: "Missing key parameter" }, { status: 400 });
  }

  const object = await context.env.STORAGE.get(key);

  if (!object) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(object.body, {
    headers: { "Content-Type": object.httpMetadata?.contentType || "application/octet-stream" },
  });
};
```

---

## Quick Reference

### Wrangler Commands for Pages

```bash
# Scaffold a new project
npm create cloudflare@latest my-site -- --framework=react

# Local development (with Functions support)
wrangler pages dev

# Deploy to Cloudflare
wrangler pages deploy dist

# Set a secret environment variable
wrangler pages secret put API_KEY

# Create a D1 database
wrangler d1 create my-database

# Run SQL against D1
wrangler d1 execute my-database --command="SELECT * FROM users"

# Tail production logs (see live requests)
wrangler pages deployment tail
```

### Useful Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Pages Functions Docs](https://developers.cloudflare.com/pages/functions/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Docs](https://developers.cloudflare.com/d1/)
- [R2 Docs](https://developers.cloudflare.com/r2/)
- [Pages Framework Guides](https://developers.cloudflare.com/pages/framework-guide/)

---

That covers the essentials of Cloudflare Pages. The core idea is simple: push code, Cloudflare builds and deploys it everywhere. Add `functions/` for a backend, wire up bindings for databases and storage, and you have a full-stack app running on the edge with zero infrastructure management.
