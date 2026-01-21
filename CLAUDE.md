# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

- **Start Dev Server**: `npm run dev` (Runs on http://localhost:5173)
- **Build for Production**: `npm run build` (Type-check and build to `dist/`)
- **Lint Code**: `npm run lint` (ESLint)
- **Preview Build**: `npm run preview`
- **Install Dependencies**: `npm install`

*Note: No test runner is currently configured.*

## Architecture & Codebase Structure

### Core Architecture
React 19 + TypeScript SPA with a dual-mode backend (abstracted via `src/lib/api.ts`):
1.  **Local Mode**: Offline-first using `localStorage` (default, no auth).
2.  **Cloud Sync Mode**: Uses Supabase (PostgreSQL + Auth) when configured.

### Key Directories
- `src/lib/`: Core API abstraction (`api.ts` switches implementation).
- `src/hooks/`: React Query hooks (`useDiary.ts`) consuming the API.
- `src/components/diary/`: Feature components (Thoughts, Diet, Exercise, Todo).
- `src/contexts/`: Global state (AuthContext).
- `src/types/`: Shared type definitions.

### State Management
- **Server State**: TanStack Query (React Query) for fetching/syncing.
- **Auth State**: React Context (`AuthContext.tsx`) for Supabase sessions.
- **Local UI**: Standard React hooks (`useState`, `useReducer`).

## Development Guidelines

### Data Model Changes
The central entity is `DailyEntry` (keyed by `YYYY-MM-DD`). To modify:
1.  Update `DailyEntry` in `src/types/index.ts`.
2.  Update **BOTH** `src/lib/mockApi.ts` (local) and `src/lib/supabaseApi.ts` (cloud).
3.  If using Supabase, add SQL migration for `daily_entries`.

### Styling & UI
- **Framework**: Tailwind CSS + shadcn/ui.
- **Components**: Use `src/components/ui/` for primitives.
- **Utils**: Use `cn()` for class merging.

### Conventions
- **Imports**: Absolute imports with `@/`.
- **Dates**: `YYYY-MM-DD` strings, manipulated via `date-fns`.
- **Strict Mode**: No `any` types.
