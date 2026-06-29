import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function handleFrontpage (req, res, url, ctx) {
  const pathChannel = url.pathname.split('/').pop()
  const channel = (pathChannel && pathChannel !== 'frontpage' && pathChannel !== 'api')
    ? pathChannel
    : url.searchParams.get('channel')

  if (!channel) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'channel required' }))
    return
  }

  try {
    if (!ctx.base || !ctx.base.view) {
      res.writeHead(503, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'starting up' }))
      return
    }
    await ctx.base.update()
    const latestKey = `frontpage-latest:${channel}`
    const latestEntry = await ctx.base.view.get(latestKey)

    if (!latestEntry) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'No front page edition yet for this channel' }))
      return
    }

    const { edition, timestamp } = JSON.parse(latestEntry.value)
    const editionKey = `frontpage:${channel}:${edition}`
    const editionEntry = await ctx.base.view.get(editionKey)

    if (!editionEntry) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Edition not found' }))
      return
    }

    const editionData = JSON.parse(editionEntry.value)

    // Check boost count
    let boostCount = 0
    let boostVolume = 0
    for await (const entry of ctx.base.view.createReadStream({
      gte: `frontpage-boost:${channel}:${edition}:`,
      lt: `frontpage-boost:${channel}:${edition}:\xff`
    })) {
      boostCount++
      const boost = JSON.parse(entry.value)
      boostVolume += boost.boostAmount || 0
    }

    // If edition was encrypted, try to decrypt for holders
    let decrypted = editionData
    if (ctx.decryptPost && editionData.stories === undefined) {
      // The edition was stored encrypted — non-holders get headlines only
      // For now, return as-is; the frontend handles display logic
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      ...decrypted,
      boostCount,
      boostVolume
    }))
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.message }))
  }
}

async function handleFrontpageList (req, res, url, ctx) {
  if (!ctx.base || !ctx.base.view) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'starting up' }))
    return
  }
  await ctx.base.update()
  const channels = []
  for await (const entry of ctx.base.view.createReadStream({
    gte: 'frontpage-latest:',
    lt: 'frontpage-latest:\xff'
  })) {
    const channel = entry.key.replace('frontpage-latest:', '')
    const { edition, timestamp } = JSON.parse(entry.value)
    channels.push({ channel, edition, timestamp })
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ channels }))
}

async function handleFrontpageBoost (req, res, url, ctx) {
  const { readBody } = await import('../http.js')
  const body = JSON.parse(await readBody(req))

  const { channel, edition, boostAmount, distributeTxHash, boostedBy, boostedByEth } = body

  if (!channel || !edition || !boostedBy) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'channel, edition, boostedBy required' }))
    return
  }

  if (!ctx.base) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'No Autobase context' }))
    return
  }

  const op = {
    type: 'frontpage-boost',
    channel,
    edition,
    boostAmount: boostAmount || 0,
    distributeTxHash: distributeTxHash || '',
    boostedBy,
    boostedByEth: boostedByEth || '',
    timestamp: Date.now()
  }

  try {
    await ctx.base.append(JSON.stringify(op))
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, ...op }))
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: err.message }))
  }
}

export const frontpageRoutes = [
  { method: 'GET', path: '/api/frontpage/list', handler: handleFrontpageList },
  { method: 'GET', path: '/api/frontpage', handler: handleFrontpage },
  { method: 'POST', path: '/api/frontpage/boost', handler: handleFrontpageBoost }
]
