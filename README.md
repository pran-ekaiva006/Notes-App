# 📝 Notes API — Fi Money Engineering Assignment

> A **production-ready multi-user Notes backend** built as part of the Fi Money Engineering Internship assignment.
> Built with **Node.js + Express + MongoDB Atlas**, featuring JWT auth, full CRUD, note sharing, version history, pinning, full-text search, and pagination.

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
- [Custom Feature — Version History](#-custom-feature--note-version-history)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Running Tests](#-running-tests)
- [Deployment (Render)](#-deployment-render)

---

## ✨ Features

### Core (Assignment Requirements)
- 🔐 **User Registration & Login** — JWT-based authentication (7-day token)
- 📝 **Full CRUD Notes** — Create, Read, Update, Delete with strict ownership checks
- 🔗 **Note Sharing** — Share notes with other users by email; shared users get read access only
- 📄 **OpenAPI Docs** — Full OpenAPI 3.0 spec at `/openapi.json` via `swagger-jsdoc`
- 👤 **About Endpoint** — Developer info + feature descriptions at `/about`

### Custom Features (Beyond Spec)
- 📚 **Note Version History** *(primary custom feature)* — Every update auto-saves a snapshot. View full history, restore any past version
- 📌 **Note Pinning** — Toggle pin/unpin; pinned notes always appear first in `GET /notes`
- 🔍 **Full-text Search** — `GET /search?q=keyword` with MongoDB text indexes and relevance ranking
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
│   │   └── notesController.js    # CRUD + pin + history + restore + search
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect middleware
│   │   ├── errorMiddleware.js    # Global error handler
│   │   └── validateRequest.js   # express-validator wrapper
│   ├── models/
│   │   ├── User.js               # User schema + bcrypt hooks
│   │   └── Note.js               # Note schema + versions array + text index
│   ├── routes/
│   │   ├── authRoutes.js         # POST /register, /login
│   │   ├── notesRoutes.js        # CRUD + share + pin + history + restore
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
| POST | `/login` | ❌ | Login, returns `access_token` JWT |

### Notes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notes` | ✅ | Get all notes (flat array, pinned first) |
| POST | `/notes` | ✅ | Create a new note |
| GET | `/notes/:id` | ✅ | Get a note by ID (owner or shared user) |
| PUT | `/notes/:id` | ✅ | Update a note — auto-saves previous version (owner only) |
| DELETE | `/notes/:id` | ✅ | Delete a note (owner only) |
| POST | `/notes/:id/share` | ✅ | Share a note by email (owner only) |
| PATCH | `/notes/:id/pin` | ✅ | Toggle pin/unpin (owner only) |

### Version History
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notes/:id/history` | ✅ | List all past versions (newest first, owner only) |
| POST | `/notes/:id/restore/:version` | ✅ | Restore note to version N (owner only) |

### Search & Meta
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?q=keyword` | ✅ | Full-text search across your notes |
| GET | `/about` | ❌ | Developer info + feature descriptions |
| GET | `/openapi.json` | ❌ | Full OpenAPI 3.0 specification |
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

**GET /notes/:id/history → 200**
```json
{
  "note_id": "665a1b2c...",
  "total_versions": 2,
  "history": [
    { "version": 2, "title": "Draft Title", "content": "Draft body", "saved_at": "2026-05-16T11:00:00Z" },
    { "version": 1, "title": "Original Title", "content": "Original body", "saved_at": "2026-05-16T10:00:00Z" }
  ]
}
```

**POST /notes/:id/restore/1 → 200**
```json
{
  "message": "Restored to version 1",
  "note": { "id": "...", "title": "Original Title", "content": "Original body", ... }
}
```

---

## 📚 Custom Feature — Note Version History

> **This is the primary custom feature**, chosen to demonstrate both product thinking and technical depth — explicitly meeting the assignment's requirement that the feature must not be "a simple CRUD extension."

### Why this feature?
Users accidentally overwrite or delete important note content with no way to recover it. This is one of the most common frustrations in notes apps. Version history solves it completely.

### How it works

1. **Automatic snapshotting** — Every time `PUT /notes/:id` changes the title or content, the *current* state is automatically saved as a version snapshot before the update is applied.
2. **View history** — `GET /notes/:id/history` returns all saved versions in reverse chronological order (newest first), with version numbers, titles, content, and timestamps.
3. **Restore any version** — `POST /notes/:id/restore/:version` restores the note to any past version. Before restoring, the current state is also auto-saved — so no content is ever truly lost.
4. **Sliding window** — A maximum of 10 versions are kept per note to bound storage. When the 11th version is created, the oldest is evicted.

### Technical details
- Versions are stored as an embedded array in the Note document (no separate collection needed — keeps reads fast and atomic)
- The `versions` array uses `shift()` to maintain the 10-version cap without extra queries
- Restore itself is a write operation that snapshots-then-overwrites atomically
- All history and restore operations are owner-only (shared users have read access only)

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
- ✅ Auth (registration, login, duplicate email, validation errors)
- ✅ Notes CRUD (create, read, update, delete with correct status codes)
- ✅ Access control (ownership checks, shared access)
- ✅ Sharing (duplicates, self-share, unknown email)
- ✅ Pin toggle (owner-only, toggle behavior)
- ✅ Full-text search (keyword, user isolation, empty query)
- ✅ Meta endpoints (health, about, openapi)

---

## 🚀 Deployment (Render)

Deployed at: **[https://notes-app-03fg.onrender.com](https://notes-app-03fg.onrender.com)**

### Environment Variables set on Render:
```
MONGO_URI      = <MongoDB Atlas connection string>
JWT_SECRET     = <strong secret key>
JWT_EXPIRES_IN = 7d
NODE_ENV       = production
CLIENT_URL     = *
```

> ⚠️ MongoDB Atlas → Network Access → IP `0.0.0.0/0` must be whitelisted for Render's dynamic IPs.

---

## 📄 License

MIT © [Pranjal Kumar Verma](https://github.com/pran-ekaiva006)
