/**
 * Composite the map image canvas and heatmap overlay canvas into a single PNG
 * and trigger a browser download.
 */
export async function exportHeatmapPng(
  mapCanvas: HTMLCanvasElement,
  heatCanvas: HTMLCanvasElement,
  filename = 'pappaliiga-heatmap.png',
): Promise<void> {
  const merged = document.createElement('canvas')
  merged.width = mapCanvas.width
  merged.height = mapCanvas.height

  const ctx = merged.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context for export canvas')

  ctx.drawImage(mapCanvas, 0, 0)
  ctx.drawImage(heatCanvas, 0, 0)

  const blob = await new Promise<Blob>((resolve, reject) => {
    merged.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png')
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
