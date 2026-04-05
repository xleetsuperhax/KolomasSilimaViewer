import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import type { ParachuteLanding, MapMeta, MapDisplayName } from '../types'
import { renderHeatmap } from '../utils/heatmap'

// Map-specific palette for placeholder backgrounds
const MAP_COLORS: Record<MapDisplayName, { bg: string; grid: string; label: string }> = {
  Erangel:  { bg: '#2d3d2e', grid: '#3d5a3e', label: '#7aab7b' },
  Miramar:  { bg: '#3d3020', grid: '#6b5535', label: '#c4a87a' },
  Taego:    { bg: '#2e3a22', grid: '#4a5c32', label: '#9ab870' },
  Vikendi:  { bg: '#2a3540', grid: '#3d5060', label: '#90b8d0' },
}

function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  mapName: MapDisplayName,
  size: number,
): void {
  const colors = MAP_COLORS[mapName] ?? MAP_COLORS.Erangel
  const gridStep = size / 8

  // Background
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, size, size)

  // Subtle grid lines
  ctx.strokeStyle = colors.grid
  ctx.lineWidth = 1
  for (let i = 1; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(i * gridStep, 0)
    ctx.lineTo(i * gridStep, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * gridStep)
    ctx.lineTo(size, i * gridStep)
    ctx.stroke()
  }

  // Map name
  ctx.fillStyle = colors.label
  ctx.textAlign = 'center'
  ctx.font = `bold ${size / 20}px sans-serif`
  ctx.fillText(mapName, size / 2, size / 2 - size / 30)

  // Instruction
  ctx.font = `${size / 40}px sans-serif`
  ctx.fillStyle = colors.grid
  ctx.fillText('Add map image to /public/maps/', size / 2, size / 2 + size / 20)
  ctx.fillText(`${mapName}.png`, size / 2, size / 2 + size / 20 + size / 28)
}

export interface HeatmapCanvasHandle {
  mapCanvas: HTMLCanvasElement | null
  heatCanvas: HTMLCanvasElement | null
}

interface Props {
  mapMeta: MapMeta
  landings: ParachuteLanding[]
  bandwidth: number
  opacity: number
}

const CANVAS_SIZE = 1024

export const HeatmapCanvas = forwardRef<HeatmapCanvasHandle, Props>(
  function HeatmapCanvas({ mapMeta, landings, bandwidth, opacity }, ref) {
    const mapCanvasRef = useRef<HTMLCanvasElement>(null)
    const heatCanvasRef = useRef<HTMLCanvasElement>(null)

    // Expose both canvas refs to parent for PNG export
    useImperativeHandle(ref, () => ({
      get mapCanvas() {
        return mapCanvasRef.current
      },
      get heatCanvas() {
        return heatCanvasRef.current
      },
    }))

    // Draw map image — re-runs when the map changes
    useEffect(() => {
      const canvas = mapCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
      }
      img.onerror = () => {
        drawPlaceholder(ctx, mapMeta.displayName, CANVAS_SIZE)
      }
      img.src = mapMeta.imagePath
    }, [mapMeta])

    // Render heatmap — re-runs when landings or options change
    useEffect(() => {
      const canvas = heatCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      renderHeatmap(ctx, landings, mapMeta, { bandwidth, opacity })
    }, [landings, mapMeta, bandwidth, opacity])

    return (
      <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
        <canvas
          ref={mapCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 w-full h-full"
        />
        <canvas
          ref={heatCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  },
)
