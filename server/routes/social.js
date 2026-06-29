import { verifyAndExtractAuthor } from '../auth.js'
import { readBody } from '../http.js'

async function handleFollow (req, res, url, ctx) {
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
  const { target } = parsed
  if (!target) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'target required' }))
    return
  }
  if (author === target) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'cannot follow yourself' }))
    return
  }
  try {
    await ctx.base.append(JSON.stringify({ type: 'follow', author, target, timestamp: Date.now() }))
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer' }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true }))
}

async function handleUnfollow (req, res, url, ctx) {
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
  const { target } = parsed
  if (!target) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'target required' }))
    return
  }
  try {
    await ctx.base.append(JSON.stringify({ type: 'unfollow', author, target, timestamp: Date.now() }))
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer' }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true }))
}

async function handleFollowing (req, res, url, ctx) {
  const author = url.searchParams.get('author')
  if (!author) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'author param required' }))
    return
  }
  await ctx.base.update()
  const following = []
  for await (const entry of ctx.base.view.createReadStream({
    gte: `follow:${author}:`,
    lt: `follow:${author}:\xff`
  })) {
    const data = JSON.parse(entry.value)
    following.push(data.target)
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ following }))
}

async function handleFollowers (req, res, url, ctx) {
  const author = url.searchParams.get('author')
  if (!author) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'author param required' }))
    return
  }
  await ctx.base.update()
  const followers = []
  for await (const entry of ctx.base.view.createReadStream({
    gte: `follower:${author}:`,
    lt: `follower:${author}:\xff`
  })) {
    const data = JSON.parse(entry.value)
    followers.push(data.author)
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ followers }))
}

async function handleIsFollowing (req, res, url, ctx) {
  const author = url.searchParams.get('author')
  const target = url.searchParams.get('target')
  if (!author || !target) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'author and target params required' }))
    return
  }
  await ctx.base.update()
  const entry = await ctx.base.view.get(`follow:${author}:${target}`)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ following: !!entry }))
}

export const socialRoutes = [
  { method: 'POST', path: '/api/follow', handler: handleFollow },
  { method: 'POST', path: '/api/unfollow', handler: handleUnfollow },
  { method: 'GET', path: '/api/following', handler: handleFollowing },
  { method: 'GET', path: '/api/followers', handler: handleFollowers },
  { method: 'GET', path: '/api/is-following', handler: handleIsFollowing }
]
