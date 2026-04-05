import clsx from 'clsx'

interface Props {
  availableTeams: string[]
  selectedTeams: string[] // empty = all teams shown
  onChange: (teams: string[]) => void
}

export function TeamFilter({ availableTeams, selectedTeams, onChange }: Props) {
  const allSelected = selectedTeams.length === 0

  const toggle = (team: string) => {
    if (selectedTeams.includes(team)) {
      const next = selectedTeams.filter(t => t !== team)
      onChange(next)
    } else {
      onChange([...selectedTeams, team])
    }
  }

  if (availableTeams.length === 0) {
    return <p className="text-gray-500 text-xs">No team data — load matches first</p>
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onChange([])}
        className={clsx(
          'text-left text-sm px-2 py-1 rounded transition-colors',
          allSelected ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        )}
      >
        All teams
      </button>
      <div className="max-h-48 overflow-y-auto flex flex-col gap-0.5 mt-1">
        {availableTeams.map(team => (
          <label
            key={team}
            className="flex items-center gap-2 text-sm cursor-pointer px-2 py-0.5 rounded hover:bg-gray-800"
          >
            <input
              type="checkbox"
              checked={selectedTeams.includes(team)}
              onChange={() => toggle(team)}
              className="accent-blue-500"
            />
            <span className="text-gray-300 truncate">{team}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
