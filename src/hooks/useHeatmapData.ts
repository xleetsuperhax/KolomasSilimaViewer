import { useMemo } from 'react'
import type { ParachuteLanding, MapDisplayName } from '../types'
import { MAP_META } from '../constants/maps'

export function useHeatmapData(
  landings: ParachuteLanding[],
  selectedMap: MapDisplayName,
  selectedTeams: string[], // empty array = show all teams
): ParachuteLanding[] {
  return useMemo(() => {
    const mapMeta = Object.values(MAP_META).find(m => m.displayName === selectedMap)
    if (!mapMeta) return []

    return landings.filter(l => {
      if (l.mapName !== mapMeta.rawName) return false
      if (selectedTeams.length > 0 && !selectedTeams.includes(l.teamName ?? '')) return false
      return true
    })
  }, [landings, selectedMap, selectedTeams])
}
