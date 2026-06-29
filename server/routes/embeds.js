import { resolveEmbed } from '../../embed-resolver.js'
import { readBody } from '../http.js'

async function handleResolve (req, res, url, ctx) {
  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return
  }
  const { url: embedUrl } = parsed
  if (!embedUrl || typeof embedUrl !== 'string') {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'url required' }))
    return
  }
  try {
    const result = await resolveEmbed(embedUrl)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result || { type: 'link', url: embedUrl, title: null, html: null }))
  } catch {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ type: 'link', url: embedUrl, title: null, html: null }))
  }
}

export const embedRoutes = [
  { method: 'POST', path: '/api/embeds/resolve', handler: handleResolve }
]
