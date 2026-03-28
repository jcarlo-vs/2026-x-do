# Cloudflare Developer Platform — Overview

Cloudflare isn't just a CDN anymore. It's a **full developer platform** that lets you build, deploy, and scale entire applications at the edge (300+ data centers worldwide). Think of it as AWS but simpler, faster, and with zero cold starts.

---

## The Services at a Glance

| Service | What It Is | Think of It Like... |
|---------|-----------|---------------------|
| **Workers** | Serverless functions that run at the edge | AWS Lambda, but globally distributed with 0ms cold starts |
| **Pages** | Deploy frontend sites from Git | Vercel / Netlify |
| **R2** | Object storage (files, images, videos) | AWS S3, but with **zero egress fees** |
| **D1** | SQLite database at the edge | PlanetScale / Turso, but built into Cloudflare |
| **KV** | Global key-value store | Redis, but globally replicated and eventually consistent |
| **Queues** | Message queues between Workers | AWS SQS / RabbitMQ |
| **Workers AI** | Run AI/ML models at the edge | OpenAI API, but runs on Cloudflare's GPUs |
| **Durable Objects** | Stateful serverless (single-instance coordination) | Like a tiny server that lives as long as you need it |
| **Images & Stream** | Image optimization + video streaming | Cloudinary / Mux |
| **Turnstile** | Bot protection (CAPTCHA alternative) | reCAPTCHA, but privacy-friendly and invisible |

---

## When to Use What — Real-World Scenarios

### "I want to build a REST API"
**Use: Workers + D1**
Workers handle your routes. D1 stores your data. No servers to manage.

### "I need to deploy a React/Next.js/Vue site"
**Use: Pages**
Connect your GitHub repo. Every push auto-deploys. Get preview URLs for PRs.

### "Users need to upload files (images, PDFs, videos)"
**Use: Workers + R2**
Workers receive the upload request, R2 stores the file. Zero egress fees means you don't pay when users download files.

### "I need a cache layer for my app"
**Use: KV**
Store session tokens, feature flags, config data. Reads are ultra-fast globally. Writes propagate in ~60 seconds.

### "I want to process tasks in the background"
**Use: Workers + Queues**
User hits your API (Worker) -> Worker pushes a message to a Queue -> Another Worker picks it up and processes it. Great for: sending emails, generating reports, processing images.

### "I want to add AI features (chatbot, image generation, embeddings)"
**Use: Workers AI**
Run models like Llama, Stable Diffusion, or embedding models directly on Cloudflare. No external API needed.

### "I'm building a real-time app (chat, multiplayer game, collaborative editor)"
**Use: Workers + Durable Objects**
Durable Objects give you a single-instance stateful "mini-server" that coordinates between users. Perfect for WebSocket-based real-time apps.

### "I need to optimize images or stream video"
**Use: Images & Stream**
Resize/compress images on the fly via URL params. Upload and stream video with adaptive bitrate.

### "I want bot protection without annoying CAPTCHAs"
**Use: Turnstile**
Drop in a widget. It runs invisible challenges. Users never solve puzzles. You get a token to verify server-side.

---

## How Services Connect Together

The real power of Cloudflare is combining services. Here's how a **full-stack SaaS app** might look:

```
User's Browser
     |
     v
[Cloudflare Pages]  ------>  Static frontend (React/Vue/Svelte)
     |
     | API calls (/api/*)
     v
[Cloudflare Workers] ------>  Backend logic (REST/GraphQL)
     |
     |--- reads/writes -----> [D1 Database]     (user data, app data)
     |--- file storage -----> [R2]              (uploads, media)
     |--- caching ----------> [KV]             (sessions, feature flags)
     |--- background jobs --> [Queues]          (emails, processing)
     |--- AI inference -----> [Workers AI]      (chat, embeddings)
     |--- real-time --------> [Durable Objects] (WebSockets, live collab)
```

---

## The Core Tool: Wrangler CLI

Everything on Cloudflare's dev platform revolves around **Wrangler** — the CLI tool.

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to your Cloudflare account
wrangler login

# Create a new Workers project
npm create cloudflare@latest my-app

# Run locally for development
wrangler dev

# Deploy to production
wrangler deploy
```

---

## Pricing — The Good News

Most services have **generous free tiers**:

| Service | Free Tier |
|---------|-----------|
| Workers | 100,000 requests/day |
| Pages | Unlimited sites, 500 builds/month |
| R2 | 10 GB storage, 10 million reads/month |
| D1 | 5 million rows read/day, 100K writes/day |
| KV | 100,000 reads/day, 1,000 writes/day |
| Queues | 1 million operations/month |
| Workers AI | 10,000 neurons/day (varies by model) |
| Durable Objects | 1 million requests/month (paid plan) |
| Turnstile | Unlimited, free for everyone |

---

## Dive Deeper

Each service has its own detailed guide with step-by-step Node.js setup:

- [Workers Guide](services/workers/guide.md) — Serverless functions at the edge
- [Pages Guide](services/pages/guide.md) — Deploy frontend sites
- [R2 Guide](services/r2/guide.md) — Object storage
- [D1 Guide](services/d1/guide.md) — SQLite database
- [KV Guide](services/kv/guide.md) — Key-value store
- [Queues Guide](services/queues/guide.md) — Message queues
- [Workers AI Guide](services/ai/guide.md) — AI/ML at the edge
- [Durable Objects Guide](services/durable-objects/guide.md) — Stateful serverless
- [Images & Stream Guide](services/images-and-stream/guide.md) — Media services
- [Turnstile Guide](services/turnstile/guide.md) — Bot protection
