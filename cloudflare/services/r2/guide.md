# Cloudflare R2 -- Study Guide

A beginner-friendly, Node.js/TypeScript-focused guide to Cloudflare R2 object storage.

---

## 1. What is R2?

R2 is Cloudflare's **S3-compatible object storage** service. Think of it as a giant, scalable hard drive in the cloud where you can store files -- images, videos, PDFs, backups, databases, literally any blob of data.

The killer feature? **Zero egress fees.**

With AWS S3, you pay every time someone downloads a file. If your app serves a lot of media or large files, those egress costs can snowball fast -- sometimes becoming the biggest line item on your bill. R2 eliminates that entirely. You pay for storage and write operations, but reads and downloads are free.

**Quick comparison:**

| Feature | AWS S3 | Cloudflare R2 |
|---------|--------|---------------|
| Storage cost | ~$0.023/GB/month | ~$0.015/GB/month |
| Egress (downloads) | ~$0.09/GB | **$0.00/GB** |
| S3 API compatible | Yes (it IS S3) | Yes |
| Global edge network | No (region-specific) | Yes (automatic) |

So if you're serving 1TB of downloads per month, S3 costs you ~$90 in egress alone. R2 costs you $0. That adds up.

---

## 2. When to Use R2

R2 is a great fit when you need to:

- **Store user-uploaded files** -- profile pictures, documents, attachments
- **Serve static assets** -- images, fonts, CSS/JS bundles
- **Store backups** -- database dumps, log archives
- **Build a data lake** -- analytics data, event logs, parquet files
- **Host media** -- video files, podcasts, large downloads
- **Replace S3 to save money** -- drop-in replacement thanks to S3 API compatibility

If your app involves "users upload files and other users download them," R2 is probably what you want.

---

## 3. Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed (`node --version` to check)
- **Wrangler CLI** -- Cloudflare's command-line tool (`npm install -g wrangler`)
- **A Cloudflare account** -- free tier works fine for getting started
- **Wrangler authenticated** -- run `wrangler login` and follow the browser prompt

---

## 4. Step-by-Step Setup

### 4.1 Create an R2 Bucket

A "bucket" is just a container for your files. Think of it like a top-level folder.

```bash
wrangler r2 bucket create my-bucket
```

That's it. Your bucket exists now.

### 4.2 Set Up a Worker Project

Workers are Cloudflare's serverless functions. They sit between your users and R2, handling uploads, downloads, auth, etc.

```bash
# Create a new Worker project
wrangler init my-r2-worker
cd my-r2-worker
```

### 4.3 Add the R2 Binding in wrangler.toml

Open `wrangler.toml` and add the R2 binding. This tells your Worker "hey, you have access to this bucket."

```toml
name = "my-r2-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "MY_BUCKET"       # The variable name you'll use in code
bucket_name = "my-bucket"   # The actual bucket name you created
```

The `binding` is the name you'll reference in your TypeScript code. The `bucket_name` is the real bucket name on Cloudflare's end. They don't have to match, but keeping them related helps.

### 4.4 Define Your Environment Type

Create or update your `src/index.ts` with the environment type so TypeScript knows about the binding:

```typescript
export interface Env {
  MY_BUCKET: R2Bucket;
}
```

Now you're ready to write code that talks to R2.

---

## 5. Code Examples

### 5.1 Upload a File (PUT)

```typescript
export interface Env {
  MY_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "PUT") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1); // Remove leading slash

    if (!key) {
      return new Response("Missing file key in URL path", { status: 400 });
    }

    // Put the request body directly into R2
    await env.MY_BUCKET.put(key, request.body, {
      httpMetadata: {
        contentType: request.headers.get("content-type") || "application/octet-stream",
      },
    });

    return new Response(JSON.stringify({ message: "Uploaded", key }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

**How to test it:**

```bash
curl -X PUT "https://my-r2-worker.<your-subdomain>.workers.dev/photos/cat.jpg" \
  --header "Content-Type: image/jpeg" \
  --data-binary @cat.jpg
```

### 5.2 Download / Get a File (GET)

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!key) {
      return new Response("Missing file key", { status: 400 });
    }

    const object = await env.MY_BUCKET.get(key);

    if (!object) {
      return new Response("File not found", { status: 404 });
    }

    // Stream the file back to the user
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        "ETag": object.httpEtag,
      },
    });
  },
};
```

### 5.3 List Objects in a Bucket

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const prefix = url.searchParams.get("prefix") || "";
    const limit = parseInt(url.searchParams.get("limit") || "100");

    const listed = await env.MY_BUCKET.list({
      prefix,
      limit,
    });

    const files = listed.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
    }));

    return new Response(JSON.stringify({ files, truncated: listed.truncated }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

**Usage:**

```bash
# List all files
curl "https://my-r2-worker.<subdomain>.workers.dev/?prefix=&limit=50"

# List files in a "folder"
curl "https://my-r2-worker.<subdomain>.workers.dev/?prefix=photos/"
```

### 5.4 Delete an Object

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "DELETE") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    await env.MY_BUCKET.delete(key);

    return new Response(JSON.stringify({ message: "Deleted", key }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
```

### 5.5 Full CRUD Worker

Here's a complete Worker that handles all file operations based on HTTP method:

```typescript
export interface Env {
  MY_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    // List objects
    if (request.method === "GET" && !key) {
      const prefix = url.searchParams.get("prefix") || "";
      const listed = await env.MY_BUCKET.list({ prefix, limit: 1000 });

      const files = listed.objects.map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded.toISOString(),
      }));

      return Response.json({ files, truncated: listed.truncated });
    }

    // Download a file
    if (request.method === "GET") {
      const object = await env.MY_BUCKET.get(key);

      if (!object) {
        return new Response("Not found", { status: 404 });
      }

      const headers = new Headers();
      headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
      headers.set("ETag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000");

      return new Response(object.body, { headers });
    }

    // Upload a file
    if (request.method === "PUT") {
      if (!key) {
        return Response.json({ error: "Key is required" }, { status: 400 });
      }

      await env.MY_BUCKET.put(key, request.body, {
        httpMetadata: {
          contentType: request.headers.get("content-type") || "application/octet-stream",
        },
        customMetadata: {
          uploadedBy: request.headers.get("x-uploaded-by") || "anonymous",
          uploadedAt: new Date().toISOString(),
        },
      });

      return Response.json({ message: "Uploaded", key }, { status: 201 });
    }

    // Delete a file
    if (request.method === "DELETE") {
      if (!key) {
        return Response.json({ error: "Key is required" }, { status: 400 });
      }

      await env.MY_BUCKET.delete(key);
      return Response.json({ message: "Deleted", key });
    }

    // HEAD -- check if file exists
    if (request.method === "HEAD") {
      const head = await env.MY_BUCKET.head(key);

      if (!head) {
        return new Response(null, { status: 404 });
      }

      return new Response(null, {
        headers: {
          "Content-Type": head.httpMetadata?.contentType || "application/octet-stream",
          "Content-Length": head.size.toString(),
          "ETag": head.httpEtag,
        },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
```

### 5.6 Presigned URLs for Direct Browser Uploads

Sometimes you want the browser to upload directly to R2 without proxying through your Worker. You can use the S3-compatible API with presigned URLs for this.

First, create an R2 API token in the Cloudflare dashboard (R2 > Manage R2 API Tokens). Then use the AWS SDK:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// These come from your R2 API token
const S3 = new S3Client({
  region: "auto",
  endpoint: "https://<ACCOUNT_ID>.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "<R2_ACCESS_KEY_ID>",
    secretAccessKey: "<R2_SECRET_ACCESS_KEY>",
  },
});

// Generate a presigned URL for uploading
async function getUploadUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: "my-bucket",
    Key: key,
    ContentType: "image/jpeg",
  });

  // URL is valid for 1 hour
  return getSignedUrl(S3, command, { expiresIn: 3600 });
}

// Generate a presigned URL for downloading
async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: "my-bucket",
    Key: key,
  });

  return getSignedUrl(S3, command, { expiresIn: 3600 });
}
```

**Browser-side upload using the presigned URL:**

```typescript
// In your frontend code
async function uploadFile(file: File) {
  // 1. Ask your backend for a presigned URL
  const res = await fetch("/api/get-upload-url", {
    method: "POST",
    body: JSON.stringify({ filename: file.name }),
  });
  const { url } = await res.json();

  // 2. Upload directly to R2 using the presigned URL
  await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
}
```

### 5.7 Setting Metadata and Custom Headers

You can attach metadata to objects when uploading. There are two kinds:

- **httpMetadata** -- standard HTTP headers (content-type, cache-control, etc.)
- **customMetadata** -- your own key-value pairs (user ID, tags, etc.)

```typescript
await env.MY_BUCKET.put("reports/q4-2025.pdf", pdfData, {
  httpMetadata: {
    contentType: "application/pdf",
    contentDisposition: 'attachment; filename="Q4-2025-Report.pdf"',
    cacheControl: "public, max-age=86400",
    contentLanguage: "en-US",
  },
  customMetadata: {
    author: "Jane Doe",
    department: "finance",
    generatedAt: new Date().toISOString(),
    version: "2",
  },
});

// Reading metadata back
const object = await env.MY_BUCKET.get("reports/q4-2025.pdf");

if (object) {
  console.log(object.httpMetadata?.contentType);    // "application/pdf"
  console.log(object.customMetadata?.author);        // "Jane Doe"
  console.log(object.customMetadata?.department);    // "finance"
}
```

---

## 6. How the Flow Works

Here's what happens when a user uploads or downloads a file through your Worker:

### Upload Flow

```
User (browser/client)
  |
  |  PUT /photos/vacation.jpg  (file in request body)
  v
Cloudflare Worker
  |
  |  env.MY_BUCKET.put("photos/vacation.jpg", body)
  v
R2 Bucket  -->  File stored globally
  |
  v
Worker returns  { "message": "Uploaded", "key": "photos/vacation.jpg" }
  |
  v
User gets 201 Created
```

### Download Flow

```
User (browser/client)
  |
  |  GET /photos/vacation.jpg
  v
Cloudflare Worker
  |
  |  env.MY_BUCKET.get("photos/vacation.jpg")
  v
R2 Bucket  -->  Returns file data (streamed, not buffered!)
  |
  v
Worker streams the response back with correct Content-Type
  |
  v
User receives the file  (ZERO egress cost to you)
```

### Direct Upload Flow (Presigned URLs)

```
User (browser)
  |
  |  POST /api/get-upload-url  { filename: "photo.jpg" }
  v
Your Backend / Worker
  |
  |  Generates presigned PUT URL
  v
Returns presigned URL to browser
  |
  v
User (browser)
  |
  |  PUT <presigned-url>  (file in request body)
  v
R2 Bucket directly  -->  File stored (bypasses your Worker entirely)
```

This last pattern is great for large files because the data goes straight to R2 without eating your Worker's CPU time.

---

## 7. Key Concepts

### Buckets
A bucket is a top-level container. You can have multiple buckets (e.g., `user-uploads`, `backups`, `assets`). Bucket names are globally unique within your account.

### Objects
An object is a single file stored in a bucket. Each object has a **key** (its path/name), **data** (the file contents), and **metadata**.

### Keys (File Paths)
Keys are just strings. They look like file paths but there are no real "folders." The key `photos/2025/vacation/beach.jpg` is just a flat string -- the slashes are part of the name. However, the `list()` API supports a `prefix` and `delimiter` parameter so you can navigate them like folders.

### S3 API Compatibility
R2 implements the S3 API. This means any tool, library, or SDK that works with S3 also works with R2 (with minor exceptions). The AWS SDK for JavaScript, boto3 for Python, rclone, cyberduck -- they all work. Just point them at your R2 endpoint.

### Bindings
A binding is the connection between a Worker and an R2 bucket (or any other Cloudflare resource). You declare it in `wrangler.toml` and access it via the `env` parameter in your Worker. Bindings are fast because they don't go over the network -- it's an in-process call.

### Multipart Uploads
For files larger than 5GB (or when you want resumable uploads), use multipart uploads. R2 supports the S3 multipart upload API:

```typescript
// Start a multipart upload
const upload = await env.MY_BUCKET.createMultipartUpload("large-file.zip");

// Upload parts (each part must be at least 5MB, except the last)
const part1 = await upload.uploadPart(1, chunk1);
const part2 = await upload.uploadPart(2, chunk2);
const part3 = await upload.uploadPart(3, chunk3);

// Complete the upload
await upload.complete([part1, part2, part3]);
```

### Object Metadata
Every object has system metadata (size, etag, last modified) plus optional custom metadata you set yourself. Custom metadata is limited to 2KB total per object.

### Public Buckets vs Workers-Fronted Access

You have two options for serving files:

- **Public bucket** -- Enable public access in the dashboard, get a URL like `https://pub-<hash>.r2.dev/<key>`. Simple but no auth, no logic, no transformations. Good for truly public assets.
- **Worker-fronted** -- A Worker sits in front of R2, giving you full control: authentication, URL rewriting, image transforms, analytics, rate limiting. This is the recommended approach for most use cases.

### R2 Limits

| Limit | Value |
|-------|-------|
| Max object size (single PUT) | 5 GB |
| Max object size (multipart) | 5 TB |
| Min multipart part size | 5 MB (except last part) |
| Max parts per multipart upload | 10,000 |
| Max buckets per account | 1,000 |
| Max custom metadata per object | 2 KB |
| Max key length | 1,024 bytes |

---

## 8. Common Patterns

### Pattern 1: Workers + R2 as a File Upload API

The most common pattern. Your frontend sends files to a Worker, the Worker validates and stores them in R2.

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Upload via POST", { status: 405 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: "File type not allowed" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Generate a unique key
    const ext = file.name.split(".").pop();
    const key = `uploads/${crypto.randomUUID()}.${ext}`;

    await env.MY_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name },
    });

    return Response.json({
      key,
      url: `https://files.example.com/${key}`,
      size: file.size,
    }, { status: 201 });
  },
};
```

### Pattern 2: R2 + Custom Domain for CDN-Like Delivery

You can connect a custom domain to your Worker so files are served from your own URL:

1. Add a custom domain to your Worker in the Cloudflare dashboard (or in `wrangler.toml`)
2. Your Worker serves files from R2 with proper cache headers

```toml
# wrangler.toml
routes = [
  { pattern = "files.example.com/*", zone_name = "example.com" }
]
```

```typescript
// Worker serves files with aggressive caching
const object = await env.MY_BUCKET.get(key);
if (!object) return new Response("Not found", { status: 404 });

return new Response(object.body, {
  headers: {
    "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
    "ETag": object.httpEtag,
  },
});
```

Now `https://files.example.com/photos/cat.jpg` serves your R2-stored image through Cloudflare's CDN. Fast, cheap, and on your own domain.

### Pattern 3: R2 as Image Storage with Transformations

Combine R2 with Cloudflare Images or a Worker-based transform to serve optimized images:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    const width = url.searchParams.get("w");
    const format = url.searchParams.get("format") || "webp";

    const object = await env.MY_BUCKET.get(key);
    if (!object) return new Response("Not found", { status: 404 });

    // If no transforms requested, return the original
    if (!width) {
      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Use Cloudflare Image Resizing (requires paid plan)
    // Fetch the image from R2 and transform it on the fly
    const imageUrl = `https://files.example.com/${key}`;
    return fetch(imageUrl, {
      cf: {
        image: {
          width: parseInt(width),
          format: format as "webp" | "avif" | "json",
          quality: 80,
          fit: "contain",
        },
      },
    });
  },
};
```

**Usage:** `https://images.example.com/photos/cat.jpg?w=300&format=webp`

---

## 9. Useful Wrangler Commands

Here's your R2 command cheatsheet:

### Bucket Commands

```bash
# List all your buckets
wrangler r2 bucket list

# Create a new bucket
wrangler r2 bucket create my-bucket

# Delete a bucket (must be empty)
wrangler r2 bucket delete my-bucket
```

### Object Commands

```bash
# Upload a local file to R2
wrangler r2 object put my-bucket/photos/cat.jpg --file ./cat.jpg

# Download a file from R2 to local
wrangler r2 object get my-bucket/photos/cat.jpg --file ./downloaded-cat.jpg

# Delete a file from R2
wrangler r2 object delete my-bucket/photos/cat.jpg
```

### Development

```bash
# Run your Worker locally (R2 is simulated locally via Miniflare)
wrangler dev

# Deploy your Worker to production
wrangler deploy

# Tail live logs from your deployed Worker
wrangler tail
```

### Quick Tip

During local development with `wrangler dev`, R2 operations use a local simulation (powered by Miniflare). Your local R2 data is stored in `.wrangler/state/`. This means you can develop and test without touching your production bucket at all.

---

## Recap

- R2 is S3-compatible object storage with **zero egress fees**
- Create a bucket, bind it to a Worker, and you're in business
- Use `env.MY_BUCKET.put()`, `.get()`, `.list()`, `.delete()`, `.head()` for all operations
- For files > 5GB, use multipart uploads
- Presigned URLs let browsers upload directly to R2
- Front your bucket with a Worker for auth, validation, and transforms
- `wrangler dev` gives you a local R2 simulation for development
- The S3 API compatibility means existing tools (AWS SDK, rclone, etc.) just work
