# Repository Guidelines

This guide covers the structure, workflows, and contribution expectations for `diary-app`.

## Project Structure & Module Organization
- `src/` contains the React + TypeScript app.
  - `components/` shared UI and feature components (e.g., `components/diary/`, `components/ui/`).
  - `pages/` route-level screens (`Dashboard`, `History`, `Settings`, `Auth`).
  - `contexts/` and `hooks/` hold app state and data hooks (Supabase + React Query).
  - `lib/` contains API and Supabase integrations, including local storage fallbacks.
  - `types/` centralizes TypeScript types.
- `public/` holds static assets. `dist/` is the production build output.
- Setup references: `.env.example`, `SUPABASE_SETUP.md`, `SUPABASE_SETUP_DETAILED.md`, `DEPLOYMENT.md`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server (http://localhost:5173).
- `npm run build`: type-check and create the production build in `dist/`.
- `npm run preview`: preview the production build locally.
- `npm run lint`: run ESLint across the codebase.

## Coding Style & Naming Conventions
- Language: TypeScript + React (ES modules).
- Indentation: 2 spaces; use semicolons and double quotes (follow existing files).
- Components: `PascalCase` filenames and exports (e.g., `Settings.tsx`).
- Hooks: `useX` naming (e.g., `useDiary.ts`).
- Linting: ESLint configured in `eslint.config.js` (no Prettier in this repo).

## Testing Guidelines
- No automated test runner is configured in `package.json` yet.
- If you add tests, keep them near the code (e.g., `src/**/__tests__`) and use `*.test.tsx` / `*.test.ts` naming.
- Until tests exist, run `npm run lint` before submitting changes.

## Commit & Pull Request Guidelines
- This workspace does not include `.git`, so there is no established commit history.
- Use short, imperative commit messages: `Add calendar filters`, `Fix auth redirect`.
- PRs should include: a concise summary, testing notes (`npm run lint`, `npm run build`), and UI screenshots for visual changes.

## Security & Configuration Tips
- Do not commit `.env`; use `.env.example` as the template.
- Supabase credentials are required for cloud sync; local mode works without them.
- If changing data access rules, update the SQL in `SUPABASE_SETUP.md` and document the change.