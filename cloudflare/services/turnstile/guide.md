# Cloudflare Turnstile -- Study Guide

A beginner-friendly, Node.js-focused guide to Cloudflare Turnstile: what it is, how it works, and how to integrate it into your projects.

---

## 1. What is Turnstile?

Turnstile is Cloudflare's free, privacy-friendly alternative to traditional CAPTCHAs like reCAPTCHA and hCaptcha.

The core idea is simple: instead of making users solve puzzles (pick all the traffic lights, type squiggly text), Turnstile runs invisible browser challenges behind the scenes. It watches for signals that indicate a real human is using the page -- things like browser APIs, environment signals, and machine learning models -- and produces a **token**. Your server then sends that token to Cloudflare to verify it's legit.

Here's what makes it worth using:

- **No user friction.** Most of the time, users never see anything. No puzzles, no checkboxes, no waiting.
- **Free for everyone.** Unlimited usage, no payment required, even if your site isn't on Cloudflare's CDN.
- **Privacy-friendly.** Turnstile doesn't use cookies to track users across sites. It doesn't collect personal data for advertising.
- **Drop-in replacement.** If you're currently using reCAPTCHA or hCaptcha, swapping to Turnstile is straightforward.

Think of it as a bouncer at a club who can tell humans from bots just by looking at them -- no ID check required.

---

## 2. When to Use It

Turnstile is a great fit anywhere you have a form or endpoint that bots might abuse:

- **Login forms** -- prevent credential stuffing attacks
- **Signup forms** -- stop fake account creation
- **Contact forms** -- block spam submissions
- **Checkout pages** -- prevent automated purchasing or card testing
- **Comment sections** -- reduce spam comments
- **Password reset forms** -- prevent enumeration attacks
- **API endpoints** -- add a layer of bot protection to public APIs

The general rule: if you have a user-facing action that bots could exploit, and you don't want to annoy real users with a puzzle, Turnstile is a solid choice.

---

## 3. Prerequisites

You don't need much to get started:

- **A Cloudflare account** -- free tier is fine. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com).
- **A website** -- any hosting works. Your site does NOT need to be proxied through Cloudflare. Turnstile works on any domain.
- **Node.js** -- for server-side token verification. Any recent version (18+) works.

That's it. No paid plans, no special DNS configuration.

---

## 4. Step-by-Step Setup

### Step 1: Create a Turnstile Widget in the Dashboard

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Go to **Turnstile** in the left sidebar.
3. Click **Add site** (or **Add widget**).
4. Enter your site's **domain name** (e.g., `example.com`). You can add multiple domains.
5. Choose a **widget mode** (start with **Managed** -- Cloudflare picks the best challenge automatically).
6. Click **Create**.

You'll get two keys:

| Key | Where it goes | Keep it secret? |
|-----|---------------|-----------------|
| **Site Key** | Client-side (HTML/JS) | No -- it's public |
| **Secret Key** | Server-side (Node.js) | **Yes -- never expose this** |

Copy both. You'll need them in the next steps.

> **Testing keys:** Cloudflare provides test keys for development. The site key `1x00000000000000000000AA` always passes, and `2x00000000000000000000AB` always blocks. The corresponding test secret key is `1x0000000000000000000000000000000AA` (always passes) or `2x0000000000000000000000000000000AB` (always fails). Use these in development so you don't burn through real verifications.

### Step 2: Add the Client-Side Widget

Add the Turnstile script and widget div to your HTML form. Details and code in the next section.

### Step 3: Verify the Token Server-Side

When the form is submitted, extract the Turnstile token and send it to Cloudflare's `siteverify` API. Details and code below.

---

## 5. Code Examples

### Client-Side: Implicit Rendering (HTML)

The simplest approach. Turnstile automatically renders when the page loads.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Form</title>
  <!-- Step 1: Add the Turnstile script -->
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
</head>
<body>
  <form action="/submit" method="POST">
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <label for="message">Message:</label>
    <textarea id="message" name="message" required></textarea>

    <!-- Step 2: Add the widget div -->
    <!-- Turnstile will inject the widget here and add a hidden input
         named "cf-turnstile-response" with the token value -->
    <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>

    <button type="submit">Send</button>
  </form>
</body>
</html>
```

When the form is submitted, the token is automatically included as a form field called `cf-turnstile-response`.

### Client-Side: Explicit Rendering (JavaScript API)

If you need more control -- for example, rendering the widget after a certain event, or in a single-page app -- use the explicit JavaScript API.

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit" async defer></script>

<div id="turnstile-container"></div>

<script>
  function onTurnstileLoad() {
    turnstile.render('#turnstile-container', {
      sitekey: 'YOUR_SITE_KEY',
      callback: function (token) {
        console.log('Turnstile token received:', token);
        // Store the token, attach it to your form, or send it with an API call
      },
      'error-callback': function () {
        console.error('Turnstile challenge failed');
      },
      'expired-callback': function () {
        console.warn('Turnstile token expired -- re-running challenge');
        // Token expired (they last 300 seconds). You can call turnstile.reset() here.
      },
      theme: 'light', // 'light', 'dark', or 'auto'
      action: 'contact-form', // optional: tag for analytics
    });
  }
</script>
```

Key methods on the `turnstile` global object:

- `turnstile.render(selector, options)` -- render a widget
- `turnstile.reset(widgetId)` -- re-run the challenge (useful after token expiry)
- `turnstile.remove(widgetId)` -- remove the widget from the page
- `turnstile.getResponse(widgetId)` -- get the current token value

### Client-Side: Getting the Token Manually

If you're submitting forms via JavaScript (fetch/XHR) instead of a normal form POST:

```typescript
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Grab the token from the hidden input Turnstile created
  const token = document.querySelector('[name="cf-turnstile-response"]')?.value;

  if (!token) {
    alert('Please wait for the security check to complete.');
    return;
  }

  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: form.email.value,
      message: form.message.value,
      turnstileToken: token,
    }),
  });

  const result = await response.json();
  console.log(result);
});
```

### Client-Side: React Component

A reusable Turnstile component for React apps:

```tsx
// TurnstileWidget.tsx
import { useEffect, useRef } from 'react';

// Extend the Window interface for the turnstile global
declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  action?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export function TurnstileWidget({
  siteKey,
  onVerify,
  onError,
  onExpire,
  action,
  theme = 'auto',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Load the Turnstile script if it hasn't been loaded yet
    const scriptId = 'cf-turnstile-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      document.head.appendChild(script);
    }

    // Wait for the script to load, then render
    const interval = setInterval(() => {
      if (window.turnstile && containerRef.current) {
        clearInterval(interval);

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'error-callback': onError,
          'expired-callback': onExpire,
          action,
          theme,
        });
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, action, theme]);

  return <div ref={containerRef} />;
}
```

Usage in a form:

```tsx
// ContactForm.tsx
import { useState } from 'react';
import { TurnstileWidget } from './TurnstileWidget';

export function ContactForm() {
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      alert('Please wait for the security check to complete.');
      return;
    }

    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        message: formData.get('message'),
        turnstileToken: token,
      }),
    });

    const result = await res.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />

      <TurnstileWidget
        siteKey="YOUR_SITE_KEY"
        onVerify={(t) => setToken(t)}
        onExpire={() => setToken(null)}
        action="contact-form"
      />

      <button type="submit" disabled={!token}>
        Send
      </button>
    </form>
  );
}
```

### Server-Side: Verify Token (Node.js)

The core verification logic. Send the token to Cloudflare's `siteverify` endpoint:

```typescript
// turnstile.ts

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY!;
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes': string[];
  challenge_ts: string;  // ISO timestamp of the challenge
  hostname: string;      // hostname the widget was solved on
  action: string;        // the action you passed to the widget
  cdata: string;         // custom data you passed to the widget
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResponse> {
  const formData = new URLSearchParams();
  formData.append('secret', TURNSTILE_SECRET_KEY);
  formData.append('response', token);

  // Including the user's IP is optional but recommended.
  // It helps Cloudflare improve detection accuracy.
  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  const response = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Turnstile verification request failed: ${response.status}`);
  }

  return response.json() as Promise<TurnstileVerifyResponse>;
}
```

### Server-Side: Full Express.js Example

A complete Express server that serves a form and verifies the Turnstile token on submission:

```typescript
// server.ts
import express from 'express';
import { verifyTurnstileToken } from './turnstile';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SITE_KEY = process.env.TURNSTILE_SITE_KEY!;

// Serve the form
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    </head>
    <body>
      <h1>Contact Us</h1>
      <form method="POST" action="/submit">
        <input type="email" name="email" placeholder="Email" required /><br>
        <textarea name="message" placeholder="Message" required></textarea><br>
        <div class="cf-turnstile" data-sitekey="${SITE_KEY}"></div>
        <button type="submit">Send</button>
      </form>
    </body>
    </html>
  `);
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const token = req.body['cf-turnstile-response'];
  const { email, message } = req.body;

  // 1. Check that a token was provided
  if (!token) {
    res.status(400).json({ error: 'Turnstile token missing. Did the widget load?' });
    return;
  }

  // 2. Verify the token with Cloudflare
  try {
    const verification = await verifyTurnstileToken(
      token,
      req.ip // pass the user's IP for better accuracy
    );

    if (!verification.success) {
      console.warn('Turnstile verification failed:', verification['error-codes']);
      res.status(403).json({
        error: 'Security check failed. Please try again.',
        codes: verification['error-codes'],
      });
      return;
    }

    // 3. Token is valid -- process the form
    console.log('Verified submission from:', email);
    console.log('Message:', message);
    console.log('Challenge solved at:', verification.challenge_ts);
    console.log('Hostname:', verification.hostname);

    // ... save to database, send email, etc.

    res.json({ success: true, message: 'Form submitted successfully.' });
  } catch (err) {
    console.error('Turnstile verification error:', err);
    res.status(500).json({ error: 'Internal error during security verification.' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Server-Side: Cloudflare Workers Example

If you're running on Cloudflare Workers, verification looks almost the same. The main difference is how you access the secret key (via environment bindings) and the request IP.

```typescript
// worker.ts
export interface Env {
  TURNSTILE_SECRET_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await request.json<{
      turnstileToken: string;
      email: string;
      message: string;
    }>();

    // Verify the Turnstile token
    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: body.turnstileToken,
          remoteip: request.headers.get('CF-Connecting-IP') || '',
        }).toString(),
      }
    );

    const verification = await verifyResponse.json<{
      success: boolean;
      'error-codes': string[];
    }>();

    if (!verification.success) {
      return Response.json(
        { error: 'Bot detected', codes: verification['error-codes'] },
        { status: 403 }
      );
    }

    // Token is valid -- process the request
    // ... save to D1, send via Email Workers, etc.

    return Response.json({ success: true });
  },
};
```

### Error Handling: Common Error Codes

When `siteverify` returns `success: false`, the `error-codes` array tells you why:

```typescript
// Common error codes and what they mean:
const ERROR_CODES: Record<string, string> = {
  'missing-input-secret':    'The secret key was not provided.',
  'invalid-input-secret':    'The secret key is malformed or invalid.',
  'missing-input-response':  'The token was not provided.',
  'invalid-input-response':  'The token is malformed or invalid.',
  'bad-request':             'The request was rejected as malformed.',
  'timeout-or-duplicate':    'The token has expired (300s) or has already been verified.',
  'internal-error':          'Something went wrong on Cloudflare\'s end. Retry.',
};

function getVerificationErrorMessage(codes: string[]): string {
  return codes
    .map((code) => ERROR_CODES[code] || `Unknown error: ${code}`)
    .join(' ');
}
```

The most common one you'll hit during development is `timeout-or-duplicate`. Remember: **each token can only be verified once.** If you call `siteverify` twice with the same token, the second call fails.

---

## 6. How the Flow Works

Here's the full flow from start to finish:

```
   User's Browser                     Your Server                 Cloudflare
   ---------------                    -----------                 ----------
        |                                  |                          |
   1.   | --- loads page ----------------> |                          |
        |                                  |                          |
   2.   | <--- HTML with Turnstile widget  |                          |
        |                                  |                          |
   3.   | --- Turnstile JS runs ---------------------------------->  |
        |    (invisible browser challenges)                           |
        |                                                             |
   4.   | <--- token issued (valid 300s) -------------------------   |
        |    (stored in hidden form field)                            |
        |                                  |                          |
   5.   | --- form POST with token ------> |                          |
        |                                  |                          |
   6.   |                                  | --- siteverify POST ---> |
        |                                  |    (secret + token)      |
        |                                  |                          |
   7.   |                                  | <--- { success: true } - |
        |                                  |                          |
   8.   | <--- "Form submitted!" --------- |                          |
        |                                  |                          |
```

Step by step:

1. **User visits your page.** Their browser loads the HTML, including the Turnstile script.
2. **Turnstile runs challenges invisibly.** The JavaScript runs a series of non-interactive browser challenges. The user typically sees nothing (or briefly sees a loading indicator).
3. **Turnstile generates a token.** If the challenges pass, Turnstile creates a signed token and places it in a hidden form field called `cf-turnstile-response`.
4. **User submits the form.** The token travels along with the form data to your server.
5. **Your server verifies the token.** You send the token (plus your secret key) to `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
6. **Cloudflare confirms the result.** It checks that the token is valid, hasn't expired, hasn't been used before, and was issued for your site.
7. **Your server processes the form.** If verification passed, you handle the form data normally. If it failed, you reject the request.

---

## 7. Key Concepts

### Site Key vs. Secret Key

These are the two credentials you get when you create a Turnstile widget:

| | Site Key | Secret Key |
|---|----------|------------|
| **Where** | Client-side (HTML, JavaScript) | Server-side only |
| **Visible to users?** | Yes -- it's in your page source | **Never** -- keep it in env vars |
| **Purpose** | Identifies your widget to Cloudflare | Authenticates your server to Cloudflare |
| **Example** | `0x4AAAAAAAB...` | `0x4AAAAAAAB...` (different value) |

If your secret key is ever exposed, rotate it immediately in the Cloudflare dashboard.

### Widget Modes

When you create a widget in the dashboard, you choose a mode:

- **Managed** -- Cloudflare decides the best approach. Most users pass invisibly. Some may see a brief non-interactive challenge. Rarely, a user might need to check a box. This is the recommended default.
- **Non-interactive** -- Always runs challenges in the background. Users see a widget but never need to interact with it. Good when you want a visible "I'm being protected" indicator.
- **Invisible** -- Completely hidden. No visible UI at all. The challenge runs entirely behind the scenes. Good for seamless UX but gives you no visual feedback to show users.

### The siteverify Endpoint

```
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
Content-Type: application/x-www-form-urlencoded
```

Parameters:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `secret` | Yes | Your secret key |
| `response` | Yes | The token from the client |
| `remoteip` | No | The user's IP address (improves accuracy) |
| `idempotency_key` | No | A unique key to allow retrying verification without `timeout-or-duplicate` errors |

### Token Expiration

Tokens are valid for **300 seconds (5 minutes)** from the time they're issued. After that, they expire and `siteverify` will return a `timeout-or-duplicate` error.

If your form takes a long time to fill out, use the `expired-callback` on the widget to detect expiration and call `turnstile.reset()` to get a fresh token.

### Action and cData

You can pass extra context when rendering the widget:

```typescript
turnstile.render('#container', {
  sitekey: 'YOUR_SITE_KEY',
  action: 'login',           // up to 32 alphanumeric characters
  cdata: 'session-abc-123',  // up to 255 characters, custom data
  callback: (token: string) => { /* ... */ },
});
```

These values show up in the `siteverify` response and in your Cloudflare analytics. Use `action` to distinguish between different forms on your site (e.g., `login` vs. `signup` vs. `checkout`). Use `cdata` for any custom tracking data you need.

### Appearance Customization

The widget supports some visual customization:

```typescript
turnstile.render('#container', {
  sitekey: 'YOUR_SITE_KEY',
  theme: 'dark',       // 'light', 'dark', or 'auto'
  size: 'compact',     // 'normal' or 'compact'
  language: 'fr',      // BCP 47 language code, or 'auto'
  callback: (token: string) => { /* ... */ },
});
```

Or via data attributes in HTML:

```html
<div class="cf-turnstile"
     data-sitekey="YOUR_SITE_KEY"
     data-theme="dark"
     data-size="compact"
     data-language="auto">
</div>
```

---

## 8. Widget Modes (In Depth)

### Managed Mode

This is the default and recommended mode. Cloudflare's algorithms decide what to show each user:

- **Most users (vast majority):** The challenge runs invisibly. They see nothing, or a brief loading spinner that disappears on its own.
- **Some users:** A non-interactive challenge runs visibly. The user sees the widget but doesn't need to do anything.
- **Rare edge cases:** The user sees a checkbox to confirm they're human.

Managed mode adapts automatically. As Cloudflare's detection improves, fewer users see any visible challenge. This is the best choice for most sites.

### Non-Interactive Mode

The challenge always runs visibly but never requires user interaction. The widget shows a loading animation while the challenge completes, then displays a checkmark.

Use this when:
- You want users to see that bot protection is active
- You need a consistent widget appearance across all visits
- You're replacing a visible reCAPTCHA checkbox

### Invisible Mode

Nothing is rendered on the page. The challenge runs entirely in the background. The user has zero indication that Turnstile is active.

Use this when:
- You want completely seamless UX with no visual interruption
- You're protecting API calls or programmatic form submissions
- Your design doesn't have space for a widget

The tradeoff: since there's no visible widget, you can't show users a "verifying..." state. Make sure your form handles the delay gracefully (the challenge typically takes under a second, but can take a few seconds on slow connections).

---

## 9. Common Patterns

### Pattern 1: Turnstile + Workers for Serverless Form Handling

A lightweight serverless setup where a Cloudflare Worker handles form submissions, verifies Turnstile, and stores data in D1 (Cloudflare's serverless database):

```typescript
// worker.ts -- serverless contact form with Turnstile + D1
export interface Env {
  TURNSTILE_SECRET_KEY: string;
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Send a POST', { status: 405 });
    }

    const formData = await request.formData();
    const token = formData.get('cf-turnstile-response') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    // Verify Turnstile
    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: request.headers.get('CF-Connecting-IP') || '',
        }),
      }
    );

    const result = await verifyRes.json<{ success: boolean }>();

    if (!result.success) {
      return new Response('Bot check failed', { status: 403 });
    }

    // Store in D1
    await env.DB.prepare(
      'INSERT INTO contacts (email, message, created_at) VALUES (?, ?, ?)'
    ).bind(email, message, new Date().toISOString()).run();

    return new Response('Thank you! We will be in touch.', { status: 200 });
  },
};
```

No server to maintain. No infrastructure to manage. Just deploy with `wrangler deploy`.

### Pattern 2: Turnstile in React/Vue SPAs

In single-page apps, you typically:

1. Load the Turnstile script once (on app mount or lazily before the form is shown).
2. Use explicit rendering (`turnstile.render()`) since you control when components mount.
3. Send the token as part of your API request body (not as a form field).

The React example in section 5 covers this pattern. For Vue, the approach is similar -- render in `onMounted`, clean up in `onUnmounted`:

```typescript
// useTurnstile.ts -- Vue 3 composable
import { ref, onMounted, onUnmounted } from 'vue';

export function useTurnstile(siteKey: string) {
  const token = ref<string | null>(null);
  const containerRef = ref<HTMLElement | null>(null);
  let widgetId: string | null = null;

  onMounted(() => {
    // Ensure script is loaded
    if (!document.querySelector('#cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      document.head.appendChild(script);
    }

    const interval = setInterval(() => {
      if (window.turnstile && containerRef.value) {
        clearInterval(interval);
        widgetId = window.turnstile.render(containerRef.value, {
          sitekey: siteKey,
          callback: (t: string) => {
            token.value = t;
          },
          'expired-callback': () => {
            token.value = null;
          },
        });
      }
    }, 100);
  });

  onUnmounted(() => {
    if (widgetId) {
      window.turnstile.remove(widgetId);
    }
  });

  return { token, containerRef };
}
```

### Pattern 3: Turnstile for API Endpoint Protection

You can use Turnstile to protect API endpoints, not just HTML forms. The client gets a token and sends it in a header or request body:

```typescript
// Client-side: attach token to API calls
async function callProtectedApi(data: Record<string, unknown>) {
  // Get a fresh token using the invisible widget
  const token = await new Promise<string>((resolve) => {
    turnstile.render('#hidden-container', {
      sitekey: 'YOUR_SITE_KEY',
      callback: resolve,
      size: 'invisible', // invisible widget for API calls
    });
  });

  const response = await fetch('/api/protected-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Turnstile-Token': token, // send token in a custom header
    },
    body: JSON.stringify(data),
  });

  return response.json();
}
```

```typescript
// Server-side: Express middleware for Turnstile verification
import { Request, Response, NextFunction } from 'express';
import { verifyTurnstileToken } from './turnstile';

export function requireTurnstile() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.headers['x-turnstile-token'] as string ||
      req.body?.turnstileToken ||
      req.body?.['cf-turnstile-response'];

    if (!token) {
      res.status(400).json({ error: 'Turnstile token required' });
      return;
    }

    try {
      const result = await verifyTurnstileToken(token, req.ip);

      if (!result.success) {
        res.status(403).json({ error: 'Turnstile verification failed' });
        return;
      }

      next();
    } catch {
      res.status(500).json({ error: 'Verification service unavailable' });
    }
  };
}

// Usage:
// app.post('/api/sensitive-action', requireTurnstile(), handleSensitiveAction);
```

This pattern is useful for protecting things like "forgot password" endpoints, public search APIs, or any route that could be abused by automated requests.

---

## Quick Reference

| Topic | Value |
|-------|-------|
| Client script URL | `https://challenges.cloudflare.com/turnstile/v0/api.js` |
| Siteverify endpoint | `https://challenges.cloudflare.com/turnstile/v0/siteverify` |
| Token field name | `cf-turnstile-response` |
| Token lifetime | 300 seconds (5 minutes) |
| Token usage | Single use only (one verification per token) |
| Test site key (pass) | `1x00000000000000000000AA` |
| Test site key (block) | `2x00000000000000000000AB` |
| Test secret key (pass) | `1x0000000000000000000000000000000AA` |
| Test secret key (block) | `2x0000000000000000000000000000000AB` |
| Pricing | Free, unlimited |
| Widget CSS class | `cf-turnstile` |
| Data attribute for key | `data-sitekey` |
