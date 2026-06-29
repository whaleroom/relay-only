import { verifyAndExtractAuthor } from '../auth.js'
import { generateAvatar } from '../avatar.js'
import { countLikes } from '../db.js'
import { readBody } from '../http.js'
import { isTokenGateEnabled, checkHoldings } from '../token-gate.js'
import { encryptPost, hasFeedKey } from '../feed-keys.js'
import { isEncrypted } from '../feed-keys.js'
import { moderatePost } from '../moderation.js'

async function handleAddWriter (req, res, url, ctx) {
  // F8 fix: Require seed node operator signature for adding writers
  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return
  }
  const { key, signature, publicKey } = parsed
  if (!key || key.length !== 64) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'key must be a 64-char hex string' }))
    return
  }
  // Verify the request is signed by the seed node operator
  const authResult = verifyAndExtractAuthor(parsed, ctx.shortKey)
  if (authResult.error || authResult.author !== ctx.shortKey) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Only the seed node operator can add writers' }))
    return
  }
  try {
    await ctx.base.append(JSON.stringify({ type: 'add-writer', key }))
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer — cannot add writers' }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true, added: key.slice(0, 8) }))
}

async function handlePost (req, res, url, ctx) {
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
  const { text, replyTo, feed: postFeed } = parsed
  if (!text || !text.trim()) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'text required' }))
    return
  }
  const post = {
    type: 'post',
    text: text.trim(),
    author,
    timestamp: Date.now()
  }
  if (replyTo) post.replyTo = replyTo
  // Accept feed by slug or by FEED_ID
  if (postFeed) {
    if (ctx.FEEDS[postFeed]) post.feed = postFeed
    else if (ctx.FEED_BY_ID[postFeed]) post.feed = ctx.FEED_BY_ID[postFeed].slug
  }

  // Token gate enforcement: only token holders can post to encrypted feeds.
  // Non-holders can still log in, browse, and see ciphertext.
  if (post.feed && isTokenGateEnabled()) {
    let ethAddress = null
    const x25519PubKey = parsed.publicKey ? parsed.publicKey : null
    if (x25519PubKey) {
      await ctx.base.update()
      const grantEntry = await ctx.base.view.get(`key-grant:${x25519PubKey}`)
      if (grantEntry) {
        const grant = JSON.parse(grantEntry.value)
        ethAddress = grant.ethAddress || null
      }
    }
    if (ethAddress) {
      const holdings = await checkHoldings(ethAddress)
      if (!holdings.valid) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Insufficient token holdings to post to this feed' }))
        return
      }
    }
    // If no ethAddress found in grant (ZK path or grant not yet replicated),
    // don't block the post — the user has a valid key grant which means they
    // were verified by the seed node at some point. The revocation loop
    // will catch them if they sell tokens.
  }

  // Pre-post moderation gate
  if (ctx.base?.view) {
    await ctx.base.update()
    const recentPosts = []
    for await (const entry of ctx.base.view.createReadStream({ reverse: true, lt: 'author:' })) {
      const p = JSON.parse(entry.value)
      if (p.type !== 'post') continue
      if (p.feed !== post.feed) continue
      if (p.text) recentPosts.push(p.text)
      if (recentPosts.length >= 20) break
    }
    const moderation = await moderatePost(text, author, !!replyTo, recentPosts)
    if (!moderation.approved) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ moderation: { approved: false, reason: moderation.reason, layer: moderation.layer } }))
      return
    }
  }

  // Server-side encryption fallback: if the post targets an encrypted feed
  // but arrives as plaintext (client didn't have feed keys), encrypt it
  // server-side before appending to the Autobase. This ensures non-holders
  // always see ciphertext, even if the poster's client didn't encrypt.
  if (post.feed && hasFeedKey(post.feed) && !isEncrypted(post.text)) {
    const result = encryptPost(post.text, post.feed)
    if (result.enc) {
      post.text = result.text
    }
  }

  try {
    await ctx.base.append(JSON.stringify(post))
    // Auto-generate avatar if this author doesn't have one yet
    const existingAvatar = await ctx.base.view.get(`avatar:${author}`)
    if (!existingAvatar) {
      const avatarConfig = generateAvatar(author)
      await ctx.base.append(JSON.stringify({ type: 'avatar', author, ...avatarConfig, timestamp: Date.now() }))
    }
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer — ask an existing writer to add this node' }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(post))
}

async function handleLike (req, res, url, ctx) {
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
  const { postKey } = parsed
  if (!postKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'postKey required' }))
    return
  }
  try {
    await ctx.base.append(JSON.stringify({ type: 'like', postKey, author, timestamp: Date.now() }))
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer' }))
    return
  }
  // Return updated count
  await ctx.base.update()
  const { likeCount } = await countLikes(ctx.base.view, postKey)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true, likeCount }))
}

async function handleUnlike (req, res, url, ctx) {
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
  const { postKey } = parsed
  if (!postKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'postKey required' }))
    return
  }
  try {
    await ctx.base.append(JSON.stringify({ type: 'unlike', postKey, author, timestamp: Date.now() }))
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer' }))
    return
  }
  await ctx.base.update()
  const { likeCount } = await countLikes(ctx.base.view, postKey)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true, likeCount }))
}

async function handleDeletePost (req, res, url, ctx) {
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
  const { postKey } = parsed
  if (!postKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'postKey required' }))
    return
  }
  await ctx.base.update()
  const existing = await ctx.base.view.get(postKey)
  if (!existing) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'post not found' }))
    return
  }
  const post = JSON.parse(existing.value)
  if (post.author !== author) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'can only delete your own posts' }))
    return
  }
  try {
    await ctx.base.append(JSON.stringify({ type: 'delete-post', postKey, author, timestamp: Date.now() }))
  } catch (err) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'not a writer' }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true }))
}

async function handleLikes (req, res, url, ctx) {
  const postKey = url.searchParams.get('post')
  const userAuthor = url.searchParams.get('author')
  if (!postKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'post param required' }))
    return
  }
  await ctx.base.update()
  const { likeCount, likedByMe } = await countLikes(ctx.base.view, postKey, userAuthor)
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ likeCount, liked: likedByMe }))
}

export const postRoutes = [
  { method: 'POST', path: '/api/add-writer', handler: handleAddWriter },
  { method: 'POST', path: '/api/post', handler: handlePost },
  { method: 'POST', path: '/api/like', handler: handleLike },
  { method: 'POST', path: '/api/unlike', handler: handleUnlike },
  { method: 'GET', path: '/api/likes', handler: handleLikes },
  { method: 'POST', path: '/api/delete-post', handler: handleDeletePost }
]
