import { useState, useCallback } from 'react'

const STORAGE_KEY = 'pappaliiga_pubg_api_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? '',
  )

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key)
    setApiKeyState(key)
  }, [])

  return { apiKey, setApiKey }
}
