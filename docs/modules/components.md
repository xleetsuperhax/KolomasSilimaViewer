# Components — src/components/

## ApiKeyInput
`{ apiKey, onSave }` — password input with Save button. Maintains local draft state;
only calls `onSave` on form submit to avoid saving on every keystroke.

## SeasonDivisionPicker
`{ season, division, onChange, disabled? }` — two `<select>` dropdowns populated from
`SEASONS` and `DIVISIONS` constants. Disabled during active fetch.

## MapFilter
`{ selected, availableMaps, onChange }` — row of tab buttons for each `MapDisplayName`.
Buttons with no data in `availableMaps` are dimmed and non-interactive.
Always shows all 4 maps so the layout doesn't shift as data loads.

## TeamFilter
`{ availableTeams, selectedTeams, onChange }` — "All teams" button + scrollable checkbox list.
`selectedTeams=[]` means "all" (no filter). Max height 12rem with overflow scroll.
Shows placeholder if `availableTeams` is empty.

## DropCountBadge
`{ count, matchCount }` — two small pills: "N drops" and "N matches".

## PartialDataWarning
`{ expiredCount, totalCount }` — yellow banner. Renders null if `expiredCount === 0`.

## LoadingProgress
`{ progress: ProgressState }` — thin progress bar + phase label + estimated time remaining.
Renders null when `phase === 'idle'` or `phase === 'done'`.
Estimated time: `(elapsed / completed) * remaining`, formatted as `~Xm Ys`.

## HeatmapCanvas
`{ mapMeta, landings, bandwidth, opacity }` + `forwardRef<HeatmapCanvasHandle>`

Two stacked `<canvas>` elements (1024×1024 internal, CSS-scaled):
- **Map canvas**: draws the map PNG via `<Image>` on `mapMeta` change.
  On load error: calls `drawPlaceholder` — map-specific colored background + subtle grid + name label.
  Placeholder colors: Erangel=forest green, Miramar=desert sand, Taego=olive, Vikendi=snow blue.
- **Heat canvas**: calls `renderHeatmap` on `landings`/`mapMeta`/`bandwidth`/`opacity` change.

`HeatmapCanvasHandle = { mapCanvas: HTMLCanvasElement | null, heatCanvas: HTMLCanvasElement | null }`
Used by `ExportButton` to composite both canvases into a PNG.

## ExportButton
`{ canvasRef, selectedMap, disabled? }` — calls `exportHeatmapPng` with both canvas
elements from the `HeatmapCanvasHandle` ref. Shows "Exporting…" during async operation.
Filename: `pappaliiga-{map}-drops.png`.

## App.tsx — state layout
```
apiKey          useApiKey hook
season          useState (default: pappaliiga-s11)
division        useState (default: 4div)
games           useState<KanaGame[]>
selectedMap     useState<MapDisplayName> (default: Erangel)
selectedTeams   useState<string[]> (default: [])
bandwidth       useState (default: 30)
opacity         useState (default: 0.75)

landings              useMatchData
progress              useMatchData
partialDataMatchIds   useMatchData

availableMaps   useMemo — unique MapDisplayName from landings
availableTeams  useMemo — unique non-null teamName from landings, sorted
filteredLandings useHeatmapData(landings, selectedMap, selectedTeams)
filteredMatchCount useMemo — unique matchIds in filteredLandings
```

Layout: `header (fixed top) | sidebar (w-64) | main (flex-1)`
- Sidebar: season picker → Load button → progress → map filter → sliders → team filter
- Main: status badges → partial data warning → canvas (or empty/loading state)
