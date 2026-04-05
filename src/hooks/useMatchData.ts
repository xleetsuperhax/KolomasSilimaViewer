import { useState, useCallback, useRef } from 'react'
import type { KanaGame, ParachuteLanding, ProgressState } from '../types'
import { fetchMatch, MatchExpiredError } from '../services/pubgApi'
import { extractTelemetryUrl, fetchLandings, buildRosterMap } from '../services/telemetry'
import { loadRoster } from '../services/kanaStats'

const IDLE_PROGRESS: ProgressState = {
  total: 0,
  completed: 0,
  failed: 0,
  phase: 'idle',
  startedAt: null,
}

export interface UseMatchDataResult {
  landings: ParachuteLanding[]
  progress: ProgressState
  partialDataMatchIds: string[]
  /** Call this to start fetching all matches for the given games list. */
  loadAll: (games: KanaGame[], apiKey: string, season: string, division: string) => Promise<void>
  reset: () => void
}

export function useMatchData(): UseMatchDataResult {
  const [landings, setLandings] = useState<ParachuteLanding[]>([])
  const [progress, setProgress] = useState<ProgressState>(IDLE_PROGRESS)
  const [partialDataMatchIds, setPartialDataMatchIds] = useState<string[]>([])
  // Cancellation flag: set to true when reset() is called or loadAll() starts a new run
  const cancelRef = useRef(false)

  const reset = useCallback(() => {
    cancelRef.current = true
    setLandings([])
    setProgress(IDLE_PROGRESS)
    setPartialDataMatchIds([])
  }, [])

  const loadAll = useCallback(
    async (games: KanaGame[], apiKey: string, season: string, division: string) => {
      if (!apiKey || games.length === 0) return

      // Cancel any in-progress fetch from a previous loadAll call
      cancelRef.current = false

      // Reset state for a fresh load
      setLandings([])
      setPartialDataMatchIds([])
      setProgress({
        total: games.length,
        completed: 0,
        failed: 0,
        phase: 'matches',
        startedAt: Date.now(),
      })

      // Try to fetch roster for team filtering; silently skip on failure
      let rosterMap: Map<string, string>
      try {
        const roster = await loadRoster(season, division)
        // Also merge any teams already present in bundled game data
        rosterMap = buildRosterMap([...games, { matchId: '', map: '', date: '', teams: roster }])
      } catch {
        rosterMap = buildRosterMap(games)
      }

      const accumulated: ParachuteLanding[] = []
      const expired: string[] = []

      // Process sequentially: respects rate limit and keeps peak memory manageable
      for (const game of games) {
        if (cancelRef.current) break
        let didFail = false
        try {
          // Phase: fetching match metadata
          setProgress(p => ({ ...p, phase: 'matches' }))
          const matchResp = await fetchMatch(game.matchId, apiKey)
          const telemetryUrl = extractTelemetryUrl(matchResp)

          // Phase: downloading telemetry
          setProgress(p => ({ ...p, phase: 'telemetry' }))
          const gameLandings = await fetchLandings(
            telemetryUrl,
            game.matchId,
            game.map,
            rosterMap,
          )

          accumulated.push(...gameLandings)
          // Spread to new array so React sees the state change
          setLandings([...accumulated])
        } catch (err) {
          didFail = true
          if (err instanceof MatchExpiredError) {
            expired.push(err.matchId)
            setPartialDataMatchIds([...expired])
          } else {
            console.error(`Failed to load match ${game.matchId}:`, err)
          }
        } finally {
          const wasFail = didFail
          setProgress(p => ({
            ...p,
            completed: p.completed + 1,
            failed: p.failed + (wasFail ? 1 : 0),
          }))
        }
      }

      setProgress(p => ({ ...p, phase: 'done' }))
    },
    [],
  )

  return { landings, progress, partialDataMatchIds, loadAll, reset }
}
