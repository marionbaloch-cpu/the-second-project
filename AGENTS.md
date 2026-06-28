<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

`quantum-core` is a single, self-contained Next.js 16 (App Router) app — no database, env vars, or external services. The dev server (`npm run dev`, port 3000) serves both the UI and the internal `/api/analysis` route, so it is the only process needed to test end-to-end. Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`).

- `npm run lint` currently reports pre-existing errors (e.g. in `components/Dashboard.tsx` and the scan page) that exist on `master`; they are not caused by your changes — don't assume you broke the build.
- Core flow to exercise the app: dashboard → "INITIATE ANALYSIS" → fill modal form → submit (POSTs to `/api/analysis`) → navigates to `/scan`.
