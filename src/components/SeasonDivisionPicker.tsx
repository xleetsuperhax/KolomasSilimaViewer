import { SEASONS, DIVISIONS } from '../constants/maps'

interface Props {
  season: string
  division: string
  onChange: (season: string, division: string) => void
  disabled?: boolean
}

export function SeasonDivisionPicker({ season, division, onChange, disabled }: Props) {
  return (
    <div className="flex gap-2">
      <select
        value={season}
        onChange={e => onChange(e.target.value, division)}
        disabled={disabled}
        className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
      >
        {SEASONS.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        value={division}
        onChange={e => onChange(season, e.target.value)}
        disabled={disabled}
        className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
      >
        {DIVISIONS.map(d => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  )
}
