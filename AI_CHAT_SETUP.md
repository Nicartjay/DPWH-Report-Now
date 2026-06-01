# AI Chat Setup Guide

Setup and configuration guide for the AI chat feature in DPWH Report Now.

## Overview

The AI chat feature uses a server-side proxy pattern to securely communicate with an upstream AI service (Langflow / IBM AI). The browser never calls the AI endpoint directly — all requests are routed through the Next.js API route at `/api/chat`.

```
Browser (Frontend)
    ↓ POST /api/chat
    ↓ { input_value, session_id }
Next.js API Route (pages/api/chat.js)
    ↓ POST with x-api-key header
AI Backend (Langflow / IBM)
    ↓ Response
Next.js API Route
    ↓ Normalized response
Browser (Frontend)
```

## Prerequisites

- Node.js 18+
- npm
- AI backend endpoint URL and API key

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the AI chat button appears in the floating control stack on the right side.

## Configuration

### Environment Variables

For production, create a `.env.local` file:

```
LANGFLOW_API_KEY=your_api_key_here
LANGFLOW_API_ENDPOINT=your_endpoint_url_here
```

For local development, the API key can be configured directly in `pages/api/chat.js`. Never commit production keys to the repository.

### API Route

The proxy is implemented in `pages/api/chat.js`:

- Accepts POST requests from the frontend
- Attaches the API key server-side
- Forwards requests to the upstream AI endpoint
- Normalizes JSON or text responses for the frontend

### Frontend Service

The client-side chat logic lives in `public/src/js/services/aiChatService.js`:

- Sends messages to `/api/chat` (relative URL)
- Manages `session_id` in `sessionStorage` for conversation continuity
- Parses nested response payloads
- Renders responses with markdown formatting
- Falls back to plain text when formatting is inconsistent

## Session Handling

1. First message: no `session_id` is sent
2. Upstream returns a `session_id` in the response
3. Frontend stores it in `sessionStorage`
4. Subsequent messages include the stored `session_id` for continuity

## Design

The AI chat modal follows the brutalist design system:

- Square modal with thick borders (4px) and hard offset shadows
- Coral Red (`#DD614C`) for the AI button and primary actions
- Near Black (`#111827`) for borders and text
- Darker Grotesque for headings, Inter for body text
- No rounded corners
- Brutalist easing: `cubic-bezier(0.16, 1, 0.3, 1)`

## Troubleshooting

### CORS Errors

If you see CORS errors, the frontend is likely calling an external endpoint directly. Ensure:
- The AI service URL points to `/api/chat` (relative), not an absolute external URL
- The Next.js dev server is running

### Port 3000 Already in Use

```bash
npm run dev -- -p 3001
```

### Connection Refused

1. Verify the Next.js server is running (`npm run dev`)
2. Check terminal for "Ready" status
3. Confirm http://localhost:3000 is accessible

### AI Returns Unexpected Format

The frontend includes fallback logic for inconsistent upstream responses:
- JSON validation before parsing
- Extraction from nested payloads
- Cleanup of tool-output wrappers
- Raw-response logging in browser console (for debugging)

### Dependencies Not Installed

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
rm -rf .next
npm run build
```

Ensure Node.js version is 18.0.0 or higher.

## Production Deployment

```bash
npm run build
npm start
```

For cloud platforms (Vercel, Netlify, etc.):
1. Push to Git repository
2. Connect to deployment platform
3. Set environment variables (`LANGFLOW_API_KEY`, `LANGFLOW_API_ENDPOINT`)
4. Platform auto-detects Next.js and deploys

## Security Notes

- API key is server-side only (never sent to browser)
- CORS handled automatically by Next.js (same-origin requests)
- No secrets in `public/` directory
- For production, always use environment variables

---

**Made with Bob**
