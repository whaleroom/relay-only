import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// In-memory log buffer (ring buffer, last 500 entries)
const MAX_LOGS = 500
const logBuffer = []
const consoleClients = new Set()

// Token tracking
const tokenStats = {
  cycleTokens: 0,
  cycleCost: 0,
  totalTokens: 0,
  totalCost: 0,
  callsThisCycle: 0,
  cycleStartTime: 0,
}

// Pricing fetched from Venice API at startup
let _pricingCache = {}
let _pricingFetchedAt = 0

async function fetchVenicePricing () {
  if (Date.now() - _pricingFetchedAt < 3600000) return // cache for 1h
  try {
    const res = await fetch('https://api.venice.ai/api/v1/models')
    if (!res.ok) return
    const data = await res.json()
    for (const m of (data.data || [])) {
      const p = m.model_spec?.pricing
      if (p) {
        _pricingCache[m.id] = {
          input: p.input?.usd || 0,
          output: p.output?.usd || 0,
        }
      }
    }
    _pricingFetchedAt = Date.now()
    console.log(`[console] fetched Venice pricing for ${Object.keys(_pricingCache).length} models`)
  } catch (err) {
    console.error('[console] failed to fetch Venice pricing:', err.message)
  }
}

// Fetch pricing on module load
fetchVenicePricing()

export function startTokenCycle () {
  tokenStats.cycleTokens = 0
  tokenStats.cycleCost = 0
  tokenStats.callsThisCycle = 0
  tokenStats.cycleStartTime = Date.now()
}

export function recordTokenUsage (model, usage) {
  if (!usage) return null
  const prompt = usage.prompt_tokens || 0
  const completion = usage.completion_tokens || 0
  const total = usage.total_tokens || (prompt + completion)
  // Venice pricing is per 1M tokens
  const pricing = _pricingCache[model] || { input: 0.14, output: 0.50 }
  const cost = (prompt / 1e6 * pricing.input) + (completion / 1e6 * pricing.output)

  tokenStats.cycleTokens += total
  tokenStats.cycleCost += cost
  tokenStats.totalTokens += total
  tokenStats.totalCost += cost
  tokenStats.callsThisCycle++

  return { prompt, completion, total, cost, model }
}

export function getTokenStats () {
  return { ...tokenStats, pricing: _pricingCache }
}

export function agentLog (level, message, data) {
  const entry = {
    timestamp: Date.now(),
    level,
    message,
    data: data || null
  }
  logBuffer.push(entry)
  if (logBuffer.length > MAX_LOGS) logBuffer.shift()

  // Broadcast to all connected console clients
  const msg = `data: ${JSON.stringify(entry)}\n\n`
  for (const res of consoleClients) {
    try { res.write(msg) } catch {}
  }
}

export function getRecentLogs () {
  return logBuffer.slice()
}

async function handleConsolePage (req, res, url, ctx) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
  res.end(renderConsoleHTML())
}

async function handleConsoleSSE (req, res, url, ctx) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  // Send connected event — client fetches recent logs via /api/console/logs
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)

  consoleClients.add(res)

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(`: heartbeat\n\n`) } catch {}
  }, 30000)

  req.on('close', () => {
    clearInterval(heartbeat)
    consoleClients.delete(res)
  })
}

async function handleConsoleLogs (req, res, url, ctx) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ logs: getRecentLogs(), tokenStats: getTokenStats() }))
}

async function handleTokenStats (req, res, url, ctx) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(getTokenStats()))
}

export const consoleRoutes = [
  { method: 'GET', path: '/console', handler: handleConsolePage, skipReady: true },
  { method: 'GET', path: '/api/console/sse', handler: handleConsoleSSE, skipReady: true },
  { method: 'GET', path: '/api/console/logs', handler: handleConsoleLogs, skipReady: true },
  { method: 'GET', path: '/api/console/tokens', handler: handleTokenStats, skipReady: true }
]

function renderConsoleHTML () {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Whaleroom — Agent Console</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0b; color: #a1a1aa; font-family: 'SF Mono', 'Monaco', 'Menlo', 'Courier New', monospace; font-size: 12px; line-height: 1.6; }
    .console-header { position: fixed; top: 0; left: 0; right: 0; background: #141416; border-bottom: 1px solid #27272a; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; z-index: 100; }
    .console-title { color: #e046bf; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; }
    .console-status { display: flex; align-items: center; gap: 8px; font-size: 11px; }
    .console-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: pulse-dot 2s infinite; }
    .console-dot.offline { background: #ef4444; animation: none; }
    @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    .console-controls { display: flex; gap: 8px; }
    .console-btn { background: none; border: 1px solid #27272a; border-radius: 4px; padding: 4px 10px; color: #71717a; font-size: 11px; cursor: pointer; font-family: inherit; }
    .console-btn:hover { border-color: #e046bf; color: #e046bf; }
    .console-btn.active { border-color: #e046bf; color: #e046bf; }
    .console-body { padding: 50px 20px 20px; max-width: 1000px; margin: 0 auto; }
    .log-entry { padding: 2px 0; display: flex; gap: 12px; align-items: flex-start; }
    .log-time { color: #52525b; flex-shrink: 0; width: 70px; }
    .log-level { flex-shrink: 0; width: 50px; font-weight: 700; }
    .log-level.info { color: #71717a; }
    .log-level.warn { color: #f59e0b; }
    .log-level.error { color: #ef4444; }
    .log-level.success { color: #22c55e; }
    .log-level.bridge { color: #06b6d4; }
    .log-level.frontpage { color: #e046bf; }
    .log-level.feedback { color: #8b5cf6; }
    .log-level.sync { color: #10b981; }
    .log-msg { color: #a1a1aa; word-break: break-word; }
    .log-msg .highlight { color: #fafafa; font-weight: 600; }
    .log-data { color: #52525b; margin-top: 2px; padding-left: 12px; border-left: 1px solid #27272a; font-size: 11px; white-space: pre-wrap; word-break: break-word; }
    .log-empty { text-align: center; padding: 40px; color: #52525b; }
  </style>
</head>
<body>
  <div class="console-header">
    <div class="console-title">🐋 WHALEROOM AGENT CONSOLE</div>
    <div class="console-status">
      <div class="console-dot" id="status-dot"></div>
      <span id="status-text">connecting...</span>
    </div>
    <div class="console-controls">
      <button class="console-btn active" id="btn-all" onclick="filterLogs('all')">All</button>
      <button class="console-btn" id="btn-bridge" onclick="filterLogs('bridge')">Bridge</button>
      <button class="console-btn" id="btn-frontpage" onclick="filterLogs('frontpage')">Front Page</button>
      <button class="console-btn" id="btn-errors" onclick="filterLogs('error')">Errors</button>
      <button class="console-btn" onclick="clearLogs()">Clear</button>
    </div>
  </div>
  <div class="console-body" id="log-body">
    <div class="log-empty">Waiting for agent activity...</div>
  </div>
  <script>
    let currentFilter = 'all';
    let allLogs = [];

    const sse = new EventSource('/api/console/sse');
    const dot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const logBody = document.getElementById('log-body');

    sse.onopen = () => {
      dot.classList.remove('offline');
      statusText.textContent = 'live';
    };

    sse.onerror = () => {
      dot.classList.add('offline');
      statusText.textContent = 'disconnected';
    };

    sse.onmessage = (e) => {
      const entry = JSON.parse(e.data);
      if (entry.type === 'connected') return;
      allLogs.push(entry);
      if (allLogs.length > 500) allLogs.shift();
      renderEntry(entry);
    };

    function renderEntry(entry) {
      if (currentFilter !== 'all' && entry.level !== currentFilter && !(currentFilter === 'error' && entry.level === 'error')) return;
      const empty = logBody.querySelector('.log-empty');
      if (empty) empty.remove();

      const div = document.createElement('div');
      div.className = 'log-entry';
      div.dataset.level = entry.level;

      const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false });
      const dataHTML = entry.data ? '<div class="log-data">' + escapeHtml(JSON.stringify(entry.data, null, 2)) + '</div>' : '';

      div.innerHTML =
        '<span class="log-time">' + time + '</span>' +
        '<span class="log-level ' + entry.level + '">' + entry.level.toUpperCase() + '</span>' +
        '<span class="log-msg">' + highlightMsg(entry.message) + '</span>' +
        dataHTML;

      logBody.appendChild(div);
      window.scrollTo(0, document.body.scrollHeight);
    }

    function filterLogs(level) {
      currentFilter = level;
      document.querySelectorAll('.console-btn').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById('btn-' + level) || document.getElementById('btn-all');
      if (btn) btn.classList.add('active');
      logBody.innerHTML = '';
      const filtered = level === 'all' ? allLogs : allLogs.filter(l => l.level === level);
      if (filtered.length === 0) {
        logBody.innerHTML = '<div class="log-empty">No logs matching filter.</div>';
      } else {
        filtered.forEach(renderEntry);
      }
    }

    function clearLogs() {
      allLogs = [];
      logBody.innerHTML = '<div class="log-empty">Cleared. Waiting for new agent activity...</div>';
    }

    function highlightMsg(msg) {
      return escapeHtml(msg)
        .replace(/\\[frontpage\\]/g, '<span class="highlight">[frontpage]</span>')
        .replace(/\\[bridge\\]/g, '<span class="highlight">[bridge]</span>')
        .replace(/\\[feedback\\]/g, '<span class="highlight">[feedback]</span>')
        .replace(/\\[feed-sync\\]/g, '<span class="highlight">[feed-sync]</span>')
        .replace(/edition #\\d+/g, function(m) { return '<span class="highlight">' + m + '</span>'; })
        .replace(/score \\d+/g, function(m) { return '<span class="highlight">' + m + '</span>'; });
    }

    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  </script>
</body>
</html>`
}
