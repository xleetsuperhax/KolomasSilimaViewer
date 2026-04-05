import type { PubgMatchResponse } from '../types'

const PUBG_BASE = 'https://api.pubg.com/shards/tournament'
const RATE_LIMIT_REQUESTS = 10
const RATE_LIMIT_WINDOW_MS = 60_000

// Module-level ring buffer — persists across React re-renders
const requestTimestamps: number[] = []

async function rateLimit(): Promise<void> {
  const now = Date.now()
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift()
  }
  if (requestTimestamps.length >= RATE_LIMIT_REQUESTS) {
    const waitMs = RATE_LIMIT_WINDOW_MS - (now - requestTimestamps[0]) + 100
    await new Promise<void>(resolve => setTimeout(resolve, waitMs))
    return rateLimit()
  }
  requestTimestamps.push(Date.now())
}

export class MatchExpiredError extends Error {
  constructor(public readonly matchId: string) {
    super(`Match ${matchId} not found (expired after 14 days)`)
    this.name = 'MatchExpiredError'
  }
}

export async function fetchMatch(
  matchId: string,
  apiKey: string,
): Promise<PubgMatchResponse> {
  await rateLimit()
  const res = await fetch(`${PUBG_BASE}/matches/${matchId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/vnd.api+json',
    },
  })
  if (res.status === 404) {
    throw new MatchExpiredError(matchId)
  }
  if (!res.ok) {
    throw new Error(`PUBG API error ${res.status} for match ${matchId}`)
  }
  return res.json() as Promise<PubgMatchResponse>
}
