# NexusChat — Real-Time Chat Application

Production-grade real-time chat built with **Next.js 15 · Express 5 · MongoDB · Socket.io 4 · Tailwind CSS v4 · Node.js 24**.

---

## Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js App Router | 15 |
| Styling | Tailwind CSS | v4 |
| Backend | **Express** | 5.x |
| Database | **MongoDB** (local 127.0.0.1) | 7 |
| ODM | Mongoose | 8.x |
| Real-time | Socket.io | 4.x |
| Auth | JWT + bcryptjs | — |
| Runtime | **Node.js** | **24** |
| Containers | Docker + Compose | — |

---

## Architecture

```
┌──────────────────────┐  HTTP   ┌────────────────────────────────┐
│  Next.js Frontend    │◄───────►│  Express 5 Backend :1337       │
│  :3000               │         │                                │
│                      │         │  POST /api/auth/local/register │
│  AuthContext         │         │  POST /api/auth/local          │
│  SocketContext       │◄───────►│  GET  /api/users/me            │
│  UI Components       │  WS/WSS │  GET  /api/messages            │
└──────────────────────┘         │  POST /api/messages            │
                                 │  Socket.io (same HTTP server)  │
                                 └────────────┬───────────────────┘
                                              │ Mongoose
                                              ▼
                                 ┌────────────────────────────────┐
                                 │  MongoDB 7 @ 127.0.0.1:27017   │
                                 │  DB: nexuschat                 │
                                 │  Collections: users, messages  │
                                 └────────────────────────────────┘
```

---

## Features

**Auth** — Register/login, bcrypt (12 rounds), JWT cookies (7d), rate limiting, session restore

**Chat** — Real-time WebSockets, message history (60 msgs), emoji reactions (persisted in Mongo), reply threads, edit/delete own messages, typing indicators, live user presence, system join/leave events, message search with highlights, optimistic sends

**UI** — Animated particle canvas, spring-physics message bubbles, emoji picker, hover profile cards, unread badges, connection quality indicator, sound toggle, mobile sidebar, context menu, scroll-to-bottom

---

## Project Structure

```
nexus-chat/
├── frontend/                     # Next.js 15
│   └── src/
│       ├── app/                  # Pages + auth-guarded layouts
│       ├── components/chat/      # ChatShell, ChatRoom, Sidebar,
│       │                         # MessageList, MessageInput, UserList, WelcomeScreen
│       ├── components/auth/      # LoginForm, RegisterForm
│       ├── components/ui/        # ParticleBackground (canvas)
│       ├── contexts/
│       │   ├── AuthContext.tsx   # JWT state — Express-compatible API calls
│       │   └── SocketContext.tsx # Socket.io state + all real-time actions
│       ├── lib/
│       │   ├── socket.ts         # Socket singleton + event names enum
│       │   ├── rooms.ts          # Default rooms config
│       │   └── utils.ts          # Helpers, formatters, sound
│       └── types/index.ts
│
└── backend/                      # Express 5 + MongoDB
    ├── server.js                 # Entry: HTTP server + Socket.io bootstrap
    └── src/
        ├── app.js                # Express app, CORS, helmet, morgan, routes
        ├── config/database.js    # Mongoose connect with exponential retry
        ├── models/
        │   ├── User.js           # Schema: username, email, bcrypt, indexes
        │   └── Message.js        # Schema: content, room, reactions[], replyTo, soft-delete
        ├── controllers/
        │   ├── auth.controller.js
        │   └── message.controller.js
        ├── routes/
        │   ├── auth.routes.js    # Validation via express-validator
        │   └── message.routes.js
        ├── middleware/
        │   ├── auth.js           # JWT protect middleware
        │   ├── errorHandler.js   # Central error → JSON (Mongoose, JWT, 404)
        │   └── rateLimiter.js    # express-rate-limit
        ├── socket/index.js       # Full Socket.io: join/send/react/edit/delete/typing
        └── utils/
            ├── jwt.js            # signToken, verifyToken
            └── logger.js         # Winston (console + rotating file in prod)
```

---

## Prerequisites

### Node.js 24

```bash
# nvm (recommended)
nvm install 24 && nvm use 24

# fnm
fnm install 24 && fnm use 24

# Verify
node --version   # v24.x.x
```

### MongoDB 7 (local)

```bash
# macOS (Homebrew)
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl enable --now mongod

# Verify
mongosh --eval "db.adminCommand('ping')"
# → { ok: 1 }
```

---

## Quick Start

### Backend

```bash
cd backend
nvm use            # auto-reads .nvmrc → 24
npm install
cp .env.example .env

# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste the output into .env as JWT_SECRET=...

npm run dev
# ✅  MongoDB connected → mongodb://127.0.0.1:27017/nexuschat
# 🚀  NexusChat API running → http://localhost:1337
```

### Frontend

```bash
cd frontend
nvm use
npm install
cp .env.local.example .env.local
# Already configured: NEXT_PUBLIC_STRAPI_URL=http://localhost:1337

npm run dev
# → http://localhost:3000
```

Open **http://localhost:3000**, register, join a room, open a second tab and chat!

---

## API Reference

### Auth (Strapi-compatible format — no frontend changes needed)

```
POST /api/auth/local/register
Body: { "username": "alice", "email": "alice@ex.com", "password": "Secret123" }
Response: { "jwt": "eyJ...", "user": { "id", "username", "email", "createdAt" } }

POST /api/auth/local
Body: { "identifier": "alice@ex.com", "password": "Secret123" }
Response: { "jwt": "eyJ...", "user": { ... } }

GET /api/users/me
Headers: Authorization: Bearer <jwt>
Response: { "id", "username", "email", "createdAt" }
```

### Messages

```
GET /api/messages?filters[room][$eq]=general&pagination[pageSize]=50
Headers: Authorization: Bearer <jwt>
Response: { "data": [...], "meta": { "pagination": { ... } } }

POST /api/messages
Headers: Authorization: Bearer <jwt>
Body: { "data": { "content": "Hello!", "room": "general" } }
Response: { "data": { "id", "content", "room", ... } }

GET /health
Response: { "status": "ok", "uptime": 42, "node": "v24.x.x", "mongodb": "connected" }
```

---

## Socket.io Events

### Client → Server

| Event | Payload |
|---|---|
| `chat:join-room` | `{ room }` |
| `chat:send-message` | `{ content, room, replyToId? }` |
| `chat:typing-start` | `{ room }` |
| `chat:typing-stop` | `{ room }` |
| `chat:add-reaction` | `{ messageId, emoji, room }` |
| `chat:edit-message` | `{ messageId, content, room }` |
| `chat:delete-message` | `{ messageId, room }` |
| `chat:leave-room` | `{ room }` |

### Server → Client

| Event | Payload |
|---|---|
| `chat:message-history` | `SocketMessage[]` |
| `chat:new-message` | `SocketMessage` |
| `chat:message-updated` | updated message |
| `chat:message-deleted` | `{ id }` |
| `chat:reaction-updated` | `{ messageId, reactions }` |
| `chat:active-users` | `ActiveUser[]` |
| `chat:typing-users` | `TypingUser[]` |
| `chat:user-joined` | `{ username, userId, room }` |
| `chat:user-left` | `{ username, userId, room }` |
| `chat:error` | `{ message }` |

---

## Backend Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `1337` | HTTP port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/nexuschat` | Local MongoDB |
| `JWT_SECRET` | — | **Required** — 64-char hex string |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `RATE_LIMIT_MAX` | `200` | Requests per 15 min |
| `AUTH_RATE_LIMIT_MAX` | `20` | Auth attempts per 15 min |
| `LOG_LEVEL` | `info` | Winston level |

---

## Docker (production)

```bash
cp .env.example .env
# Edit .env: set JWT_SECRET at minimum

docker compose up -d --build
# Starts MongoDB 7 + Express backend + Next.js frontend

docker compose logs -f backend   # watch logs
docker compose down              # stop
```

---

## MongoDB Quick Reference

```bash
mongosh nexuschat

# Messages per room
db.messages.aggregate([{ $group: { _id: "$room", count: { $sum: 1 } } }])

# All users
db.users.find({}, { username: 1, email: 1, createdAt: 1 }).sort({ createdAt: -1 })

# Recent messages in general
db.messages.find({ room: "general" }).sort({ createdAt: -1 }).limit(10)
```
