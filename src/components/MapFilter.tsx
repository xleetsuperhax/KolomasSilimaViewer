import clsx from 'clsx'
import type { MapDisplayName } from '../types'
import { ALL_MAPS } from '../constants/maps'

interface Props {
  selected: MapDisplayName
  availableMaps: MapDisplayName[] // maps with at least 1 landing loaded
  onChange: (map: MapDisplayName) => void
}

export function MapFilter({ selected, availableMaps, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {ALL_MAPS.map(map => {
        const hasData = availableMaps.includes(map)
        return (
          <button
            key={map}
            onClick={() => onChange(map)}
            disabled={!hasData}
            className={clsx(
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              selected === map
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
              !hasData && 'opacity-40 cursor-not-allowed',
            )}
          >
            {map}
          </button>
        )
      })}
    </div>
  )
}
