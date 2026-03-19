# Claude Skills — Complete Developer Guide

> How to use SKILL.md to make Claude follow your team's exact patterns, every session, without re-explaining anything.

---

## What is a SKILL.md?

A `SKILL.md` is a **markdown instruction file** you create once that tells Claude:
- What tools to use
- What patterns to follow
- What rules to never break
- How to verify its own output

Think of it as a **SOP (Standard Operating Procedure)** for Claude — version-controlled in your repo, shared across your team, and referenced in a single short prompt instead of a long repeated one.

---

## How Claude Reads It

Skills use a **3-layer loading system**:

```
Layer 1 — Metadata (always available, ~100 words)
          name + description in the frontmatter
                    ↓  Claude decides to trigger
Layer 2 — SKILL.md body (loaded on demand, <500 lines)
          your rules, patterns, commands, examples
                    ↓  Claude reads referenced files
Layer 3 — Bundled resources (loaded only when needed)
          scripts/, references/, assets/
```

Claude does **not** load everything upfront — only what's needed for the task.

---

## ⚠️ Auto-Detection: The Honest Truth

| Environment | Auto-Detects SKILL.md? |
|---|---|
| **claude.ai** | ✅ Yes — Anthropic pre-loads skills from `/mnt/skills/` |
| **Claude Code (VS Code)** | ❌ No — you must reference it explicitly in your prompt |

**In Claude Code, you always trigger it manually:**

```
Read .claude/skills/api-tests/SKILL.md then write tests for POST /api/payments/charge
```

---

## Folder Structure

### Minimal Setup (single skill)

```
project/
└── .claude/
    └── skills/
        └── api-tests/
            └── SKILL.md
```

### Full Team Setup (multiple skills)

```
project/
├── src/
├── __tests__/
└── .claude/
    └── skills/
        ├── api-tests/          → write integration tests
        │   └── SKILL.md
        ├── db-migrations/      → write database migrations
        │   └── SKILL.md
        ├── pr-review/          → review PRs to team standards
        │   └── SKILL.md
        └── docker-deploy/      → deploy to staging/prod
            ├── SKILL.md
            └── references/
                ├── aws.md
                └── gcp.md
```

### Skill With Bundled Resources

```
api-tests/
├── SKILL.md                  ← core instructions (required)
├── references/
│   ├── auth-patterns.md      ← loaded when Claude needs auth details
│   └── db-helpers.md         ← loaded when Claude needs DB details
├── scripts/
│   └── seed_test_db.py       ← executable scripts Claude can run
└── assets/
    └── test-template.js      ← boilerplate Claude can copy from
```

---

## SKILL.md Anatomy

```markdown
---
name: api-tests
description: Write integration tests for our API endpoints. Use this
skill whenever the user asks to write tests, add coverage, test an
endpoint, or mentions "integration test". Always trigger this — our
patterns differ significantly from standard Jest examples.
---

# API Integration Test Skill

## Stack
- Jest + Supertest
- Auth: authHelper.getToken('admin') for bearer token
- DB: testDb.seed() in beforeEach, testDb.cleanup() in afterEach

## Pattern
[your code examples here]

## Rules
- NEVER use axios directly — always Supertest
- NEVER skip testDb.seed()
- ALWAYS follow AAA: Arrange, Act, Assert
```

### Frontmatter Fields

| Field | Purpose | Required |
|---|---|---|
| `name` | Skill identifier | ✅ Yes |
| `description` | When to trigger + what it does | ✅ Yes |
| `compatibility` | Required tools/dependencies | Optional |

### Description Writing Tips

❌ **Weak trigger** (Claude might ignore it):
```yaml
description: Helps with deployment tasks.
```

✅ **Strong trigger** (Claude reliably uses it):
```yaml
description: Deploy our app to AWS/GCP. Use this skill whenever the
user mentions deploy, release, push to prod, CI/CD, or environment
promotion — even for simple deploy questions. Our infra differs from
standard tutorials.
```

Make the description **specific and explicit**. Claude reads all available skill descriptions and decides which to load — vague descriptions get skipped.

---

## Before vs After SKILL.md

### The Endpoint Being Tested

```javascript
// routes/payments.js
router.post('/api/payments/charge', authenticate, async (req, res) => {
  const { amount, currency, customerId } = req.body;
  const result = await stripe.charge({ amount, currency, customerId });
  res.status(201).json({ chargeId: result.id, status: result.status });
});
```

---

### ❌ BEFORE — No SKILL.md

Every session, every developer writes this:

```
Write integration tests for POST /api/payments/charge

Context you need to know:
- We use Jest + Supertest (NOT axios directly in tests)
- Auth: use authHelper.getToken('admin') to get bearer token
- Always call testDb.seed() in beforeEach — never assume clean DB state
- Always call testDb.cleanup() in afterEach
- Base URL comes from process.env.TEST_API_URL
- For Stripe, use our mock: jest.mock('../services/stripe', () => mockStripe)
- mockStripe.charge() should return { id: 'ch_test_123', status: 'succeeded' }
- Test file goes in __tests__/integration/payments.test.js
- We follow AAA pattern: Arrange, Act, Assert
- Error cases: test 400 for missing fields, 401 for no auth, 422 for invalid amount
- We never test Stripe internals — only our API response shape
- Coverage must include: success case, missing body fields, unauthorized, invalid currency

Write the full test file now.
```

**Problems with this approach:**
- 20+ lines rewritten every single session
- New team members don't know these conventions — inconsistent output
- If patterns change, you have to update every chat, every developer
- Copy-paste errors, forgotten rules, missing coverage
- No single source of truth

---

### ✅ AFTER — With SKILL.md

**Step 1: Create the skill once (lives in git forever)**

**`.claude/skills/api-tests/SKILL.md`:**

```markdown
---
name: api-tests
description: Write integration tests for our API endpoints. Use this
skill whenever the user asks to write tests, add test coverage, test
an endpoint, or mentions "integration test". Always use this — our
patterns differ significantly from standard Jest examples online.
---

# API Integration Test Skill

## Stack
- Jest + Supertest
- Auth: `authHelper.getToken('admin')` for bearer token
- DB: `testDb.seed()` in beforeEach, `testDb.cleanup()` in afterEach
- Base URL: `process.env.TEST_API_URL`
- Stripe: always mock via `jest.mock('../services/stripe', () => mockStripe)`
- Mock return: `{ id: 'ch_test_123', status: 'succeeded' }`
- File location: `__tests__/integration/<resource>.test.js`

## Required Test Cases (every endpoint)
1. Success case (201/200 with correct response shape)
2. Unauthorized (401 — no token)
3. Missing required fields (400)
4. Invalid field values (422)

## Pattern

\`\`\`javascript
const request = require('supertest');
const app = require('../../app');
const { authHelper } = require('../helpers/auth');
const { testDb } = require('../helpers/db');

jest.mock('../services/stripe', () => ({
  charge: jest.fn()
}));
const mockStripe = require('../services/stripe');

describe('POST /api/payments/charge', () => {
  let token;

  beforeEach(async () => {
    await testDb.seed();
    token = await authHelper.getToken('admin');
    mockStripe.charge.mockResolvedValue({ id: 'ch_test_123', status: 'succeeded' });
  });

  afterEach(async () => {
    await testDb.cleanup();
    jest.clearAllMocks();
  });

  it('charges successfully with valid payload', async () => {
    // Arrange
    const payload = { amount: 5000, currency: 'usd', customerId: 'cus_123' };

    // Act
    const res = await request(app)
      .post('/api/payments/charge')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('chargeId');
    expect(res.body.status).toBe('succeeded');
  });

  it('returns 401 when no token provided', async () => {
    const res = await request(app)
      .post('/api/payments/charge')
      .send({ amount: 5000, currency: 'usd', customerId: 'cus_123' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/payments/charge')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000 }); // missing currency and customerId

    expect(res.status).toBe(400);
  });

  it('returns 422 for invalid amount', async () => {
    const res = await request(app)
      .post('/api/payments/charge')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: -100, currency: 'usd', customerId: 'cus_123' });

    expect(res.status).toBe(422);
  });
});
\`\`\`

## Rules
- NEVER use axios directly — always Supertest
- NEVER skip testDb.seed() — never assume clean state
- NEVER test Stripe internals — only test your API's response shape
- ALWAYS follow AAA: Arrange, Act, Assert
- ALWAYS clear mocks in afterEach
```

**Step 2: Developer prompt (every session after)**

```
Read .claude/skills/api-tests/SKILL.md then write tests for
POST /api/payments/charge defined in routes/payments.js
```

That's it. **One line instead of twenty. Claude reads the skill and follows every rule.**

---

## Before vs After Comparison Table

| | ❌ Before SKILL.md | ✅ After SKILL.md |
|---|---|---|
| **Prompt length** | 20+ lines of context every session | 1 line + skill reference |
| **Consistency** | Depends on who wrote the prompt | Always identical patterns |
| **New team member** | Must learn all conventions manually | Just references the skill |
| **Pattern changes** | Update every chat, every developer | Update one file in git |
| **Source of truth** | Nowhere / in people's heads | SKILL.md in version control |
| **Session memory** | Claude forgets everything | Skill file never forgets |

---

## Sample Prompts — Real Developer Usage

### Writing Tests

```
Read .claude/skills/api-tests/SKILL.md then write integration tests
for POST /api/payments/charge in routes/payments.js
```

### Database Migrations

```
Read .claude/skills/db-migrations/SKILL.md then write a migration
to add a `subscription_tier` column to the users table
```

### PR Review

```
Read .claude/skills/pr-review/SKILL.md then review the diff in
this PR against our team standards
```

### Deployment

```
Read .claude/skills/docker-deploy/SKILL.md then help me deploy
the current main branch to staging
```

### Multiple Skills in One Prompt

```
Read .claude/skills/api-tests/SKILL.md and .claude/skills/pr-review/SKILL.md
then review these new test files I wrote and check if they follow our standards
```

---

## How Teams Scale This

```
.claude/skills/
├── api-tests/SKILL.md        → "write tests for X endpoint"
├── db-migrations/SKILL.md    → "write migration for new users table"
├── pr-review/SKILL.md        → "review this PR for our standards"
└── docker-deploy/SKILL.md    → "deploy staging build"
```

### VS Code Snippet Setup

Save these as editor snippets so every developer uses the same prefix:

```json
// .vscode/claude-snippets.code-snippets
{
  "Claude API Tests": {
    "prefix": "ctest",
    "body": "Read .claude/skills/api-tests/SKILL.md then $1"
  },
  "Claude DB Migration": {
    "prefix": "cmigrate",
    "body": "Read .claude/skills/db-migrations/SKILL.md then $1"
  },
  "Claude PR Review": {
    "prefix": "creview",
    "body": "Read .claude/skills/pr-review/SKILL.md then $1"
  },
  "Claude Deploy": {
    "prefix": "cdeploy",
    "body": "Read .claude/skills/docker-deploy/SKILL.md then $1"
  }
}
```

Developer types `ctest` → tab → autocompletes to the full skill reference.

### Git Workflow

```bash
# Skills are committed to the repo like any other file
git add .claude/skills/
git commit -m "add api-tests skill with our Jest patterns"
git push

# New team member onboards:
git clone your-repo
# All skills immediately available — no setup needed
```

---

## Iteration: Improving Your Skill Over Time

```
1. IDENTIFY a repeated task
   "I keep explaining our migration format..."
         ↓
2. DRAFT a SKILL.md
   Ask Claude: "Help me write a skill for writing DB migrations
   using our knex.js setup"
         ↓
3. TEST with real prompts
   Use it on 2-3 real tasks, see if Claude follows the rules
         ↓
4. EVALUATE
   Did it miss anything? Add it to the Rules section
         ↓
5. ITERATE
   Push updates to git — team gets improvements automatically
         ↓
6. SHARE
   Package as .skill file for teams outside your repo:
   python -m scripts.package_skill .claude/skills/api-tests/
```

---

## Key Rules for Writing Good Skills

1. **Keep SKILL.md under 500 lines** — if longer, split into `references/` files and link them
2. **Make description specific and "pushy"** — vague descriptions don't trigger
3. **Lead with the stack/tools** — Claude needs to know what's available immediately
4. **Include real code examples** — not pseudocode, actual working patterns
5. **Write the "never do this" rules** — these are learned from real failures
6. **Add a QA section** — tell Claude how to verify its own output
7. **Version it in git** — it's documentation, treat it like code

---

## Summary

> A `SKILL.md` is a one-time investment that eliminates repeated context. You write your team's conventions once, Claude follows them forever.

**The workflow in one line:**

```
Create SKILL.md once → reference it in prompt → Claude follows your exact patterns
```

**The team benefit in one line:**

```
One file in git → consistent AI output across every developer, every session
```
