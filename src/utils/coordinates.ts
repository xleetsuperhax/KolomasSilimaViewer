import type { MapMeta } from '../types'

export interface CanvasPoint {
  px: number
  py: number
}

/**
 * Convert PUBG game coordinates to canvas pixel coordinates.
 *
 * PUBG uses a bottom-left origin (y increases upward).
 * Canvas uses a top-left origin (y increases downward).
 * The Y flip: pixelY = (1 - gameY / mapSize) * canvasHeight
 */
export function gameToCanvas(
  gameX: number,
  gameY: number,
  mapMeta: MapMeta,
  canvasWidth: number,
  canvasHeight: number,
): CanvasPoint {
  return {
    px: (gameX / mapMeta.size) * canvasWidth,
    py: (1 - gameY / mapMeta.size) * canvasHeight,
  }
}
