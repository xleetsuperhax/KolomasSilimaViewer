# Module: src/utils/heatmap.ts

Gaussian KDE heatmap renderer. Writes directly to a Canvas 2D context.

## Exports

### `renderHeatmap(ctx, landings, mapMeta, options?): void`
Clears the canvas and renders a density heatmap.

**Algorithm:**
1. Allocate `Float32Array(W * H)` density grid
2. For each landing: splat a 2D Gaussian kernel (`e^(-d²/2σ²)`) within a `3σ` bounding box
3. Normalise grid 0→1 by dividing by max value
4. For each cell with `t > 0.01`: interpolate colour from ramp, set alpha = `t * opacity * 255`
5. Write `ImageData` to canvas

**Performance:** 1024×1024 canvas, 100 drops, bandwidth=30 → ~150ms.
The `3σ` clamp is critical — without it, each point iterates all 1M pixels.

### `HeatmapOptions`
```ts
{ bandwidth: number  // Gaussian radius in canvas pixels (default: 30)
  opacity: number    // overlay opacity 0–1 (default: 0.75) }
```

## Colour ramp
`blue(0) → cyan(0.25) → green(0.5) → yellow(0.75) → red(1.0)`
Linear interpolation between stops.

## Usage pattern
- Called from `HeatmapCanvas` component's `useEffect`
- Context belongs to the **heatmap overlay canvas** (not the map image canvas)
- Re-called whenever `landings` or `mapMeta` changes (filters applied upstream)
