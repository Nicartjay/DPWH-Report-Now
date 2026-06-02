# Next.js Migration

Historical reference documenting the migration from a plain Node.js server to a Next.js wrapper.

## Summary

The application was migrated from a custom `http.createServer` implementation to Next.js (currently v16). The frontend code (vanilla JavaScript, HTML, CSS) was not changed — only the server layer was replaced.

## What Changed

| Before | After |
|--------|-------|
| Custom Node.js HTTP server (`server.js`) | Next.js framework (v16) |
| Manual routing for API endpoints | `pages/api/` (file-based routing) |
| Manual CORS header management | Automatic same-origin handling |
| Node.js `http`/`https` modules | Modern `fetch` API |
| Static files served from root | Static files served from `public/` |
| Absolute endpoint URLs in frontend | Relative URLs (`/api/...`) |

## Files Added

| File | Purpose |
|------|---------|
| `pages/api/projects.js` | DPWH API proxy route |
| `pages/_app.js` | Minimal Next.js app component |
| `pages/index.js` | Redirects `/` to `/index.html` |
| `next.config.js` | Next.js configuration |
| `.gitignore` | Excludes `.next/`, `node_modules/`, `.env*` |

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Added Next.js/React deps, updated scripts to `next dev/build/start` |

## Files Moved

All static frontend files moved into `public/` directory (Next.js convention for static assets).

## Why Next.js?

- **Built-in API routes** — No separate server file needed
- **Hot reload** — Better developer experience
- **Production-ready** — Easy deployment to Vercel, Cloudflare Pages, etc.
- **Minimal impact** — Frontend remains vanilla JavaScript (React is only a Next.js runtime dependency)
- **Same port** — Still runs on port 3000 by default

## What Stayed the Same

- All frontend code (HTML, CSS, JavaScript)
- Request/response format
- Brutalist design system and assets
- Google Fonts integration
- No breaking changes for end users

## Current State

The project now uses Next.js exclusively as a lightweight wrapper. The `server.js` file no longer exists. All development uses:

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm start      # Start production server
```
