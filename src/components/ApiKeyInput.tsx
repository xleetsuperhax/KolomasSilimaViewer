import { useState } from 'react'

interface Props {
  apiKey: string
  onSave: (key: string) => void
}

export function ApiKeyInput({ apiKey, onSave }: Props) {
  const [draft, setDraft] = useState(apiKey)

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSave(draft)
      }}
      className="flex gap-2"
    >
      <input
        type="password"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="PUBG API key"
        className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm font-medium transition-colors"
      >
        Save
      </button>
    </form>
  )
}
