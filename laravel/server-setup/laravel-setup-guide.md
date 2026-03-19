# Laravel Setup Guide — macOS (M3 Pro)

Step-by-step guide to install PHP, Composer, Laravel, and run a simple server.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Install Homebrew](#2-install-homebrew)
3. [Install PHP](#3-install-php)
4. [Install Composer](#4-install-composer)
5. [Install Laravel Installer](#5-install-laravel-installer)
6. [Create a New Laravel Project](#6-create-a-new-laravel-project)
7. [Run the Development Server](#7-run-the-development-server)
8. [Project Structure Walkthrough](#8-project-structure-walkthrough)
9. [Create a Simple API](#9-create-a-simple-api)
10. [Connect to a Database (SQLite)](#10-connect-to-a-database-sqlite)
11. [Artisan Commands Cheat Sheet](#11-artisan-commands-cheat-sheet)

---

## 1. Prerequisites

Make sure you have:
- macOS with terminal access
- Admin privileges (for Homebrew installs)

That's it. No nvm, no node, no npm needed for the PHP/Laravel side.

> **Note**: Laravel also uses Node/npm for frontend assets (Vite), but that's optional for API-only projects.

---

## 2. Install Homebrew

If you already have Homebrew, skip this step.

```bash
# Check if Homebrew is installed
brew --version

# If not installed, run:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

After installing, follow the terminal instructions to add Homebrew to your PATH (it will tell you exactly what to run).

---

## 3. Install PHP

```bash
# Install PHP (latest stable version)
brew install php

# Verify installation
php --version
# Should show something like: PHP 8.3.x (cli)
```

Homebrew installs PHP with all the common extensions Laravel needs. No extra setup required.

### Optional: Multiple PHP Versions

```bash
# If you need a specific version later
brew install php@8.2
brew link php@8.2 --force
```

---

## 4. Install Composer

Composer is the package manager for PHP (like npm for Node).

```bash
# Install via Homebrew
brew install composer

# Verify
composer --version
# Should show: Composer version 2.x.x
```

### Add Composer's Global Bin to PATH

This lets you run globally installed tools (like the Laravel installer) from anywhere.

```bash
# Add to your ~/.zshrc
echo 'export PATH="$HOME/.composer/vendor/bin:$PATH"' >> ~/.zshrc

# Reload shell
source ~/.zshrc
```

---

## 5. Install Laravel Installer

```bash
# Install the Laravel installer globally
composer global require laravel/installer

# Verify
laravel --version
```

---

## 6. Create a New Laravel Project

```bash
# Navigate to where you want your project
cd ~/Desktop/laravel/server-setup

# Create a new Laravel project
laravel new my-app
```

The installer will ask you some questions:

```
Would you like to install a starter kit? → No starter kit
Which testing framework? → Pest (recommended, feels like Jest)
Which database will your application use? → SQLite (simplest for getting started)
Would you like to run the default database migrations? → Yes
```

> **Alternative**: You can also create a project with Composer directly:
> ```bash
> composer create-project laravel/laravel my-app
> ```

---

## 7. Run the Development Server

```bash
# Enter the project directory
cd my-app

# Start the dev server
php artisan serve
```

You should see:

```
INFO  Server running on [http://127.0.0.1:8000].
Press Ctrl+C to stop the server
```

Open **http://127.0.0.1:8000** in your browser. You should see the Laravel welcome page.

> **Think of it like**: `php artisan serve` = `node server.js` or `npm run dev`

### Running with Vite (for frontend assets)

If you're building with frontend assets too, open a second terminal:

```bash
npm install    # Yes, Laravel uses npm for frontend tooling
npm run dev    # Starts Vite dev server for hot reloading
```

---

## 8. Project Structure Walkthrough

Here's what matters when you're getting started:

```
my-app/
├── app/
│   ├── Http/
│   │   └── Controllers/       ← YOUR CODE: route handlers go here
│   └── Models/                ← YOUR CODE: database models go here
│
├── routes/
│   ├── api.php                ← YOUR CODE: API routes (like Express router)
│   └── web.php                ← Browser routes (with sessions, CSRF)
│
├── database/
│   ├── migrations/            ← YOUR CODE: database schema changes
│   └── seeders/               ← YOUR CODE: seed data for development
│
├── config/                    ← App configuration (reads from .env)
├── resources/views/           ← Blade templates (skip if API-only)
├── storage/                   ← Logs, cache, file uploads (auto-managed)
├── tests/                     ← YOUR CODE: tests go here
│
├── .env                       ← Environment variables (like Node .env)
├── composer.json              ← Dependencies (like package.json)
├── artisan                    ← CLI tool (run with: php artisan ...)
└── phpunit.xml                ← Test config
```

**For API development, you'll spend 90% of your time in**:
- `routes/api.php` — defining routes
- `app/Http/Controllers/` — writing controllers
- `app/Models/` — defining models
- `database/migrations/` — creating tables

---

## 9. Create a Simple API

Let's build a quick API — the Express equivalent of a "Hello World" server with CRUD.

### Step 1: Add Routes

```bash
# First, install the API routes file (Laravel 11+)
php artisan install:api
```

Now edit `routes/api.php`:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;

// Simple test route
Route::get('/hello', function () {
    return ['message' => 'Hello from Laravel!'];
});

// RESTful resource routes (creates all CRUD routes)
Route::apiResource('tasks', TaskController::class);
```

Test it:
```bash
# With the server running, open another terminal
curl http://127.0.0.1:8000/api/hello
# → {"message":"Hello from Laravel!"}
```

### Step 2: Create a Model + Migration + Controller

```bash
# This one command creates all three files at once
php artisan make:model Task -mc --api
# -m = migration, -c = controller, --api = API controller (no create/edit views)
```

### Step 3: Define the Migration

Edit `database/migrations/xxxx_xx_xx_create_tasks_table.php`:

```php
public function up(): void
{
    Schema::create('tasks', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->text('description')->nullable();
        $table->boolean('completed')->default(false);
        $table->timestamps();  // adds created_at and updated_at
    });
}
```

Run the migration:

```bash
php artisan migrate
```

### Step 4: Set Up the Model

Edit `app/Models/Task.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = ['title', 'description', 'completed'];
}
```

### Step 5: Build the Controller

Edit `app/Http/Controllers/TaskController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // GET /api/tasks
    public function index()
    {
        return Task::all();
    }

    // POST /api/tasks
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $task = Task::create($validated);

        return response()->json($task, 201);
    }

    // GET /api/tasks/{id}
    public function show(Task $task)  // Route model binding — auto finds by ID
    {
        return $task;
    }

    // PUT /api/tasks/{id}
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'completed'   => 'sometimes|boolean',
        ]);

        $task->update($validated);

        return $task;
    }

    // DELETE /api/tasks/{id}
    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json(null, 204);
    }
}
```

### Step 6: Test Your API

```bash
# Create a task
curl -X POST http://127.0.0.1:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Laravel", "description": "Coming from Express"}'

# List all tasks
curl http://127.0.0.1:8000/api/tasks

# Get one task
curl http://127.0.0.1:8000/api/tasks/1

# Update a task
curl -X PUT http://127.0.0.1:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a task
curl -X DELETE http://127.0.0.1:8000/api/tasks/1
```

### See All Your Routes

```bash
php artisan route:list
```

---

## 10. Connect to a Database (SQLite)

If you selected SQLite during project creation, it's already set up. Otherwise:

### Quick SQLite Setup

```bash
# Your .env should have:
DB_CONNECTION=sqlite
# That's it — Laravel creates database/database.sqlite automatically
```

### Switch to MySQL Later

```bash
# Install MySQL via Homebrew
brew install mysql
brew services start mysql

# Update .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=my_app
DB_USERNAME=root
DB_PASSWORD=

# Create the database
mysql -u root -e "CREATE DATABASE my_app;"

# Run migrations
php artisan migrate
```

### Switch to PostgreSQL Later

```bash
# Install PostgreSQL via Homebrew
brew install postgresql@16
brew services start postgresql@16

# Update .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=my_app
DB_USERNAME=your_mac_username
DB_PASSWORD=

# Create the database
createdb my_app

# Run migrations
php artisan migrate
```

---

## 11. Artisan Commands Cheat Sheet

### Server & Development

```bash
php artisan serve                    # Start dev server (port 8000)
php artisan serve --port=3000        # Custom port
php artisan tinker                   # Interactive REPL (like node console)
php artisan route:list               # Show all registered routes
php artisan route:list --path=api    # Filter routes by path
```

### Code Generation

```bash
php artisan make:model Post -mcf --api
# Creates: Model, Migration, Controller (API), Factory — all in one command
# -m = migration
# -c = controller
# -f = factory (for generating test data)
# --api = API controller (no create/edit methods)

php artisan make:controller PostController --api    # API controller only
php artisan make:model Post -m                      # Model + migration
php artisan make:middleware CheckAge                 # Middleware
php artisan make:request StorePostRequest            # Form request (validation)
php artisan make:seeder PostSeeder                   # Database seeder
php artisan make:test PostTest                       # Feature test
```

### Database

```bash
php artisan migrate                  # Run pending migrations
php artisan migrate:rollback         # Undo last batch of migrations
php artisan migrate:fresh            # Drop all tables + re-migrate
php artisan migrate:fresh --seed     # Drop all + re-migrate + seed
php artisan db:seed                  # Run seeders
php artisan migrate:status           # Show migration status
```

### Cache & Config

```bash
php artisan config:clear             # Clear config cache
php artisan cache:clear              # Clear app cache
php artisan view:clear               # Clear compiled views
php artisan optimize:clear           # Clear all caches at once
php artisan optimize                 # Cache config, routes, views for production
```

### Testing

```bash
php artisan test                          # Run all tests
php artisan test --filter=TaskTest        # Run specific test
php artisan test --coverage               # With code coverage
php artisan test --parallel               # Run tests in parallel
```

### Useful Debugging

```bash
php artisan route:list --json            # Routes as JSON (pipe to jq)
php artisan model:show User              # Show model details (columns, relations)
php artisan about                        # Show app environment info
```

---

## Quick Start Summary

```bash
# 1. Install tools (one-time)
brew install php composer
composer global require laravel/installer

# 2. Create project
laravel new my-app

# 3. Enter project and start server
cd my-app
php artisan serve

# 4. Create your first resource
php artisan make:model Task -mc --api

# 5. Edit these files:
#    - database/migrations/xxxx_create_tasks_table.php  (define columns)
#    - app/Models/Task.php                               (set fillable)
#    - app/Http/Controllers/TaskController.php           (write CRUD logic)
#    - routes/api.php                                    (add routes)

# 6. Run migration
php artisan migrate

# 7. Test your API
curl http://127.0.0.1:8000/api/tasks
```

You're ready to build. Refer to `laravel-for-node-developers.md` for concept mapping as you go.
