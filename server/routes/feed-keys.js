import { getFeedKeysForProof } from '../feed-keys.js'
import { readBody } from '../http.js'

// GET /api/feeds/keys — DEPRECATED: returns feed base keys in plaintext
// H7 fix: This endpoint is restricted. New clients must use /api/key-grant
// (P2P encrypted key delivery). This is kept as a fallback only when the
// P2P grant system is unavailable (no seed node).
async function handleFeedKeys (req, res, url, ctx) {
  // If this node has feed keys and can issue grants, refuse — use /api/key-grant
  if (ctx.base && ctx.base.writable) {
    res.writeHead(410, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'This endpoint is deprecated. Use POST /api/key-grant for encrypted key delivery.' }))
    return
  }

  // Try to get proof from query param (base64 encoded JSON)
  let proof = null
  const proofParam = url.searchParams.get('proof')
  if (proofParam) {
    try {
      proof = JSON.parse(Buffer.from(decodeURIComponent(proofParam), 'base64').toString())
    } catch { /* ignore */ }
  }

  if (!proof) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Proof required' }))
    return
  }

  const keys = await getFeedKeysForProof(proof)
  if (!keys) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Invalid or expired proof' }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ keys }))
}

// POST /api/feeds/keys — same restriction
async function handleFeedKeysPost (req, res, url, ctx) {
  if (ctx.base && ctx.base.writable) {
    res.writeHead(410, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'This endpoint is deprecated. Use POST /api/key-grant for encrypted key delivery.' }))
    return
  }

  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return
  }

  const keys = await getFeedKeysForProof(parsed)
  if (!keys) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Invalid or expired proof' }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ keys }))
}

export const feedKeyRoutes = [
  { method: 'GET', path: '/api/feeds/keys', handler: handleFeedKeys },
  { method: 'POST', path: '/api/feeds/keys', handler: handleFeedKeysPost }
]
