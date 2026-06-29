export const MAX_CHARS = 280

export const NAV_META = {
  frontpage:    { name: 'Front Page',               color: 'var(--accent)' },
  following:    { name: 'Following',               color: 'var(--accent)' }
}

export const FEED_META = {
  all:          { name: 'All',                     color: 'var(--accent)' },
  ai:           { name: 'AI',                      color: 'var(--feed-ai)' },
  biotech:      { name: 'Biotech',                 color: 'var(--feed-biotech)' },
  bitcoin:      { name: 'Bitcoin',                 color: 'var(--feed-bitcoin)' },
  crypto:       { name: 'Crypto',                  color: 'var(--feed-crypto)' },
  geopolitics:  { name: 'Geopolitics',             color: 'var(--feed-geopolitics)' },
  predictions:  { name: 'Prediction Markets',      color: 'var(--feed-predictions)' },
  privacy:      { name: 'Privacy',                color: 'var(--feed-privacy)' }
}

export function timeAgo (ts) {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 5) return 'now'
  if (s < 60) return s + 's'
  const m = Math.floor(s / 60)
  if (m < 60) return m + 'm'
  const h = Math.floor(m / 60)
  if (h < 24) return h + 'h'
  const d = Math.floor(h / 24)
  if (d < 7) return d + 'd'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function fullDate (ts) {
  return new Date(ts).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export function keyColor (key) {
  const h = parseInt(key.slice(0, 4), 16) % 360
  return `hsl(${h}, 50%, 55%)`
}

const VIDEO_PATTERNS = [
  { regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s]*v=([a-zA-Z0-9_-]{11})/, type: 'youtube' },
  { regex: /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/, type: 'youtube' },
  { regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, type: 'youtube' },
  { regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, type: 'youtube' },
  { regex: /(?:https?:\/\/)?rumble\.com\/embed\/([a-zA-Z0-9]+)/, type: 'rumble' },
  { regex: /(?:https?:\/\/)?rumble\.com\/(v[a-zA-Z0-9]+)[^\s]*\.html/, type: 'rumble' }
]

export function extractVideo (text) {
  for (const { regex, type } of VIDEO_PATTERNS) {
    const m = text.match(regex)
    if (m) return { type, id: m[1] }
  }
  return null
}

// ── Image URL allowlist — only render inline images from moderated hosts ──
const IMAGE_DOMAINS = [
  'i.imgur.com',
  'i.giphy.com',
  'media.giphy.com',
  'media.tenor.com',
  'pbs.twimg.com',
  'i.redd.it',
  'preview.redd.it',
  'upload.wikimedia.org',
  'images.unsplash.com',
  'i.pinimg.com'
]

// Suffix-matched CDNs (Google Photos/Drive, Scripps/Food Network, etc.)
const IMAGE_DOMAIN_SUFFIXES = [
  '.googleusercontent.com',
  '.ggpht.com',
  '.sndimg.com'
]

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|avif)(?:[?#][^\s]*)?$/i

export function isAllowedImageUrl (url) {
  try {
    const u = new URL(url)
    // Google CDN URLs often lack file extensions — allow by domain alone
    if (IMAGE_DOMAIN_SUFFIXES.some(s => u.hostname.endsWith(s))) return true
    if (!IMAGE_EXT.test(u.pathname)) return false
    return IMAGE_DOMAINS.includes(u.hostname)
  } catch { return false }
}

export function extractImageUrls (text) {
  return (text.match(/https?:\/\/[^\s]+/g) || []).filter(isAllowedImageUrl)
}

// Split text into plain-text, URL, hashtag, and cashtag segments for safe rendering (no innerHTML)
export function linkParts (text) {
  const parts = []
  const regex = /(https?:\/\/[^\s]+|(?<!\w)#[a-zA-Z]\w{0,39}|(?<!\w)\$[A-Z]{1,10})(?=\s|[.,!?;:)\]}]|$)/g
  let last = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) })
    const m = match[0]
    if (m.startsWith('http')) parts.push({ url: m })
    else if (m.startsWith('#')) parts.push({ hashtag: m })
    else if (m.startsWith('$')) parts.push({ cashtag: m })
    last = regex.lastIndex
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}
