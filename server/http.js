import http from 'node:http'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { infoRoutes } from './routes/info.js'
import { feedRoutes } from './routes/feed.js'
import { postRoutes } from './routes/posts.js'
import { socialRoutes } from './routes/social.js'
import { identityRoutes } from './routes/identity.js'
import { searchRoutes } from './routes/search.js'
import { embedRoutes } from './routes/embeds.js'
import { tokenGateRoutes } from './routes/token-gate.js'
import { rpcProxyRoutes } from './routes/rpc-proxy.js'
import { feedKeyRoutes } from './routes/feed-keys.js'
import { keyGrantRoutes } from './routes/key-grants.js'
import { governanceRoutes } from './routes/governance.js'
import { pulseRoutes } from './routes/pulse-news.js'
import { frontpageRoutes } from './routes/frontpage.js'
import { newsHTMLRoutes } from './routes/news-html.js'
import { consoleRoutes } from './routes/console.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const publicDir = path.resolve(projectRoot, 'public')

// ── Compute inline script hashes for CSP ──
const inlineScriptHashes = []
const scriptRegex = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g
for (const htmlFile of ['index.html', 'club.html', 'auth.html', 'what-is-whaleroom.html', 'run-a-node.html']) {
  const html = fs.readFileSync(path.join(publicDir, htmlFile), 'utf8')
  let match
  while ((match = scriptRegex.exec(html)) !== null) {
    // Skip module scripts with src attributes
    if (match[0].includes('src=')) continue
    const hash = "'sha256-" + crypto.createHash('sha256').update(match[1]).digest('base64') + "'"
    inlineScriptHashes.push(hash)
  }
}
const scriptHashes = inlineScriptHashes.join(' ')

// ── Route table ──
const routes = [
  ...infoRoutes,
  ...feedRoutes,
  ...postRoutes,
  ...socialRoutes,
  ...identityRoutes,
  ...searchRoutes,
  ...embedRoutes,
  ...tokenGateRoutes,
  ...rpcProxyRoutes,
  ...feedKeyRoutes,
  ...keyGrantRoutes,
  ...governanceRoutes,
  ...pulseRoutes,
  ...frontpageRoutes,
  ...newsHTMLRoutes,
  ...consoleRoutes
]

// ── Security headers ──
function setSecurityHeaders (res) {
  res.setHeader('Content-Security-Policy', [
    "default-src 'none'",
    `script-src 'self' 'wasm-unsafe-eval' https://esm.sh ${scriptHashes}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "font-src 'self' https: data:",
    "connect-src 'self' https: wss: ws:",
    "frame-src https:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '))
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  // M7 fix: No CORS headers — API is same-origin only
  // Same-origin requests don't need CORS; cross-origin is blocked by default
}

// ── Static file types ──
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
}

// ── Rate limiting (M3+M9 fix) ──
const rateLimits = new Map() // ip → { count, resetAt }
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_POST = 30 // max POST requests per minute
const RATE_LIMIT_MAX_GET = 60 // max GET requests per minute for API endpoints

function checkRateLimit (req) {
  const ip = req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  let entry = rateLimits.get(ip)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW }
    rateLimits.set(ip, entry)
  }
  entry.count++
  const max = req.method === 'POST' ? RATE_LIMIT_MAX_POST : RATE_LIMIT_MAX_GET
  return entry.count <= max
}

// ── Body reader (with size limit for DoS protection) ──
const MAX_BODY_SIZE = 2 * 1024 * 1024 // 2MB
const BODY_TIMEOUT = 10 * 1000 // 10 seconds

export function readBody (req) {
  return new Promise((resolve, reject) => {
    let body = ''
    let size = 0
    const timer = setTimeout(() => {
      req.destroy()
      reject(new Error('Body read timeout'))
    }, BODY_TIMEOUT)
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_SIZE) {
        clearTimeout(timer)
        req.destroy()
        reject(new Error('Body too large'))
        return
      }
      body += chunk
    })
    req.on('end', () => { clearTimeout(timer); resolve(body) })
    req.on('error', (err) => { clearTimeout(timer); reject(err) })
  })
}

// ── BigInt-safe JSON ──
// F11 fix: Keep the monkey-patch but document it clearly.
// Many ops use BigInt (from ethers.js), so removing this would break serialization.
const _origStringify = JSON.stringify
JSON.stringify = function (value, replacer, space) {
  const bigIntReplacer = (key, val) => {
    if (typeof val === 'bigint') return val.toString()
    if (typeof replacer === 'function') return replacer(key, val)
    return val
  }
  return _origStringify.call(JSON, value, bigIntReplacer, space)
}

// ── Start HTTP server ──
export function startHttp (port, ctx) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`)

    setSecurityHeaders(res)
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return }

    // Route dispatch
    for (const route of routes) {
      const matches = route.prefix
        ? url.pathname.startsWith(route.prefix)
        : route.path === url.pathname
      if (matches && (!route.method || route.method === req.method)) {
        // F5 fix: Rate limit API endpoints — but exempt /api/rpc (proxy needs multiple rapid calls for storage proofs)
        if (url.pathname.startsWith('/api/') && url.pathname !== '/api/rpc' && url.pathname !== '/api/info' && !checkRateLimit(req)) {
          res.writeHead(429, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }))
          return
        }
        if (!route.skipReady && !ctx.ready) {
          res.writeHead(503, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'starting up' }))
          return
        }
        await route.handler(req, res, url, ctx)
        return
      }
    }

    // Clean URL: /club → /club.html
    const reqPath = url.pathname === '/' ? '/index.html'
      : url.pathname === '/club' ? '/club.html'
      : url.pathname === '/what-is-whaleroom' ? '/what-is-whaleroom.html'
      : url.pathname === '/run-a-node' ? '/run-a-node.html'
      : url.pathname
    const filePath = path.normalize(path.join(publicDir, reqPath))

    // F19 fix: Use realpath for both paths to handle symlinks
    const realPublicDir = fs.realpathSync(publicDir)
    if (!filePath.startsWith(realPublicDir + path.sep) && filePath !== realPublicDir) {
      res.writeHead(403)
      res.end('forbidden')
      return
    }

    const ext = path.extname(filePath)
    try {
      const content = fs.readFileSync(filePath)
      const headers = { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' }
      // Prevent stale JS/HTML in desktop webview cache
      if (ext === '.html' || ext === '.js') {
        headers['Cache-Control'] = 'no-cache'
      }
      res.writeHead(200, headers)
      res.end(content)
    } catch {
      res.writeHead(404)
      res.end('not found')
    }
  })

  const bindAddr = process.env.BIND_ADDR || '0.0.0.0'
  server.listen(port, bindAddr, () => {
    console.log(`=== WHALEROOM ===`)
    console.log(`http://0.0.0.0:${port}`)
    console.log('starting p2p...')
  })

  return server
}
