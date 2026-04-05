interface Props {
  count: number
  matchCount: number
}

export function DropCountBadge({ count, matchCount }: Props) {
  return (
    <div className="flex gap-2 text-xs text-gray-400">
      <span className="bg-gray-800 px-2 py-1 rounded-full">
        {count.toLocaleString()} drops
      </span>
      <span className="bg-gray-800 px-2 py-1 rounded-full">
        {matchCount} {matchCount === 1 ? 'match' : 'matches'}
      </span>
    </div>
  )
}
