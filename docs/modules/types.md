# Module: src/types/index.ts

All shared TypeScript interfaces for the app. No runtime code — types only.

## Exports

### KanaTeam
```ts
{ teamName: string; players: string[] }
```
One team entry from KanaStats. `players` are in-game account names.

### KanaGame
```ts
{ matchId: string; map: string; date: string; teams: KanaTeam[] }
```
One match entry from KanaStats (bundled JSON or live API). `map` is the raw PUBG
internal name e.g. `"Baltic_Main"`.

### PubgMatchResponse
Shape of the PUBG API `GET /shards/tournament/matches/{id}` response.
Contains `data.relationships.assets.data[]` which links to the telemetry asset.

### PubgIncluded
Entries in `PubgMatchResponse.included`. The telemetry asset has `type === 'asset'`
and `attributes.URL` containing the telemetry download URL.

### TelemetryEvent
One event in a PUBG telemetry JSON array. Key field: `_T` (event type string).
Drop events have `_T === "LogParachuteLanding"` and a `character.location` object.

### ParachuteLanding
Processed drop point, ready for rendering:
```ts
{ playerName, x, y, matchId, mapName, teamName: string | null }
```
`x`/`y` are raw PUBG game coordinates (not yet converted to pixels).

### MapDisplayName
`'Erangel' | 'Miramar' | 'Taego' | 'Vikendi'`

### MapMeta
```ts
{ displayName: MapDisplayName; rawName: string; size: number; imagePath: string }
```
Used for coordinate conversion and image loading.

### FetchPhase
`'idle' | 'matches' | 'telemetry' | 'done'`

### ProgressState
```ts
{ total: number; completed: number; failed: number; phase: FetchPhase; startedAt: number | null }
```
Drives the `LoadingProgress` component. `startedAt` is `Date.now()` when fetching began.
