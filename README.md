# DPWH Report Now

Mobile-first web app for browsing and reporting DPWH infrastructure projects on an interactive map with AI chat support.

Built with vanilla JavaScript, Leaflet.js, and a brutalist design system. Uses Next.js as a minimal server wrapper for API proxying.

## Features

- **Interactive Map** — Browse DPWH projects on a Leaflet map with automatic geolocation
- **Smart Filtering** — Filter by distance (500m–50km), project status, and infrastructure type
- **Marker Interactions** — Click markers to get directions or view project details
- **Animated Routing** — Visualize routes from your location to any project
- **AI Assistant** — Chat with an AI assistant for project-related queries
- **Issue Reporting** — Report concerns on specific projects
- **Cover Page** — Animated landing page with Philippines map background
- **Brutalist Design** — Bold typography, thick borders, hard shadows, no gradients

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Server | Next.js 16 (API proxy + static serving) |
| Frontend | Vanilla JavaScript (ES6 modules) |
| Mapping | Leaflet.js 1.9.4, Leaflet Routing Machine, OpenStreetMap |
| Styling | Modular CSS with custom properties |
| Data | DPWH Transparency API |
| Geocoding | Nominatim (OpenStreetMap) |
| Routing | OSRM |
| AI | Langflow / IBM AI (proxied through `/api/chat`) |
| Fonts | Darker Grotesque, Inter, JetBrains Mono |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Modern browser with geolocation support

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production

```bash
npm run build
npm start
```

## Project Structure

```
├── pages/
│   ├── _app.js              # Minimal Next.js app shell
│   ├── index.js             # Redirects to static frontend
│   └── api/
│       └── chat.js          # AI proxy API route
├── public/
│   ├── index.html           # Main application HTML
│   ├── favicon.svg
│   └── src/
│       ├── css/
│       │   ├── main.css     # CSS entry (import order matters)
│       │   ├── base/        # Variables, reset, typography
│       │   ├── layout/      # Map, header, panels, bottom sheet
│       │   ├── components/  # Buttons, cards, modals, markers
│       │   ├── utilities/   # Animations, responsive, loading
│       │   └── vendor/      # Leaflet overrides
│       └── js/
│           ├── main.js      # JS entry point
│           ├── api/         # DPWH, geocoding, report APIs
│           ├── config/      # Constants, province mappings
│           ├── events/      # Event handlers, global handlers
│           ├── services/    # AI chat, filtering, location, routing
│           ├── state/       # AppState singleton
│           ├── ui/          # Map, markers, panels, modals, bottom sheet
│           └── utils/       # Formatters, helpers, validators
├── package.json
├── next.config.js
└── .gitignore
```

## Architecture

### Why Next.js?

Next.js serves two purposes only:
1. **Static file serving** — Serves the vanilla JS frontend from `public/`
2. **API proxy** — Proxies AI chat requests to hide API keys and avoid CORS

The frontend is entirely vanilla JavaScript with no React rendering.

### Frontend Architecture

Layered modular design with strict dependency direction:

```
Entry Point (main.js)
  → Events (user interactions)
    → UI (DOM, rendering)
      → Services (business logic)
        → API / State / Utils
          → Config (constants)
```

### State Management

- `appState` singleton manages all application state
- Display logic uses `appState.filteredProjects` (never modify `.projects` directly)
- Distance filter defaults to 1km for performance

### Data Flow

1. Browser requests geolocation
2. Coordinates are reverse-geocoded via Nominatim
3. City/province used to query DPWH Transparency API
4. Projects filtered by distance, then status/type
5. Markers rendered on Leaflet map

## Design System

Brutalist aesthetic defined in `public/src/css/base/variables.css`:

| Element | Value |
|---------|-------|
| Primary | `#DD614C` (Coral Red) |
| Secondary | `#DAA144` (Golden Yellow) |
| Borders | 2–4px, `#111827` (Near Black) |
| Shadows | Hard offset, no blur |
| Corners | Square (no border-radius) |
| Display Font | Darker Grotesque (900, uppercase) |
| Body Font | Inter |
| Mono Font | JetBrains Mono |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` |

## AI Chat Integration

The AI assistant uses a server-side proxy pattern:

```
Browser → POST /api/chat → Next.js API Route → Langflow/IBM AI → Response
```

- API key stays server-side (never exposed to browser)
- Session ID maintained in `sessionStorage` for conversation continuity
- Responses rendered with markdown formatting

See [AI_CHAT_SETUP.md](AI_CHAT_SETUP.md) for detailed setup instructions.

## Environment Variables

For production, configure these in `.env.local`:

```
LANGFLOW_API_KEY=your_api_key
LANGFLOW_API_ENDPOINT=your_endpoint_url
```

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari iOS 12+
- Chrome Mobile (Android)

Requirements: ES6 modules, Geolocation API, Fetch API. Geolocation requires HTTPS in production (localhost exempt).

## Known Limitations

- DPWH API may return invalid coordinates (lat/lng = 0) — these are skipped
- DPWH endpoint may trigger Cloudflare verification
- AI response format may vary; frontend handles graceful fallback
- Maximum dataset size limited by upstream DPWH API

## Documentation

- [AI_CHAT_SETUP.md](AI_CHAT_SETUP.md) — AI feature setup and troubleshooting
- [NEXTJS_MIGRATION.md](NEXTJS_MIGRATION.md) — Migration notes from plain Node.js to Next.js
- [TESTING.md](TESTING.md) — Comprehensive testing guide
- [AGENTS.md](AGENTS.md) — Developer patterns and gotchas

## Credits

- [OpenStreetMap](https://www.openstreetmap.org/) — Map tiles and geocoding
- [Leaflet.js](https://leafletjs.com/) — Interactive mapping
- [DPWH Transparency Portal](https://transparency.dpwh.gov.ph) — Project data
- [Material Icons](https://fonts.google.com/icons) — Icon set

## License

This project is intended for demonstration and development purposes around publicly available DPWH infrastructure data.

---

**Made with Bob**
