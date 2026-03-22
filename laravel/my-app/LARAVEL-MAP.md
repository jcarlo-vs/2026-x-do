# Laravel Project Map — For Node/Express Developers

A quick reference to understand where everything lives and how it connects.

---

## Express vs Laravel — Side by Side

| Express (what you know)          | Laravel (where to find it)                |
|----------------------------------|-------------------------------------------|
| `app.js` / `server.js`          | `bootstrap/app.php` — app config, middleware, routes registration |
| `app.listen(3000)`              | `php artisan serve` or `composer run dev` |
| `router.get('/users', ...)`     | `routes/web.php` or `routes/api.php`      |
| Controller / route handler      | `app/Http/Controllers/`                   |
| `express.json()` middleware      | Built-in, just works                      |
| Custom middleware                | `app/Http/Middleware/`                     |
| Mongoose model                  | `app/Models/`                              |
| Migration files                 | `database/migrations/`                     |
| Seed data                       | `database/seeders/`                        |
| Factory (test data)             | `database/factories/`                      |
| `.env`                          | `.env` (same concept)                      |
| `package.json`                  | `composer.json` (PHP deps) + `package.json` (frontend deps) |
| `node_modules/`                 | `vendor/` (PHP) + `node_modules/` (frontend) |
| `npm install`                   | `composer install` (PHP) + `npm install` (frontend) |
| Jest / Mocha                    | `tests/` using Pest (this project)         |
| EJS / Handlebars templates      | `resources/views/` using Blade templates   |
| `public/` static files          | `public/` (same concept)                   |

---

## Folder-by-Folder Breakdown

### `routes/` — Where URLs are defined

```
routes/
├── web.php       ← Browser routes (returns HTML views, has sessions/CSRF)
└── console.php   ← Artisan CLI commands (like custom npm scripts)
```

- **No `api.php` yet** — run `php artisan install:api` to add it
- `web.php` = routes that return pages (like Express + EJS)
- `api.php` = routes that return JSON (like your Express APIs)

### `app/Http/Controllers/` — Route handlers

```
app/Http/Controllers/
└── Controller.php   ← Base controller (others extend this)
```

- Create new ones with: `php artisan make:controller TaskController --api`
- Each method maps to a route (index, store, show, update, destroy)
- Think of it as: one controller = one Express router file

### `app/Models/` — Database models (like Mongoose schemas)

```
app/Models/
└── User.php   ← Built-in user model
```

- Create new ones with: `php artisan make:model Task -m` (also creates migration)
- Unlike Mongoose, you don't define fields here — the migration defines the columns
- The model defines: which fields are writable (`$fillable`), relationships, and query scopes

### `database/` — Everything database

```
database/
├── database.sqlite          ← Your SQLite database file
├── migrations/
│   ├── create_users_table   ← Defines users table columns
│   ├── create_cache_table   ← Framework cache table
│   └── create_jobs_table    ← Queue jobs table
├── factories/
│   └── UserFactory.php      ← Generates fake users for testing
└── seeders/
    └── DatabaseSeeder.php   ← Populates DB with test data
```

- **Migrations** = version-controlled schema changes (like knex migrations)
- Run with: `php artisan migrate`
- Rollback with: `php artisan migrate:rollback`
- Reset everything: `php artisan migrate:fresh --seed`

### `bootstrap/app.php` — The app entry point

This is where Laravel wires everything together:
- Registers route files (web.php, api.php)
- Registers middleware
- Registers exception handlers

Think of it as your Express `app.js` where you do `app.use()` for middleware and mount routers.

### `config/` — Configuration files

```
config/
├── app.php          ← App name, timezone, locale
├── auth.php         ← Authentication settings
├── database.php     ← DB connections (sqlite, mysql, pgsql)
├── cache.php        ← Cache driver settings
├── mail.php         ← Email settings
├── queue.php        ← Background job settings
├── session.php      ← Session configuration
└── ...
```

- These read from `.env` using `env('KEY', 'default')`
- In your code, always use `config('database.default')`, never `env()` directly

### `resources/` — Frontend assets

```
resources/
├── views/     ← Blade templates (.blade.php) — like EJS/Handlebars
├── css/       ← Stylesheets (processed by Vite)
└── js/        ← JavaScript (processed by Vite)
```

- Skip this entirely if you're building API-only
- Blade = Laravel's template engine: `{{ $variable }}`, `@if`, `@foreach`

### `tests/` — Test files

```
tests/
├── Feature/     ← Integration tests (hit routes, test full flow)
├── Unit/        ← Unit tests (test isolated functions)
├── Pest.php     ← Pest configuration
└── TestCase.php ← Base test class
```

- This project uses **Pest** (clean syntax, similar feel to Jest)
- Run all tests: `php artisan test`
- Run specific: `php artisan test --filter=TaskTest`

### `storage/` — Auto-managed files

```
storage/
├── app/        ← File uploads
├── framework/  ← Cache, sessions, compiled views
└── logs/       ← Application logs (laravel.log)
```

- You rarely touch this directly
- Check `storage/logs/laravel.log` when debugging errors

### `public/` — Web root

```
public/
├── index.php   ← Entry point (don't touch)
├── favicon.ico
└── build/      ← Compiled Vite assets (after npm run build)
```

- Only files in `public/` are accessible via browser
- Static assets (images, fonts) go here

---

## How a Request Flows

```
Browser/Postman
    ↓
public/index.php
    ↓
bootstrap/app.php (loads middleware, routes)
    ↓
routes/web.php or routes/api.php (matches URL)
    ↓
Middleware (auth, CSRF, etc.)
    ↓
Controller method (your logic)
    ↓
Model (database query via Eloquent)
    ↓
Response (JSON or Blade view)
```

Express equivalent:
```
Request → app.js → router → middleware → handler → mongoose → res.json()
```

---

## Key Commands Cheat Sheet

| What you want to do                  | Command                                      |
|--------------------------------------|----------------------------------------------|
| Start server                         | `php artisan serve` or `composer run dev`     |
| Create controller                    | `php artisan make:controller Name --api`      |
| Create model + migration             | `php artisan make:model Name -m`              |
| Create model + migration + controller| `php artisan make:model Name -mc --api`       |
| Run migrations                       | `php artisan migrate`                         |
| Undo last migration                  | `php artisan migrate:rollback`                |
| See all routes                       | `php artisan route:list`                      |
| Add API routes file                  | `php artisan install:api`                     |
| Run tests                            | `php artisan test`                            |
| Interactive REPL (like node console) | `php artisan tinker`                          |
| Format code                          | `vendor/bin/pint`                             |

---

## Quick Start: Adding a New Feature

Say you want to add a "tasks" API:

```bash
# 1. Create model, migration, and controller at once
php artisan make:model Task -mc --api --no-interaction

# 2. Edit the migration to define columns
#    database/migrations/xxxx_create_tasks_table.php

# 3. Edit the model to set fillable fields
#    app/Models/Task.php

# 4. Edit the controller with CRUD logic
#    app/Http/Controllers/TaskController.php

# 5. Add API routes (install api.php first if needed)
php artisan install:api
#    Then add to routes/api.php:
#    Route::apiResource('tasks', TaskController::class);

# 6. Run migration
php artisan migrate

# 7. Test it
curl http://127.0.0.1:8000/api/tasks
```
