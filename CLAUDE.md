# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Application de préparation au Bac Français 2026 (EAF - Épreuve Anticipée de Français). Elle permet aux élèves de réviser la méthodologie, de s'entraîner avec des sujets générés par IA (Gemini), et de consulter le programme officiel.

## Commands

### Frontend (React)
```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend (API Server)
```bash
cd server

# Install dependencies
npm install

# Run development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Setup

### Frontend
Create `.env.local` with:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

### Backend
Create `server/.env` with:
```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
PORT=3001
```

## Architecture

### Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + React Router v7
- **Backend**: Hono (Node.js) + TypeScript + Zod validation
- **AI**: DeepSeek V3.2 API (proxied through backend)

### Directory Structure

```
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   │   ├── layout/         # Layout wrapper with navigation
│   │   └── ui/             # Reusable UI primitives
│   ├── contexts/           # React contexts (AuthContext)
│   ├── services/           # API client (api.ts)
│   ├── constants.ts        # Static data (program, methodology)
│   ├── types.ts            # TypeScript interfaces
│   └── App.tsx             # Root component with routing
│
└── server/                 # Backend API
    └── src/
        ├── routes/         # API route handlers
        │   └── ai.ts       # AI endpoints (/api/ai/*)
        ├── services/       # Business logic
        │   └── gemini.ts   # Gemini API wrapper
        ├── middleware/     # Middleware (rate limiting)
        └── index.ts        # Server entry point
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/generate-subject` | POST | Generate exam subject |
| `/api/ai/generate-subject-list` | POST | Generate 3 subjects |
| `/api/ai/evaluate` | POST | Correct student work |
| `/api/ai/work-analysis` | POST | Generate study guide |
| `/health` | GET | Health check |

### Core Patterns

**Authentication**: Supabase Auth with email/password and Google OAuth. Session managed via `AuthContext` (`src/contexts/AuthContext.tsx`). Supabase client initialized in `src/lib/supabase.ts`. Routes protected with `ProtectedRoute`.

**AI Integration**: Frontend calls backend API (`src/services/api.ts`), backend proxies to DeepSeek (`server/src/services/deepseek.ts`). API key stays server-side.

**Rate Limiting**: 20 requests/minute per IP on `/api/ai/*` routes.

**Validation**: Zod schemas validate all API inputs.

### Path Aliases

`@/*` maps to project root (frontend only).

## Language

Application UI and content are in French. Code comments and variable names may be in French or English.
