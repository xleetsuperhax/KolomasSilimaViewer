interface Props {
  expiredCount: number
  totalCount: number
}

export function PartialDataWarning({ expiredCount, totalCount }: Props) {
  if (expiredCount === 0) return null

  const available = totalCount - expiredCount

  return (
    <div className="bg-yellow-950 border border-yellow-700 rounded-lg p-3 text-sm">
      <p className="text-yellow-300 font-medium">
        Partial data — {expiredCount} of {totalCount}{' '}
        {totalCount === 1 ? 'match' : 'matches'} unavailable
      </p>
      <p className="text-yellow-500 mt-1">
        Showing {available} available {available === 1 ? 'match' : 'matches'}. PUBG deletes
        match telemetry after 14 days. Load the app weekly to capture data before it expires.
      </p>
    </div>
  )
}
