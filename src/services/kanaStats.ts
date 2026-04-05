import type { KanaGame } from '../types'
import { BUNDLED_DATA_FILES } from '../constants/maps'

const CORS_PROXY = 'https://corsproxy.io/?url='
const KANA_BASE = 'https://kanastats.com/pappaliiga'

/**
 * Load games for a season+division.
 * - Default: serves from bundled JSON in /public/data/ (no CORS issues, fast)
 * - useLive=true: fetches from KanaStats via CORS proxy (requires internet, may be flaky)
 */
export async function loadGames(
  season: string,
  division: string,
  useLive = false,
): Promise<KanaGame[]> {
  if (useLive) {
    return loadLiveGames(season, division)
  }
  return loadBundledGames(season, division)
}

async function loadBundledGames(season: string, division: string): Promise<KanaGame[]> {
  const key = `${season}:${division}`
  const path = BUNDLED_DATA_FILES[key]
  if (!path) {
    throw new Error(
      `No bundled data for ${key}. ` +
        'Either add a JSON file to public/data/ and register it in BUNDLED_DATA_FILES, ' +
        'or use the live fetch option.',
    )
  }
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error(`Failed to load bundled data from ${path}: ${res.status}`)
  }
  return res.json() as Promise<KanaGame[]>
}

async function loadLiveGames(season: string, division: string): Promise<KanaGame[]> {
  const targetUrl =
    `${KANA_BASE}/${season}/${division}/games` +
    `?_data=routes/$org.$serie.$group.games._index`
  const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`

  const res = await fetch(proxiedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
      Referer: `https://kanastats.com/pappaliiga/${season}/${division}/games`,
      Accept: 'application/json, */*',
    },
  })
  if (!res.ok) {
    throw new Error(`KanaStats live fetch failed: ${res.status}`)
  }
  const raw = await res.json()
  return normalizeKanaGames(raw)
}

/**
 * Adapt the raw KanaStats Remix loader response to our KanaGame[] shape.
 * The actual API schema is undocumented — inspect via DevTools Network tab on kanastats.com
 * and adjust this function if fields differ.
 */
function normalizeKanaGames(raw: unknown): KanaGame[] {
  // Expected shape based on spec:
  // { games: [{ gameId, mapName, createdAt, positions: [{ teamId, rank, kills }] }], teams: { "4": "BADA BING!" } }
  const data = raw as {
    games: Array<{
      gameId: string
      mapName: string
      createdAt: string
    }>
    teams: Record<string, string>
  }

  return (data.games ?? []).map(g => ({
    matchId: g.gameId,
    map: g.mapName,
    date: g.createdAt,
    // KanaStats games endpoint doesn't include rosters — teams array left empty.
    // Rosters come from the /teams endpoint (Phase 3 hook handles this separately).
    teams: [],
  }))
}

/**
 * Load team rosters for a season+division from the KanaStats teams endpoint.
 * Used by useMatchData to build the playerName→teamName lookup.
 */
export async function loadRoster(
  season: string,
  division: string,
): Promise<Array<{ teamName: string; players: string[] }>> {
  const targetUrl =
    `${KANA_BASE}/${season}/${division}/teams` +
    `?_data=routes/$org.$serie.$group.teams._index`
  const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`

  const res = await fetch(proxiedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0',
      Referer: `https://kanastats.com/pappaliiga/${season}/${division}/teams`,
      Accept: 'application/json, */*',
    },
  })
  if (!res.ok) {
    // Roster is optional — team filtering just won't be available
    console.warn(`KanaStats roster fetch failed: ${res.status}`)
    return []
  }
  const raw = await res.json()
  return normalizeRoster(raw)
}

function normalizeRoster(
  raw: unknown,
): Array<{ teamName: string; players: string[] }> {
  // Adjust if the actual API response shape differs
  const data = raw as {
    teams?: Array<{
      name?: string
      teamName?: string
      players?: Array<{ name?: string; accountName?: string }>
    }>
  }
  return (data.teams ?? []).map(t => ({
    teamName: t.teamName ?? t.name ?? 'Unknown',
    players: (t.players ?? []).map(p => p.accountName ?? p.name ?? '').filter(Boolean),
  }))
}
