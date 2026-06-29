// Embed resolver — oEmbed + iframe builders + link preview fallback

// ── In-memory cache ──
const cache = new Map()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

function cacheGet (url) {
  const entry = cache.get(url)
  if (!entry) return null
  if (Date.now() - entry.ts > (entry.ttl || CACHE_TTL)) {
    cache.delete(url)
    return null
  }
  return entry.data
}

function cacheSet (url, data, ttl) {
  cache.set(url, { data, ts: Date.now(), ttl: (ttl || 86400) * 1000 })
  // Evict old entries periodically
  if (cache.size > 2000) {
    const now = Date.now()
    for (const [k, v] of cache) {
      if (now - v.ts > v.ttl) cache.delete(k)
    }
  }
}

// ── oEmbed providers ──
const OEMBED_PROVIDERS = [
  // Video
  { name: 'youtube', schemes: ['https://youtube.com/watch*', 'https://www.youtube.com/watch*', 'https://youtu.be/*', 'https://youtube.com/shorts/*', 'https://www.youtube.com/shorts/*'], endpoint: 'https://www.youtube.com/oembed' },
  { name: 'vimeo', schemes: ['https://vimeo.com/*', 'https://player.vimeo.com/video/*'], endpoint: 'https://vimeo.com/api/oembed.json' },
  { name: 'dailymotion', schemes: ['https://www.dailymotion.com/video/*', 'https://dai.ly/*'], endpoint: 'https://www.dailymotion.com/services/oembed' },
  { name: 'streamable', schemes: ['https://streamable.com/*'], endpoint: 'https://api.streamable.com/oembed.json' },
  { name: 'loom', schemes: ['https://www.loom.com/share/*'], endpoint: 'https://www.loom.com/v1/oembed' },
  // Social
  { name: 'twitter', schemes: ['https://twitter.com/*/status/*', 'https://x.com/*/status/*'], endpoint: 'https://publish.twitter.com/oembed' },
  { name: 'reddit', schemes: ['https://www.reddit.com/r/*/comments/*'], endpoint: 'https://www.reddit.com/oembed' },
  { name: 'tiktok', schemes: ['https://www.tiktok.com/*/video/*', 'https://www.tiktok.com/@*/video/*'], endpoint: 'https://www.tiktok.com/oembed' },
  { name: 'tumblr', schemes: ['https://*.tumblr.com/post/*'], endpoint: 'https://www.tumblr.com/oembed/1.0' },
  { name: 'pinterest', schemes: ['https://www.pinterest.com/pin/*'], endpoint: 'https://www.pinterest.com/oembed.json' },
  // Audio
  { name: 'spotify', schemes: ['https://open.spotify.com/track/*', 'https://open.spotify.com/album/*', 'https://open.spotify.com/playlist/*', 'https://open.spotify.com/episode/*'], endpoint: 'https://open.spotify.com/oembed' },
  { name: 'soundcloud', schemes: ['https://soundcloud.com/*'], endpoint: 'https://soundcloud.com/oembed' },
  { name: 'bandcamp', schemes: ['https://*.bandcamp.com/track/*', 'https://*.bandcamp.com/album/*'], endpoint: 'https://bandcamp.com/oembed' },
  // Code & Dev
  { name: 'codepen', schemes: ['https://codepen.io/*/pen/*'], endpoint: 'https://codepen.io/api/oembed' },
  { name: 'codesandbox', schemes: ['https://codesandbox.io/s/*', 'https://codesandbox.io/p/*'], endpoint: 'https://codesandbox.io/oembed' },
  // Design
  { name: 'figma', schemes: ['https://www.figma.com/file/*', 'https://www.figma.com/design/*'], endpoint: 'https://www.figma.com/api/oembed' },
  { name: 'dribbble', schemes: ['https://dribbble.com/shots/*'], endpoint: 'https://dribbble.com/oauth/oembed' },
  // Documents
  { name: 'slideshare', schemes: ['https://www.slideshare.net/*/*'], endpoint: 'https://www.slideshare.net/api/oembed/2' },
  // Data
  { name: 'flourish', schemes: ['https://public.flourish.studio/visualisation/*', 'https://flo.uri.sh/visualisation/*'], endpoint: 'https://app.flourish.studio/api/v1/oembed' },
  // Publishing
  { name: 'medium', schemes: ['https://medium.com/*'], endpoint: 'https://medium.com/oembed' },
]

// ── Iframe builders ──
const IFRAME_BUILDERS = {
  rumble (url) {
    const m = url.match(/rumble\.com\/([a-zA-Z0-9-]+)\.html/)
    if (!m) return null
    return { type: 'video', provider: 'rumble', html: `<iframe src="https://rumble.com/embed/${m[1]}/" width="640" height="360" frameborder="0" allowfullscreen></iframe>` }
  },
  odysee (url) {
    const m = url.match(/odysee\.com\/(.+)/)
    if (!m) return null
    return { type: 'video', provider: 'odysee', html: `<iframe src="https://odysee.com/$/embed/${m[1]}" width="560" height="315" frameborder="0" allowfullscreen></iframe>` }
  },
  bitchute (url) {
    const m = url.match(/bitchute\.com\/video\/([a-zA-Z0-9]+)/)
    if (!m) return null
    return { type: 'video', provider: 'bitchute', html: `<iframe src="https://www.bitchute.com/embed/${m[1]}/" width="560" height="315" frameborder="0" allowfullscreen></iframe>` }
  },
  kick (url) {
    const m = url.match(/kick\.com\/([^/]+)\/clips\/([^/?]+)/)
    if (!m) return null
    return { type: 'video', provider: 'kick', html: `<iframe src="https://kick.com/${m[1]}/clips/${m[2]}" width="560" height="315" frameborder="0" allowfullscreen></iframe>` }
  },
  peertube (url) {
    const m = url.match(/(https:\/\/[^/]+)\/w\/([a-zA-Z0-9-]+)/)
    if (!m) return null
    return { type: 'video', provider: 'peertube', html: `<iframe src="${m[1]}/videos/embed/${m[2]}" width="560" height="315" frameborder="0" sandbox="allow-same-origin allow-scripts allow-popups" allowfullscreen></iframe>` }
  },
  bluesky (url) {
    const m = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([a-zA-Z0-9]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'bluesky', html: `<iframe src="https://embed.bsky.app/embed/${m[1]}/app.bsky.feed.post/${m[2]}" width="400" height="300" frameborder="0" scrolling="no"></iframe>` }
  },
  mastodon (url) {
    const m = url.match(/(https:\/\/[^/]+)\/@([^/]+)\/(\d+)/)
    if (!m) return null
    return { type: 'rich', provider: 'mastodon', html: `<iframe src="${m[1]}/@${m[2]}/${m[3]}/embed" width="400" height="400" frameborder="0" allowfullscreen></iframe>` }
  },
  linkedin (url) {
    const m = url.match(/linkedin\.com\/(?:posts|feed\/update\/urn:li:(?:share|activity):)(\d+)/)
    if (!m) return null
    return { type: 'rich', provider: 'linkedin', html: `<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:share:${m[1]}" width="504" height="400" frameborder="0" allowfullscreen></iframe>` }
  },
  apple_music (url) {
    const m = url.match(/music\.apple\.com\/([a-z]{2})\/album\/[^/]+\/(\d+)(?:\?i=(\d+))?/)
    if (!m) return null
    const trackParam = m[3] ? `?i=${m[3]}` : ''
    return { type: 'audio', provider: 'apple_music', html: `<iframe src="https://embed.music.apple.com/${m[1]}/album/${m[2]}${trackParam}" width="100%" height="175" frameborder="0" allow="autoplay *; encrypted-media *;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe>` }
  },
  deezer (url) {
    const tm = url.match(/deezer\.com\/(?:[a-z]+\/)?track\/(\d+)/)
    if (tm) return { type: 'audio', provider: 'deezer', html: `<iframe src="https://widget.deezer.com/widget/dark/track/${tm[1]}" width="100%" height="120" frameborder="0" allow="encrypted-media"></iframe>` }
    const am = url.match(/deezer\.com\/(?:[a-z]+\/)?album\/(\d+)/)
    if (am) return { type: 'audio', provider: 'deezer', html: `<iframe src="https://widget.deezer.com/widget/dark/album/${am[1]}" width="100%" height="300" frameborder="0" allow="encrypted-media"></iframe>` }
    return null
  },
  apple_podcasts (url) {
    const m = url.match(/podcasts\.apple\.com\/([a-z]{2})\/podcast\/[^/]+\/id(\d+)(?:\?i=(\d+))?/)
    if (!m) return null
    const ep = m[3] ? `&i=${m[3]}` : ''
    return { type: 'audio', provider: 'apple_podcasts', html: `<iframe src="https://embed.podcasts.apple.com/podcast/id${m[2]}${ep}?country=${m[1]}" width="100%" height="175" frameborder="0" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe>` }
  },
  audius (url) {
    const m = url.match(/audius\.co\/([^/]+)\/([^/?]+)/)
    if (!m) return null
    return { type: 'audio', provider: 'audius', html: `<iframe src="https://audius.co/embed/track?handle=${m[1]}&title=${m[2]}" width="100%" height="120" frameborder="0" allow="encrypted-media"></iframe>` }
  },
  github_gist (url) {
    const m = url.match(/gist\.github\.com\/([^/]+)\/([a-f0-9]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'github_gist', html: `<div class="gist-embed" data-gist-url="${url}"></div>`, requiresHydration: true }
  },
  jsfiddle (url) {
    const m = url.match(/jsfiddle\.net\/([^/]+)\/([^/]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'jsfiddle', html: `<iframe src="https://jsfiddle.net/${m[1]}/${m[2]}/embedded/" width="100%" height="400" frameborder="0"></iframe>` }
  },
  stackblitz (url) {
    const m = url.match(/stackblitz\.com\/edit\/([^/?]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'stackblitz', html: `<iframe src="https://stackblitz.com/edit/${m[1]}?embed=1" width="100%" height="500" frameborder="0"></iframe>` }
  },
  google_maps (url) {
    if (url.includes('/maps/embed')) return { type: 'rich', provider: 'google_maps', html: `<iframe src="${url}" width="100%" height="400" frameborder="0" style="border:0;" allowfullscreen loading="lazy"></iframe>` }
    const pm = url.match(/google\.com\/maps\/place\/([^/?]+)/)
    if (pm) return { type: 'rich', provider: 'google_maps', html: `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(pm[1])}&output=embed" width="100%" height="400" frameborder="0" style="border:0;" allowfullscreen loading="lazy"></iframe>` }
    return null
  },
  google_docs (url) {
    const m = url.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([^/]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'google_docs', html: `<iframe src="https://docs.google.com/${m[1]}/d/${m[2]}/preview" width="100%" height="500" frameborder="0"></iframe>` }
  },
  google_forms (url) {
    const m = url.match(/docs\.google\.com\/forms\/d\/e?\/([^/]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'google_forms', html: `<iframe src="https://docs.google.com/forms/d/e/${m[1]}/viewform?embedded=true" width="100%" height="600" frameborder="0">Loading…</iframe>` }
  },
  figma_file (url) {
    const m = url.match(/figma\.com\/(?:file|design)\/([^/]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'figma', html: `<iframe src="https://www.figma.com/embed?embed_host=whaleroom&url=${encodeURIComponent(url)}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>` }
  },
  canva (url) {
    const m = url.match(/canva\.com\/design\/([^/]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'canva', html: `<iframe src="https://www.canva.com/design/${m[1]}/view?embed" width="100%" height="500" frameborder="0" allowfullscreen></iframe>` }
  },
  notion (url) {
    const m = url.match(/notion\.so\/(?:[^/]+\/)?([a-f0-9]{32}|[a-f0-9-]+)/)
    if (!m) return null
    const id = m[1].replace(/-/g, '')
    return { type: 'rich', provider: 'notion', html: `<iframe src="https://notion.so/${id}" width="100%" height="500" frameborder="0" style="border: none;"></iframe>` }
  },
  miro (url) {
    const m = url.match(/miro\.com\/app\/board\/([^/?]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'miro', html: `<iframe src="https://miro.com/app/embed/${m[1]}/" width="768" height="432" frameborder="0" scrolling="no" allowfullscreen></iframe>` }
  },
  airtable (url) {
    const m = url.match(/airtable\.com\/(shr[a-zA-Z0-9]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'airtable', html: `<iframe src="https://airtable.com/embed/${m[1]}" width="100%" height="533" frameborder="0"></iframe>` }
  },
  typeform (url) {
    const m = url.match(/(?:form\.typeform\.com\/to|[a-zA-Z0-9]+\.typeform\.com\/to)\/([a-zA-Z0-9]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'typeform', html: `<iframe src="https://form.typeform.com/to/${m[1]}" width="100%" height="500" frameborder="0"></iframe>` }
  },
  calendly (url) {
    const m = url.match(/calendly\.com\/([^/?]+(?:\/[^/?]+)?)/)
    if (!m) return null
    return { type: 'rich', provider: 'calendly', html: `<iframe src="https://calendly.com/${m[1]}" width="100%" height="630" frameborder="0"></iframe>` }
  },
  tableau (url) {
    const m = url.match(/public\.tableau\.com\/(?:views|profile\/[^/]+\/vizhome)\/([^/?]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'tableau', html: `<iframe src="https://public.tableau.com/views/${m[1]}?:embed=y&:display_count=yes" width="100%" height="500" frameborder="0"></iframe>` }
  },
  datawrapper (url) {
    const m = url.match(/datawrapper\.dwcdn\.net\/([a-zA-Z0-9]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'datawrapper', html: `<iframe src="https://datawrapper.dwcdn.net/${m[1]}/" width="100%" height="400" frameborder="0" scrolling="no"></iframe>` }
  },
  observable (url) {
    const m = url.match(/observablehq\.com\/(@[^/]+\/[^/?]+|d\/[a-f0-9]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'observable', html: `<iframe src="https://observablehq.com/embed/${m[1]}" width="100%" height="500" frameborder="0"></iframe>` }
  },
  giphy (url) {
    const m = url.match(/giphy\.com\/(?:gifs|embed)\/(?:.*-)?([a-zA-Z0-9]+)/)
    if (!m) return null
    return { type: 'photo', provider: 'giphy', html: `<iframe src="https://giphy.com/embed/${m[1]}" width="480" height="360" frameborder="0" allowfullscreen></iframe>` }
  },
  tenor (url) {
    const m = url.match(/tenor\.com\/view\/[^-]+.*-(\d+)/)
    if (!m) return null
    return { type: 'photo', provider: 'tenor', html: `<iframe src="https://tenor.com/embed/${m[1]}" width="498" height="368" frameborder="0" allowfullscreen></iframe>` }
  },
  imgur (url) {
    const m = url.match(/imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)/)
    if (!m) return null
    const isAlbum = url.includes('/a/') || url.includes('/gallery/')
    return { type: 'photo', provider: 'imgur', html: `<iframe src="https://imgur.com/${isAlbum ? 'a/' : ''}${m[1]}/embed?pub=true" width="540" height="500" frameborder="0"></iframe>` }
  },
  lichess (url) {
    const m = url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)
    if (!m) return null
    return { type: 'rich', provider: 'lichess', html: `<iframe src="https://lichess.org/embed/game/${m[1]}?theme=auto&bg=auto" width="600" height="397" frameborder="0"></iframe>` }
  },
  steam (url) {
    const m = url.match(/store\.steampowered\.com\/app\/(\d+)/)
    if (!m) return null
    return { type: 'rich', provider: 'steam', html: `<iframe src="https://store.steampowered.com/widget/${m[1]}/" width="646" height="190" frameborder="0"></iframe>` }
  },
  kickstarter (url) {
    const m = url.match(/kickstarter\.com\/projects\/([^/]+)\/([^/?]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'kickstarter', html: `<iframe src="https://www.kickstarter.com/projects/${m[1]}/${m[2]}/widget/card.html" width="220" height="420" frameborder="0" scrolling="no"></iframe>` }
  },
  gofundme (url) {
    const m = url.match(/gofundme\.com\/f\/([^/?]+)/)
    if (!m) return null
    return { type: 'rich', provider: 'gofundme', html: `<iframe src="https://www.gofundme.com/f/${m[1]}/widget/large" width="300" height="400" frameborder="0" scrolling="no"></iframe>` }
  }
}

// ── Allowed iframe domains ──
const ALLOWED_EMBED_DOMAINS = [
  'youtube.com', 'youtube-nocookie.com', 'player.vimeo.com', 'dailymotion.com',
  'rumble.com', 'odysee.com', 'bitchute.com', 'kick.com',
  'platform.twitter.com', 'publish.twitter.com', 'syndication.twitter.com',
  'www.instagram.com', 'facebook.com', 'connect.facebook.net',
  'open.spotify.com', 'embed.music.apple.com', 'w.soundcloud.com', 'bandcamp.com',
  'www.tiktok.com', 'embed.bsky.app',
  'codepen.io', 'codesandbox.io', 'replit.com', 'stackblitz.com', 'jsfiddle.net', 'glitch.com',
  'gist.github.com',
  'embed.podcasts.apple.com', 'share.transistor.fm', 'www.buzzsprout.com',
  'www.figma.com', 'sketchfab.com', 'giphy.com', 'tenor.com', 'imgur.com',
  'lichess.org', 'store.steampowered.com', 'www.kickstarter.com', 'www.gofundme.com',
  'miro.com', 'airtable.com', 'form.typeform.com', 'calendly.com',
  'docs.google.com', 'maps.google.com', 'notion.so', 'www.canva.com',
  'public.tableau.com', 'datawrapper.dwcdn.net', 'observablehq.com',
  'flo.uri.sh', 'app.flourish.studio', 'medium.com',
  'www.slideshare.net', 'www.scribd.com', 'www.openstreetmap.org',
  'widget.deezer.com', 'audius.co', 'www.linkedin.com',
  'www.reddit.com', 'embed.reddit.com', 'www.tumblr.com',
  'www.pinterest.com', 'assets.pinterest.com',
  'streamable.com', 'www.loom.com',
  'dribbble.com',
]

// ── SSRF protection ──
function isUrlSafe (urlString) {
  try {
    const parsed = new URL(urlString)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const hostname = parsed.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') return false
    // Block private IP ranges
    const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
    if (ipv4Match) {
      const [, a, b] = ipv4Match.map(Number)
      if (a === 10) return false                          // 10.0.0.0/8
      if (a === 172 && b >= 16 && b <= 31) return false   // 172.16.0.0/12
      if (a === 192 && b === 168) return false             // 192.168.0.0/16
      if (a === 169 && b === 254) return false             // 169.254.0.0/16
      if (a === 127) return false                          // 127.0.0.0/8
      if (a === 0) return false                            // 0.0.0.0/8
    }
    if (hostname.startsWith('[')) {
      const inner = hostname.slice(1, -1)
      if (inner === '::1' || inner.startsWith('fe80:') || inner.startsWith('fc') || inner.startsWith('fd')) return false
    }
    if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return false
    return true
  } catch {
    return false
  }
}

// ── Sanitization ──
function sanitizeEmbedHtml (rawHtml) {
  if (!rawHtml) return null
  // Strip <script> tags (we load SDKs ourselves)
  let clean = rawHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  // Strip event handler attributes (defense-in-depth — DOMPurify is primary defense)
  clean = clean.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  // Strip javascript: URIs
  clean = clean.replace(/(href|src|action)\s*=\s*["']?\s*javascript:/gi, '$1="')
  // Strip dangerous tags
  clean = clean.replace(/<\/?(?:object|applet|form|input|textarea|button|select|meta|link|base|embed)\b[^>]*>/gi, '')
  // Validate iframe src domains
  const srcMatches = clean.matchAll(/src=["']([^"']+)["']/g)
  for (const match of srcMatches) {
    const src = match[1]
    try {
      const hostname = new URL(src).hostname
      const isAllowed = ALLOWED_EMBED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))
      if (!isAllowed) return null
    } catch {
      return null
    }
  }
  return clean
}

// ── oEmbed URL matching ──
function matchScheme (url, scheme) {
  const pattern = '^' + scheme.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '(?:\\?.*)?$'
  return new RegExp(pattern, 'i').test(url)
}

function matchProvider (url) {
  for (const provider of OEMBED_PROVIDERS) {
    for (const scheme of provider.schemes) {
      if (matchScheme(url, scheme)) return provider
    }
  }
  return null
}

// ── Extract OG meta from raw HTML (no dependencies) ──
function extractMeta (html, property) {
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m) return m[1]
  }
  return null
}

function extractTitle (html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  return m ? m[1].trim() : null
}

function extractFavicon (html, baseUrl) {
  const m = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i)
  if (m) {
    try { return new URL(m[1], baseUrl).href } catch {}
  }
  try { return new URL('/favicon.ico', baseUrl).href } catch {}
  return null
}

// ── Link preview fallback ──
async function fetchLinkPreview (url) {
  if (!isUrlSafe(url)) return null
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Whaleroom-LinkPreview/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000)
    })
    if (!res.ok) return null
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('text/html')) return null
    const html = await res.text()
    const hostname = new URL(url).hostname.replace('www.', '')
    return {
      type: 'link',
      provider: hostname,
      url,
      title: extractMeta(html, 'og:title') || extractTitle(html) || null,
      description: extractMeta(html, 'og:description') || extractMeta(html, 'description') || null,
      thumbnail_url: extractMeta(html, 'og:image') || null,
      author_name: extractMeta(html, 'author') || null,
      html: null,
      width: null,
      height: null,
      site_name: extractMeta(html, 'og:site_name') || null,
      favicon: extractFavicon(html, url)
    }
  } catch {
    return null
  }
}

// ── Main resolver ──
export async function resolveEmbed (url) {
  if (!isUrlSafe(url)) return null
  // Check cache
  const cached = cacheGet(url)
  if (cached) return cached

  // 1. Try oEmbed
  const provider = matchProvider(url)
  if (provider) {
    try {
      const oembedUrl = `${provider.endpoint}?url=${encodeURIComponent(url)}&format=json&maxwidth=600`
      const res = await fetch(oembedUrl, {
        headers: provider.headers || {},
        signal: AbortSignal.timeout(8000)
      })
      if (res.ok) {
        const data = await res.json()
        const result = {
          type: data.type || 'rich',
          provider: provider.name,
          url,
          title: data.title || null,
          description: data.description || null,
          thumbnail_url: data.thumbnail_url || null,
          author_name: data.author_name || null,
          author_url: data.author_url || null,
          html: sanitizeEmbedHtml(data.html),
          width: data.width || null,
          height: data.height || null
        }
        cacheSet(url, result, data.cache_age || 86400)
        return result
      }
    } catch { /* fall through */ }
  }

  // 2. Try iframe builders
  for (const [name, builder] of Object.entries(IFRAME_BUILDERS)) {
    const result = builder(url)
    if (result) {
      result.url = url
      result.title = null
      result.description = null
      result.thumbnail_url = null
      result.author_name = null
      result.author_url = null
      result.width = null
      result.height = null
      cacheSet(url, result)
      return result
    }
  }

  // 3. Link preview fallback
  const preview = await fetchLinkPreview(url)
  if (preview) {
    cacheSet(url, preview, 3600) // shorter TTL for link previews
    return preview
  }

  return null
}
