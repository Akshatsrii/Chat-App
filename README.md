<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,50:8b5cf6,100:06b6d4&height=200&section=header&text=NexusChat&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=Production-grade%20Real-Time%20Chat%20Application&descAlignY=62&descSize=18&animation=fadeIn" width="100%"/>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=Real-time+WebSocket+Chat;Emoji+Reactions+%26+Reply+Threads;JWT+Auth+%2B+bcrypt+Security;Animated+Particle+Canvas+UI;Docker+Production+Ready" alt="Typing SVG" />

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🔄 Request Flow](#-request-flow)
- [📦 Stack](#-stack)
- [🗂️ Project Structure](#️-project-structure)
- [⚡ Quick Start](#-quick-start)
- [🔌 API Reference](#-api-reference)
- [📡 Socket.io Events](#-socketio-events)
- [🌍 Environment Variables](#-environment-variables)
- [🐳 Docker](#-docker)
- [🗄️ MongoDB Reference](#️-mongodb-reference)

---

## ✨ Features

<div align="center">

| 🔐 Auth | 💬 Chat | 🎨 UI |
|:---:|:---:|:---:|
| Register & Login | Real-time WebSockets | Animated particle canvas |
| bcrypt (12 rounds) | Message history (60 msgs) | Spring-physics bubbles |
| JWT cookies (7d) | Emoji reactions (persisted) | Emoji picker |
| Rate limiting | Reply threads | Hover profile cards |
| Session restore | Edit / Delete own messages | Unread badges |
| — | Typing indicators | Connection quality indicator |
| — | Live user presence | Sound toggle |
| — | System join/leave events | Mobile sidebar |
| — | Message search + highlights | Context menu |
| — | Optimistic sends | Scroll-to-bottom |

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NexusChat System                            │
│                                                                     │
│  ┌─────────────────────┐   HTTP/REST    ┌────────────────────────┐  │
│  │   Next.js Frontend  │◄──────────────►│  Express 5 Backend     │  │
│  │      :3000          │                │       :1337            │  │
│  │                     │                │                        │  │
│  │  ┌───────────────┐  │                │  POST /auth/register   │  │
│  │  │  AuthContext  │  │                │  POST /auth/local      │  │
│  │  └───────────────┘  │                │  GET  /users/me        │  │
│  │  ┌───────────────┐  │  WebSocket/WS  │  GET  /messages        │  │
│  │  │SocketContext  │◄─┼───────────────►│  POST /messages        │  │
│  │  └───────────────┘  │                │                        │  │
│  │  ┌───────────────┐  │                │  Socket.io engine      │  │
│  │  │ UI Components │  │                │  (same HTTP server)    │  │
│  │  └───────────────┘  │                └───────────┬────────────┘  │
│  └─────────────────────┘                            │ Mongoose ODM  │
│                                                     ▼               │
│                                        ┌────────────────────────┐  │
│                                        │  MongoDB 7             │  │
│                                        │  @ 127.0.0.1:27017     │  │
│                                        │                        │  │
│                                        │  DB: nexuschat         │  │
│                                        │  ├── users             │  │
│                                        │  └── messages          │  │
│                                        └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### Auth Flow

```
Client                    Express Backend               MongoDB
  │                             │                          │
  │── POST /api/auth/local ────►│                          │
  │   { identifier, password }  │── find user by email ──►│
  │                             │◄─ user document ─────────│
  │                             │── bcrypt.compare() ──────┤
  │                             │── signToken(userId) ─────┤
  │◄─ { jwt, user } ───────────│                          │
  │── store JWT in cookie ──────┤                          │
```

### Real-Time Message Flow

```
User A (Sender)          Socket.io Server           User B (Receiver)
     │                         │                          │
     │── chat:send-message ───►│                          │
     │   { content, room }     │── save to MongoDB ───────┤
     │                         │── broadcast to room ─────►│
     │◄─ chat:new-message ─────│◄────────────────────────│
     │   (optimistic confirm)  │                          │
```

### Socket Room Lifecycle

```
Connect ──► authenticate JWT ──► chat:join-room
                                       │
                    ┌──────────────────┼──────────────────────┐
                    ▼                  ▼                      ▼
           chat:message-history  chat:active-users     chat:user-joined
           (last 60 messages)    (online list)         (broadcast)
                    │
          [In Room]──────────────────────────────────────────┐
                    │                                         │
          chat:send-message      chat:typing-start            │
          chat:add-reaction      chat:typing-stop             │
          chat:edit-message      chat:leave-room ─────────────┘
          chat:delete-message         │
                                chat:user-left (broadcast)
```

---

## 📦 Stack

| Layer | Technology | Version |
|---|---|---|
| 🖥️ Frontend | Next.js App Router | **15** |
| 🎨 Styling | Tailwind CSS | **v4** |
| ⚙️ Backend | Express | **5.x** |
| 🗄️ Database | MongoDB (local 127.0.0.1) | **7** |
| 🔗 ODM | Mongoose | **8.x** |
| 📡 Real-time | Socket.io | **4.x** |
| 🔐 Auth | JWT + bcryptjs | — |
| 🟢 Runtime | Node.js | **24** |
| 🐳 Containers | Docker + Compose | — |

---

## 🗂️ Project Structure

```
nexus-chat/
├── frontend/                        # Next.js 15
│   └── src/
│       ├── app/                     # Pages + auth-guarded layouts
│       ├── components/
│       │   ├── chat/                # ChatShell, ChatRoom, Sidebar,
│       │   │                        # MessageList, MessageInput,
│       │   │                        # UserList, WelcomeScreen
│       │   ├── auth/                # LoginForm, RegisterForm
│       │   └── ui/                  # ParticleBackground (canvas)
│       ├── contexts/
│       │   ├── AuthContext.tsx      # JWT state — Express-compatible API
│       │   └── SocketContext.tsx    # Socket.io state + real-time actions
│       ├── lib/
│       │   ├── socket.ts            # Socket singleton + event names enum
│       │   ├── rooms.ts             # Default rooms config
│       │   └── utils.ts             # Helpers, formatters, sound
│       └── types/index.ts
│
└── backend/                         # Express 5 + MongoDB
    ├── server.js                    # Entry: HTTP server + Socket.io
    └── src/
        ├── app.js                   # Express app, CORS, helmet, morgan
        ├── config/
        │   └── database.js          # Mongoose connect + exponential retry
        ├── models/
        │   ├── User.js              # Schema: username, email, bcrypt
        │   └── Message.js           # Schema: content, room, reactions,
        │                            #         replyTo, soft-delete
        ├── controllers/
        │   ├── auth.controller.js
        │   └── message.controller.js
        ├── routes/
        │   ├── auth.routes.js       # Validation via express-validator
        │   └── message.routes.js
        ├── middleware/
        │   ├── auth.js              # JWT protect middleware
        │   ├── errorHandler.js      # Central error → JSON handler
        │   └── rateLimiter.js       # express-rate-limit
        ├── socket/
        │   └── index.js             # Socket.io: join/send/react/edit/delete
        └── utils/
            ├── jwt.js               # signToken, verifyToken
            └── logger.js            # Winston (console + rotating file)
```

---

## ⚡ Quick Start

### Prerequisites

#### Node.js 24

```bash
# nvm (recommended)
nvm install 24 && nvm use 24

# fnm
fnm install 24 && fnm use 24

# Verify
node --version   # v24.x.x
```

#### MongoDB 7 (local)

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

### 🔧 Backend

```bash
cd backend
nvm use                  # auto-reads .nvmrc → 24
npm install
cp .env.example .env

# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste output into .env as JWT_SECRET=...

npm run dev
# ✅  MongoDB connected → mongodb://127.0.0.1:27017/nexuschat
# 🚀  NexusChat API running → http://localhost:1337
```

### 🖥️ Frontend

```bash
cd frontend
nvm use
npm install
cp .env.local.example .env.local
# NEXT_PUBLIC_STRAPI_URL=http://localhost:3000 (pre-configured)

npm run dev
# → http://localhost:3000
```

> Open **http://localhost:3000**, register, join a room, open a second tab and chat! 🎉

---

## 🔌 API Reference

### Auth *(Strapi-compatible format)*

```http
POST /api/auth/local/register
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "Secret123"
}

# Response
{
  "jwt": "eyJ...",
  "user": { "id", "username", "email", "createdAt" }
}
```

```http
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "alice@example.com",
  "password": "Secret123"
}
```

```http
GET /api/users/me
Authorization: Bearer <jwt>

# Response
{ "id", "username", "email", "createdAt" }
```

### Messages

```http
GET /api/messages?filters[room][$eq]=general&pagination[pageSize]=50
Authorization: Bearer <jwt>

# Response
{
  "data": [...],
  "meta": { "pagination": { "page", "pageSize", "total" } }
}
```

```http
POST /api/messages
Authorization: Bearer <jwt>
Content-Type: application/json

{ "data": { "content": "Hello!", "room": "general" } }

# Response
{ "data": { "id", "content", "room", ... } }
```

```http
GET /health

# Response
{ "status": "ok", "uptime": 42, "node": "v24.x.x", "mongodb": "connected" }
```

---

## 📡 Socket.io Events

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

## 🌍 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `1337` | HTTP port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/nexuschat` | Local MongoDB URI |
| `JWT_SECRET` | — | ⚠️ **Required** — 64-char hex string |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `RATE_LIMIT_MAX` | `200` | Requests per 15 min |
| `AUTH_RATE_LIMIT_MAX` | `20` | Auth attempts per 15 min |
| `LOG_LEVEL` | `info` | Winston log level |

---

## 🐳 Docker

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET at minimum

docker compose up -d --build
# Starts: MongoDB 7 + Express backend + Next.js frontend

docker compose logs -f backend   # watch logs
docker compose down              # stop all services
```

---

## 🗄️ MongoDB Quick Reference

```bash
mongosh nexuschat

# Messages per room
db.messages.aggregate([
  { $group: { _id: "$room", count: { $sum: 1 } } }
])

# All users (sorted by join date)
db.users.find(
  {},
  { username: 1, email: 1, createdAt: 1 }
).sort({ createdAt: -1 })

# Recent messages in #general
db.messages
  .find({ room: "general" })
  .sort({ createdAt: -1 })
  .limit(10)
```

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06b6d4,50:8b5cf6,100:6366f1&height=120&section=footer&animation=fadeIn" width="100%"/>

**Built with ❤️ using Next.js · Express · MongoDB · Socket.io**

</div>