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

export async function initP2P ({ ctx, dataDir }) {
  // FORCE_WIPE: clear ALL data and use a fresh subdirectory to avoid volume caching
  let coreDir = path.join(dataDir, 'core')
  if (process.env.FORCE_WIPE === 'true') {
    console.log('FORCE_WIPE: clearing data directory')
    if (fs.existsSync(dataDir)) {
      for (const entry of fs.readdirSync(dataDir)) {
        if (entry.startsWith('.')) continue
        fs.rmSync(path.join(dataDir, entry), { recursive: true, force: true })
      }
    }
    // Use a unique subdirectory to guarantee no stale data collision
    coreDir = path.join(dataDir, 'core-' + Date.now())
  }

  const store = new Corestore(coreDir)
  ctx.swarm = new Hyperswarm()
  ctx.peerCount = 0
  ctx.localPeerIds = new Set()
  ctx.remotePeerIds = new Map() // noiseId -> Set of peerIds
  ctx.getOnlineUsers = () => {
    const all = new Set(ctx.localPeerIds)
    for (const ids of ctx.remotePeerIds.values()) {
      for (const id of ids) all.add(id)
    }
    return all.size
  }

  // FORCE_WIPE: clear ALL data (old core data at /app/data/ and new at /app/data/core/)
  if (process.env.FORCE_WIPE === 'true') {
    console.log('FORCE_WIPE: clearing data directory')
    if (fs.existsSync(dataDir)) {
      for (const entry of fs.readdirSync(dataDir)) {
        if (entry.startsWith('.')) continue
        fs.rmSync(path.join(dataDir, entry), { recursive: true, force: true })
      }
    }
  }

  // Check if core dir has existing hypercore data
  const dataDirExists = fs.existsSync(coreDir)
  const hasExistingData = dataDirExists &&
    fs.readdirSync(coreDir).some(f => !f.startsWith('.'))

  const hasDataAfterWipe = hasExistingData

  if (ctx.FEED_KEY && process.env.FORCE_WIPE === 'true' && !hasDataAfterWipe) {
    // FORCE_WIPE with FEED_KEY — bootstrap fresh as writable owner
    console.log('FORCE_WIPE: bootstrapping fresh as writable owner')
    ctx.base = new Autobase(store, null, applyOpts())
  } else if (ctx.FEED_KEY) {
    // Join existing network by FEED_KEY (read-only peer if no existing data,
    // or reopen existing local data)
    console.log(hasDataAfterWipe ? 'Reopening existing feed by key' : 'Joining network as peer by FEED_KEY')
    ctx.base = new Autobase(store, b4a.from(ctx.FEED_KEY, 'hex'), applyOpts())
  } else {
    // No FEED_KEY — bootstrap as owner (writable) — seed node creation
    console.log('No FEED_KEY — bootstrapping fresh as writable owner')
    ctx.base = new Autobase(store, null, applyOpts())
  }
  await ctx.base.ready()

  const feedKey = b4a.toString(ctx.base.key, 'hex')
  // Store the bootstrap key so the apply function can verify writer identity
  setBootstrapKey(feedKey)
  ctx.localKey = b4a.toString(ctx.base.local.key, 'hex')
  ctx.shortKey = ctx.localKey.slice(0, 8)
  ctx.ready = true

  // Initialize server X25519 keypair from the Autobase local key (for key grants)
  initServerX25519(ctx.base.local.key)

  // If FEED_KEY was set but we bootstrapped fresh, verify the key matches
  if (ctx.FEED_KEY && feedKey !== ctx.FEED_KEY) {
    console.log(`WARNING: generated feed key ${feedKey} does not match FEED_KEY ${ctx.FEED_KEY}`)
    console.log('Update your FEED_KEY env var to match, or clear it to use the generated key.')
  }

  console.log(`feed: ${feedKey}`)
  console.log(`p2p ready — author: @${ctx.shortKey} — writable: ${ctx.base.writable}`)

  ctx.swarm.on('connection', (socket, info) => {
    const noiseId = b4a.toString(info.publicKey, 'hex').slice(0, 8)
    ctx.peerCount++
    ctx.remotePeerIds.set(noiseId, new Set())
    console.log(`+ peer ${noiseId} (total: ${ctx.peerCount})`)
    socket.on('close', () => {
      ctx.peerCount = Math.max(0, ctx.peerCount - 1)
      ctx.remotePeerIds.delete(noiseId)
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

    // Peer ID exchange — share unique online peer IDs across nodes
    const idsChannel = mux.createChannel({ protocol: 'whaleroom-peerids' })
    const idsMsg = idsChannel.addMessage({
      encoding: { preencode (s, m) { s.end += m.length }, encode (s, m) { s.buffer.set(m, s.start); s.start += m.length }, decode (s) { return s.buffer.subarray(s.start, s.end) } },
      onmessage (buf) {
        const json = b4a.toString(buf, 'utf-8')
        try {
          const ids = JSON.parse(json)
          ctx.remotePeerIds.set(noiseId, new Set(Array.isArray(ids) ? ids : []))
        } catch {}
      }
    })

    idsChannel.open()
    writerMsg.send(ctx.base.local.key)

    // Broadcast our local peer IDs to this peer
    ctx.broadcastPeerIds = () => {
      idsMsg.send(b4a.from(JSON.stringify(Array.from(ctx.localPeerIds)), 'utf-8'))
    }
    ctx.broadcastPeerIds()

    // Re-broadcast every 10s to keep in sync
    const interval = setInterval(() => ctx.broadcastPeerIds && ctx.broadcastPeerIds(), 10000)
    socket.on('close', () => clearInterval(interval))
  })

  ctx.swarm.join(ctx.base.discoveryKey)
  ctx.swarm.flush().then(() => {
    console.log(`swarm connected — peers: ${ctx.swarm.connections.size}`)
  })

  // Watch for new posts — use diff stream to only emit actual changes
  startDiffWatcher(ctx)
}
