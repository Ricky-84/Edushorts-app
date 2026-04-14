# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Rules

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them.
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made.
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the tasks/todo.md file with a summary of the changes(with some low level explanation, as I don't want to be in the dark) you made and any other relevant information.

## Project Overview

EduShorts is a TikTok-style educational short-video app built with React Native (frontend) and Node.js/Express (backend). Users swipe through educational video clips, take quizzes, and earn XP/achievements.

## Key Versions

| Layer | Package | Version |
|-------|---------|---------|
| **Frontend** | React Native | 0.72.6 |
| | React | 18.2.0 |
| | TypeScript | 4.8.4 |
| | Redux Toolkit | 1.9.7 |
| | React Navigation | 6.x |
| | react-native-video | 6.4.5 |
| | react-native-mmkv | 2.10.2 |
| **Backend** | Node.js (required) | ≥18.0.0 |
| | Express | 4.18.2 |
| | TypeScript | 5.2.2 |
| | Prisma | 5.6.0 |
| | jsonwebtoken | 9.0.2 |
| **Infrastructure** | PostgreSQL (Docker) | 15-alpine |
| | Redis (Docker) | 7-alpine |
| **Test Device** | Pixel 6 (Android emulator) | Android 14 |

## Commands

### Frontend (React Native)
```bash
npm start              # Start Metro bundler
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
npm run lint           # ESLint check
npm run typecheck      # TypeScript type check
```

### Backend
```bash
cd backend && npm run dev      # Start backend with nodemon (hot reload)
cd backend && npm run build    # Compile TypeScript to dist/
cd backend && npm test         # Run backend tests
cd backend && npm run lint     # ESLint check

# Database (run inside Docker container, not host)
cd backend && npm run db:generate   # Regenerate Prisma client
cd backend && npm run db:migrate    # Run migrations
cd backend && npm run db:seed       # Seed sample video data
cd backend && npm run db:reset      # Reset and re-migrate (destructive)
```

### Docker (preferred for backend development)
```bash
npm run docker:up      # Start postgres, redis, backend containers
npm run docker:down    # Stop all containers

# Run Prisma/DB commands inside container (DATABASE_URL is only set there)
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx tsx src/prisma/seed.ts
```

> **Important**: `DATABASE_URL` is only available inside the Docker backend container. Always run Prisma CLI commands via `docker-compose exec backend ...`, not on the host.

## Architecture

### Frontend (`src/`)

**Navigation** — Three-level stack:
1. `AppNavigator` — root stack, switches between `AuthNavigator` and `MainTabNavigator` based on Redux `auth.isAuthenticated`
2. `AuthNavigator` — stack for Onboarding → Login/Register screens
3. `MainTabNavigator` — bottom tabs: VideoFeed, Progress, Profile

**State management** — Redux Toolkit with two slices:
- `authSlice` — user auth state, persisted via redux-persist → MMKV storage
- `videoSlice` — video list and playback state, not persisted

**API layer** — `src/services/videoService.ts` uses Axios with base URL `http://10.0.2.2:3000/api` (Android emulator localhost). Video streaming uses a direct URL (`/api/videos/:id/stream`) passed to the `VideoPlayer` component.

**Shared types** — `src/types/index.ts` defines `User`, `Video`, `Quiz`, `Question`, `UserProgress`, `Achievement`.

### Backend (`backend/src/`)

**Express server** (`server.ts`) registers routes under `/api/auth`, `/api/videos`, `/api/users`. Starts only after connecting to Postgres (Prisma) and Redis.

**Controllers**:
- `AuthController` — register/login with JWT, bcrypt password hashing
- `VideoController` — list videos (paginated), stream video files, track progress
- `UserController` — user profile management

**Database** — PostgreSQL via Prisma ORM. Schema: `User`, `Video`, `Quiz`, `QuizQuestion`, `UserProgress`, `Achievement`, `UserAchievement`, `QuizAttempt`. Schema file: `backend/prisma/schema.prisma`.

**Caching** — Redis (`backend/src/config/redis.ts`) for session/rate-limit data.

**Video files** — Stored locally in `backend/uploads/videos/`. Files must be placed there manually; the app has no upload UI. The `Video.url` field in the DB stores the filename, and the stream endpoint serves the file.

### Infrastructure
- Docker Compose runs postgres (5432), redis (6379), and backend (3000) containers.
- The `init.sql` file referenced in docker-compose.yml does not exist — Prisma migrations handle schema creation instead.
- Metro bundler runs on port 8081 (Android emulator connects via `10.0.2.2:3000` for the backend).
