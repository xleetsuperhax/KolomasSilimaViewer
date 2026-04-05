# Module: src/utils/exportPng.ts

Composites two canvases (map image + heatmap overlay) into a PNG and triggers download.

## Exports

### `exportHeatmapPng(mapCanvas, heatCanvas, filename?): Promise<void>`
1. Creates an offscreen `<canvas>` at the same dimensions as `mapCanvas`
2. Draws `mapCanvas` then `heatCanvas` on top
3. Calls `canvas.toBlob()` → creates object URL → clicks a hidden `<a>` to download
4. Revokes the object URL

**Default filename:** `'pappaliiga-heatmap.png'`

Called from `ExportButton` component, which receives both canvas refs from `HeatmapCanvas`
via `useImperativeHandle` / `forwardRef`.
