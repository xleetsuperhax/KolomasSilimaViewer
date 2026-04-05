/**
 * Generates solid-color placeholder PNG files for each PUBG map.
 * Run once: node scripts/gen-placeholder-maps.mjs
 * Replace with real map images from pubg.com/game/maps when available.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

const SIZE = 512

// Map display name → [R, G, B] background color
const MAPS = {
  Erangel:  [52,  72,  54],   // forest green
  Miramar:  [120, 96,  58],   // desert sand
  Taego:    [72,  90,  50],   // olive
  Vikendi:  [140, 170, 190],  // snow blue
}

// ── Minimal PNG writer ────────────────────────────────���───────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const byte of buf) crc = CRC_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcVal = Buffer.alloc(4)
  crcVal.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcVal])
}

function makePng(width, height, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // RGB
  // bytes 10-12: compression=0, filter=0, interlace=0

  // Build raw scanlines: filter byte (0=None) + RGB pixels per row
  const row = Buffer.alloc(1 + width * 3)
  for (let x = 0; x < width; x++) {
    row[1 + x * 3]     = r
    row[2 + x * 3]     = g
    row[3 + x * 3]     = b
  }
  const raw = Buffer.concat(Array.from({ length: height }, () => row))
  const idat = deflateSync(raw, { level: 1 }) // fast compression

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Generate ───────────────────────────────���───────────────────────────────���──

mkdirSync('public/maps', { recursive: true })

for (const [name, [r, g, b]] of Object.entries(MAPS)) {
  const path = `public/maps/${name}.png`
  writeFileSync(path, makePng(SIZE, SIZE, r, g, b))
  console.log(`✓ ${path}`)
}

console.log('\nReplace with real map images from https://www.pubg.com/en/game/maps')
