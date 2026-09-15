# Post App — Project Structure & Coding Conventions

> **Instructions for AI code generators (ChatGPT, Claude, Copilot, etc.)**
>
> This document is the single source of truth for how this project is organized.
> When generating or modifying code for this project you MUST:
>
> 1. Use **exactly** the folder structure, file names, and naming patterns described here.
> 2. **NOT** introduce frameworks, libraries, or patterns that are not listed here
>    (no Laravel, Slim, Composer autoloading, Express, React, Vue, jQuery, Axios, TypeScript, Tailwind, SPA routers, etc.).
> 3. Follow the code templates in this document when adding new features (new resource, new page, new API call).
> 4. Keep the same response format, error format, and auth flow.
> 5. When unsure, copy the pattern of the closest existing file (e.g. new resource = copy the `Post` pattern).

---

## 1. Overview

| Part | Tech | Location |
|------|------|----------|
| Backend | Plain PHP 8.2 (no framework, no Composer), PDO + MySQL/MariaDB | `C:\xampp\htdocs\post-app\` (root) |
| Frontend | Vanilla JavaScript (ES modules), Vite 8 (multi-page), Bootstrap 5.3 | `C:\xampp\htdocs\post-app\post-app-frontend\` |
| Server | XAMPP (Apache + mod_rewrite + MySQL) | |
| Database | MySQL database named `post-app` | dump in `database/post-app.sql` |

**Architecture:** MVC-style REST API (Router → Middleware → Controller → Model → PDO).
Frontend is a **multi-page app** (one `.html` file per page + one JS file per page), talking to the API with `fetch` and a Bearer token stored in `localStorage`.

**URLs**

| What | URL |
|------|-----|
| API base (direct) | `http://localhost/post-app/public/api` |
| Frontend dev server | `http://localhost:5173` |
| API from frontend (through Vite proxy) | `/api` |

---

## 2. Full Directory Tree

```
post-app/
├── .gitignore
├── API_DOCUMENTATION.md          # Endpoint reference (paths, payloads, responses)
├── PROJECT_STRUCTURE.md          # This file
│
├── config/
│   └── database.php              # Creates global $pdo (PDO connection)
│
├── controllers/
│   ├── AuthController.php        # register(), login()
│   └── PostController.php        # index(), create(), show(), update(), delete()
│
├── database/
│   └── post-app.sql              # Full DB schema + data dump
│
├── middleware/
│   └── AuthMiddleware.php        # authenticate(): validates Bearer token, returns user id
│
├── models/
│   ├── Post.php                  # SQL for posts table
│   └── User.php                  # SQL for users + user_tokens tables
│
├── public/                       # ONLY web-accessible folder (document root of API)
│   ├── .htaccess                 # Rewrites all requests to index.php
│   └── index.php                 # Front controller: CORS, JSON header, requires, bootstraps
│
├── routes/
│   └── api.php                   # Manual router (if blocks), wires routes → controllers
│
└── post-app-frontend/
    ├── .env                      # VITE_API_BASE_URL=/api
    ├── package.json              # deps: bootstrap; devDeps: vite
    ├── vite.config.js            # port 5173, /api proxy, multi-page build inputs
    │
    ├── index.html                # Entry: redirects to login or posts
    ├── login.html                # Login page (no navbar, centered card)
    ├── register.html             # Register page (no navbar, centered card)
    ├── posts.html                # Posts page (navbar + list + create/edit modal)
    │
    ├── public/                   # Static files copied as-is (favicon.svg, icons.svg)
    │
    └── src/
        ├── main.js               # Shared setup: Bootstrap JS → window.bootstrap
        ├── index.js              # Redirect logic for index.html
        │
        ├── api/
        │   ├── http.js           # request(): fetch wrapper (base URL, token, errors, 401)
        │   ├── auth.api.js       # login(), register()
        │   └── posts.api.js      # getPosts(), getPost(), createPost(), updatePost(), deletePost()
        │
        ├── assets/
        │   └── css/
        │       ├── main.css      # CSS entry: @import bootstrap + app.css
        │       └── app.css       # Custom app styles
        │
        ├── auth/
        │   └── auth.guard.js     # requireAuth(): redirect to login if no token
        │
        ├── config/
        │   └── config.js         # config.apiBaseUrl from import.meta.env
        │
        ├── pages/
        │   ├── login/
        │   │   └── login.js
        │   ├── register/
        │   │   └── register.js
        │   └── posts/
        │       └── posts.js
        │
        └── utils/
            ├── alert.js          # showSuccess(), showError() into #alert-container
            └── storage.js        # localStorage helpers for token/user/expiry
```

---

## 3. Database Schema

Database name: `post-app`. Engine InnoDB, charset `utf8mb4`.

```sql
CREATE TABLE users (
  id          INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,              -- password_hash() output
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id          INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  user_id     INT(11) NOT NULL,                   -- FK → users.id
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_tokens (
  id          INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     INT(11) NOT NULL,                   -- FK → users.id
  token       VARCHAR(255) NOT NULL,              -- bin2hex(random_bytes(32))
  expires_at  DATETIME NOT NULL,                  -- login time + 7 days
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Conventions:** table names plural snake_case; columns snake_case; every table has `id` + `created_at`; ownership via `user_id`.

---

## 4. Backend (PHP)

### 4.1 Rules

- Plain PHP classes, **no namespaces**, **no Composer**, **no autoloader**. Files are loaded with `require_once` in `public/index.php`.
- **One class per file**, file name = class name (PascalCase): `PostController.php` → `class PostController`.
- Folders: `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `public/`. Do not add `src/`, `app/`, `services/`, `repositories/`, etc.
- All output is JSON. `Content-Type: application/json` is set once in `public/index.php`.
- Use **PDO prepared statements with named placeholders** (`:user_id`) for every query. Never concatenate user input into SQL.
- Use typed properties and typed parameters (`private PDO $db;`, `int $userId`).
- Read JSON body with `json_decode(file_get_contents("php://input"), true)`.
- Respond with `http_response_code(...)` + `echo json_encode([...])` then `return;` (controllers) or `exit;` (middleware).
- Passwords: `password_hash($password, PASSWORD_DEFAULT)` / `password_verify()`.
- Every protected resource is **scoped to the logged-in user** (queries include `AND user_id = :user_id`).
- Style: 4 spaces indent, opening brace of classes/methods on new line, blank lines between logical blocks, short `//` comments above each method describing route + purpose.

### 4.2 Request Lifecycle

```
HTTP request
  → public/.htaccess           (rewrite to index.php)
  → public/index.php           (CORS headers, OPTIONS → 204, JSON header,
                                require config/models/controllers/middleware,
                                create $user, $post models)
  → routes/api.php             (strip "/post-app/public", match method + path)
  → AuthMiddleware::authenticate()   (protected routes only → returns int $userId)
  → Controller method          (validate input, call model, echo JSON)
  → Model method               (PDO prepared SQL)
```

### 4.3 `public/.htaccess`

```apache
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
```

### 4.4 `public/index.php` (front controller)

Responsibilities, in this order:

1. CORS: whitelist `$allowedOrigins` array (`http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:5500`, `http://127.0.0.1:5500`); echo back matching `Origin` + `Vary: Origin`.
2. `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`, `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`, `Access-Control-Max-Age: 86400`.
3. `OPTIONS` request → `http_response_code(204); exit;`
4. `header('Content-Type: application/json');`
5. `require_once` in this order: `../config/database.php`, models, controllers, middleware.
6. Instantiate models with `$pdo`: `$user = new User($pdo);`, `$post = new Post($pdo);`
7. `require_once '../routes/api.php';`

When adding a new resource, add its `require_once` lines and model instance here.

### 4.5 `config/database.php`

Defines `$host`, `$dbname = "post-app"`, `$username = "root"`, `$password = ""`, creates global `$pdo` with `charset=utf8mb4` and `PDO::ERRMODE_EXCEPTION`. On failure: `die("Database connection failed: " . $e->getMessage());`

### 4.6 `routes/api.php` (router)

- No router library. Sequential `if` blocks, each ending with `exit;`.
- Normalize path:
  ```php
  $requestMethod = $_SERVER['REQUEST_METHOD'];
  $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
  $requestUri = str_replace('/post-app/public', '', $requestUri);
  $requestUri = rtrim($requestUri, '/');
  if ($requestUri === '') {
      $requestUri = '/';
  }
  ```
- Instantiate controllers + middleware once at top:
  ```php
  $authController = new AuthController($user);
  $postController = new PostController($post);
  $authMiddleware = new AuthMiddleware($pdo);
  ```
- Static route:
  ```php
  // Get logged-in user's posts
  if ($requestMethod === 'GET' && $requestUri === '/api/posts') {
      $userId = $authMiddleware->authenticate();
      $postController->index($userId);
      exit;
  }
  ```
- Route with numeric id — use `preg_match('#^/api/<resource>/([0-9]+)$#', ...)` and cast `(int) $matches[1]`:
  ```php
  // Get logged-in user's single post
  if (
      $requestMethod === 'GET' &&
      preg_match('#^/api/posts/([0-9]+)$#', $requestUri, $matches)
  ) {
      $postId = (int) $matches[1];
      $userId = $authMiddleware->authenticate();
      $postController->show($postId, $userId);
      exit;
  }
  ```
- Last block = 404 fallback:
  ```php
  http_response_code(404);
  echo json_encode([
      'message' => 'API endpoint not found'
  ]);
  ```

**Route naming:** `/api/<plural-resource>` and `/api/<plural-resource>/{id}`. RESTful methods:

| Method | Path | Controller method |
|--------|------|-------------------|
| GET | `/api/posts` | `index($userId)` |
| POST | `/api/posts` | `create($userId)` |
| GET | `/api/posts/{id}` | `show($postId, $userId)` |
| PUT | `/api/posts/{id}` | `update($postId, $userId)` |
| DELETE | `/api/posts/{id}` | `delete($postId, $userId)` |
| POST | `/api/register` | `AuthController::register()` |
| POST | `/api/login` | `AuthController::login()` |

### 4.7 Middleware — `middleware/AuthMiddleware.php`

- Class `AuthMiddleware`, constructor takes `PDO $db`.
- `authenticate()`:
  1. Read `Authorization` header from `getallheaders()`. **Lookup must be case-insensitive** (the Vite proxy sends lowercase `authorization`, direct clients send `Authorization`):
     ```php
     $headers = array_change_key_case(getallheaders(), CASE_LOWER);
     $authHeader = $headers['authorization']
         ?? $_SERVER['HTTP_AUTHORIZATION']
         ?? '';
     ```
  2. Missing → 401 `{"message": "Authorization token required"}` + `exit;`
  3. Not `Bearer <token>` (explode by space, 2 parts, first === `Bearer`) → 401 `{"message": "Invalid authorization header"}` + `exit;`
  4. Query `SELECT user_id FROM user_tokens WHERE token = :token AND expires_at > NOW() LIMIT 1`.
  5. Not found → 401 `{"message": "Invalid or expired token"}` + `exit;`
  6. Return `(int) $result['user_id']`.

### 4.8 Controllers — `controllers/<Name>Controller.php`

- Constructor receives the **model** (not PDO): `public function __construct(Post $post)`.
- Methods receive route params + `$userId` from the router; they never read the token themselves.
- Pattern for each method: read input → trim → validate → (check ownership) → call model → respond.

Template:

```php
<?php

class PostController
{
    private Post $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }


    // POST /api/posts
    // Create post for logged-in user
    public function create(int $userId)
    {
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');

        if (!$title || !$content) {

            http_response_code(400);

            echo json_encode([
                'message' => 'Title and content are required'
            ]);

            return;
        }

        $postId = $this->post->create(
            $title,
            $content,
            $userId
        );

        http_response_code(201);

        echo json_encode([
            'message' => 'Post created successfully',
            'post_id' => $postId
        ]);
    }


    // PUT /api/posts/{id}
    // Update logged-in user's own post
    public function update(
        int $postId,
        int $userId
    ) {
        // ...read + validate input (400)...

        // Check ownership
        $post = $this->post->findByIdAndUserId(
            $postId,
            $userId
        );

        if (!$post) {

            http_response_code(404);

            echo json_encode([
                'message' => 'Post not found'
            ]);

            return;
        }

        // ...call model, echo success message...
    }
}
```

**AuthController** (`__construct(User $user)`):
- `register()`: require `name`, `email`, `password` → 400 `All fields are required`; `findByEmail` exists → 409 `Email already exists`; hash password; `create`; 201 `{message, user_id}`.
- `login()`: require `email`, `password` → 400; user not found or `password_verify` fails → 401 `Invalid email or password`; token `bin2hex(random_bytes(32))`; `expires_at = date('Y-m-d H:i:s', strtotime('+7 days'))`; `saveToken`; 200 `{message, token, expires_at, user: {id, name, email}}`.

### 4.9 Models — `models/<Name>.php`

- Class name **singular** PascalCase (`Post`, `User`); constructor takes `PDO $db`.
- One method per query. Only SQL + return values; no `echo`, no HTTP codes, no validation.
- SQL in a multi-line `$sql = "..."` string, then `prepare` + `execute([...])` with named params.
- Return conventions:
  - insert → `$this->db->lastInsertId()`
  - list → `$stmt->fetchAll(PDO::FETCH_ASSOC)`
  - single → `$stmt->fetch(PDO::FETCH_ASSOC)` (returns `false` if not found)
  - update/delete → `return $stmt->execute([...])`
- Method names: `create`, `getByUserId`, `findByIdAndUserId`, `findByEmail`, `findById`, `update`, `delete`, `saveToken`.

Template:

```php
<?php

class Post
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // Find a post belonging to a specific user
    public function findByIdAndUserId(
        int $postId,
        int $userId
    ) {
        $sql = "
            SELECT
                posts.*,
                users.name AS user_name
            FROM posts
            INNER JOIN users
                ON posts.user_id = users.id
            WHERE posts.id = :post_id
            AND posts.user_id = :user_id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':post_id' => $postId,
            ':user_id' => $userId
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
```

### 4.10 API Response Format

| Case | Status | Body |
|------|--------|------|
| List | 200 | `{"data": [ ... ]}` |
| Single | 200 | `{"data": { ... }}` |
| Created | 201 | `{"message": "<Resource> created successfully", "<resource>_id": "<id>"}` |
| Updated / Deleted | 200 | `{"message": "<Resource> updated successfully"}` |
| Login | 200 | `{"message", "token", "expires_at", "user": {id, name, email}}` |
| Validation error | 400 | `{"message": "..."}` |
| Auth error | 401 | `{"message": "..."}` |
| Not found / not owner | 404 | `{"message": "<Resource> not found"}` |
| Conflict | 409 | `{"message": "..."}` |

- Errors always use a single `message` key.
- Data always wrapped in `data`.
- Accessing another user's resource returns **404**, not 403.
- Full endpoint details: see `API_DOCUMENTATION.md`.

### 4.11 Checklist — Adding a New Backend Resource (e.g. `comments`)

1. SQL: add `comments` table in `database/post-app.sql` (with `id`, `user_id`, `created_at`, `updated_at`).
2. `models/Comment.php` — class `Comment`, PDO methods as in 4.9.
3. `controllers/CommentController.php` — class `CommentController(Comment $comment)`, methods `index/create/show/update/delete`.
4. `public/index.php` — `require_once '../models/Comment.php';`, `require_once '../controllers/CommentController.php';`, `$comment = new Comment($pdo);`
5. `routes/api.php` — `$commentController = new CommentController($comment);` + route `if` blocks **above** the 404 fallback.
6. Document endpoints in `API_DOCUMENTATION.md`.

---

## 5. Frontend (Vanilla JS + Vite + Bootstrap)

### 5.1 Rules

- **Vanilla JavaScript only**, ES modules (`import`/`export`), `"type": "module"` in `package.json`.
- **No** React/Vue/Svelte, **no** TypeScript, **no** Axios (use `fetch` via `src/api/http.js`), **no** jQuery, **no** client-side router, **no** Tailwind.
- Only runtime dependency: `bootstrap` (it pulls `@popperjs/core`). Dev dependency: `vite`.
- **Multi-page app:** each screen = one root `.html` file + one `src/pages/<page>/<page>.js`. Navigation uses normal links / `window.location.href = '/<page>.html'`.
- Markup lives in the `.html` file. JS only fills dynamic parts (lists, alerts, user name) with template strings.
- UI is built with **Bootstrap 5 classes** (`container`, `row`, `col-*`, `card`, `btn`, `form-control`, `alert`, `modal`, `navbar`). Custom CSS only in `src/assets/css/app.css`.
- Any user-provided text inserted with `innerHTML` MUST go through `escapeHtml()`.
- Named exports only (no default exports). Relative imports **with `.js` extension**.
- File names: lowercase; API modules `<resource>.api.js`; guards `<name>.guard.js`; page scripts `<page>.js` inside `src/pages/<page>/`.
- Functions camelCase; DOM ids kebab-case (`login-form`, `alert-container`, `posts-container`).
- Style: 4 spaces indent, single quotes, semicolons, trailing commas in multi-line objects, blank lines between logical blocks.

### 5.2 Config Files

**`package.json`**
```json
{
  "name": "post-app-frontend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^8.3.0"
  },
  "dependencies": {
    "bootstrap": "^5.3.8"
  }
}
```

**`.env`**
```
VITE_API_BASE_URL=/api
```
Always `/api` (relative) so requests go through the Vite proxy and avoid CORS. Restart `npm run dev` after changing.

**`vite.config.js`** — every new HTML page MUST be added to `build.rollupOptions.input`:
```js
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
    server: {
        port: 5173,

        proxy: {
            '/api': {
                target: 'http://localhost/post-app/public',
                changeOrigin: true,
            },
        },
    },

    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                register: resolve(__dirname, 'register.html'),
                posts: resolve(__dirname, 'posts.html'),
            },
        },
    },
});
```

### 5.3 HTML Page Template

Rules:
- CSS is loaded with a `<link>` to `/src/assets/css/main.css` **in `<head>`** (never import CSS from JS — that causes a flash of unstyled content in dev).
- One `<script type="module" src="/src/pages/<page>/<page>.js">` at the end of `<body>`.
- Every page has `<div id="alert-container"></div>` for messages.
- **Guest pages (login, register): no navbar**, card centered vertically + horizontally.
- **Authenticated pages (posts, …): dark navbar** with brand, `#user-name`, and `#logout-button`.

Guest page (e.g. `login.html`):
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Login - Post App</title>

    <link rel="stylesheet" href="/src/assets/css/main.css">
</head>

<body>

    <main class="container min-vh-100 d-flex align-items-center py-4">

        <div class="row w-100 justify-content-center mx-0">

            <div class="col-md-6 col-lg-4">

                <div class="card shadow-sm">

                    <div class="card-body p-4">

                        <h2 class="mb-4 text-center">
                            Login
                        </h2>

                        <div id="alert-container"></div>

                        <form id="login-form">
                            <!-- .mb-3 > label.form-label + input.form-control -->
                            <button
                                type="submit"
                                id="login-button"
                                class="btn btn-primary w-100"
                            >
                                Login
                            </button>
                        </form>

                        <div class="text-center mt-3">
                            <a href="/register.html">
                                Create an account
                            </a>
                        </div>

                    </div>

                </div>

            </div>

        </div>

    </main>

    <script
        type="module"
        src="/src/pages/login/login.js"
    ></script>

</body>

</html>
```

Authenticated page (e.g. `posts.html`):
```html
<body>

    <nav class="navbar navbar-expand-lg bg-dark navbar-dark">
        <div class="container">
            <a class="navbar-brand" href="/posts.html">Post App</a>

            <div class="d-flex align-items-center">
                <span id="user-name" class="text-white me-3"></span>
                <button id="logout-button" class="btn btn-outline-light btn-sm">
                    Logout
                </button>
            </div>
        </div>
    </nav>

    <main class="container py-5">

        <div class="d-flex justify-content-between mb-4">
            <h1>My Posts</h1>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#postModal">
                Create Post
            </button>
        </div>

        <div id="alert-container"></div>

        <div id="posts-container" class="row g-4"></div>

    </main>

    <!-- Bootstrap modal with form#post-form, input#post-id (hidden), #post-title, #post-content -->

    <script type="module" src="/src/pages/posts/posts.js"></script>

</body>
```

`index.html` has no UI; it only loads `/src/index.js`, which redirects:
```js
import { isAuthenticated } from './utils/storage.js';

window.location.replace(
    isAuthenticated() ? '/posts.html' : '/login.html'
);
```

### 5.4 CSS

**`src/assets/css/main.css`** (the only stylesheet linked from HTML):
```css
@import 'bootstrap/dist/css/bootstrap.min.css';
@import './app.css';
```

**`src/assets/css/app.css`** — small custom overrides only (body background `#f8f9fa`, `.card { border: 0; }`, `.navbar-brand { font-weight: 600; }`, `textarea { resize: vertical; }`).

### 5.5 `src/main.js` (shared JS setup)

Imported first by **every** page script (`import '../../main.js';`). Makes Bootstrap JS available globally (used for `bootstrap.Modal`):
```js
import * as bootstrap from 'bootstrap';

window.bootstrap = bootstrap;
```

### 5.6 Config — `src/config/config.js`

```js
export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
};
```
Never hardcode the API URL elsewhere.

### 5.7 HTTP Layer — `src/api/http.js`

Single `request(endpoint, options = {})` function. **All API calls go through it** — pages never call `fetch` directly.

Behavior:
1. Builds URL `${config.apiBaseUrl}${endpoint}`.
2. Sets `Content-Type: application/json`, merges `options.headers`.
3. Adds `Authorization: Bearer <token>` if a token exists in storage.
4. Parses JSON response (falls back to `null`).
5. If `!response.ok`:
   - If `status === 401` **and a token was sent** → `clearAuth()` + redirect `/login.html` (expired session).
     (401 without token, e.g. wrong login password, must NOT redirect — the error has to be shown.)
   - `throw new Error(data?.message || 'Something went wrong')`.
6. Returns parsed `data`.

### 5.8 API Modules — `src/api/<resource>.api.js`

One file per backend resource. Thin functions returning `request(...)` promises. Endpoint paths are relative to `/api`.

```js
import { request } from './http.js';

export function getPosts() {
    return request('/posts');
}

export function getPost(id) {
    return request(`/posts/${id}`);
}

export function createPost(title, content) {
    return request('/posts', {
        method: 'POST',

        body: JSON.stringify({
            title,
            content,
        }),
    });
}

export function updatePost(id, title, content) {
    return request(`/posts/${id}`, {
        method: 'PUT',

        body: JSON.stringify({
            title,
            content,
        }),
    });
}

export function deletePost(id) {
    return request(`/posts/${id}`, {
        method: 'DELETE',
    });
}
```

`auth.api.js` exports `login(email, password)` → `POST /login` and `register(name, email, password)` → `POST /register`.

Naming: `get<Resources>`, `get<Resource>`, `create<Resource>`, `update<Resource>`, `delete<Resource>`.

### 5.9 Utils

**`src/utils/storage.js`** — the only place that touches `localStorage`:

| Key | Value |
|-----|-------|
| `post_app_token` | token string |
| `post_app_user` | JSON of `{id, name, email}` |
| `post_app_token_expiry` | `expires_at` string |

Exports: `saveAuth(authData)` (takes the login response), `getToken()`, `getUser()`, `getExpiry()`, `clearAuth()`, `isAuthenticated()`.

**`src/utils/alert.js`** — the only way to show messages:
- Exports `showSuccess(message)`, `showError(message)`.
- Renders a Bootstrap dismissible alert (`alert alert-<success|danger> alert-dismissible fade show`) into `#alert-container`, message escaped with `escapeHtml`, close button removes it, auto-removed after 3 seconds.
- Pages must import these instead of defining their own `showError`/`showSuccess`.

### 5.10 Auth Guard — `src/auth/auth.guard.js`

```js
import { isAuthenticated } from '../utils/storage.js';

export function requireAuth() {

    if (!isAuthenticated()) {
        window.location.href = '/login.html';
    }

}
```
Call `requireAuth()` at the top of every authenticated page script, right after imports.

### 5.11 Page Scripts — `src/pages/<page>/<page>.js`

Structure (in this order):
1. `import '../../main.js';`
2. Imports: api functions, storage, guard, alert.
3. `requireAuth();` (authenticated pages only).
4. `const` DOM references via `document.getElementById(...)`.
5. Module state (`let posts = [];`).
6. `init();` + `async function init()`.
7. Load/render functions (`loadPosts`, `renderPosts`) using template strings + `.join('')`.
8. Handlers needed from inline `onclick` are attached to `window` (`window.editPost = function (id) {...}`); others use `addEventListener`.
9. Form `submit` handler: `event.preventDefault()`, read + `.trim()` values, `try { await apiCall(); showSuccess(...); } catch (error) { showError(error.message); }`.
10. Local helpers at the bottom (`escapeHtml`).

Behavior rules:
- Submit buttons: disable + change text while waiting (`'Logging in...'`), restore in `finally`.
- After login: `saveAuth(response)` → `window.location.href = '/posts.html'`.
- After register: success alert → `setTimeout` 1500 ms → `/login.html`.
- Logout: `clearAuth()` → `/login.html`.
- Show a loading placeholder (`Loading posts...`) before fetching; show `alert-info` empty state when list is empty.
- Modals: `bootstrap.Modal.getOrCreateInstance(element).show()` / `bootstrap.Modal.getInstance(element).hide()`.
- One form can do create + edit using a hidden `#post-id` input (empty = create).

### 5.12 Checklist — Adding a New Frontend Page (e.g. `profile`)

1. `profile.html` at frontend root (copy guest or authenticated template from 5.3; link `main.css` in `<head>`).
2. `src/pages/profile/profile.js` (structure from 5.11, starts with `import '../../main.js';`).
3. If new endpoints: `src/api/profile.api.js` using `request()`.
4. Add `profile: resolve(__dirname, 'profile.html')` to `vite.config.js` → `build.rollupOptions.input`.
5. Add link in navbar of authenticated pages if needed.

---

## 6. Auth Flow (end to end)

```
register.html → POST /api/register → 201 → redirect /login.html
login.html    → POST /api/login    → 200 {token, expires_at, user}
              → saveAuth() in localStorage → redirect /posts.html
posts.html    → requireAuth() (token exists?) else → /login.html
              → GET /api/posts with "Authorization: Bearer <token>"
              → AuthMiddleware checks user_tokens (token + expires_at > NOW())
              → 401 (expired/invalid) → http.js clearAuth() → /login.html
logout        → clearAuth() → /login.html   (token row stays in DB until expiry)
```

---

## 7. Running the Project

1. Start **Apache** and **MySQL** in XAMPP.
2. Create database `post-app` and import `database/post-app.sql` (phpMyAdmin or `mysql -uroot post-app < database/post-app.sql`).
3. Backend is served at `http://localhost/post-app/public` (project must be in `C:\xampp\htdocs\post-app`, `mod_rewrite` enabled).
4. Frontend:
   ```bash
   cd post-app-frontend
   npm install
   npm run dev      # http://localhost:5173
   npm run build    # outputs dist/
   ```

---

## 8. Do / Don't Summary

| Do | Don't |
|----|-------|
| Plain PHP classes + `require_once` | Laravel, Slim, Composer, namespaces |
| Manual `if` routes in `routes/api.php` | Router libraries, `.htaccess` per-route rules |
| PDO prepared statements with named params | String-concatenated SQL, mysqli |
| JSON `{ "message" }` errors, `{ "data" }` payloads | HTML error pages, other response shapes |
| Bearer token from `user_tokens` table | JWT, sessions, cookies |
| Scope every query by `user_id` | Returning other users' data |
| Vanilla JS ES modules + Vite multi-page | React, Vue, TypeScript, SPA router |
| `fetch` via `src/api/http.js` `request()` | Axios, direct `fetch` in pages |
| Bootstrap 5 classes | Tailwind, other UI kits |
| CSS via `<link>` to `main.css` in `<head>` | `import './x.css'` in JS |
| `showSuccess`/`showError` from `utils/alert.js` | `alert()` or per-page alert functions |
| `localStorage` only through `utils/storage.js` | Direct `localStorage` calls in pages |
| `escapeHtml()` for user text in `innerHTML` | Raw user text in `innerHTML` |
| Register every HTML page in `vite.config.js` | Pages missing from build input |
