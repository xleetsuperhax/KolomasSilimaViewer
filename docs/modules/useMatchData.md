# Module: src/hooks/useMatchData.ts

Orchestrates the full data-fetch pipeline: match metadata → telemetry → landings.

## Exports

### `useMatchData(): UseMatchDataResult`
```ts
{
  landings: ParachuteLanding[]
  progress: ProgressState
  partialDataMatchIds: string[]   // match IDs that 404'd (expired)
  loadAll: (games, apiKey, season, division) => Promise<void>
  reset: () => void
}
```

### `loadAll(games, apiKey, season, division)`
Sequentially processes each game:
1. Attempts `loadRoster(season, division)` via CORS proxy for team names (silent fail)
2. Builds `rosterMap` from bundled game data teams + live roster
3. For each game:
   - `fetchMatch(matchId, apiKey)` → sets phase `'matches'`
   - `extractTelemetryUrl()` from response
   - `fetchLandings(url, ...)` → sets phase `'telemetry'`
   - Appends to `accumulated[]`, calls `setLandings([...accumulated])` incrementally
   - On `MatchExpiredError`: adds to `partialDataMatchIds`, marks as failed
   - On other errors: logs to console, marks as failed
   - `finally`: increments `progress.completed` + `progress.failed`
4. Sets phase `'done'` when all games processed

**Sequential processing** is intentional: avoids saturating the 10 req/min rate limit
and limits peak memory by not holding multiple telemetry payloads simultaneously.

### `reset()`
Sets `cancelRef.current = true` (stops any in-flight loop immediately), then clears
`landings`, `progress`, and `partialDataMatchIds` back to initial idle state.

## Cancellation
A `useRef<boolean>` (`cancelRef`) guards the sequential loop.
- `loadAll` sets it `false` at the start of each run
- `reset` sets it `true` — the loop checks `if (cancelRef.current) break` before each match
- Prevents setState calls from a stale loop after the user triggers a new load
