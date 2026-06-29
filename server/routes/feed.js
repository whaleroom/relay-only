import { countLikes, countReplies, resolveProfile } from '../db.js'

async function handleFeed (req, res, url, ctx) {
  const limit = parseInt(url.searchParams.get('limit')) || 50
  const before = url.searchParams.get('before')
  const feedParam = url.searchParams.get('feed')
  const viewer = url.searchParams.get('viewer') || ''
  // Resolve feed filter: accept slug or FEED_ID
  const feedFilter = feedParam
    ? (ctx.FEEDS[feedParam] ? feedParam : ctx.FEED_BY_ID[feedParam]?.slug || null)
    : null
  // "following" virtual feed — collect who the viewer follows
  let followingSet = null
  if (feedParam === 'following' && viewer) {
    followingSet = new Set()
    for await (const entry of ctx.base.view.createReadStream({
      gte: `follow:${viewer}:`,
      lt: `follow:${viewer}:\xff`
    })) {
      const data = JSON.parse(entry.value)
      followingSet.add(data.target)
    }
  }
  const posts = []
  const opts = { reverse: true, lt: 'author:' }
  if (before) opts.lt = before

  await ctx.base.update()
  const profileCache = {}
  for await (const entry of ctx.base.view.createReadStream(opts)) {
    const post = JSON.parse(entry.value)
    // Skip replies from showing as top-level posts
    if (post.replyTo) continue
    // Skip posts from deleted/unknown feeds
    if (post.feed && !ctx.FEEDS[post.feed]) continue
    // Filter by feed if specified (skip for "following" virtual feed)
    if (feedFilter && feedParam !== 'following' && post.feed !== feedFilter) continue
    // Following feed: only show posts from followed users
    if (followingSet && !followingSet.has(post.author)) continue
    if (post.type === 'post') {
      const postKey = `${post.timestamp}:${post.author}`
      post.replyCount = await countReplies(ctx.base.view, postKey)
      const { likeCount, likedByMe } = await countLikes(ctx.base.view, postKey, viewer)
      post.likeCount = likeCount
      post.likedByMe = likedByMe
      const profile = await resolveProfile(ctx.base.view, post.author, profileCache)
      post.authorUsername = profile.username
      post.authorDisplayName = profile.displayName
      posts.push(post)
      if (posts.length >= limit) break
    }
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(posts))
}

async function handleReplies (req, res, url, ctx) {
  const postKey = url.searchParams.get('post')
  if (!postKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'post param required' }))
    return
  }

  await ctx.base.update()

  // Get parent post
  const parentEntry = await ctx.base.view.get(postKey)
  const parent = parentEntry ? JSON.parse(parentEntry.value) : null

  // Get replies
  const replies = []
  for await (const entry of ctx.base.view.createReadStream({
    gte: `reply:${postKey}:`,
    lt: `reply:${postKey}:\xff`
  })) {
    const reply = JSON.parse(entry.value)
    replies.push(reply)
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ parent, replies }))
}

async function handleUserPosts (req, res, url, ctx) {
  const author = url.searchParams.get('author')
  if (!author) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'author param required' }))
    return
  }
  const limit = parseInt(url.searchParams.get('limit')) || 50
  await ctx.base.update()

  // Get profile
  const profileEntry = await ctx.base.view.get(`profile:${author}`)
  const profile = profileEntry ? JSON.parse(profileEntry.value) : null

  // Get user's posts via author index (reverse chronological)
  const userPosts = []
  for await (const entry of ctx.base.view.createReadStream({
    gte: `author:${author}:`,
    lt: `author:${author}:\xff`,
    reverse: true
  })) {
    const post = JSON.parse(entry.value)
    if (post.type === 'post' && !post.replyTo && !(post.feed && !ctx.FEEDS[post.feed])) {
      const postKey = `${post.timestamp}:${post.author}`
      const { likeCount } = await countLikes(ctx.base.view, postKey)
      post.likeCount = likeCount
      post.replyCount = await countReplies(ctx.base.view, postKey)
      userPosts.push(post)
      if (userPosts.length >= limit) break
    }
  }

  // Attach username
  const nameEntry = await ctx.base.view.get(`user-to-name:${author}`)
  const username = nameEntry ? nameEntry.value : null

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ profile, username, posts: userPosts }))
}

export const feedRoutes = [
  { method: 'GET', path: '/api/feed', handler: handleFeed },
  { method: 'GET', path: '/api/replies', handler: handleReplies },
  { method: 'GET', path: '/api/user-posts', handler: handleUserPosts }
]
