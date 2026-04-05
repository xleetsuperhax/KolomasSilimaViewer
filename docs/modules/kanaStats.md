# Module: src/services/kanaStats.ts

Loads Pappaliiga game lists and team rosters from KanaStats.

## Exports

### `loadGames(season, division, useLive?): Promise<KanaGame[]>`
- `useLive=false` (default): reads from `/public/data/` bundled JSON.
  Key `"{season}:{division}"` must be registered in `BUNDLED_DATA_FILES` (constants/maps.ts).
- `useLive=true`: fetches via `corsproxy.io` CORS proxy. Headers include User-Agent + Referer
  to avoid 403. Response is normalised via `normalizeKanaGames`.

**Note:** The games endpoint does NOT return rosters. `teams[]` is always `[]` from live fetch.
Rosters come separately from `loadRoster`.

### `loadRoster(season, division): Promise<{teamName, players}[]>`
Fetches `https://kanastats.com/pappaliiga/{season}/{division}/teams?_data=...` via CORS proxy.
Returns empty array (not a throw) on failure — team filter simply becomes unavailable.

## Internal helpers
- `normalizeKanaGames(raw)` — adapts Remix loader JSON shape to `KanaGame[]`.
  KanaStats API schema is undocumented; adjust if fields change.
- `normalizeRoster(raw)` — adapts roster response. Handles both `name` and `teamName`/`accountName`
  field variants defensively.

## CORS proxy
`const CORS_PROXY = 'https://corsproxy.io/?url='`
If corsproxy.io is down, user can run: `npx local-cors-proxy --proxyUrl https://kanastats.com --port 8010`
and change the constant to `'http://localhost:8010/proxy/'`.
