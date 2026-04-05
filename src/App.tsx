import { useState, useMemo, useEffect, useRef } from 'react'
import type { MapDisplayName, KanaGame } from './types'
import { MAP_META } from './constants/maps'
import { loadGames } from './services/kanaStats'
import { useApiKey } from './hooks/useApiKey'
import { useMatchData } from './hooks/useMatchData'
import { useHeatmapData } from './hooks/useHeatmapData'
import { ApiKeyInput } from './components/ApiKeyInput'
import { SeasonDivisionPicker } from './components/SeasonDivisionPicker'
import { MapFilter } from './components/MapFilter'
import { TeamFilter } from './components/TeamFilter'
import { HeatmapCanvas } from './components/HeatmapCanvas'
import type { HeatmapCanvasHandle } from './components/HeatmapCanvas'
import { LoadingProgress } from './components/LoadingProgress'
import { PartialDataWarning } from './components/PartialDataWarning'
import { DropCountBadge } from './components/DropCountBadge'
import { ExportButton } from './components/ExportButton'

export default function App() {
  const { apiKey, setApiKey } = useApiKey()
  const [season, setSeason] = useState('pappaliiga-s11')
  const [division, setDivision] = useState('4div')
  const [games, setGames] = useState<KanaGame[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoadingGames, setIsLoadingGames] = useState(false)
  const [selectedMap, setSelectedMap] = useState<MapDisplayName>('Erangel')
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [bandwidth, setBandwidth] = useState(30)
  const [opacity, setOpacity] = useState(0.75)

  const canvasRef = useRef<HeatmapCanvasHandle | null>(null)
  const { landings, progress, partialDataMatchIds, loadAll, reset } = useMatchData()

  // Derive which maps have data loaded
  const availableMaps = useMemo<MapDisplayName[]>(() => {
    const found = new Set<MapDisplayName>()
    for (const l of landings) {
      const meta = MAP_META[l.mapName]
      if (meta) found.add(meta.displayName)
    }
    return Array.from(found)
  }, [landings])

  // Derive unique team names from all landings that have a teamName
  const availableTeams = useMemo<string[]>(() => {
    const found = new Set<string>()
    for (const l of landings) {
      if (l.teamName) found.add(l.teamName)
    }
    return Array.from(found).sort()
  }, [landings])

  const filteredLandings = useHeatmapData(landings, selectedMap, selectedTeams)

  // Count unique matches in the current filtered view
  const filteredMatchCount = useMemo(
    () => new Set(filteredLandings.map(l => l.matchId)).size,
    [filteredLandings],
  )

  const currentMapMeta = Object.values(MAP_META).find(m => m.displayName === selectedMap)!

  const isLoading = progress.phase === 'matches' || progress.phase === 'telemetry'

  const handleSeasonDivisionChange = (s: string, d: string) => {
    setSeason(s)
    setDivision(d)
    reset()
    setGames([])
    setLoadError(null)
    setSelectedTeams([])
  }

  const handleLoad = async () => {
    if (!apiKey) {
      setLoadError('Enter your PUBG API key first.')
      return
    }
    setLoadError(null)
    setIsLoadingGames(true)
    try {
      const fetched = await loadGames(season, division)
      setGames(fetched)
      reset()
      setSelectedTeams([])
      // Auto-select first available map after load if current has no data
      await loadAll(fetched, apiKey, season, division)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load game data.')
    } finally {
      setIsLoadingGames(false)
    }
  }

  // Auto-switch to a map that has data when loading completes
  useEffect(() => {
    if (progress.phase === 'done' && availableMaps.length > 0 && !availableMaps.includes(selectedMap)) {
      setSelectedMap(availableMaps[0])
    }
  }, [progress.phase, availableMaps, selectedMap])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between gap-4">
        <h1 className="text-lg font-bold tracking-tight whitespace-nowrap">
          Pappaliiga Drop Heatmap
        </h1>
        <div className="flex items-center gap-3 flex-1 max-w-md ml-auto">
          <ExportButton
            canvasRef={canvasRef}
            selectedMap={selectedMap}
            disabled={landings.length === 0}
          />
          <div className="flex-1">
            <ApiKeyInput apiKey={apiKey} onSave={setApiKey} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-gray-800 p-4 flex flex-col gap-5 overflow-y-auto">

          {/* Season + Division */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Season / Division
            </h2>
            <SeasonDivisionPicker
              season={season}
              division={division}
              onChange={handleSeasonDivisionChange}
              disabled={isLoading}
            />
          </section>

          {/* Load button */}
          <button
            onClick={handleLoad}
            disabled={isLoading || isLoadingGames}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded font-medium text-sm transition-colors"
          >
            {isLoadingGames ? 'Loading…' : isLoading ? 'Fetching…' : 'Load Data'}
          </button>

          {loadError && (
            <p className="text-red-400 text-xs -mt-3">{loadError}</p>
          )}

          {/* Progress */}
          {isLoading && <LoadingProgress progress={progress} />}

          {/* Map filter */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Map
            </h2>
            <MapFilter
              selected={selectedMap}
              availableMaps={availableMaps.length > 0 ? availableMaps : ['Erangel', 'Miramar', 'Taego', 'Vikendi']}
              onChange={setSelectedMap}
            />
          </section>

          {/* Heatmap options */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Heatmap
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Bandwidth: {bandwidth}px</span>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={bandwidth}
                  onChange={e => setBandwidth(Number(e.target.value))}
                  className="accent-blue-500"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-gray-400">Opacity: {Math.round(opacity * 100)}%</span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(opacity * 100)}
                  onChange={e => setOpacity(Number(e.target.value) / 100)}
                  className="accent-blue-500"
                />
              </label>
            </div>
          </section>

          {/* Team filter */}
          <section className="flex-1">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Teams
            </h2>
            <TeamFilter
              availableTeams={availableTeams}
              selectedTeams={selectedTeams}
              onChange={setSelectedTeams}
            />
          </section>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto min-w-0">
          {/* Status row */}
          <div className="flex items-center gap-3 flex-wrap">
            <DropCountBadge count={filteredLandings.length} matchCount={filteredMatchCount} />
            {games.length > 0 && (
              <span className="text-xs text-gray-500">
                {season} / {division} — {games.length} matches in dataset
              </span>
            )}
          </div>

          {/* Partial data warning */}
          <PartialDataWarning
            expiredCount={partialDataMatchIds.length}
            totalCount={games.length}
          />

          {/* Loading progress in main area when no data yet */}
          {isLoading && landings.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-sm">
                <LoadingProgress progress={progress} />
                <p className="text-center text-gray-500 text-xs mt-3">
                  PUBG API rate limit: ~6s per match
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && landings.length === 0 && progress.phase === 'idle' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <p className="text-lg font-medium mb-1">No data loaded</p>
                <p className="text-sm">Enter your PUBG API key and click Load Data</p>
              </div>
            </div>
          )}

          {/* Canvas */}
          {(landings.length > 0 || isLoading) && currentMapMeta && (
            <div className="flex-1 flex items-start justify-center">
              <div className="w-full max-w-3xl">
                <HeatmapCanvas
                  ref={canvasRef}
                  mapMeta={currentMapMeta}
                  landings={filteredLandings}
                  bandwidth={bandwidth}
                  opacity={opacity}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
