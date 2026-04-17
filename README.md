# NexusAI — Full Stack AI SaaS

A production-ready AI SaaS platform built with Next.js 14, Express.js, MongoDB, and OpenAI GPT-4o.

## Project Structure

```
nexusai/
├── frontend/                          # Next.js 14 App
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── globals.css            # Global styles
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx         # Dashboard sidebar layout
│   │   │       ├── page.tsx           # Overview
│   │   │       ├── chat/page.tsx      # AI Chat
│   │   │       ├── generate/page.tsx  # Content Generator
│   │   │       ├── history/page.tsx   # Generation History
│   │   │       └── settings/page.tsx  # Settings & Plan
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios API client
│   │   │   ├── store.ts               # Zustand auth store
│   │   │   └── utils.ts               # Utility functions
│   │   └── types/index.ts             # TypeScript types
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── package.json
│
└── backend/                           # Express.js API
    ├── src/
    │   ├── index.ts                   # Entry point
    │   ├── config/db.ts               # MongoDB connection
    │   ├── models/
    │   │   ├── User.ts
    │   │   ├── Conversation.ts
    │   │   └── Generation.ts
    │   ├── routes/
    │   │   ├── auth.ts                # /api/auth/*
    │   │   ├── chat.ts                # /api/chat/*
    │   │   ├── generate.ts            # /api/generate/*
    │   │   └── user.ts                # /api/user/*
    │   ├── middleware/
    │   │   ├── auth.ts                # JWT guard
    │   │   └── rateLimit.ts           # Rate limiting
    │   └── services/openai.ts         # OpenAI service
    ├── tsconfig.json
    └── package.json
```

## Quick Start

### 1. Clone and install

```bash
# Install backend dependencies
cd nexusai/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```



**Frontend** — create `frontend/.env.local` from `frontend/.env.local.example`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Docker (easiest)
docker run -d -p 27017:27017 --name mongodb mongo:7

# Ubuntu
sudo systemctl start mongod
```

### 4. Run in development

Open two terminals:

```bash
# Terminal 1 — Backend
cd nexusai/backend
npm run dev
# API starts at http://localhost:5000

# Terminal 2 — Frontend
cd nexusai/frontend
npm run dev
# App starts at http://localhost:3000
```

Visit **http://localhost:3000** 🎉

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/chat/conversations | List conversations |
| POST | /api/chat/conversations | New conversation |
| POST | /api/chat/conversations/:id/messages | Send message |
| DELETE | /api/chat/conversations/:id | Delete conversation |
| POST | /api/generate/content | Generate content |
| GET | /api/generate/history | Generation history |
| PATCH | /api/generate/:id/favorite | Toggle favorite |
| DELETE | /api/generate/:id | Delete generation |
| GET | /api/user/profile | Get profile |
| PUT | /api/user/profile | Update profile |
| GET | /api/user/usage | Usage stats |

## Features

- ✅ AI Chat with GPT-4o (persistent conversations)
- ✅ Content Generator (8 types, 6 tones, 11 languages)
- ✅ JWT Auth with bcrypt
- ✅ Per-plan usage limits (Free / Pro / Enterprise)
- ✅ Usage analytics dashboard
- ✅ Generation history with favorites
- ✅ Dark premium UI
- ✅ Rate limiting & security headers
- ✅ MongoDB with Mongoose ODM
- ✅ Full TypeScript

## Production Deployment

**Frontend → Vercel:**
```bash
cd frontend && vercel deploy
# Set: NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

**Backend → Railway / Render:**
```bash
cd backend && npm run build && npm start
# Set all env vars from .env.example
```

**Database → MongoDB Atlas (free tier):**
https://cloud.mongodb.com
