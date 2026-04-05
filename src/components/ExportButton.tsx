import { useRef, useState } from 'react'
import type { HeatmapCanvasHandle } from './HeatmapCanvas'
import { exportHeatmapPng } from '../utils/exportPng'
import type { MapDisplayName } from '../types'

interface Props {
  canvasRef: React.RefObject<HeatmapCanvasHandle | null>
  selectedMap: MapDisplayName
  disabled?: boolean
}

export function ExportButton({ canvasRef, selectedMap, disabled }: Props) {
  const [exporting, setExporting] = useState(false)
  // Keep a stable ref for the button to avoid stale closure
  const exportingRef = useRef(false)

  const handleExport = async () => {
    if (exportingRef.current) return
    const handle = canvasRef.current
    if (!handle?.mapCanvas || !handle?.heatCanvas) return

    exportingRef.current = true
    setExporting(true)
    try {
      await exportHeatmapPng(
        handle.mapCanvas,
        handle.heatCanvas,
        `pappaliiga-${selectedMap.toLowerCase()}-drops.png`,
      )
    } finally {
      exportingRef.current = false
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting}
      className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 rounded text-sm font-medium transition-colors"
    >
      {exporting ? 'Exporting…' : 'Export PNG'}
    </button>
  )
}
