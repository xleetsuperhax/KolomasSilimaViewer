import type { MapMeta, MapDisplayName } from '../types'

export const MAP_META: Record<string, MapMeta> = {
  Baltic_Main: {
    displayName: 'Erangel',
    rawName: 'Baltic_Main',
    size: 816000,
    imagePath: '/maps/Erangel.png',
  },
  Desert_Main: {
    displayName: 'Miramar',
    rawName: 'Desert_Main',
    size: 816000,
    imagePath: '/maps/Miramar.png',
  },
  Tiger_Main: {
    displayName: 'Taego',
    rawName: 'Tiger_Main',
    size: 816000,
    imagePath: '/maps/Taego.png',
  },
  DihorOtok_Main: {
    displayName: 'Vikendi',
    rawName: 'DihorOtok_Main',
    size: 600000,
    imagePath: '/maps/Vikendi.png',
  },
}

export const ALL_MAPS: MapDisplayName[] = ['Erangel', 'Miramar', 'Taego', 'Vikendi']

export const SEASONS: string[] = [
  'pappaliiga-s11',
  'pappaliiga-s10',
  'pappaliiga-s9',
]

export const DIVISIONS: string[] = [
  'mestaruussarja',
  '1div',
  '2div',
  '3div',
  '4div',
  '5div',
  '6div',
  '7div',
  '8div',
]

// Maps season+division key to bundled JSON path in /public/data/
export const BUNDLED_DATA_FILES: Partial<Record<string, string>> = {
  'pappaliiga-s11:4div': '/data/s11-4div-games.json',
}
