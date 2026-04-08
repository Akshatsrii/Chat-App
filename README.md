<div align="center">

<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/Strapi-4945FF?style=for-the-badge&logo=strapi&logoColor=white" />
<img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />

<br/><br/>

# 💬 RealTalk — Real-Time Chat Application

> **A full-stack real-time chat application** built with Next.js, Strapi CMS, and Socket.io — enabling instant messaging, room management, and live user presence.

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Status](https://img.shields.io/badge/Status-Active-success)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🔄 Application Flow](#-application-flow)
- [⚙️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔌 API Endpoints](#-api-endpoints)
- [🌐 Socket Events](#-socket-events)
- [🖼️ UI Components](#️-ui-components)
- [🔐 Authentication Flow](#-authentication-flow)
- [🛠️ Environment Variables](#️-environment-variables)
- [📊 Database Schema](#-database-schema)
- [📝 License](#-license)

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 User Authentication | Register & login with username/password | ✅ |
| 💬 Real-Time Messaging | Instant messages via Socket.io | ✅ |
| 🏠 Chat Rooms | Join named rooms & chat within them | ✅ |
| 👥 Active Users List | See live online users per room | ✅ |
| 📜 Chat History | Persistent message storage via Strapi | ✅ |
| 🌐 Strapi Webhooks | Trigger socket events on new messages | ✅ |
| 📱 Responsive UI | Mobile-friendly Tailwind CSS design | ✅ |
| ⚠️ Error Handling | Graceful error & feedback mechanisms | ✅ |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                            │
│   ┌─────────────┐   ┌──────────────┐  ┌─────────────┐  │
│   │  Next.js    │   │  Socket.io   │  │  Tailwind   │  │
│   │   Pages &   │◄──│   Client     │  │    CSS UI   │  │
│   │  Components │   │  (ws://)     │  │             │  │
│   └──────┬──────┘   └──────┬───────┘  └─────────────┘  │
└──────────┼─────────────────┼───────────────────────────-┘
           │  REST API        │  WebSocket
           ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                        BACKEND                           │
│   ┌─────────────┐   ┌──────────────┐                    │
│   │   Strapi    │──►│  Webhooks    │                    │
│   │  REST API   │   │  (on create) │                    │
│   └──────┬──────┘   └──────┬───────┘                   │
│          │                 ▼                             │
│          │          ┌──────────────┐                    │
│          │          │  Socket.io   │                    │
│          │          │   Server     │                    │
│          │          └──────────────┘                    │
│          ▼                                               │
│   ┌─────────────┐                                       │
│   │  PostgreSQL  │  (or SQLite for dev)                 │
│   │  Database   │                                       │
│   └─────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Application Flow

### 1️⃣ User Registration & Login Flow

```
User Opens App
      │
      ▼
┌─────────────┐    NO     ┌──────────────┐
│  Has Token? │──────────►│  Show Login  │
└──────┬──────┘           │  /Register   │
       │ YES              └──────┬───────┘
       ▼                         │ Submit
┌─────────────┐                  ▼
│  Dashboard  │◄────────┌──────────────┐
│ (Room List) │  Token  │  Strapi Auth │
└─────────────┘  Stored │  API Call    │
                        └──────────────┘
```

### 2️⃣ Real-Time Messaging Flow

```
User Sends Message
        │
        ▼
 Next.js Frontend
 (POST /api/messages)
        │
        ▼
  Strapi REST API ──► Saves to DB
        │
        ▼ (Webhook Fires)
  Socket.io Server
        │
        ├──► Broadcast to Room
        │         │
        │         ▼
        │   All Room Members
        │   Receive Message
        │
        └──► Emit 'new-message' event
```

### 3️⃣ Room Join & Presence Flow

```
User Selects Room
        │
        ▼
 Socket.io Client
 emit('join-room', { roomId, user })
        │
        ▼
 Socket.io Server
        │
        ├──► socket.join(roomId)
        ├──► Update active users map
        └──► broadcast('user-joined')
                   │
                   ▼
           All Room Users Update
           Active Users Sidebar
```

---

## ⚙️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | React Framework (Routing, SSR, API) | `^14.x` |
| **Socket.io Client** | Real-time WS communication | `^4.x` |
| **Tailwind CSS** | Utility-first styling | `^3.x` |
| **React Context** | Auth state management | Built-in |
| **Axios** | HTTP client for REST calls | `^1.x` |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Strapi** | Headless CMS + REST API | `^4.x` |
| **Socket.io Server** | WebSocket real-time engine | `^4.x` |
| **Node.js** | JavaScript runtime | `^18.x` |
| **SQLite / PostgreSQL** | Database (dev / prod) | — |

---

## 📁 Project Structure

```
realtalk/
│
├── 📂 frontend/                  # Next.js Application
│   ├── 📂 components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx     # Login UI component
│   │   │   └── RegisterForm.jsx  # Registration UI
│   │   ├── Chat/
│   │   │   ├── ChatRoom.jsx      # Main chat interface
│   │   │   ├── MessageList.jsx   # Message feed display
│   │   │   ├── MessageInput.jsx  # Message compose bar
│   │   │   └── ActiveUsers.jsx   # Live users sidebar
│   │   └── Layout/
│   │       └── Navbar.jsx        # Navigation bar
│   ├── 📂 pages/
│   │   ├── index.jsx             # Landing / redirect
│   │   ├── login.jsx             # Login page
│   │   ├── register.jsx          # Register page
│   │   └── room/
│   │       └── [roomId].jsx      # Dynamic room page
│   ├── 📂 lib/
│   │   ├── socket.js             # Socket.io client init
│   │   └── api.js                # Axios API helpers
│   ├── 📂 context/
│   │   └── AuthContext.jsx       # Global auth state
│   └── .env.local                # Frontend env vars
│
├── 📂 backend/                   # Strapi + Socket.io
│   ├── 📂 src/
│   │   ├── 📂 api/
│   │   │   ├── message/          # Message content type
│   │   │   │   ├── content-types/
│   │   │   │   │   └── schema.json
│   │   │   │   ├── controllers/
│   │   │   │   ├── routes/
│   │   │   │   └── services/
│   │   │   └── chat-room/        # Chat Room content type
│   │   ├── 📂 extensions/
│   │   │   └── users-permissions/ # Auth customizations
│   │   └── 📂 socket/
│   │       └── index.js          # Socket.io server logic
│   ├── 📂 config/
│   │   ├── database.js
│   │   ├── server.js
│   │   └── middlewares.js
│   └── .env                      # Backend env vars
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/realtalk.git
cd realtalk
```

### 2. Setup Backend (Strapi)

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Start Strapi in development
npm run develop
```

> 🌐 Strapi Admin Panel: `http://localhost:1337/admin`

**Create an admin account**, then configure:
- ✅ Enable public access to `messages` collection (GET, POST)
- ✅ Enable `users-permissions` plugin endpoints
- ✅ Set up Webhook → `http://localhost:3001/webhook/new-message`

### 3. Setup Frontend (Next.js)

```bash
cd ../frontend
npm install

# Copy environment file
cp .env.local.example .env.local

# Start Next.js
npm run dev
```

> 🌐 Frontend App: `http://localhost:3000`

### 4. Run Both Together

```bash
# From root — run both concurrently
npm run dev
```

---

## 🔌 API Endpoints

### Authentication (Strapi)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/local/register` | Register new user |
| `POST` | `/api/auth/local` | Login, get JWT token |
| `GET` | `/api/users/me` | Get current user profile |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/messages?filters[room][$eq]=:roomId` | Get room messages |
| `POST` | `/api/messages` | Create a new message |

### Chat Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat-rooms` | List all chat rooms |
| `POST` | `/api/chat-rooms` | Create a new room |

---

## 🌐 Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId, user }` | Join a specific chat room |
| `leave-room` | `{ roomId, user }` | Leave a chat room |
| `send-message` | `{ roomId, message, user }` | Broadcast a message |
| `typing` | `{ roomId, user }` | Emit typing indicator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new-message` | `{ id, text, user, createdAt }` | New message received |
| `user-joined` | `{ user, activeUsers }` | User entered the room |
| `user-left` | `{ user, activeUsers }` | User exited the room |
| `active-users` | `[...users]` | Current online users list |
| `typing` | `{ user }` | Another user is typing |

---

## 🖼️ UI Components

```
┌──────────────────────────────────────────────────────────┐
│  NAVBAR  ─────────────── RealTalk  [Username] [Logout]   │
├──────────────────────────────────────────────────────────┤
│                                           │              │
│  ROOM LIST          MESSAGE FEED          │  ACTIVE      │
│  ──────────         ──────────────────    │  USERS       │
│  # general     │   [Alice] Hello! 👋      │  ──────────  │
│  # dev-chat    │   [Bob] Hey there!       │  🟢 Alice    │
│  # random      │   [You] Sup everyone     │  🟢 Bob      │
│                │                          │  🟢 You      │
│                │   ────────────────────   │              │
│                │   [  Type a message... ] │              │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
                  ┌────────────────────┐
                  │   User Submits     │
                  │   Login Form       │
                  └────────┬───────────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │  POST /api/auth/   │
                  │  local (Strapi)    │
                  └────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              │ Success                 │ Failure
              ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  Store JWT in    │      │  Show Error Msg  │
    │  localStorage /  │      │  to User         │
    │  httpOnly cookie │      └──────────────────┘
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Redirect to     │
    │  /room/general   │
    └──────────────────┘
```

---

## 🛠️ Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:1337
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Backend (`backend/.env`)

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-salt-here
ADMIN_JWT_SECRET=your-admin-secret
JWT_SECRET=your-jwt-secret
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
SOCKET_PORT=3001
```

---

## 📊 Database Schema

### Message Content Type

```json
{
  "kind": "collectionType",
  "collectionName": "messages",
  "attributes": {
    "text":      { "type": "text",     "required": true },
    "user":      { "type": "relation", "target": "plugin::users-permissions.user" },
    "chat_room": { "type": "relation", "target": "api::chat-room.chat-room" },
    "createdAt": { "type": "datetime" }
  }
}
```

### ChatRoom Content Type

```json
{
  "kind": "collectionType",
  "collectionName": "chat_rooms",
  "attributes": {
    "name":        { "type": "string",   "required": true, "unique": true },
    "description": { "type": "text" },
    "messages":    { "type": "relation", "target": "api::message.message", "relation": "oneToMany" }
  }
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Full-Stack Engineer Assignment**

⭐ Star this repo if you found it helpful!

</div>
