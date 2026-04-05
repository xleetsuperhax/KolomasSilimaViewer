# Module: src/hooks/useHeatmapData.ts

Derives the filtered set of landings to render from the full raw landings array.

## Exports

### `useHeatmapData(landings, selectedMap, selectedTeams): ParachuteLanding[]`
`useMemo` that filters `landings` by:
1. `mapName === MAP_META[selectedMap].rawName` (e.g. `'Baltic_Main'`)
2. If `selectedTeams.length > 0`: `teamName` must be in `selectedTeams`
   (players with no team assignment — `teamName === null` — are excluded when team filter is active)

Returns empty array if `selectedMap` has no entry in `MAP_META`.

Re-runs only when `landings`, `selectedMap`, or `selectedTeams` reference changes.
No network calls — pure derivation from existing state.
