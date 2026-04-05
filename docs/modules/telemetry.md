# Module: src/services/telemetry.ts

Fetches PUBG telemetry files and extracts parachute landing events.

## Exports

### `extractTelemetryUrl(matchResponse): string`
Finds the asset entry with `type === 'asset'` and a non-empty `attributes.URL` in the
match response's `included` array. Throws if not found.

### `fetchLandings(telemetryUrl, matchId, mapName, rosterMap): Promise<ParachuteLanding[]>`
1. Fetches the telemetry URL (large JSON, 5–15 MB compressed)
2. Parses the full JSON array
3. Filters for `_T === 'LogParachuteLanding'` events
4. Maps each to `ParachuteLanding` — raw `x`/`y` game coords, not yet converted to pixels
5. Looks up `character.name` in `rosterMap` to set `teamName` (null if not found)

### `buildRosterMap(games): Map<string, string>`
Iterates all `games[].teams[].players` and builds a `playerName → teamName` map.
Used by `useMatchData` hook to pass into `fetchLandings`.
Accepts any array with `{ teams: { teamName, players }[] }` shape.
