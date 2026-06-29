const AVATAR_SHAPES = ['circle', 'cross', 'square']
const AVATAR_LATIN = [
  [[0,1,2],[1,2,0],[2,0,1]],[[0,1,2],[2,0,1],[1,2,0]],
  [[0,2,1],[1,0,2],[2,1,0]],[[0,2,1],[2,1,0],[1,0,2]],
  [[1,0,2],[0,2,1],[2,1,0]],[[1,0,2],[2,1,0],[0,2,1]],
  [[1,2,0],[0,1,2],[2,0,1]],[[1,2,0],[2,0,1],[0,1,2]],
  [[2,0,1],[0,1,2],[1,2,0]],[[2,0,1],[1,2,0],[0,1,2]],
  [[2,1,0],[0,2,1],[1,0,2]],[[2,1,0],[1,0,2],[0,2,1]]
]
const AVATAR_PALETTE = [
  '#FB2910','#FE734C','#A06021','#EAD86A','#BBF80A',
  '#9FDF80','#1FF00F','#22BE46','#238F52','#65EEE2',
  '#85BDE1','#1295FA','#094AA8','#0533F6','#A588E6',
  '#602BB6','#D62AE4','#A60C92','#E587C4','#E93373'
]

function mulberry32 (seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

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
  const sq = AVATAR_LATIN[Math.floor(rand() * AVATAR_LATIN.length)]
  const grid = sq.map(r => r.map(i => AVATAR_SHAPES[i]))
  const colors = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => AVATAR_PALETTE[Math.floor(rand() * AVATAR_PALETTE.length)])
  )
  return { version: 1, grid, colors }
}
