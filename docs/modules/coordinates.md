# Module: src/utils/coordinates.ts

Pure coordinate conversion from PUBG game space to canvas pixel space.

## Exports

### `gameToCanvas(gameX, gameY, mapMeta, canvasWidth, canvasHeight): CanvasPoint`
```ts
{ px: (gameX / mapMeta.size) * canvasWidth,
  py: (1 - gameY / mapMeta.size) * canvasHeight }
```
Y is flipped: PUBG origin is bottom-left, canvas origin is top-left.

### `CanvasPoint`
`{ px: number; py: number }`

## Map sizes (from constants/maps.ts)
- Baltic_Main (Erangel): 816000
- Desert_Main (Miramar): 816000
- Tiger_Main (Taego): 816000
- DihorOtok_Main (Vikendi): 600000
