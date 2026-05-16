# 📝 Notes API — Fi Money Engineering Assignment

> A **production-ready multi-user Notes backend** built as part of the Fi Money Engineering Internship assignment.
> Built with **Node.js + Express + MongoDB Atlas**, featuring JWT auth, full CRUD, note sharing, pinning, full-text search, and pagination.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)
[![Tests](https://img.shields.io/badge/Tests-66%2F66%20passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌐 Live API

> **Base URL:** [https://notes-app-03fg.onrender.com](https://notes-app-03fg.onrender.com)

| Endpoint | URL |
|----------|-----|
| Health Check | [https://notes-app-03fg.onrender.com/](https://notes-app-03fg.onrender.com/) |
| Swagger Docs | [https://notes-app-03fg.onrender.com/api-docs](https://notes-app-03fg.onrender.com/api-docs) |
| OpenAPI JSON | [https://notes-app-03fg.onrender.com/openapi.json](https://notes-app-03fg.onrender.com/openapi.json) |
| About | [https://notes-app-03fg.onrender.com/about](https://notes-app-03fg.onrender.com/about) |

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Custom Features](#-custom-features)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Running Tests](#-running-tests)
- [Deployment (Render)](#-deployment-render)

---

## ✨ Features

### Core (Assignment Requirements)
- 🔐 **User Registration & Login** — JWT-based authentication (7-day token)
- 📝 **Full CRUD Notes** — Create, Read, Update, Delete with ownership checks
- 🔗 **Note Sharing** — Share notes with other users by email; shared users get read access
- 📄 **OpenAPI Docs** — Full OpenAPI 3.0 spec at `/openapi.json`
- 👤 **About Endpoint** — Developer info + feature descriptions at `/about`

### Custom Features (Beyond Spec)
- 📌 **Note Pinning** — Toggle pin/unpin; pinned notes always appear first
- 🏷️ **Note Tagging** — Attach multiple tags to notes for flexible categorization
- 🔍 **Full-text Search** — `GET /search?q=keyword` with MongoDB text indexes
- 📄 **Pagination** — `GET /notes?page=1&limit=10` with total/totalPages metadata

### Security & Quality
- 🛡️ **Helmet** — Secure HTTP headers
- ⏱️ **Rate Limiting** — 100 requests per 15 minutes per IP
- 🧹 **Mongo Sanitize** — Prevents NoSQL injection attacks
- ✅ **Input Validation** — `express-validator` on all endpoints
- 🧪 **66 Automated Tests** — Full shell-based test suite

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20.x (ES Modules) |
| Framework | Express 4.x |
| Database | MongoDB Atlas (Mongoose 8.x) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Validation | `express-validator` |
| Security | `helmet`, `express-rate-limit`, `express-mongo-sanitize` |
| Docs | `swagger-jsdoc` + `swagger-ui-express` |
| Dev | `nodemon` |

---

## 📁 Project Structure

```
notes-app/
├── src/
│   ├── app.js                    # Express app, middleware, routes
│   ├── server.js                 # Server entry point
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, Login
│   │   └── notesController.js    # All note operations
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect middleware
│   │   ├── errorMiddleware.js    # Global error handler
│   │   └── validateRequest.js   # express-validator wrapper
│   ├── models/
│   │   ├── User.js               # User schema + bcrypt hooks
│   │   └── Note.js               # Note schema + text index
│   ├── routes/
│   │   ├── authRoutes.js         # POST /register, /login
│   │   ├── notesRoutes.js        # CRUD + share + pin
│   │   ├── searchRoutes.js       # GET /search
│   │   └── metaRoutes.js         # GET /about, /openapi.json
│   ├── validators/
│   │   ├── authValidators.js     # Register/login validation rules
│   │   └── noteValidators.js     # Note CRUD validation rules
│   ├── utils/
│   │   ├── AppError.js           # Custom error class
│   │   └── generateToken.js      # JWT generation
│   └── docs/
│       └── swaggerConfig.js      # swagger-jsdoc config
├── tests/
│   └── api.test.sh               # 66 automated API tests
├── .env.example                  # Environment variable template
├── package.json
└── README.md
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login, returns JWT token |

### Notes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notes` | ✅ | Get all notes (flat array, pinned first) |
| POST | `/notes` | ✅ | Create a new note |
| GET | `/notes/:id` | ✅ | Get a note by ID (owner or shared) |
| PUT | `/notes/:id` | ✅ | Update a note (owner only) |
| DELETE | `/notes/:id` | ✅ | Delete a note (owner only) |
| POST | `/notes/:id/share` | ✅ | Share a note by email (owner only) |
| PATCH | `/notes/:id/pin` | ✅ | Toggle pin/unpin (owner only) |

### Search & Meta
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?q=keyword` | ✅ | Full-text search across notes |
| GET | `/about` | ❌ | Developer info + features |
| GET | `/openapi.json` | ❌ | Full OpenAPI 3.0 spec |
| GET | `/api-docs` | ❌ | Interactive Swagger UI |

### Example Responses

**POST /login → 200**
```json
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**POST /notes → 201**
```json
{
  "id": "665a1b2c3d4e5f6a7b8c9d0e",
  "title": "My Note",
  "content": "Note body",
  "isPinned": false,
  "tags": ["work"],
  "created_at": "2026-05-16T10:00:00.000Z",
  "updated_at": "2026-05-16T10:00:00.000Z"
}
```

**GET /notes → 200** (flat array, pinned first)
```json
[
  { "id": "...", "title": "Pinned Note", "isPinned": true, "created_at": "...", "updated_at": "..." },
  { "id": "...", "title": "Regular Note", "isPinned": false, "created_at": "...", "updated_at": "..." }
]
```

---

## 💡 Custom Features

### 📌 Note Pinning
**Endpoint:** `PATCH /notes/:id/pin`
Toggles `isPinned` on each call. Pinned notes always appear at the top of `GET /notes`. Mirrors Google Keep's behavior — users can highlight important notes without reorganizing everything.

### 🏷️ Note Tagging
**Field:** `tags: ["work", "urgent"]` on create/update
Each note supports multiple tags for lightweight categorization. No rigid folder hierarchy — tags are flexible and composable, similar to Gmail labels.

### 🔍 Full-text Search
**Endpoint:** `GET /search?q=keyword`
Uses MongoDB `$text` index on `title` and `content`. Results are scoped to the authenticated user's notes only (own + shared). Ranked by text relevance score.

### 📄 Pagination
**Endpoint:** `GET /notes?page=1&limit=10`
Returns `{ currentPage, totalPages, totalNotes, notes[] }` when pagination params are provided. Default `GET /notes` returns the full flat array per spec.

---

## ⚙️ Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/pran-ekaiva006/Notes-App.git
cd Notes-App

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and fill in MONGO_URI and JWT_SECRET

# 4. Start development server
npm run dev
# Server runs at http://localhost:5000
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWTs | `your-strong-secret` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `NODE_ENV` | Environment | `production` |
| `CLIENT_URL` | Allowed CORS origin | `*` |

---

## 🧪 Running Tests

Make sure the server is running on port 5000, then:

```bash
bash tests/api.test.sh
```

Expected output:
```
📊  RESULTS: 66/66 passed, 0 failed
```

The suite covers:
- ✅ Auth (registration, login, validation errors)
- ✅ Notes CRUD (create, read, update, delete)
- ✅ Access control (ownership, shared access)
- ✅ Sharing (duplicates, self-share, unknown email)
- ✅ Pin toggle (owner-only, toggle behavior)
- ✅ Full-text search (keyword, isolation, empty query)
- ✅ Meta endpoints (health, about, openapi)

---

## 🚀 Deployment (Render)

Deployed at: **https://notes-app-03fg.onrender.com**

### Environment Variables set on Render:
```
MONGO_URI      = <MongoDB Atlas connection string>
JWT_SECRET     = <strong secret key>
JWT_EXPIRES_IN = 7d
NODE_ENV       = production
CLIENT_URL     = *
```

> ⚠️ MongoDB Atlas → Network Access → IP `0.0.0.0/0` must be whitelisted.

---

## 📄 License

MIT © [Pranjal Kumar Verma](https://github.com/pran-ekaiva006)
