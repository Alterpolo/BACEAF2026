# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Application de préparation au Bac Français 2026 (EAF - Épreuve Anticipée de Français). Elle permet aux élèves de réviser la méthodologie, de s'entraîner avec des sujets générés par IA (DeepSeek), et de consulter le programme officiel. Inclut un système d'abonnement Stripe et un mode enseignant.

## Commands

### Frontend (React)
```bash
npm install          # Install dependencies
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend (API Server)
```bash
cd server
npm install          # Install dependencies
npm run dev          # Dev server with hot reload (port 3001)
npm run build        # Compile TypeScript
npm start            # Run production build
```

## Environment Setup

### Frontend `.env.local`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
```

### Backend `server/.env`
```
PORT=3001
DEEPSEEK_API_KEY=your_key          # Optional: runs mock if absent
STRIPE_SECRET_KEY=your_key         # Optional: runs demo mode if absent
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STUDENT_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_STUDENT_PREMIUM_YEARLY=price_...
STRIPE_PRICE_STUDENT_TUTORING_MONTHLY=price_...
STRIPE_PRICE_STUDENT_TUTORING_YEARLY=price_...
STRIPE_PRICE_TEACHER_PRO_MONTHLY=price_...
STRIPE_PRICE_TEACHER_PRO_YEARLY=price_...
```

## Architecture

### Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + React Router v7 + Framer Motion
- **Backend**: Hono (Node.js) + TypeScript + Zod validation
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: DeepSeek V3.2 API (proxied through backend, mock fallback)
- **Payments**: Stripe (subscriptions, customer portal)

### Directory Structure

```
src/
├── components/           # React components
│   ├── layout/           # Layout with navigation
│   └── ui/               # Reusable primitives
├── contexts/
│   ├── AuthContext.tsx   # Supabase Auth session
│   └── SubscriptionContext.tsx  # Plan/feature access
├── services/
│   ├── api.ts            # AI API client
│   ├── database.ts       # Supabase CRUD (exercises, notes, progress)
│   ├── payments.ts       # Subscription helpers
│   ├── progression.ts    # Skill tracking
│   └── tutoring.ts       # Tutoring session booking
├── constants.ts          # Static data (program, methodology)
└── types.ts              # TypeScript interfaces

server/src/
├── routes/
│   ├── ai.ts             # /api/ai/* endpoints
│   ├── payments.ts       # /api/payments/* (Stripe checkout, webhook)
│   └── tutoring.ts       # /api/tutoring/* (session management)
├── services/
│   ├── deepseek.ts       # DeepSeek API wrapper
│   ├── deepseek-mock.ts  # Demo mode fallback
│   └── stripe.ts         # Stripe service (plans, checkout, portal)
├── middleware/
│   ├── rateLimiter.ts    # 20 req/min per IP on AI routes
│   └── subscription.ts   # Plan verification
└── index.ts              # Server entry point

supabase/migrations/      # SQL migration files (001-007)
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/generate-subject` | POST | Generate exam subject |
| `/api/ai/generate-subject-list` | POST | Generate 3 subjects |
| `/api/ai/evaluate` | POST | Correct student work |
| `/api/ai/work-analysis` | POST | Generate study guide |
| `/api/payments/checkout` | POST | Create Stripe checkout |
| `/api/payments/portal` | POST | Stripe customer portal |
| `/api/payments/webhook` | POST | Stripe webhook handler |
| `/api/tutoring/*` | Various | Tutoring session management |
| `/health` | GET | Health check |

### Core Patterns

**Authentication**: Supabase Auth (email/password + Google OAuth). `AuthContext` manages session state. Routes protected via `ProtectedRoute` wrapper in `App.tsx`.

**Subscription System**: Three tiers (free/premium/tutoring) + teacher plan. `SubscriptionContext` provides `isPremium`, `hasAI`, `canDoExercise` helpers. Free tier limited to 3 exercises/week.

**AI Integration**: Frontend (`src/services/api.ts`) → Backend (`/api/ai/*`) → DeepSeek API. If `DEEPSEEK_API_KEY` missing, uses mock service for demo.

**Payments**: Stripe checkout sessions with 1-day trial. Webhook updates `subscriptions` table in Supabase. Customer portal for managing subscriptions.

**Database**: Supabase tables include `exercises`, `progress`, `notes`, `subscriptions`, `skills`, `user_skills`, `classes`, `tutors`, `tutoring_sessions`.

### Path Aliases

`@/*` maps to project root (frontend only, configured in `tsconfig.json` and `vite.config.ts`).

## Important Notes

- Both backend services (DeepSeek, Stripe) run in **demo/mock mode** when API keys are missing - useful for local development
- Rate limiting: 20 requests/minute per IP on `/api/ai/*` routes
- Router uses `HashRouter` for compatibility with static hosting
- UI language is French; code uses mix of French/English

## Database Migrations

Located in `supabase/migrations/`:
1. `001_initial_schema.sql` - Users, exercises, progress, notes
2. `002_teacher_mode.sql` - Profiles, classes, teacher-student relationships
3. `003_methodology_progression.sql` - Skills, user_skills, achievements
4. `004_stripe_subscriptions.sql` - Subscriptions, stripe_events, tutors, tutoring_sessions
5. `005_tutoring_hours_rpc.sql` - Atomic RPC for tutoring hours (increment/decrement)
6. `006_onboarding_fields.sql` - Onboarding completion tracking
7. `007_analytics_events.sql` - Analytics events for conversion funnel
