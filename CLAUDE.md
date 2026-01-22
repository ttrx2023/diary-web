# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Start Dev Server**: `npm run dev` (Runs on http://localhost:5173)
- **Build for Production**: `npm run build` (Type-check and build to `dist/`)
- **Lint Code**: `npm run lint` (ESLint)
- **Preview Build**: `npm run preview`
- **Install Dependencies**: `npm install`

## Architecture & Structure

### Core Stack
- **Framework**: React 19 + TypeScript + Vite 7.
- **PWA**: `vite-plugin-pwa` for offline support and installation.
- **State Management**:
  - **Server State**: TanStack Query (`@tanstack/react-query`) for data fetching/syncing.
  - **Global State**: React Context (`AuthContext`, `ThemeContext`).
  - **Drag & Drop**: `@dnd-kit` (used in Todo/Sortable lists).
- **Styling**: Tailwind CSS + shadcn/ui. Utils: `clsx`, `tailwind-merge` (via `cn` helper).

### Data Layer (Dual-Mode)
The app runs in two modes, abstracted via `src/lib/api.ts`:
1.  **Local Mode**: `src/lib/mockApi.ts` - Uses `localStorage` (offline-first).
2.  **Cloud Mode**: `src/lib/supabaseApi.ts` - Uses Supabase (PostgreSQL + Auth).

### Directory Overview
- `src/lib/`: Core logic. `api.ts` is the central interface. `exportService.ts` handles data export.
- `src/hooks/`: React Query hooks (`useDiary.ts`, `useAllEntries.ts`) and auth/preference hooks.
- `src/components/diary/`: Feature modules (Thoughts, Diet, Exercise, Todo, Discovery).
- `src/components/ui/`: Reusable shadcn/ui components.
- `src/contexts/`: `AuthContext` (User session), `ThemeContext` (Dark/Light mode).
- `src/pages/`: Route targets (Lazy loaded).
- `src/types/`: Shared definitions (`DailyEntry`, `Thought`, etc.).

## Development Guidelines

### Performance & PWA
- **Code Splitting**: Routes are lazy-loaded in `App.tsx` using `React.lazy` + `Suspense`.
- **Mobile Optimization**: `index.css` contains strict rules (`touch-action: manipulation`, `overscroll-behavior-y: none`) for native-like feel.
- **Meta Tags**: `index.html` includes `mobile-web-app-capable` tags for PWA support.

### Modifying the Data Model
The central entity is `DailyEntry` (keyed by date string `YYYY-MM-DD`). To add fields or sections:
1.  **Type Definition**: Update interfaces in `src/types/index.ts`.
2.  **API Implementation**: You **MUST** update implementations in both:
    - `src/lib/mockApi.ts` (Local storage logic)
    - `src/lib/supabaseApi.ts` (Supabase logic)
3.  **Database**: If using Supabase, ensure SQL migrations match the schema changes.

### Conventions
- **Imports**: Use absolute imports with `@/` (e.g., `import { Button } from "@/components/ui/button"`).
- **Dates**: Use `YYYY-MM-DD` string format for storage keys. Use `date-fns` for manipulation.
- **Strict Mode**: No `any` types. Ensure strict null checks.
- **UI Components**: Place reusable primitives in `src/components/ui/`.
