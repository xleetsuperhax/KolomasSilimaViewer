import type { PubgMatchResponse, TelemetryEvent, ParachuteLanding } from '../types'

export function extractTelemetryUrl(matchResponse: PubgMatchResponse): string {
  const asset = matchResponse.included.find(
    i => i.type === 'asset' && typeof i.attributes.URL === 'string',
  )
  if (!asset?.attributes.URL) {
    throw new Error('No telemetry URL found in match response')
  }
  return asset.attributes.URL
}

export async function fetchLandings(
  telemetryUrl: string,
  matchId: string,
  mapName: string,
  rosterMap: Map<string, string>, // playerName → teamName
): Promise<ParachuteLanding[]> {
  const res = await fetch(telemetryUrl)
  if (!res.ok) {
    throw new Error(`Telemetry fetch failed: ${res.status}`)
  }

  const text = await res.text()
  const events = JSON.parse(text) as TelemetryEvent[]

  return events
    .filter(e => e._T === 'LogParachuteLanding' && e.character != null)
    .map(e => ({
      playerName: e.character!.name,
      x: e.character!.location.x,
      y: e.character!.location.y,
      matchId,
      mapName,
      teamName: rosterMap.get(e.character!.name) ?? null,
    }))
}

/** Build a playerName → teamName lookup from a flat list of KanaGame entries. */
export function buildRosterMap(
  games: Array<{ teams: Array<{ teamName: string; players: string[] }> }>,
): Map<string, string> {
  const map = new Map<string, string>()
  for (const game of games) {
    for (const team of game.teams) {
      for (const player of team.players) {
        map.set(player, team.teamName)
      }
    }
  }
  return map
}
