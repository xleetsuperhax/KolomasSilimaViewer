# Module: src/services/pubgApi.ts

PUBG REST API client. Handles rate limiting and 404 detection.

## Exports

### `fetchMatch(matchId, apiKey): Promise<PubgMatchResponse>`
Fetches match metadata from `https://api.pubg.com/shards/tournament/matches/{matchId}`.
- Calls `rateLimit()` before every request (enforces 10 req/min)
- Throws `MatchExpiredError` on HTTP 404
- Throws generic `Error` on other non-OK responses

### `class MatchExpiredError extends Error`
Sentinel for expired matches (PUBG deletes after 14 days).
- `matchId: string` — the match UUID that 404'd
- Callers catch this to add the matchId to `partialDataMatchIds`, not to crash

## Rate limiter (module-level, not exported)
Ring buffer of `requestTimestamps: number[]`. Before each request:
1. Purges timestamps older than 60s
2. If 10 timestamps remain, waits until the oldest is 60s old + 100ms buffer
3. Recursively re-checks after waiting (handles concurrent callers)

**Important:** The ring buffer is module-level — it persists across React re-renders
and hook calls within the same browser session.
