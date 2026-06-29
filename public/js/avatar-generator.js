// Pure deterministic avatar generator — userId → { grid, colors }
// Zero dependencies. Works in both browser and Node.js.

const SHAPES = ['circle', 'cross', 'square']

// All 12 valid 3×3 Latin squares (each symbol once per row and column)
const LATIN_SQUARES = [
  [[0,1,2],[1,2,0],[2,0,1]],
  [[0,1,2],[2,0,1],[1,2,0]],
  [[0,2,1],[1,0,2],[2,1,0]],
  [[0,2,1],[2,1,0],[1,0,2]],
  [[1,0,2],[0,2,1],[2,1,0]],
  [[1,0,2],[2,1,0],[0,2,1]],
  [[1,2,0],[0,1,2],[2,0,1]],
  [[1,2,0],[2,0,1],[0,1,2]],
  [[2,0,1],[0,1,2],[1,2,0]],
  [[2,0,1],[1,2,0],[0,1,2]],
  [[2,1,0],[0,2,1],[1,0,2]],
  [[2,1,0],[1,0,2],[0,2,1]]
]

// 20 vibrant colors — high contrast on dark backgrounds
const PALETTE = [
  '#FB2910', '#FE734C', '#A06021', '#EAD86A', '#BBF80A',
  '#9FDF80', '#1FF00F', '#22BE46', '#238F52', '#65EEE2',
  '#85BDE1', '#1295FA', '#094AA8', '#0533F6', '#A588E6',
  '#602BB6', '#D62AE4', '#A60C92', '#E587C4', '#E93373'
]

// Mulberry32 seeded PRNG
function mulberry32 (seed) {
  return function () {
    seed |= 0
    seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Hash a hex string to a 32-bit integer seed
function hexToSeed (hex) {
  let h = 0
  for (let i = 0; i < hex.length; i++) {
    h = Math.imul(h ^ hex.charCodeAt(i), 0x5BD1E995)
    h = (h ^ (h >>> 15)) | 0
  }
  return h
}

export function generateAvatar (userId) {
  const rand = mulberry32(hexToSeed(userId))

  // Pick a Latin square
  const square = LATIN_SQUARES[Math.floor(rand() * LATIN_SQUARES.length)]
  const grid = square.map(row => row.map(i => SHAPES[i]))

  // Pick 9 colors (with replacement from palette)
  const colors = []
  for (let r = 0; r < 3; r++) {
    const row = []
    for (let c = 0; c < 3; c++) {
      row.push(PALETTE[Math.floor(rand() * PALETTE.length)])
    }
    colors.push(row)
  }

  return { version: 1, grid, colors }
}
