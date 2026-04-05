# Module: src/hooks/useApiKey.ts

Persists the PUBG API key to localStorage and exposes it as React state.

## Exports

### `useApiKey(): { apiKey: string; setApiKey: (key: string) => void }`
- Initialises from `localStorage.getItem('pappaliiga_pubg_api_key')` (lazy initial state)
- `setApiKey` writes to localStorage AND updates React state atomically
- The key is never sent anywhere except `api.pubg.com` (in `fetchMatch`)
