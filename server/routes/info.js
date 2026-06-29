import b4a from 'b4a'

async function handleInfo (req, res, url, ctx) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    feedKey: ctx.base ? b4a.toString(ctx.base.key, 'hex') : ctx.FEED_KEY,
    author: ctx.shortKey,
    peers: (ctx.peerCount || (ctx.swarm ? ctx.swarm.connections.size : 0)) + 1,
    onlineUsers: ctx.getOnlineUsers ? ctx.getOnlineUsers() : 0,
    posts: ctx.ready ? ctx.base.view.version : 0,
    ready: ctx.ready,
    feeds: Object.fromEntries(
      Object.entries(ctx.FEEDS).map(([slug, f]) => [slug, { id: f.id, slug: f.slug, name: f.name }])
    )
  }))
}

async function handleLive (req, res, url, ctx) {
  const origin = req.headers.origin
  if (origin) {
    if (origin === 'null') {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'sandboxed origin not allowed' }))
      return
    }
    try {
      const originHost = new URL(origin).host
      if (originHost !== req.headers.host) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'cross-origin not allowed' }))
        return
      }
    } catch {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'invalid origin' }))
      return
    }
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })
  res.write(':\n\n')

  const client = { res }
  ctx.sseClients.add(client)
  ctx.localBrowserCount = ctx.sseClients.size
  if (ctx.broadcastPresence) ctx.broadcastPresence()

  // Heartbeat every 15s to detect zombie connections
  const heartbeat = setInterval(() => {
    try { res.write(':\n\n') } catch {}
  }, 15000)

  req.on('close', () => {
    ctx.sseClients.delete(client)
    clearInterval(heartbeat)
    ctx.localBrowserCount = ctx.sseClients.size
    if (ctx.broadcastPresence) ctx.broadcastPresence()
  })
}

export const infoRoutes = [
  { method: 'GET', path: '/api/info', handler: handleInfo, skipReady: true },
  { path: '/api/live', handler: handleLive, skipReady: true }
]
