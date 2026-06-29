import Corestore from 'corestore'
import Autobase from 'autobase'
import Hyperswarm from 'hyperswarm'
import Protomux from 'protomux'
import b4a from 'b4a'
import fs from 'node:fs'
import path from 'node:path'
import { applyOpts } from './db.js'
import { startDiffWatcher } from './sse.js'
import { initServerX25519 } from './key-grants.js'
import { setBootstrapKey } from './db.js'

const PRESENCE_INTERVAL_MS = 10000
const PRESENCE_TTL_MS = 30000

export async function initP2P ({ ctx, dataDir }) {
  let coreDir = path.join(dataDir, 'core')
  if (process.env.FORCE_WIPE === 'true') {
    console.log('FORCE_WIPE: clearing data directory')
    if (fs.existsSync(dataDir)) {
      for (const entry of fs.readdirSync(dataDir)) {
        if (entry.startsWith('.')) continue
        fs.rmSync(path.join(dataDir, entry), { recursive: true, force: true })
      }
    }
    coreDir = path.join(dataDir, 'core-' + Date.now())
  }

  const store = new Corestore(coreDir)
  ctx.swarm = new Hyperswarm()
  ctx.peerCount = 0
  ctx.localBrowserCount = 0
  ctx.remotePresence = new Map() // nodeId -> { count, lastSeen }

  ctx.getOnlineUsers = () => {
    const now = Date.now()
    let total = ctx.localBrowserCount
    for (const entry of ctx.remotePresence.values()) {
      if (now - entry.lastSeen < PRESENCE_TTL_MS) total += entry.count
    }
    return total
  }

  ctx.pruneStalePresence = () => {
    const now = Date.now()
    let pruned = 0
    for (const [nodeId, entry] of ctx.remotePresence) {
      if (now - entry.lastSeen >= PRESENCE_TTL_MS) {
        ctx.remotePresence.delete(nodeId)
        pruned++
      }
    }
    if (pruned > 0) console.log(`[presence] pruned ${pruned} stale node(s)`)
  }

  if (process.env.FORCE_WIPE === 'true') {
    console.log('FORCE_WIPE: clearing data directory')
    if (fs.existsSync(dataDir)) {
      for (const entry of fs.readdirSync(dataDir)) {
        if (entry.startsWith('.')) continue
        fs.rmSync(path.join(dataDir, entry), { recursive: true, force: true })
      }
    }
  }

  const dataDirExists = fs.existsSync(coreDir)
  const hasExistingData = dataDirExists &&
    fs.readdirSync(coreDir).some(f => !f.startsWith('.'))

  const hasDataAfterWipe = hasExistingData

  if (ctx.FEED_KEY && process.env.FORCE_WIPE === 'true' && !hasDataAfterWipe) {
    console.log('FORCE_WIPE: bootstrapping fresh as writable owner')
    ctx.base = new Autobase(store, null, applyOpts())
  } else if (ctx.FEED_KEY) {
    console.log(hasDataAfterWipe ? 'Reopening existing feed by key' : 'Joining network as peer by FEED_KEY')
    ctx.base = new Autobase(store, b4a.from(ctx.FEED_KEY, 'hex'), applyOpts())
  } else {
    console.log('No FEED_KEY — bootstrapping fresh as writable owner')
    ctx.base = new Autobase(store, null, applyOpts())
  }
  await ctx.base.ready()

  const feedKey = b4a.toString(ctx.base.key, 'hex')
  setBootstrapKey(feedKey)
  ctx.localKey = b4a.toString(ctx.base.local.key, 'hex')
  ctx.shortKey = ctx.localKey.slice(0, 8)
  ctx.nodeId = ctx.shortKey
  ctx.ready = true

  initServerX25519(ctx.base.local.key)

  if (ctx.FEED_KEY && feedKey !== ctx.FEED_KEY) {
    console.log(`WARNING: generated feed key ${feedKey} does not match FEED_KEY ${ctx.FEED_KEY}`)
    console.log('Update your FEED_KEY env var to match, or clear it to use the generated key.')
  }

  console.log(`feed: ${feedKey}`)
  console.log(`p2p ready — author: @${ctx.shortKey} — writable: ${ctx.base.writable}`)

  const presenceChannels = new Set()

  function buildPresenceMessage () {
    return b4a.from(JSON.stringify({
      nodeId: ctx.nodeId,
      count: ctx.localBrowserCount,
      ts: Date.now()
    }), 'utf-8')
  }

  function broadcastPresence () {
    const msg = buildPresenceMessage()
    for (const send of presenceChannels) {
      try { send(msg) } catch {}
    }
  }

  ctx.broadcastPresence = broadcastPresence

  ctx.swarm.on('connection', (socket, info) => {
    const noiseId = b4a.toString(info.publicKey, 'hex').slice(0, 8)
    ctx.peerCount++
    console.log(`+ peer ${noiseId} (total: ${ctx.peerCount})`)
    socket.on('close', () => {
      ctx.peerCount = Math.max(0, ctx.peerCount - 1)
      console.log(`- peer ${noiseId} (total: ${ctx.peerCount})`)
    })
    store.replicate(socket)

    const mux = Protomux.from(socket)
    const channel = mux.createChannel({ protocol: 'whaleroom-writer' })

    const writerMsg = channel.addMessage({
      encoding: { preencode (s, m) { s.end += m.length }, encode (s, m) { s.buffer.set(m, s.start); s.start += m.length }, decode (s) { return s.buffer.subarray(s.start, s.end) } },
      async onmessage (key) {
        const hex = b4a.toString(key, 'hex')
        const id = hex.slice(0, 8)
        console.log(`peer writer key: @${id} (manual add required)`)
      }
    })

    const presenceChannel = mux.createChannel({ protocol: 'whaleroom-presence' })
    const presenceMsg = presenceChannel.addMessage({
      encoding: { preencode (s, m) { s.end += m.length }, encode (s, m) { s.buffer.set(m, s.start); s.start += m.length }, decode (s) { return s.buffer.subarray(s.start, s.end) } },
      onmessage (buf) {
        try {
          const data = JSON.parse(b4a.toString(buf, 'utf-8'))
          if (data.nodeId && typeof data.count === 'number') {
            ctx.remotePresence.set(data.nodeId, { count: data.count, lastSeen: Date.now() })
          }
        } catch {}
      }
    })

    presenceChannel.open()
    writerMsg.send(ctx.base.local.key)
    presenceChannels.add(presenceMsg.send.bind(presenceMsg))

    try { presenceMsg.send(buildPresenceMessage()) } catch {}

    const interval = setInterval(() => broadcastPresence(), PRESENCE_INTERVAL_MS)
    socket.on('close', () => {
      clearInterval(interval)
      presenceChannels.delete(presenceMsg.send.bind(presenceMsg))
    })
  })

  ctx.swarm.join(ctx.base.discoveryKey)
  ctx.swarm.flush().then(() => {
    console.log(`swarm connected — peers: ${ctx.swarm.connections.size}`)
  })

  setInterval(() => ctx.pruneStalePresence(), PRESENCE_INTERVAL_MS)

  startDiffWatcher(ctx)
}
