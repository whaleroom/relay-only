import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildFeeds } from './feeds.js'
import { startHttp } from './http.js'
import { initP2P } from './p2p.js'
import { initFeedKeys, encryptPost } from './feed-keys.js'
import { startRevocationLoop } from './revocation.js'
import { publishGateConfig } from './gate-config.js'
import { setModerationLog } from './moderation.js'
import { agentLog } from './routes/console.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4444
const DATA_DIR = process.env.DATA_DIR || './data'
const PRODUCTION_FEED_KEY = 'daf5b224befc2f4269268db983ecffd892bc15fcbf13ccb2780f08ab67d8887f'
const FEED_KEY = process.env.FORCE_WIPE === 'true' ? null : (process.env.FEED_KEY || PRODUCTION_FEED_KEY)

const { FEEDS, FEED_BY_SLUG, FEED_BY_ID } = buildFeeds()
initFeedKeys(FEEDS)

if (process.env.TOKEN_GATE_ENABLED === 'false') {
  console.warn('WARNING: TOKEN_GATE_ENABLED=false — anyone can get feed encryption keys without holding tokens!')
}

const ctx = {
  base: null,
  swarm: null,
  ready: false,
  localKey: '',
  shortKey: '',
  sseClients: new Set(),
  FEEDS,
  FEED_BY_SLUG,
  FEED_BY_ID,
  FEED_KEY,
  encryptPost
}

if (!FEED_KEY && !process.env.FORCE_WIPE && fs.existsSync(path.resolve(__dirname, '..', DATA_DIR, 'core'))) {
  console.error('Missing FEED_KEY — required when data directory already exists.')
  process.exit(1)
}

const server = startHttp(PORT, ctx)
initP2P({ ctx, dataDir: DATA_DIR }).then(() => {
  publishGateConfig(ctx)
  startRevocationLoop(ctx)
  setModerationLog(agentLog)
  console.log('[relay] node ready — relay-only mode (no bridge)')
}).catch(err => {
  console.error('p2p init failed:', err.message)
})

const parentPid = parseInt(process.env.PARENT_PID)
if (parentPid) {
  setInterval(() => {
    try { process.kill(parentPid, 0) } catch { process.exit(0) }
  }, 3000)
}

process.on('SIGINT', async () => {
  console.log('\nshutting down...')
  server.close()
  if (ctx.swarm) await ctx.swarm.destroy()
  process.exit(0)
})
