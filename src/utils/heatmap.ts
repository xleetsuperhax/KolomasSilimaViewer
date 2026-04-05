import type { ParachuteLanding, MapMeta } from '../types'
import { gameToCanvas } from './coordinates'

export interface HeatmapOptions {
  /** Gaussian kernel radius in canvas pixels. Default: 30 */
  bandwidth: number
  /** Final heatmap layer opacity 0–1. Default: 0.75 */
  opacity: number
}

const DEFAULT_OPTIONS: HeatmapOptions = {
  bandwidth: 30,
  opacity: 0.75,
}

interface ColorStop {
  stop: number
  color: [number, number, number]
}

// Blue → cyan → green → yellow → red
const COLOR_RAMP: ColorStop[] = [
  { stop: 0.0,  color: [0,   0,   255] },
  { stop: 0.25, color: [0,   255, 255] },
  { stop: 0.5,  color: [0,   255, 0  ] },
  { stop: 0.75, color: [255, 255, 0  ] },
  { stop: 1.0,  color: [255, 0,   0  ] },
]

/**
 * Render a Gaussian KDE heatmap onto a canvas context.
 * The context is cleared before rendering.
 *
 * Algorithm:
 * 1. For each landing, splat a 2D Gaussian kernel into a Float32Array density grid.
 * 2. Normalise the grid 0→1.
 * 3. Map each cell through the colour ramp and write RGBA pixels.
 * 4. Write the ImageData to the canvas.
 */
export function renderHeatmap(
  ctx: CanvasRenderingContext2D,
  landings: ParachuteLanding[],
  mapMeta: MapMeta,
  options: Partial<HeatmapOptions> = {},
): void {
  const { bandwidth: bw, opacity } = { ...DEFAULT_OPTIONS, ...options }
  const W = ctx.canvas.width
  const H = ctx.canvas.height

  ctx.clearRect(0, 0, W, H)

  if (landings.length === 0) return

  // ── Step 1: Build density grid ────────────────────────────────────────────
  const density = new Float32Array(W * H)
  const bw2 = bw * bw
  const kernelNorm = 1 / (2 * Math.PI * bw2)
  // Only splat within 3σ — beyond this the contribution is negligible
  const splatRadius = Math.ceil(bw * 3)

  for (const landing of landings) {
    const { px, py } = gameToCanvas(landing.x, landing.y, mapMeta, W, H)

    const xMin = Math.max(0, Math.floor(px) - splatRadius)
    const xMax = Math.min(W - 1, Math.floor(px) + splatRadius)
    const yMin = Math.max(0, Math.floor(py) - splatRadius)
    const yMax = Math.min(H - 1, Math.floor(py) + splatRadius)

    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        const dx = x - px
        const dy = y - py
        density[y * W + x] += kernelNorm * Math.exp(-(dx * dx + dy * dy) / (2 * bw2))
      }
    }
  }

  // ── Step 2: Find max for normalisation ───────────────────────────────────
  let maxDensity = 0
  for (let i = 0; i < density.length; i++) {
    if (density[i] > maxDensity) maxDensity = density[i]
  }
  if (maxDensity === 0) return

  // ── Step 3: Map to RGBA ───────────────────────────────────────────────────
  const imageData = ctx.createImageData(W, H)
  const pixels = imageData.data

  for (let i = 0; i < density.length; i++) {
    const t = density[i] / maxDensity
    if (t < 0.01) continue // leave transparent

    const [r, g, b] = interpolateColor(t)
    const a = Math.round(t * opacity * 255)

    const off = i * 4
    pixels[off]     = r
    pixels[off + 1] = g
    pixels[off + 2] = b
    pixels[off + 3] = a
  }

  ctx.putImageData(imageData, 0, 0)
}

function interpolateColor(t: number): [number, number, number] {
  let lo = COLOR_RAMP[0]
  let hi = COLOR_RAMP[COLOR_RAMP.length - 1]

  for (let i = 0; i < COLOR_RAMP.length - 1; i++) {
    if (t >= COLOR_RAMP[i].stop && t <= COLOR_RAMP[i + 1].stop) {
      lo = COLOR_RAMP[i]
      hi = COLOR_RAMP[i + 1]
      break
    }
  }

  const span = hi.stop - lo.stop
  const localT = span === 0 ? 0 : (t - lo.stop) / span

  return [
    Math.round(lo.color[0] + (hi.color[0] - lo.color[0]) * localT),
    Math.round(lo.color[1] + (hi.color[1] - lo.color[1]) * localT),
    Math.round(lo.color[2] + (hi.color[2] - lo.color[2]) * localT),
  ]
}
