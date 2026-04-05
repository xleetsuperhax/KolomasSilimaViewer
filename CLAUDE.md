# Pappaliiga Drop Heatmap — CLAUDE.md

## Project overview
Browser-only React + Vite + Tailwind SPA. Visualises PUBG player drop locations for
the Pappaliiga league. No backend — all API calls run from the browser.

## Tech stack
- React 19 + TypeScript (strict)
- Vite 6 + @tailwindcss/vite (Tailwind v4, no tailwind.config.js needed)
- Canvas API for heatmap rendering (custom Gaussian KDE)
- clsx for conditional class names

## Dev commands
```
npm install        # install deps
npm run dev        # start dev server (http://localhost:5173)
npm run build      # type-check + production build → dist/
npm run preview    # serve dist/ locally
```

## Implementation phases
The project is built in 5 phases. Each phase has its own conversation turn.
- Phase 1: Scaffolding + types + constants (DONE)
- Phase 2: Services + utilities (pubgApi, telemetry, kanaStats, coordinates, heatmap, exportPng)
- Phase 3: Custom hooks (useApiKey, useMatchData, useHeatmapData)
- Phase 4: Components + App assembly (full working UI)
- Phase 5: Map images + polish

## Module documentation rule
After every phase that touches a module, update its corresponding MD file in `docs/modules/`.
These files are the authoritative summaries used in future conversation turns — always read
them at the start of a new phase before writing any code.

## Key technical decisions
| Decision | Choice |
|---|---|
| KanaStats CORS | Bundled JSON default (`/public/data/`), live CORS proxy optional |
| Heatmap | Custom Gaussian KDE on Canvas — no external deps |
| Canvas size | 1024×1024 internal pixels, CSS-scaled to container |
| State | useState in App.tsx + custom hooks — no Redux |
| Rate limiting | Module-level ring buffer in pubgApi.ts (10 req/min) |
| Map images | Local `/public/maps/` — no hotlinking |
| PUBG shard | **tournament** shard only — steam shard returns 404 for Pappaliiga |

## Data constants
- PUBG tournament API base: `https://api.pubg.com/shards/tournament`
- Map sizes: Baltic_Main=816000, Desert_Main=816000, Tiger_Main=816000, DihorOtok_Main=600000
- Y-axis flip: `pixelY = (1 - gameY / mapSize) * canvasHeight`
- 14-day match retention: 404 = expired, not a bug

## Module index
See `docs/modules/` for per-file documentation.
