export function broadcast (sseClients, data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`
  for (const client of sseClients) {
    const res = client.res || client
    res.write(msg)
  }
}

export async function startDiffWatcher (ctx) {
  let lastVersion = ctx.base.view.version
  const watcher = ctx.base.view.watch()
  for await (const _ of watcher) {
    const currentVersion = ctx.base.view.version
    if (currentVersion <= lastVersion) continue
    const diffStream = ctx.base.view.createDiffStream(lastVersion)
    lastVersion = currentVersion
    for await (const diff of diffStream) {
      // Broadcast delete events from the deletion index
      if (diff.left && diff.left.key.startsWith('deleted:')) {
        const postKey = diff.left.key.slice('deleted:'.length)
        broadcast(ctx.sseClients, { type: 'delete', postKey })
        continue
      }
      if (!diff.left) continue
      // Each post creates multiple Hyperbee entries (main + author index + reply index).
      // Only emit from the main entry to avoid duplicates.
      const key = diff.left.key
      if (key.startsWith('author:') || key.startsWith('reply:') ||
          key.startsWith('username:') || key.startsWith('user-to-name:') ||
          key.startsWith('profile:') || key.startsWith('avatar:') ||
          key.startsWith('follow:') || key.startsWith('follower:') ||
          key.startsWith('key-grant:') || key.startsWith('key-revoke:') ||
          key.startsWith('bridge-operator') || key.startsWith('gate-config') ||
          key.startsWith('frontpage') || key.startsWith('deleted:')) continue
      let val
      try { val = JSON.parse(diff.left.value) } catch { continue }
      // Skip posts from deleted/unknown feeds
      if (val.feed && !ctx.FEEDS[val.feed]) continue
      if (val.type === 'post') {
        // Resolve author username/displayName before sending to clients
        const nameEntry = await ctx.base.view.get(`user-to-name:${val.author}`)
        val.authorUsername = nameEntry ? nameEntry.value : null
        const profileEntry = await ctx.base.view.get(`profile:${val.author}`)
        val.authorDisplayName = profileEntry ? (JSON.parse(profileEntry.value).displayName || null) : null
      }
      if (val.type === 'post' || val.type === 'like' || val.type === 'unlike') {
        broadcast(ctx.sseClients, val)
      }
    }
  }
}
