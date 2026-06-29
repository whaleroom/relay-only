import { countLikes, countReplies, resolveProfile } from '../db.js'
import { decryptPost } from '../feed-keys.js'

async function handleSearch (req, res, url, ctx) {
  const q = (url.searchParams.get('q') || '').trim().toLowerCase()
  const limit = parseInt(url.searchParams.get('limit')) || 30
  const viewer = url.searchParams.get('viewer') || ''
  if (!q) {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ posts: [], users: [] }))
    return
  }

  await ctx.base.update()

  // Search users by username
  const users = []
  for await (const entry of ctx.base.view.createReadStream({
    gte: 'username:',
    lt: 'username:\xff'
  })) {
    const name = entry.key.slice('username:'.length)
    if (name.includes(q)) {
      const data = JSON.parse(entry.value)
      const profileEntry = await ctx.base.view.get(`profile:${data.author}`)
      const profile = profileEntry ? JSON.parse(profileEntry.value) : null
      users.push({
        author: data.author,
        username: name,
        displayName: profile?.displayName || null
      })
      if (users.length >= 10) break
    }
  }

  // Search posts by text content (decrypt if needed)
  const posts = []
  const profileCache = {}
  for await (const entry of ctx.base.view.createReadStream({ reverse: true, lt: 'author:' })) {
    const post = JSON.parse(entry.value)
    if (post.type !== 'post') continue
    if (post.replyTo) continue
    if (post.feed && !ctx.FEEDS[post.feed]) continue
    // Decrypt text for search matching
    let searchText = post.text
    if (post.feed) {
      const decrypted = decryptPost(post.text, post.feed)
      if (decrypted !== null) searchText = decrypted
    }
    if (!searchText.toLowerCase().includes(q)) continue

    const postKey = `${post.timestamp}:${post.author}`
    const { likeCount, likedByMe } = await countLikes(ctx.base.view, postKey, viewer)
    post.likeCount = likeCount
    post.likedByMe = likedByMe
    post.replyCount = await countReplies(ctx.base.view, postKey)

    const profile = await resolveProfile(ctx.base.view, post.author, profileCache)
    post.authorUsername = profile.username
    post.authorDisplayName = profile.displayName

    posts.push(post)
    if (posts.length >= limit) break
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ posts, users }))
}

export const searchRoutes = [
  { method: 'GET', path: '/api/search', handler: handleSearch }
]
