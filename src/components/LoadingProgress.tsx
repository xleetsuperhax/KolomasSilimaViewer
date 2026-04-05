import type { ProgressState } from '../types'

interface Props {
  progress: ProgressState
}

function formatRemaining(ms: number): string {
  const secs = Math.ceil(ms / 1000)
  if (secs > 60) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `~${m}m ${s}s`
  }
  return `~${secs}s`
}

export function LoadingProgress({ progress }: Props) {
  if (progress.phase === 'idle' || progress.phase === 'done') return null

  const pct =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0

  const estimatedRemaining = (() => {
    if (!progress.startedAt || progress.completed === 0) return null
    const elapsed = Date.now() - progress.startedAt
    const perItem = elapsed / progress.completed
    const remaining = perItem * (progress.total - progress.completed)
    return formatRemaining(remaining)
  })()

  const phaseLabel =
    progress.phase === 'matches' ? 'Fetching match metadata' : 'Downloading telemetry'

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span>
          {phaseLabel} — {progress.completed}/{progress.total}
          {progress.failed > 0 && (
            <span className="text-yellow-500 ml-2">({progress.failed} skipped)</span>
          )}
        </span>
        {estimatedRemaining && <span>{estimatedRemaining} remaining</span>}
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
