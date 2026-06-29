import { verifyAndExtractAuthor } from '../auth.js'
import { generateAvatar } from '../avatar.js'
import { readBody } from '../http.js'

async function handleGetProfile (req, res, url, ctx) {
  const author = url.searchParams.get('author')
  if (!author) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'author param required' }))
    return
  }
  await ctx.base.update()
  const entry = await ctx.base.view.get(`profile:${author}`)
  const profile = entry ? JSON.parse(entry.value) : null
  // Attach username if claimed
  const nameEntry = await ctx.base.view.get(`user-to-name:${author}`)
  const username = nameEntry ? nameEntry.value : null
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ...(profile || {}), author, username }))
}

async function handlePostProfile (req, res, url, ctx) {
  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return
  }
  const authResult = verifyAndExtractAuthor(parsed, ctx.shortKey)
  if (authResult.error) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: authResult.error }))
    return
  }
  const { author } = authResult
  const { displayName, bio } = parsed
  try {
    await ctx.base.append(JSON.stringify({
      type: 'profile',
      author,
      displayName: (displayName || '').slice(0, 50),
      bio: (bio || '').slice(0, 160),
      timestamp: Date.now()
    }))
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer' }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true }))
}

async function handleAvatar (req, res, url, ctx) {
  const author = url.searchParams.get('author')
  if (!author) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'author param required' }))
    return
  }
  await ctx.base.update()
  const entry = await ctx.base.view.get(`avatar:${author}`)
  if (entry) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(entry.value)
  } else {
    // Generate deterministically and return (not yet persisted)
    const config = generateAvatar(author)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ author, ...config }))
  }
}

async function handleClaimUsername (req, res, url, ctx) {
  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return
  }
  const authResult = verifyAndExtractAuthor(parsed, ctx.shortKey)
  if (authResult.error) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: authResult.error }))
    return
  }
  const { author } = authResult
  const { username } = parsed
  if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'username must be 3-20 chars, alphanumeric or underscore' }))
    return
  }
  const normalizedName = username.toLowerCase()

  await ctx.base.update()
  // Check if username is already taken
  const existing = await ctx.base.view.get(`username:${normalizedName}`)
  if (existing) {
    const owner = JSON.parse(existing.value)
    if (owner.author !== author) {
      res.writeHead(409, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'username already taken' }))
      return
    }
  }
  try {
    await ctx.base.append(JSON.stringify({ type: 'claim-username', username: normalizedName, author, timestamp: Date.now() }))
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer' }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true, username: normalizedName }))
}

export const identityRoutes = [
  { method: 'GET', path: '/api/profile', handler: handleGetProfile },
  { method: 'POST', path: '/api/profile', handler: handlePostProfile },
  { method: 'GET', path: '/api/avatar', handler: handleAvatar },
  { method: 'POST', path: '/api/claim-username', handler: handleClaimUsername }
]
