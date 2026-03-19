# Laravel for Node.js/Express Developers

A guide that maps what you already know from Express to Laravel equivalents.

---

## Table of Contents

1. [PHP Syntax Basics (vs JavaScript)](#1-php-syntax-basics-vs-javascript)
2. [Package Management: npm vs Composer](#2-package-management-npm-vs-composer)
3. [Project Structure](#3-project-structure)
4. [Routing](#4-routing)
5. [Middleware](#5-middleware)
6. [Controllers](#6-controllers)
7. [Request & Response](#7-request--response)
8. [Database & ORM: Sequelize/Prisma vs Eloquent](#8-database--orm-sequelizeprisma-vs-eloquent)
9. [Migrations](#9-migrations)
10. [Environment & Config](#10-environment--config)
11. [Authentication](#11-authentication)
12. [CLI: npm scripts vs Artisan](#12-cli-npm-scripts-vs-artisan)
13. [Templating: EJS/Pug vs Blade](#13-templating-ejspug-vs-blade)
14. [Error Handling](#14-error-handling)
15. [Testing: Jest/Mocha vs PHPUnit/Pest](#15-testing-jestmocha-vs-phpunitpest)
16. [Key Paradigm Differences](#16-key-paradigm-differences)

---

## 1. PHP Syntax Basics (vs JavaScript)

### Variables

```js
// JavaScript
const name = "John";
let age = 25;
const items = ["a", "b", "c"];
const user = { name: "John", age: 25 };
```

```php
// PHP
$name = "John";        // All variables start with $
$age = 25;
$items = ["a", "b", "c"];
$user = ["name" => "John", "age" => 25];  // Associative array (like JS object)
```

### Key Differences at a Glance

| JavaScript | PHP | Notes |
|---|---|---|
| `const` / `let` | `$variable` | No const/let — just `$` prefix |
| `===` | `===` | Same strict equality |
| `console.log()` | `dd()` or `dump()` | `dd()` = dump & die (stops execution) |
| `null` / `undefined` | `null` | PHP has no `undefined` |
| `{}` object | `[]` associative array | Or use classes/stdClass |
| `...spread` | `...` (PHP 8+) | Works for arrays and function args |
| `arrow => func` | `fn($x) => $x * 2` | Single expression only in PHP |
| `(x) => { ... }` | `function($x) { ... }` | Multi-line closures use `function` |
| Template `` `${var}` `` | `"Hello $var"` or `"Hello {$var}"` | Double quotes interpolate, single quotes don't |
| `import/require` | `use App\Models\User;` | Namespaces + autoloading (no manual imports) |
| `async/await` | Not needed | PHP is synchronous per request |
| `.map()` `.filter()` | `array_map()` `array_filter()` | Or use Laravel Collections (much nicer) |

### Type Hints (PHP 8+)

```php
// PHP supports type hints (optional but recommended)
function greet(string $name): string
{
    return "Hello, {$name}";
}

// Nullable types
function find(int $id): ?User  // ? means it can return null
{
    return User::find($id);
}
```

### Classes

```js
// JavaScript
class UserService {
    constructor(db) {
        this.db = db;
    }

    async getUser(id) {
        return await this.db.find(id);
    }
}
```

```php
// PHP
class UserService
{
    // Constructor property promotion (PHP 8+) — declares + assigns in one line
    public function __construct(
        private Database $db
    ) {}

    public function getUser(int $id): ?User
    {
        return $this->db->find($id);  // $this-> instead of this.
    }
}
```

### Collections (Laravel's killer feature for array manipulation)

```js
// JavaScript
const active = users
    .filter(u => u.active)
    .map(u => u.name)
    .sort();
```

```php
// Laravel Collections — same chaining style you're used to
$active = collect($users)
    ->filter(fn($u) => $u->active)
    ->map(fn($u) => $u->name)
    ->sort();

// Or from Eloquent (already a Collection)
$active = User::where('active', true)->pluck('name')->sort();
```

---

## 2. Package Management: npm vs Composer

| npm (Node) | Composer (PHP) |
|---|---|
| `package.json` | `composer.json` |
| `package-lock.json` | `composer.lock` |
| `node_modules/` | `vendor/` |
| `npm install` | `composer install` |
| `npm install axios` | `composer require guzzlehttp/guzzle` |
| `npm install --save-dev jest` | `composer require --dev phpunit/phpunit` |
| `npx` | `./vendor/bin/` |
| `npm run dev` | `php artisan serve` (or Composer scripts) |

**Autoloading**: PHP uses PSR-4 autoloading — no `require()` or `import` needed. Just add `use App\Models\User;` at the top and it's available. Composer handles the rest.

---

## 3. Project Structure

### Express (typical)

```
my-app/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── services/
├── .env
├── package.json
└── server.js
```

### Laravel

```
my-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/       ← Route handlers
│   │   ├── Middleware/         ← Middleware
│   │   └── Requests/          ← Form validation (like express-validator)
│   ├── Models/                ← Eloquent models (like Sequelize models)
│   └── Providers/             ← Service providers (like DI container setup)
├── routes/
│   ├── web.php                ← Browser routes (with sessions, CSRF)
│   └── api.php                ← API routes (stateless, like Express routes)
├── database/
│   ├── migrations/            ← Schema migrations
│   ├── seeders/               ← Seed data
│   └── factories/             ← Test data factories
├── config/                    ← Config files (reads from .env)
├── resources/
│   └── views/                 ← Blade templates
├── public/                    ← Static files (like Express static)
├── storage/                   ← Logs, cache, uploads
├── tests/                     ← Tests
├── .env                       ← Environment variables
├── composer.json              ← Dependencies
└── artisan                    ← CLI tool (like a Swiss army knife)
```

**Key insight**: In Express you decide the structure. In Laravel, it's decided for you — just follow the conventions.

---

## 4. Routing

### Express

```js
// routes/users.js
const express = require("express");
const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
```

### Laravel

```php
// routes/api.php
use App\Http\Controllers\UserController;

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// Or even simpler — one line does all 7 RESTful routes:
Route::apiResource('users', UserController::class);
```

### Route Groups (like Express Router mounting)

```js
// Express
app.use("/api/v1", authMiddleware, v1Router);
```

```php
// Laravel
Route::prefix('api/v1')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('posts', PostController::class);
});
```

### Route Parameters

```js
// Express — req.params.id
router.get("/users/:id", (req, res) => {
    const { id } = req.params;
});
```

```php
// Laravel — passed as function argument
Route::get('/users/{id}', function (int $id) {
    // $id is automatically extracted from the URL
});
```

---

## 5. Middleware

### Express

```js
// middleware/auth.js
const auth = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    req.user = verifyToken(token);
    next();
};

// Usage
app.use("/api", auth);
router.get("/profile", auth, getProfile);
```

### Laravel

```php
// app/Http/Middleware/EnsureTokenIsValid.php
class EnsureTokenIsValid
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->bearerToken()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}

// Usage in routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
});
```

**Key difference**: Laravel middleware is registered by name in `bootstrap/app.php`, then referenced by that name in routes. Express middleware is just a function you pass directly.

---

## 6. Controllers

### Express (route handler)

```js
// controllers/userController.js
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
```

### Laravel (controller class)

```php
// app/Http/Controllers/UserController.php
class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
        // Or even shorter — Laravel auto-converts to JSON:
        // return User::all();
    }

    public function show(int $id)
    {
        $user = User::findOrFail($id);  // Auto 404 if not found
        return $user;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users',
        ]);

        $user = User::create($validated);
        return response()->json($user, 201);
    }
}
```

**Generate a controller**: `php artisan make:controller UserController --api`

This creates a controller with `index`, `store`, `show`, `update`, `destroy` methods — matching RESTful conventions.

---

## 7. Request & Response

### Getting Request Data

```js
// Express
app.post("/users", (req, res) => {
    const { name, email } = req.body;    // Body
    const { page } = req.query;          // Query string
    const { id } = req.params;           // URL params
    const token = req.headers.authorization; // Headers
});
```

```php
// Laravel
public function store(Request $request)
{
    $name  = $request->input('name');      // Body
    $page  = $request->query('page');      // Query string
    // $id comes from route parameter (function argument)
    $token = $request->header('Authorization'); // Headers

    // Or grab everything:
    $all = $request->all();

    // Only specific fields (like pick/lodash):
    $data = $request->only(['name', 'email']);
}
```

### Sending Responses

```js
// Express
res.json({ message: "ok" });
res.status(201).json(user);
res.status(404).json({ error: "Not found" });
```

```php
// Laravel
return response()->json(['message' => 'ok']);
return response()->json($user, 201);
return response()->json(['error' => 'Not found'], 404);

// Shorthand — return any array/model and it auto-becomes JSON in API routes
return $user;
return ['message' => 'ok'];
```

---

## 8. Database & ORM: Sequelize/Prisma vs Eloquent

### Model Definition

```js
// Sequelize
const User = sequelize.define("User", {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
});
```

```php
// Laravel Eloquent — app/Models/User.php
class User extends Model
{
    // That's it. Laravel auto-maps to `users` table.
    // Columns are discovered from the database — no need to redefine them.

    // Specify which fields can be mass-assigned (security feature)
    protected $fillable = ['name', 'email'];
}
```

### Common Queries

| Operation | Sequelize / Prisma | Eloquent |
|---|---|---|
| Find all | `User.findAll()` | `User::all()` |
| Find by ID | `User.findByPk(1)` | `User::find(1)` |
| Find or 404 | Manual check | `User::findOrFail(1)` |
| Where | `User.findAll({ where: { active: true } })` | `User::where('active', true)->get()` |
| Create | `User.create({ name: "John" })` | `User::create(['name' => 'John'])` |
| Update | `user.update({ name: "Jane" })` | `$user->update(['name' => 'Jane'])` |
| Delete | `user.destroy()` | `$user->delete()` |
| Count | `User.count()` | `User::count()` |
| With relation | `User.findAll({ include: Post })` | `User::with('posts')->get()` |
| Paginate | Manual | `User::paginate(15)` |

### Relationships

```php
// app/Models/User.php
class User extends Model
{
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}

// app/Models/Post.php
class Post extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

// Usage
$user = User::with('posts')->find(1);
$user->posts;  // Collection of posts
$post->user;   // The user who wrote the post
```

---

## 9. Migrations

### Sequelize

```js
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("users", {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: { type: Sequelize.STRING },
            email: { type: Sequelize.STRING, unique: true },
        });
    },
    down: async (queryInterface) => {
        await queryInterface.dropTable("users");
    },
};
```

### Laravel

```php
// database/migrations/2024_01_01_000000_create_users_table.php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();                // Auto-increment bigint PK
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamps();        // created_at & updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

```bash
# Create migration
php artisan make:migration create_posts_table

# Run migrations
php artisan migrate

# Rollback
php artisan migrate:rollback

# Fresh start (drop all + re-migrate)
php artisan migrate:fresh

# Fresh + seed
php artisan migrate:fresh --seed
```

---

## 10. Environment & Config

Both use `.env` files, but Laravel adds a layer on top:

```bash
# .env (same concept as Node)
APP_NAME=MyApp
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=myapp
DB_USERNAME=root
DB_PASSWORD=secret
```

```php
// Accessing env values — NEVER use env() directly in code
// Instead, use config files:

// config/database.php
'mysql' => [
    'host' => env('DB_HOST', '127.0.0.1'),  // env() with default
    'database' => env('DB_DATABASE', 'forge'),
],

// In your code, use config():
$host = config('database.connections.mysql.host');
```

**Why this extra layer?** Laravel caches config for performance. After caching, `env()` returns null — only `config()` works. Always go through config files.

---

## 11. Authentication

### Express (manual with JWT/Passport)

```js
// You build it yourself or use passport.js
const jwt = require("jsonwebtoken");
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
```

### Laravel (batteries included)

```bash
# Install Sanctum (API token auth — like JWT but simpler)
php artisan install:api

# Or install Breeze (full auth scaffolding with login/register pages)
composer require laravel/breeze --dev
php artisan breeze:install api
```

```php
// Protecting routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());
});

// Issuing tokens
$token = $user->createToken('api-token')->plainTextToken;

// Revoking tokens
$request->user()->currentAccessToken()->delete();
```

**Key insight**: Laravel gives you auth out of the box. You don't build it from scratch like in Express.

---

## 12. CLI: npm scripts vs Artisan

Artisan is Laravel's CLI tool — it replaces npm scripts and adds code generation.

| Task | Node/Express | Laravel |
|---|---|---|
| Start dev server | `npm run dev` | `php artisan serve` |
| Run migrations | `npx sequelize db:migrate` | `php artisan migrate` |
| Create controller | Manually create file | `php artisan make:controller UserController` |
| Create model | Manually create file | `php artisan make:model User -m` (-m = with migration) |
| Create middleware | Manually create file | `php artisan make:middleware CheckAge` |
| Seed database | Custom script | `php artisan db:seed` |
| Clear cache | `rm -rf .cache` | `php artisan cache:clear` |
| Interactive REPL | `node` | `php artisan tinker` |
| List all routes | — | `php artisan route:list` |
| Run tests | `npm test` | `php artisan test` |

**Tinker** is incredibly useful — it's like the Node REPL but with your entire Laravel app loaded:

```bash
php artisan tinker

>>> User::count()
=> 42
>>> User::factory()->create(['name' => 'Test'])
=> App\Models\User { id: 43, name: "Test" ... }
```

---

## 13. Templating: EJS/Pug vs Blade

If you're building APIs only, you can skip this. But if you ever need server-rendered views:

```html
<!-- EJS -->
<h1><%= user.name %></h1>
<% if (user.admin) { %>
    <span>Admin</span>
<% } %>
<% users.forEach(user => { %>
    <li><%= user.name %></li>
<% }) %>
```

```html
<!-- Blade (resources/views/profile.blade.php) -->
<h1>{{ $user->name }}</h1>
@if ($user->admin)
    <span>Admin</span>
@endif
@foreach ($users as $user)
    <li>{{ $user->name }}</li>
@endforeach
```

```php
// Returning a view from a controller
return view('profile', ['user' => $user]);
```

---

## 14. Error Handling

### Express

```js
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
});
```

### Laravel

Laravel handles errors automatically via `app/Exceptions/`:

```php
// In bootstrap/app.php — customize error rendering
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->render(function (NotFoundHttpException $e) {
        return response()->json(['error' => 'Not found'], 404);
    });
})
```

**Built-in niceties**:
- `findOrFail()` → auto 404
- `validate()` → auto 422 with error messages
- `authorize()` → auto 403
- Unhandled exceptions → auto 500 with stack trace in dev, generic message in prod

---

## 15. Testing: Jest/Mocha vs PHPUnit/Pest

### Jest

```js
describe("UserController", () => {
    it("should return all users", async () => {
        const res = await request(app).get("/api/users");
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });
});
```

### Laravel (Pest — the modern, Jest-like option)

```php
// tests/Feature/UserTest.php
it('returns all users', function () {
    User::factory()->count(3)->create();

    $response = $this->getJson('/api/users');

    $response->assertStatus(200)
             ->assertJsonCount(3);
});

it('creates a user', function () {
    $response = $this->postJson('/api/users', [
        'name' => 'John',
        'email' => 'john@example.com',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
});
```

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/UserTest.php

# With coverage
php artisan test --coverage
```

---

## 16. Key Paradigm Differences

### 1. Sync vs Async

```js
// Node — everything is async
const users = await User.findAll();
const posts = await Post.findAll();
// These run sequentially unless you Promise.all() them
```

```php
// PHP — synchronous, but that's fine
$users = User::all();
$posts = Post::all();
// Each request is its own process, so blocking is normal
// No callback hell, no async/await complexity
```

### 2. Shared vs Isolated Process

- **Node**: Single process, shared memory. Global state persists across requests.
- **PHP/Laravel**: Each request starts fresh. No shared state between requests (this eliminates an entire class of bugs).

### 3. Dependency Injection

Laravel heavily uses DI through its "Service Container":

```php
// Instead of importing and instantiating:
public function index(UserService $service)  // Laravel auto-injects this
{
    return $service->getActiveUsers();
}
```

This is like having an automatic DI container built in — no need for `awilix` or `tsyringe`.

### 4. Convention over Configuration

Express: you decide everything (folder structure, naming, patterns).
Laravel: conventions are set — follow them and things "just work" (routing, model-table mapping, controller methods, etc.).

---

## Quick Reference: "How do I do X?"

| In Express... | In Laravel... |
|---|---|
| `npm init` | `laravel new my-app` |
| `node server.js` | `php artisan serve` |
| `req.body` | `$request->input('key')` |
| `req.params.id` | Route param as function arg |
| `req.query.page` | `$request->query('page')` |
| `res.json(data)` | `return response()->json($data)` or just `return $data` |
| `res.status(201).json(data)` | `return response()->json($data, 201)` |
| express-validator | `$request->validate([...])` |
| `app.use(middleware)` | `->middleware('name')` in routes |
| `process.env.KEY` | `config('file.key')` |
| Sequelize model | Eloquent model |
| `npx sequelize db:migrate` | `php artisan migrate` |
| Passport.js / JWT | Laravel Sanctum |
| Jest / Mocha | Pest / PHPUnit |
| `node` REPL | `php artisan tinker` |
| `console.log()` | `dd()`, `dump()`, `Log::info()` |
| Postman | Postman (same) or `php artisan tinker` |
