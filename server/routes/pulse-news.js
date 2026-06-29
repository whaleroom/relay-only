import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let profilesCache = null

async function getProfiles () {
  if (profilesCache) return profilesCache
  const channelsDir = join(__dirname, '..', '..', 'channels')
  try {
    const { loadProfiles } = await import('../../bridge/profile-loader.js')
    profilesCache = await loadProfiles(channelsDir)
    console.log(`pulse-news: loaded ${Object.keys(profilesCache).length} profiles from ${channelsDir}`)
  } catch (err) {
    console.log(`pulse-news: failed to load profiles from ${channelsDir}: ${err.message}`)
    profilesCache = {}
  }
  return profilesCache
}

async function handlePulseNews (req, res, url, ctx) {
  const slug = url.searchParams.get('slug') || url.pathname.split('/').pop()
  const limit = parseInt(url.searchParams.get('limit')) || 500
  const since = parseInt(url.searchParams.get('since')) || 168
  const domain = url.searchParams.get('domain') || ''

  const profiles = await getProfiles()

  // "all" slug — aggregate news across all channel profiles
  if (slug === 'all') {
    const PULSE_BASE = process.env.PULSE_API_URL || 'http://127.0.0.1:8787'
    try {
      const allResults = []
      const seenUids = new Set()

      // Pulse RSS-based search
      for (const [name, profile] of Object.entries(profiles)) {
        if (profile.daily_volume_cap === 0) continue
        const params = new URLSearchParams()
        params.set('limit', '200')
        params.set('since', String(since))
        if (profile.categories?.length) {
          params.set('category', profile.categories.join(','))
        }
        if (profile.keywords?.length) {
          params.set('keywords', profile.keywords.map(k => k.term).join(','))
        } else if (profile.search_queries?.length) {
          params.set('q', profile.search_queries.join(' OR '))
        }
        try {
          const r = await fetch(`${PULSE_BASE}/api/search?${params}`)
          if (!r.ok) continue
          const data = await r.json()
          for (const item of (data.results || [])) {
            if (!seenUids.has(item.uid)) {
              seenUids.add(item.uid)
              item.channel = name
              allResults.push(item)
            }
          }
        } catch {}
      }

      allResults.sort((a, b) => {
        const da = a.published_utc ? new Date(a.published_utc).getTime() : 0
        const db = b.published_utc ? new Date(b.published_utc).getTime() : 0
        return db - da
      })

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ results: allResults.slice(0, limit) }))
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Failed to reach Pulse: ' + (err.message || '') }))
    }
    return
  }

  const profile = profiles[slug]
  if (!profile) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'No channel profile for: ' + slug }))
    return
  }

  const PULSE_BASE = process.env.PULSE_API_URL || 'http://127.0.0.1:8787'

  try {
    const params = new URLSearchParams()
    params.set('limit', String(limit))
    params.set('since', String(since))
    if (profile.categories?.length) {
      params.set('category', profile.categories.join(','))
    }
    if (profile.keywords?.length) {
      params.set('keywords', profile.keywords.map(k => k.term).join(','))
    } else if (profile.search_queries?.length) {
      params.set('q', profile.search_queries.join(' OR '))
    }
    if (domain) {
      params.set('domain', domain)
    }

    const r = await fetch(`${PULSE_BASE}/api/search?${params}`)
    if (!r.ok) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Pulse API error: ' + r.status }))
      return
    }
    const data = await r.json()

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Failed to reach Pulse: ' + (err.message || '') }))
  }
}

async function handlePulseEntry (req, res, url, ctx) {
  const uid = url.searchParams.get('uid')
  if (!uid) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'uid param required' }))
    return
  }

  const PULSE_BASE = process.env.PULSE_API_URL || 'http://127.0.0.1:8787'

  try {
    const r = await fetch(`${PULSE_BASE}/api/entries/${uid}`)
    if (!r.ok) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Pulse API error: ' + r.status }))
      return
    }
    const data = await r.json()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Failed to reach Pulse: ' + (err.message || '') }))
  }
}

async function handlePulseEnrich (req, res, url, ctx) {
  const uid = url.searchParams.get('uid')
  if (!uid) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'uid param required' }))
    return
  }

  const PULSE_BASE = process.env.PULSE_API_URL || 'http://127.0.0.1:8787'

  try {
    // First trigger Pulse's enrich endpoint (extracts full text, no AI)
    const enrichRes = await fetch(`${PULSE_BASE}/api/entries/${uid}/enrich`, { method: 'POST' })
    if (!enrichRes.ok) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Pulse enrich failed: ' + enrichRes.status }))
      return
    }
    const data = await enrichRes.json()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Failed to reach Pulse: ' + (err.message || '') }))
  }
}

export const pulseRoutes = [
  { method: 'GET', path: '/api/pulse/news', handler: handlePulseNews, skipReady: true },
  { method: 'GET', path: '/api/pulse/entry', handler: handlePulseEntry, skipReady: true },
  { method: 'POST', path: '/api/pulse/enrich', handler: handlePulseEnrich, skipReady: true },
  { method: 'GET', path: '/api/serp-news', handler: handleSerpNews, skipReady: true }
]

// ── SerpAPI encrypted news feed endpoint ──

async function handleSerpNews (req, res, url, ctx) {
  const channel = url.searchParams.get('channel') || 'all'
  const limit = parseInt(url.searchParams.get('limit')) || 50

  if (!ctx.base?.view) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'starting up' }))
    return
  }

  await ctx.base.update()

  const articles = []
  const prefix = channel === 'all' ? 'serp-all:' : `serp:${channel}:`

  for await (const entry of ctx.base.view.createReadStream({
    gte: prefix,
    lt: prefix + '\xff',
    reverse: true,
  })) {
    const article = JSON.parse(entry.value)
    articles.push({
      channel: article.channel,
      sourceName: article.sourceName,
      sourceUrl: article.sourceUrl,
      title: article.title,
      domain: article.domain,
      text: article.text, // encrypted — frontend decrypts for holders
      topImage: article.topImage,
      published_utc: article.published_utc,
      timestamp: article.timestamp,
    })
    if (articles.length >= limit) break
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ results: articles }))
}
