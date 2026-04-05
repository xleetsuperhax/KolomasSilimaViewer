// ── KanaStats shapes ─────────────────────────────────────────────────────────

export interface KanaTeam {
  teamName: string
  players: string[] // in-game account names
}

export interface KanaGame {
  matchId: string   // PUBG match UUID
  map: string       // e.g. "Baltic_Main"
  date: string      // ISO date string
  teams: KanaTeam[]
}

// ── PUBG API shapes ──────────────────────────────────────────────────────────

export interface PubgMatchResponse {
  data: {
    id: string
    attributes: {
      mapName: string
      createdAt: string
    }
    relationships: {
      assets: {
        data: Array<{ type: string; id: string }>
      }
    }
  }
  included: PubgIncluded[]
}

export interface PubgIncluded {
  type: string
  id: string
  attributes: {
    URL?: string
    [key: string]: unknown
  }
}

// ── Telemetry shapes ─────────────────────────────────────────────────────────

export interface TelemetryEvent {
  _T: string
  _D: string
  character?: {
    name: string
    location: { x: number; y: number; z: number }
  }
}

export interface ParachuteLanding {
  playerName: string
  x: number         // raw PUBG game coordinate
  y: number
  matchId: string
  mapName: string   // raw PUBG map name e.g. "Baltic_Main"
  teamName: string | null
}

// ── App state shapes ─────────────────────────────────────────────────────────

export type MapDisplayName = 'Erangel' | 'Miramar' | 'Taego' | 'Vikendi'

export interface MapMeta {
  displayName: MapDisplayName
  rawName: string   // e.g. "Baltic_Main"
  size: number      // coordinate space in game units
  imagePath: string // e.g. "/maps/Erangel.png"
}

export type FetchPhase = 'idle' | 'matches' | 'telemetry' | 'done'

export interface ProgressState {
  total: number
  completed: number
  failed: number
  phase: FetchPhase
  startedAt: number | null // Date.now() timestamp
}
