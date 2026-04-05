# Module: src/constants/maps.ts

Static lookup tables for map metadata, seasons, divisions, and bundled data file paths.

## Exports

### MAP_META
`Record<string, MapMeta>` — keyed by PUBG raw map name.

| Key | displayName | size | imagePath |
|---|---|---|---|
| `Baltic_Main` | Erangel | 816000 | /maps/Erangel.png |
| `Desert_Main` | Miramar | 816000 | /maps/Miramar.png |
| `Tiger_Main` | Taego | 816000 | /maps/Taego.png |
| `DihorOtok_Main` | Vikendi | 600000 | /maps/Vikendi.png |

### ALL_MAPS
`MapDisplayName[]` — ordered list of display names for UI tabs.
`['Erangel', 'Miramar', 'Taego', 'Vikendi']`

### SEASONS
`string[]` — valid KanaStats season slugs, newest first.
`['pappaliiga-s11', 'pappaliiga-s10', 'pappaliiga-s9']`

### DIVISIONS
`string[]` — valid KanaStats division slugs.
`['mestaruussarja', '1div', '2div', '3div', '4div', '5div', '6div', '7div', '8div']`

### BUNDLED_DATA_FILES
`Partial<Record<string, string>>` — maps `"{season}:{division}"` to a `/public/data/` path.

Currently registered:
- `'pappaliiga-s11:4div'` → `'/data/s11-4div-games.json'`

Add new seasons here when bundling fresh KanaStats snapshots.
