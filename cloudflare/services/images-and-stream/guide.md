# Cloudflare Images & Cloudflare Stream -- Study Guide

A beginner-friendly, Node.js/TypeScript-focused guide to storing, transforming, and delivering images and video through Cloudflare's media services.

---

## Table of Contents

1. [What are Cloudflare Images & Stream?](#1-what-are-cloudflare-images--stream)
2. [When to Use It](#2-when-to-use-it)
3. [Prerequisites](#3-prerequisites)
4. [Step-by-Step Setup](#4-step-by-step-setup)
5. [Code Examples](#5-code-examples)
6. [How the Flow Works](#6-how-the-flow-works)
7. [Key Concepts](#7-key-concepts)
8. [Common Patterns](#8-common-patterns)

---

## 1. What are Cloudflare Images & Stream?

### Cloudflare Images

Cloudflare Images is a fully managed image pipeline. You upload images, Cloudflare stores them, and you serve them through their CDN with on-the-fly transformations -- resizing, cropping, format conversion, quality adjustment -- all via URL parameters.

Think of it like **Cloudinary but built into the Cloudflare ecosystem**. You don't need to manage storage buckets, set up CDN distributions, or run image processing servers. Upload an image, get a URL, append your desired transformations, done.

Key capabilities:
- **Store** images on Cloudflare's infrastructure (no separate object storage needed)
- **Resize and crop** via URL parameters or predefined "variants"
- **Format negotiation** -- automatically serves WebP or AVIF to browsers that support them
- **Image Resizing via Workers** -- transform any image on-the-fly in a Worker using `cf.image` options on fetch requests

### Cloudflare Stream

Cloudflare Stream is a fully managed video pipeline. You upload a video, Cloudflare encodes it into multiple resolutions, stores it, and delivers it with adaptive bitrate streaming via HLS and DASH.

Think of it like **Mux or Vimeo's API** -- a developer-first video platform. No need to worry about encoding settings, CDN configuration, or player compatibility.

Key capabilities:
- **Upload** videos via API, dashboard, or direct creator uploads (one-time upload URLs)
- **Encode** into adaptive bitrate automatically (multiple resolutions)
- **Deliver** via HLS/DASH through Cloudflare's global network
- **Live streaming** via RTMPS input
- **Built-in player** or bring your own (HLS.js, Video.js, etc.)
- **Analytics, captions, thumbnails** -- all built in

---

## 2. When to Use It

### Cloudflare Images is great for:

| Use Case | Why |
|---|---|
| **E-commerce product images** | Upload once, serve at dozens of sizes via variants |
| **User-generated content** | Profile pictures, community uploads -- Cloudflare handles resizing and optimization |
| **Blog / CMS images** | Authors upload full-res, the CDN serves optimized versions |
| **Responsive images** | Serve different sizes for mobile vs. desktop without storing multiple copies |
| **Format optimization** | Automatically serve AVIF/WebP to modern browsers, fall back to JPEG/PNG |

### Cloudflare Stream is great for:

| Use Case | Why |
|---|---|
| **Course / education platforms** | Upload lectures, get adaptive streaming out of the box |
| **Video hosting** | Replace self-hosted video or expensive Vimeo/Wistia plans |
| **User-generated video** | Direct creator uploads let users upload without exposing your API key |
| **Live streaming** | Push RTMPS from OBS or similar, viewers get a low-latency HLS stream |
| **Internal video** | Training videos, team updates -- simple API, built-in access control |

### When NOT to use them:

- If you only need static file storage (use **R2** instead)
- If you need complex video editing or effects (use a specialized service)
- If you're already deep in the AWS/GCP ecosystem and don't want to add Cloudflare as a dependency

---

## 3. Prerequisites

### For both services:

- A **Cloudflare account** (free tier exists, but Images and Stream are paid add-ons)
- An **API token** with the appropriate permissions:
  - Images: `Cloudflare Images:Edit` for uploads, `Cloudflare Images:Read` for reading
  - Stream: `Stream:Edit` for uploads, `Stream:Read` for reading
- Your **Account ID** (found in the Cloudflare dashboard under any zone, or at the top of the Workers/Images/Stream pages)

### Optional but helpful:

- **Wrangler** (Cloudflare's CLI) -- useful if you want to integrate with Workers
- **Node.js 18+** -- for the code examples below (we use the built-in `fetch`)

```bash
# Install Wrangler globally
npm install -g wrangler

# Authenticate
wrangler login
```

### Grab your credentials:

```
Dashboard -> Images (or Stream) -> Overview
-> Your Account ID is at the top right
-> Create an API token at https://dash.cloudflare.com/profile/api-tokens
```

Store them as environment variables:

```bash
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
export CLOUDFLARE_API_TOKEN="your_api_token"
```

---

## 4. Step-by-Step Setup

### Images Setup

1. **Enable Images** -- Go to your Cloudflare dashboard -> Images. If you haven't enabled it, you'll see a button to subscribe. Images is billed per image stored and per image delivered.

2. **Upload via Dashboard** -- You can drag-and-drop images right in the dashboard to get started. Each image gets a unique ID.

3. **Upload via API** -- For programmatic uploads (which is what you'll actually use in production), hit the Images API with a POST request. See the code examples below.

4. **Create Variants** -- Variants are predefined transformation presets. Go to Images -> Variants and create ones like `thumbnail` (150x150, cover), `hero` (1920x1080, scale-down), etc. You can also use flexible variants for on-the-fly transforms.

5. **Serve via URL** -- Every image is available at:
   ```
   https://imagedelivery.net/<account_hash>/<image_id>/<variant_name>
   ```

### Stream Setup

1. **Enable Stream** -- Go to your Cloudflare dashboard -> Stream. Subscribe to a plan (billed per minutes stored and minutes viewed).

2. **Upload via Dashboard** -- Drag-and-drop a video to test. Cloudflare will encode it and give you an embed code.

3. **Upload via API** -- For programmatic uploads, use the Stream API or the TUS protocol for large files. See code examples below.

4. **Get Playback URL** -- Each video gets:
   - An **HLS URL** for adaptive streaming
   - A **DASH URL** as an alternative
   - An **embed code** using Cloudflare's built-in player

5. **Embed or Integrate** -- Use the `<stream>` web component, an `<iframe>`, or pull the HLS URL into your own player (HLS.js, Video.js, etc.).

---

## 5. Code Examples

### Images

#### Upload an Image via API

```typescript
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

// Upload from a URL
async function uploadImageFromUrl(imageUrl: string, customId?: string) {
  const formData = new FormData();
  formData.append("url", imageUrl);

  // Optional: set a custom ID so you can reference it by name
  if (customId) {
    formData.append("id", customId);
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        // Don't set Content-Type -- fetch sets it automatically with the boundary for FormData
      },
      body: formData,
    }
  );

  const data = await response.json();
  console.log("Upload result:", data);
  return data;
}

// Upload from a local file (Node.js)
async function uploadImageFromFile(filePath: string) {
  const fs = await import("fs");
  const file = fs.readFileSync(filePath);
  const blob = new Blob([file]);

  const formData = new FormData();
  formData.append("file", blob, "image.jpg");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: formData,
    }
  );

  const data = await response.json();
  console.log("Upload result:", data);
  return data;
}

// Example usage
const result = await uploadImageFromUrl(
  "https://example.com/photo.jpg",
  "products/blue-widget-001"
);

// result.result.variants will contain URLs like:
// https://imagedelivery.net/<hash>/products/blue-widget-001/public
// https://imagedelivery.net/<hash>/products/blue-widget-001/thumbnail
```

#### Serve with Transformations (Variants)

Once uploaded, images are served via the `imagedelivery.net` domain. The URL format is:

```
https://imagedelivery.net/<account_hash>/<image_id>/<variant_name>
```

Cloudflare comes with a `public` variant by default (serves the original). You create additional variants in the dashboard or via API:

```typescript
// Create a variant via API
async function createVariant(variantName: string, options: {
  fit: "scale-down" | "contain" | "cover" | "crop" | "pad";
  width: number;
  height: number;
  metadata?: "none" | "keep" | "copyright";
}) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1/variants`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: variantName,
        options: {
          fit: options.fit,
          width: options.width,
          height: options.height,
          metadata: options.metadata ?? "none",
        },
        neverRequireSignedURLs: true, // set to false for private images
      }),
    }
  );

  const data = await response.json();
  console.log("Variant created:", data);
  return data;
}

// Create some common variants
await createVariant("thumbnail", { fit: "cover", width: 150, height: 150 });
await createVariant("card", { fit: "cover", width: 400, height: 300 });
await createVariant("hero", { fit: "scale-down", width: 1920, height: 1080 });
```

Now you can serve the same image at different sizes:

```
https://imagedelivery.net/abc123/products/blue-widget-001/thumbnail  -> 150x150
https://imagedelivery.net/abc123/products/blue-widget-001/card       -> 400x300
https://imagedelivery.net/abc123/products/blue-widget-001/hero       -> 1920x1080
```

#### Flexible Variants (On-the-Fly via URL)

If you enable **Flexible Variants** in the dashboard (Images -> Variants -> toggle "Flexible Variants"), you can pass transformation parameters directly in the URL instead of using predefined variants:

```
https://imagedelivery.net/<hash>/<image_id>/w=300,h=200,fit=cover,quality=80
```

This is more flexible but gives callers control over transformations. Use predefined variants if you want to lock down the allowed sizes.

#### Image Resizing with Workers (On-the-Fly Transforms)

This is one of the most powerful features. Inside a Cloudflare Worker, you can fetch any image and transform it on the fly using the `cf.image` option:

```typescript
// wrangler.toml: name = "image-resizer"

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Parse parameters from the request
    const width = parseInt(url.searchParams.get("w") || "800");
    const height = parseInt(url.searchParams.get("h") || "600");
    const fit = url.searchParams.get("fit") || "cover";
    const quality = parseInt(url.searchParams.get("q") || "85");

    // The source image URL (could come from R2, an origin server, anywhere)
    const imageUrl = url.searchParams.get("src");
    if (!imageUrl) {
      return new Response("Missing 'src' parameter", { status: 400 });
    }

    // Fetch the image with on-the-fly transformations
    const response = await fetch(imageUrl, {
      cf: {
        image: {
          width,
          height,
          fit: fit as "cover" | "contain" | "scale-down" | "crop" | "pad",
          quality,
          format: "auto", // auto-negotiates WebP/AVIF based on Accept header
        },
      },
    });

    // Return the transformed image
    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400", // cache for 24 hours
      },
    });
  },
};
```

Usage:
```
https://image-resizer.your-domain.workers.dev/?src=https://example.com/photo.jpg&w=300&h=300&fit=cover&q=80
```

This is incredibly useful because:
- You can transform images from **any origin** (R2, S3, your own server)
- Transformations are cached at the edge
- You can add auth logic, watermarking logic, etc. in the Worker

#### List and Delete Images

```typescript
// List all images (paginated)
async function listImages(page = 1, perPage = 100) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }
  );

  const data = await response.json();
  console.log(`Page ${page}:`, data.result.images.length, "images");
  return data;
}

// Delete an image
async function deleteImage(imageId: string) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }
  );

  const data = await response.json();
  console.log("Deleted:", data.success);
  return data;
}
```

---

### Stream

#### Upload a Video via API

```typescript
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

// Upload from a URL (simplest method)
async function uploadVideoFromUrl(videoUrl: string, meta?: Record<string, string>) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/copy`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: videoUrl,
        meta: meta || {},
      }),
    }
  );

  const data = await response.json();
  console.log("Video upload started:", data);
  // data.result.uid is the video ID
  // data.result.status.state will be "queued" -> "inprogress" -> "ready"
  return data;
}

// Upload a file directly
async function uploadVideoFromFile(filePath: string) {
  const fs = await import("fs");
  const file = fs.readFileSync(filePath);
  const blob = new Blob([file]);

  const formData = new FormData();
  formData.append("file", blob, "video.mp4");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: formData,
    }
  );

  const data = await response.json();
  console.log("Video upload started:", data);
  return data;
}

const result = await uploadVideoFromUrl(
  "https://example.com/my-lecture.mp4",
  { title: "Intro to TypeScript", course: "ts-101" }
);
```

#### Upload Large Videos with TUS Protocol

For large files (or resumable uploads), Cloudflare Stream supports the [TUS protocol](https://tus.io/). Use the `tus-js-client` library:

```typescript
import * as tus from "tus-js-client";
import * as fs from "fs";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

function uploadLargeVideo(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const file = fs.createReadStream(filePath);
    const size = fs.statSync(filePath).size;

    const upload = new tus.Upload(file, {
      endpoint: `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`,
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      chunkSize: 50 * 1024 * 1024, // 50 MB chunks
      uploadSize: size,
      metadata: {
        name: "large-video.mp4",
        // You can add custom metadata here
      },
      onError: (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(`${percentage}% uploaded`);
      },
      onSuccess: () => {
        // The video ID is in the upload URL
        const videoId = upload.url?.split("/").pop();
        console.log("Upload complete! Video ID:", videoId);
        resolve(videoId!);
      },
    });

    upload.start();
  });
}
```

#### Get Playback URLs

```typescript
// Check video status and get playback info
async function getVideoDetails(videoId: string) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }
  );

  const data = await response.json();
  const video = data.result;

  console.log("Status:", video.status.state); // "ready" when done encoding
  console.log("Duration:", video.duration, "seconds");
  console.log("HLS URL:", video.playback.hls);
  console.log("DASH URL:", video.playback.dash);
  console.log("Preview:", video.preview);
  console.log("Thumbnail:", video.thumbnail);

  return video;
}

// Poll until video is ready
async function waitForReady(videoId: string, maxAttempts = 60): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const video = await getVideoDetails(videoId);

    if (video.status.state === "ready") {
      console.log("Video is ready!");
      return;
    }

    if (video.status.state === "error") {
      throw new Error(`Video encoding failed: ${video.status.errorReasonText}`);
    }

    console.log(`Status: ${video.status.state}, checking again in 5s...`);
    await new Promise((r) => setTimeout(r, 5000));
  }

  throw new Error("Timed out waiting for video to be ready");
}
```

#### Embed in HTML with the Stream Player

Cloudflare provides a lightweight web component for embedding:

```html
<!-- Using the <stream> web component (recommended) -->
<script
  data-cfasync="false"
  defer
  type="text/javascript"
  src="https://embed.cloudflarestream.com/embed/sdk.latest.js"
></script>

<stream
  src="VIDEO_ID_HERE"
  controls
  autoplay
  muted
  preload="auto"
  poster="https://customer-abc123.cloudflarestream.com/VIDEO_ID/thumbnails/thumbnail.jpg"
></stream>

<!-- Or using an iframe -->
<iframe
  src="https://customer-abc123.cloudflarestream.com/VIDEO_ID/iframe"
  style="border: none; width: 100%; aspect-ratio: 16/9"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
  allowfullscreen
></iframe>
```

Or use HLS.js for a custom player:

```typescript
import Hls from "hls.js";

function initPlayer(videoElement: HTMLVideoElement, hlsUrl: string) {
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(hlsUrl);
    hls.attachMedia(videoElement);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoElement.play();
    });
  } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
    // Safari has native HLS support
    videoElement.src = hlsUrl;
    videoElement.addEventListener("loadedmetadata", () => {
      videoElement.play();
    });
  }
}

// Usage:
// const video = document.querySelector("video")!;
// initPlayer(video, "https://customer-abc123.cloudflarestream.com/VIDEO_ID/manifest/video.m3u8");
```

#### Direct Creator Uploads (One-Time Upload URLs)

This is the pattern you'll use most in production. Instead of having users upload to your server (which then uploads to Cloudflare), you generate a one-time upload URL and give it directly to the client. The video goes straight from the user's browser to Cloudflare.

```typescript
// Server-side: generate a one-time upload URL
async function createDirectUploadUrl(maxDurationSeconds = 3600) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds,
        // Optional: require signed URLs for playback
        requireSignedURLs: false,
        // Optional: set allowed origins for the upload
        // allowedOrigins: ["https://your-app.com"],
        // Optional: set expiry for the upload URL (default is 30 min)
        expiry: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        // Optional: metadata
        meta: {
          uploadedBy: "user-123",
        },
      }),
    }
  );

  const data = await response.json();
  console.log("Upload URL:", data.result.uploadURL);
  console.log("Video UID (for tracking):", data.result.uid);

  return {
    uploadUrl: data.result.uploadURL,
    videoId: data.result.uid,
  };
}

// Client-side: upload directly from the browser
async function uploadFromBrowser(file: File, uploadUrl: string) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  console.log("Upload complete!");
}
```

A typical flow:
1. User clicks "Upload Video" in your app
2. Your backend calls `createDirectUploadUrl()` and returns the URL + video ID to the frontend
3. Frontend calls `uploadFromBrowser(file, uploadUrl)`
4. Video goes directly to Cloudflare (never touches your server)
5. Your backend stores the `videoId` in your database
6. You poll or use webhooks to know when encoding is done

#### Stream Webhooks

You can configure a webhook URL in the Stream dashboard so Cloudflare notifies you when a video finishes processing:

```typescript
// Express.js webhook handler
import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.STREAM_WEBHOOK_SECRET!;

app.post("/webhooks/stream", (req, res) => {
  // Verify the webhook signature
  const signature = req.headers["webhook-signature"] as string;
  const body = JSON.stringify(req.body);

  // Cloudflare sends a signature you can verify
  // (check their docs for the exact verification method)

  const event = req.body;
  console.log("Stream webhook:", event);

  // event.status.state will be "ready" or "error"
  if (event.status?.state === "ready") {
    console.log(`Video ${event.uid} is ready for playback!`);
    console.log(`HLS: ${event.playback?.hls}`);
    console.log(`Duration: ${event.duration}s`);
    // Update your database, notify the user, etc.
  }

  res.sendStatus(200);
});
```

#### Using Stream with Workers

```typescript
// A Worker that acts as a proxy / auth layer for Stream videos
export default {
  async fetch(request: Request, env: { STREAM_API_TOKEN: string; ACCOUNT_ID: string }): Promise<Response> {
    const url = new URL(request.url);
    const videoId = url.pathname.split("/").pop();

    if (!videoId) {
      return new Response("Missing video ID", { status: 400 });
    }

    // Add your own auth logic here
    const authHeader = request.headers.get("Authorization");
    if (!isValidUser(authHeader)) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Fetch video details from Stream API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${env.STREAM_API_TOKEN}`,
        },
      }
    );

    const data = await response.json() as any;

    if (!data.success) {
      return new Response("Video not found", { status: 404 });
    }

    // Return playback info
    return Response.json({
      id: data.result.uid,
      duration: data.result.duration,
      hls: data.result.playback.hls,
      dash: data.result.playback.dash,
      thumbnail: data.result.thumbnail,
      status: data.result.status.state,
    });
  },
};

function isValidUser(authHeader: string | null): boolean {
  // Your auth logic here
  return authHeader !== null;
}
```

---

## 6. How the Flow Works

### Images Flow

```
                         Cloudflare Images
                    +--------------------------+
                    |                          |
  Upload Image ---> |  1. Store original       |
  (API / Dashboard) |  2. Generate variants    |
                    |     on first request     |
                    |  3. Cache at edge        |
                    |                          |
                    +--------------------------+
                               |
                               v
                    +--------------------------+
                    |  imagedelivery.net CDN   |
                    |                          |
                    |  /account_hash/          |
                    |    /image_id/            |
                    |      /variant_name       |
                    +--------------------------+
                               |
                    +----------+----------+
                    |          |          |
                    v          v          v
                 Browser   Browser   Browser
                 (WebP)    (AVIF)    (JPEG)
                           (auto format negotiation)
```

**Step by step:**

1. You upload an image to Cloudflare via API or dashboard
2. Cloudflare stores the original in their infrastructure
3. When someone requests a variant URL for the first time, Cloudflare generates that transformation and caches it at the edge
4. Subsequent requests for the same variant are served from cache (fast)
5. Cloudflare automatically checks the browser's `Accept` header and serves the best format (AVIF > WebP > original)

### Image Resizing via Workers Flow

```
  Request to Worker ---> Worker runs fetch() with cf.image options
                              |
                              v
                    Cloudflare Image Resizing
                    (transforms the image)
                              |
                              v
                    Cached at edge for
                    subsequent requests
                              |
                              v
                    Response to client
```

### Stream Flow

```
                          Cloudflare Stream
                    +--------------------------+
                    |                          |
  Upload Video ---> |  1. Ingest video         |
  (API / TUS /      |  2. Encode to multiple   |
   Direct Upload)   |     resolutions          |
                    |     (360p, 720p, 1080p)  |
                    |  3. Generate HLS/DASH    |
                    |     manifests            |
                    |  4. Generate thumbnails  |
                    |                          |
                    +--------------------------+
                               |
                               v
                    +--------------------------+
                    |  cloudflarestream.com    |
                    |  CDN                     |
                    |                          |
                    |  HLS: .../video.m3u8     |
                    |  DASH: .../video.mpd     |
                    +--------------------------+
                               |
                    +----------+----------+
                    |          |          |
                    v          v          v
                 Mobile    Desktop    Smart TV
                 (360p)    (1080p)    (1080p)
                 (adaptive bitrate picks the best quality)
```

**Step by step:**

1. You upload a video (via API, TUS, or direct creator upload)
2. Cloudflare ingests and encodes it into multiple resolutions (this takes a few minutes)
3. HLS and DASH manifests are generated so players can do adaptive bitrate streaming
4. Thumbnails are auto-generated (you can also set custom thumbnail timestamps)
5. When a viewer watches, their player requests the manifest, then fetches video segments at the appropriate quality based on their connection speed
6. Segments are cached at Cloudflare's edge nodes worldwide

---

## 7. Key Concepts

### Images Key Concepts

#### Variants

Variants are predefined transformation presets. Instead of exposing raw transformation parameters in URLs (which could let attackers generate tons of unique transforms and bust your cache), you define a fixed set of variants:

```
thumbnail  -> 150x150, cover, no metadata
card       -> 400x300, cover, strip metadata
full       -> 1920x1080, scale-down, keep metadata
public     -> original (built-in default)
```

Each variant is generated on first request and cached. Variants keep your transformation surface controlled and predictable.

#### Flexible Variants

An opt-in feature that lets you specify transformations directly in the URL:

```
/image_id/w=300,h=200,fit=cover
```

More flexible, but gives callers the ability to request arbitrary sizes. Use with caution in public-facing URLs.

#### Custom IDs

By default, images get a UUID. You can set a custom ID on upload (like `products/blue-widget-001`) to make them more meaningful. Custom IDs must be unique within your account.

#### Delivery URLs

All images are served from `imagedelivery.net`:

```
https://imagedelivery.net/<account_hash>/<image_id>/<variant>
```

The `account_hash` is a public identifier (not a secret). The `image_id` is either the UUID or your custom ID.

#### Format Negotiation

Cloudflare automatically inspects the request's `Accept` header and serves:
- **AVIF** if the browser supports it (smallest file size, best quality)
- **WebP** as a fallback (good compression, wide support)
- **Original format** (JPEG/PNG) for older browsers

You don't have to do anything -- this happens automatically. It can reduce image sizes by 30-50% compared to always serving JPEG.

#### Signed URLs

For private images, you can require signed URLs. Cloudflare provides a signing key, and you generate time-limited signed URLs on your server:

```typescript
import crypto from "crypto";

function signImageUrl(imageId: string, variant: string, expiresAt: number, signingKey: string): string {
  const url = `https://imagedelivery.net/ACCOUNT_HASH/${imageId}/${variant}`;
  const expiry = Math.floor(expiresAt / 1000); // Unix timestamp

  const stringToSign = `${url}?exp=${expiry}`;
  const mac = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  return `${url}?exp=${expiry}&sig=${mac}`;
}
```

---

### Stream Key Concepts

#### Adaptive Bitrate Streaming

When you upload a video, Stream encodes it into multiple quality levels (e.g., 360p, 480p, 720p, 1080p). The HLS/DASH manifest lists all available qualities. The player starts at a reasonable quality and dynamically switches up or down based on the viewer's network speed. This means:
- Fast connections get crisp 1080p
- Slow connections still get watchable 360p
- Buffering is minimized because the player adapts in real time

#### HLS and DASH

**HLS** (HTTP Live Streaming) is Apple's adaptive streaming protocol. It's the most widely supported -- works natively in Safari and via HLS.js in other browsers.

**DASH** (Dynamic Adaptive Streaming over HTTP) is an alternative, more common on Android. Stream provides both.

In practice, most developers just use HLS since it works everywhere with HLS.js.

#### Direct Creator Uploads

Instead of routing video uploads through your server, you generate a one-time upload URL from Cloudflare and hand it to the client. The upload goes directly from the user's browser to Cloudflare. Benefits:
- No bandwidth cost on your server
- No file size limits on your server
- Faster for the user (one fewer hop)
- The upload URL expires, so it can't be reused

#### Captions and Subtitles

You can upload WebVTT caption files for any video:

```typescript
async function addCaptions(videoId: string, language: string, label: string, vttContent: string) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/${videoId}/captions/${language}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: vttContent,
      }),
    }
  );

  return response.json();
}

await addCaptions("video-id-123", "en", "English", `WEBVTT

00:00:00.000 --> 00:00:05.000
Welcome to this course on TypeScript.

00:00:05.000 --> 00:00:10.000
Today we'll cover the basics.
`);
```

#### Thumbnails

Stream auto-generates a thumbnail from the video. You can customize the timestamp:

```typescript
// Set thumbnail to a specific time
async function setThumbnail(videoId: string, timeSeconds: number) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/${videoId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        thumbnailTimestampPct: timeSeconds / 100, // percentage of video duration
      }),
    }
  );

  return response.json();
}
```

Thumbnail URL format:
```
https://customer-abc123.cloudflarestream.com/VIDEO_ID/thumbnails/thumbnail.jpg
https://customer-abc123.cloudflarestream.com/VIDEO_ID/thumbnails/thumbnail.jpg?time=10s&width=640
```

#### Video Analytics

Stream provides built-in analytics -- minutes viewed, number of views, unique viewers, etc. Available via the dashboard and API:

```typescript
async function getVideoAnalytics(videoId: string) {
  // Uses Cloudflare's GraphQL analytics API
  const query = `
    query {
      viewer {
        accounts(filter: { accountTag: "${ACCOUNT_ID}" }) {
          streamMinutesViewedAdaptiveGroups(
            filter: { uid: "${videoId}" }
            limit: 100
            orderBy: [date_ASC]
          ) {
            dimensions {
              date
            }
            sum {
              minutesViewed
            }
            count
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  return response.json();
}
```

#### Live Streaming (RTMPS Input)

Stream supports live streaming. You create a "live input" which gives you an RTMPS URL. You point OBS (or any RTMPS encoder) at that URL, and viewers get a live HLS stream:

```typescript
// Create a live input
async function createLiveInput(name: string) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/live_inputs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meta: { name },
        recording: {
          mode: "automatic", // automatically save recordings
        },
      }),
    }
  );

  const data = await response.json();
  const input = data.result;

  console.log("RTMPS URL:", input.rtmps.url);
  console.log("RTMPS Key:", input.rtmps.streamKey);
  console.log("Playback (HLS):", input.playback?.hls);

  // In OBS:
  // Server: input.rtmps.url
  // Stream Key: input.rtmps.streamKey

  return input;
}
```

---

## 8. Common Patterns

### Pattern 1: Images + Workers for Dynamic Transformations

Instead of using Cloudflare Images (which stores images on Cloudflare), you can store images in **R2** and use **Image Resizing via Workers** to transform them on the fly. This gives you more control and can be cheaper at scale.

```typescript
// Worker that serves images from R2 with on-the-fly resizing
export default {
  async fetch(request: Request, env: { IMAGES_BUCKET: R2Bucket }): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // remove leading /

    // Parse transform params
    const width = parseInt(url.searchParams.get("w") || "0") || undefined;
    const height = parseInt(url.searchParams.get("h") || "0") || undefined;
    const quality = parseInt(url.searchParams.get("q") || "85");

    // Get the original image from R2
    const object = await env.IMAGES_BUCKET.get(path);
    if (!object) {
      return new Response("Image not found", { status: 404 });
    }

    // If no transforms requested, serve the original
    if (!width && !height) {
      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Construct the R2 URL for the image (or use the object body)
    // Image Resizing needs a fetchable URL, so we use the R2 public URL or a signed URL
    const imageResponse = await fetch(`https://your-r2-bucket.your-domain.com/${path}`, {
      cf: {
        image: {
          width,
          height,
          fit: "cover",
          quality,
          format: "auto",
        },
      },
    });

    return new Response(imageResponse.body, {
      headers: {
        "Content-Type": imageResponse.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  },
};
```

**When to use this pattern:**
- You want to store originals in R2 (cheaper per GB than Images)
- You need full control over transformation logic (auth, watermarks, etc.)
- You have images from external sources that you want to optimize on the fly

**When to use Cloudflare Images instead:**
- You want a simpler API (upload + variant URL, done)
- You want Cloudflare to manage storage entirely
- You want the variant system for controlled, predefined transforms

### Pattern 2: Stream for Course / Video Platforms

A typical course platform architecture with Stream:

```typescript
// 1. Instructor uploads a video
// Backend: generate a direct upload URL
app.post("/api/courses/:courseId/lessons", async (req, res) => {
  const { courseId } = req.params;
  const { title, description } = req.body;

  // Create direct upload URL
  const { uploadUrl, videoId } = await createDirectUploadUrl(7200); // max 2 hours

  // Create the lesson in your database (video not ready yet)
  const lesson = await db.lessons.create({
    courseId,
    title,
    description,
    streamVideoId: videoId,
    status: "uploading",
  });

  res.json({ lesson, uploadUrl });
});

// 2. Webhook: video is ready
app.post("/webhooks/stream", async (req, res) => {
  const event = req.body;

  if (event.status?.state === "ready") {
    await db.lessons.update({
      where: { streamVideoId: event.uid },
      data: {
        status: "ready",
        duration: event.duration,
        hlsUrl: event.playback.hls,
        thumbnailUrl: event.thumbnail,
      },
    });
  }

  res.sendStatus(200);
});

// 3. Student watches a lesson
app.get("/api/lessons/:lessonId/playback", async (req, res) => {
  const lesson = await db.lessons.findUnique({ where: { id: req.params.lessonId } });

  // Check enrollment, auth, etc.
  if (!isEnrolled(req.user, lesson.courseId)) {
    return res.status(403).json({ error: "Not enrolled" });
  }

  res.json({
    hlsUrl: lesson.hlsUrl,
    thumbnail: lesson.thumbnailUrl,
    duration: lesson.duration,
  });
});
```

### Pattern 3: Images + R2 for Hybrid Storage

Sometimes you want to keep originals in R2 (for full control, backups, or because you also serve them as downloads) but use Cloudflare Images for the optimized delivery:

```typescript
// Upload flow: store original in R2, optimized version in Images
async function uploadProductImage(file: Buffer, productId: string) {
  // 1. Store original in R2 (for backup / download)
  await r2Bucket.put(`products/${productId}/original.jpg`, file, {
    httpMetadata: { contentType: "image/jpeg" },
  });

  // 2. Upload to Cloudflare Images (for optimized delivery)
  const formData = new FormData();
  formData.append("file", new Blob([file]), "image.jpg");
  formData.append("id", `products/${productId}`);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      body: formData,
    }
  );

  const data = await response.json();

  // 3. Store both references in your database
  await db.products.update({
    where: { id: productId },
    data: {
      originalImageR2Key: `products/${productId}/original.jpg`,
      imageDeliveryUrl: data.result.variants[0], // the public variant URL
    },
  });
}
```

### Pattern 4: Signed URLs for Private Content

For paid content (courses, premium images), use signed URLs so only authorized users can access the media:

```typescript
// Images: signed URL
function getSignedImageUrl(imageId: string, variant: string): string {
  const SIGNING_KEY = process.env.IMAGES_SIGNING_KEY!;
  const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour

  const baseUrl = `https://imagedelivery.net/ACCOUNT_HASH/${imageId}/${variant}`;
  const token = crypto
    .createHmac("sha256", SIGNING_KEY)
    .update(`${baseUrl}?exp=${expiry}`)
    .digest("hex");

  return `${baseUrl}?exp=${expiry}&sig=${token}`;
}

// Stream: signed token for video playback
async function getSignedStreamToken(videoId: string): Promise<string> {
  // Stream uses a signing key (PEM format) that you generate in the dashboard
  // The token is a JWT signed with your key

  const STREAM_SIGNING_KEY_ID = process.env.STREAM_KEY_ID!;
  const STREAM_SIGNING_KEY_PEM = process.env.STREAM_KEY_PEM!;

  const header = { alg: "RS256", kid: STREAM_SIGNING_KEY_ID };
  const payload = {
    sub: videoId,
    kid: STREAM_SIGNING_KEY_ID,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    // Optional restrictions:
    // accessRules: [
    //   { type: "ip.geoip.country", country: ["US", "CA"], action: "allow" },
    //   { type: "any", action: "block" },
    // ],
  };

  // Sign the JWT with your PEM key (use jsonwebtoken or jose library)
  const jwt = await signJwt(header, payload, STREAM_SIGNING_KEY_PEM);
  return jwt;

  // The signed playback URL becomes:
  // https://customer-abc123.cloudflarestream.com/${token}/manifest/video.m3u8
}
```

---

## Quick Reference

### Images API Endpoints

| Action | Method | Endpoint |
|---|---|---|
| Upload image | POST | `/accounts/{id}/images/v1` |
| List images | GET | `/accounts/{id}/images/v1` |
| Get image details | GET | `/accounts/{id}/images/v1/{image_id}` |
| Delete image | DELETE | `/accounts/{id}/images/v1/{image_id}` |
| Create variant | POST | `/accounts/{id}/images/v1/variants` |
| List variants | GET | `/accounts/{id}/images/v1/variants` |
| Direct upload URL | POST | `/accounts/{id}/images/v2/direct_upload` |

### Stream API Endpoints

| Action | Method | Endpoint |
|---|---|---|
| Upload video | POST | `/accounts/{id}/stream` |
| Copy from URL | POST | `/accounts/{id}/stream/copy` |
| Get video details | GET | `/accounts/{id}/stream/{video_id}` |
| List videos | GET | `/accounts/{id}/stream` |
| Delete video | DELETE | `/accounts/{id}/stream/{video_id}` |
| Direct upload URL | POST | `/accounts/{id}/stream/direct_upload` |
| Add captions | PUT | `/accounts/{id}/stream/{video_id}/captions/{lang}` |
| Create live input | POST | `/accounts/{id}/stream/live_inputs` |

### Delivery URL Formats

```
# Images
https://imagedelivery.net/<account_hash>/<image_id>/<variant>
https://imagedelivery.net/<account_hash>/<image_id>/w=300,h=200,fit=cover  (flexible variants)

# Stream
HLS:  https://customer-<hash>.cloudflarestream.com/<video_id>/manifest/video.m3u8
DASH: https://customer-<hash>.cloudflarestream.com/<video_id>/manifest/video.mpd
Thumbnail: https://customer-<hash>.cloudflarestream.com/<video_id>/thumbnails/thumbnail.jpg
Embed: https://customer-<hash>.cloudflarestream.com/<video_id>/iframe
```

### Pricing (as of early 2026, check current pricing)

**Images:**
- Storage: $5/month per 100,000 images stored
- Delivery: $1/month per 100,000 images delivered
- Image Resizing (via Workers): included with Workers Paid plan, billed per unique transform

**Stream:**
- Storage: $5/month per 1,000 minutes of video stored
- Delivery: $1/month per 1,000 minutes of video viewed
- Live streaming: same pricing model

Both are pay-as-you-go with no minimum commitments.
