# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal journaling application built with React, TypeScript, and Supabase. The app supports both local-only mode (localStorage) and cloud-sync mode (Supabase), allowing users to track daily thoughts, diet, exercises, and todos across multiple devices.

## Development Commands

### Essential Commands
```bash
npm install              # Install dependencies
npm run dev             # Start dev server at http://localhost:5173
npm run build           # Type-check with tsc and build for production
npm run preview         # Preview production build locally
npm run lint            # Run ESLint
```

### Important Notes
- No test runner is currently configured
- The app runs on Vite dev server (port 5173)
- Production builds output to `dist/`

## Architecture & Key Patterns

### Dual-Mode API Architecture

The app uses an **abstraction layer pattern** to support two operational modes:

1. **Local Mode**: Data stored in browser localStorage (no Supabase credentials)
2. **Cloud Sync Mode**: Data synced via Supabase PostgreSQL (requires credentials)

**Critical files:**
- `src/lib/api.ts` - Exports a single `api` object that auto-switches between implementations
- `src/lib/mockApi.ts` - localStorage implementation (DiaryApi interface)
- `src/lib/supabaseApi.ts` - Supabase implementation (DiaryApi interface)
- `src/lib/supabase.ts` - Conditionally creates Supabase client (returns `null` if env vars missing)

**How it works:**
```typescript
// src/lib/api.ts automatically switches based on configuration
export const api: DiaryApi = supabase ? supabaseApi : mockDiaryApi;
```

All data access goes through `src/hooks/useDiary.ts`, which uses TanStack Query and calls the abstracted `api` object. This means components never know which backend they're using.

### State Management

- **TanStack Query (React Query)**: All server/storage state, caching, and mutations
- **React Context**: Authentication state (`src/contexts/AuthContext.tsx`)
- **Query keys**: Format is `["entry", date]` for single entries

### Authentication Flow

- Managed by `AuthContext.tsx` using Supabase Auth
- In local mode, auth is bypassed (user object is null/mock)
- Protected routes check auth state before rendering

### Data Model

The core entity is `DailyEntry` (see `src/types/index.ts`):
- One entry per date (YYYY-MM-DD format)
- Contains:
  - `thoughts` (string)
  - `diet` (object with meals)
  - `exercises` (array of items with type 'reps' | 'duration' | 'distance')
  - `todos` (array of `TodoItem` objects with completion status)

## Environment Configuration

### Required for Cloud Sync
Create `.env` file (use `.env.example` as template):
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Local Mode
Simply omit the `.env` file or leave variables empty. The app will automatically fall back to localStorage.

## Database Setup (Cloud Sync Only)

If adding/modifying database schema:
1. Update SQL in `SUPABASE_SETUP.md` (main setup) or `SUPABASE_SETUP_DETAILED.md` (detailed)
2. Test migrations in Supabase SQL Editor
3. Ensure Row Level Security (RLS) policies are maintained
4. Update TypeScript types in `src/types/index.ts` to match schema changes

The database table is `daily_entries` with RLS policies that restrict access to `auth.uid()`.

## File Structure Conventions

- **Components**: `src/components/ui/` for reusable UI (shadcn/ui), `src/components/diary/` for feature components, `src/components/export/` for export features
- **Pages**: `src/pages/` for route-level components (Dashboard, History, Settings, Auth)
- **Hooks**: Custom hooks in `src/hooks/`, prefixed with `use`
- **Lib**: Utilities and API integrations in `src/lib/`
- **Types**: All TypeScript interfaces in `src/types/index.ts`

## Common Development Patterns

### Adding a New Data Field

1. Update `DailyEntry` interface in `src/types/index.ts`
2. Update both API implementations:
   - `src/lib/mockApi.ts` (localStorage logic)
   - `src/lib/supabaseApi.ts` (Supabase queries)
3. Add database migration SQL to `SUPABASE_SETUP.md`
4. Update relevant UI components in `src/components/diary/`
5. The `useDiary` hook will automatically handle the new field

### Working with Dates

- Use `date-fns` library (already installed)
- Dates are stored as YYYY-MM-DD strings
- Use `format(date, 'yyyy-MM-dd')` for consistency

### Styling

- Tailwind CSS 3 with custom configuration in `tailwind.config.js`
- UI components from shadcn/ui (Radix UI primitives)
- Use `cn()` utility from `src/lib/utils.ts` for conditional classes
- Follow existing component patterns for consistency

## Deployment

The app is designed for Vercel/Netlify deployment:
- Ensure environment variables are set in platform settings (not in code)
- See `DEPLOYMENT.md` for detailed deployment guide (in Chinese)
- Supabase configuration is **required** for cloud deployments (localStorage doesn't work across devices)
- `vercel.json` is already configured for SPA routing

## Security Considerations

- Never commit `.env` file (already in `.gitignore`)
- Supabase anon key is safe for client-side use (RLS protects data)
- User data is isolated via RLS policies matching `auth.uid()`
- Authentication uses Supabase Auth (email/password)

## Code Style

- TypeScript with strict mode
- 2-space indentation
- ES modules (`"type": "module"` in package.json)
- PascalCase for components, camelCase for utilities
- Use `@/` path alias for imports (configured in tsconfig)
