import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const FEED_COLORS = {
  bitcoin: '#f7931a', crypto: '#8b5cf6', ai: '#06b6d4',
  biotech: '#10b981', privacy: '#ef4444', geopolitics: '#f59e0b',
  predictions: '#22c55e'
}

const FEED_NAMES = {
  bitcoin: 'Bitcoin', crypto: 'Crypto', ai: 'AI',
  biotech: 'Biotech', privacy: 'Privacy', geopolitics: 'Geopolitics',
  predictions: 'Prediction Markets'
}

function renderEditionHTML (edition, channel) {
  const color = FEED_COLORS[channel] || '#e046bf'
  const name = FEED_NAMES[channel] || channel
  const updated = edition.timestamp ? new Date(edition.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''
  const nextNeeded = edition.triggerThreshold ? Math.max(0, edition.triggerThreshold - (edition.triggerCount || 0)) : ''

  const sirenHTML = edition.siren?.active ? `
    <div class="fp-siren">
      <div class="fp-siren-banner">
        <span class="fp-siren-dot">🔴</span>
        <span class="fp-siren-text">CONVERGENCE: ${esc(edition.siren.text)}</span>
      </div>
      ${edition.siren.channels ? `<div class="fp-siren-channels">${edition.siren.channels.map(c => `<span>${esc(FEED_NAMES[c] || c)}</span>`).join(' ')}</div>` : ''}
    </div>` : ''

  const storiesHTML = (edition.stories || []).map(s => `
    <div class="fp-story">
      <div class="fp-story-rank">${s.rank}</div>
      <div class="fp-story-content">
        <h3 class="fp-story-headline">${esc(s.headline)}</h3>
        <div class="fp-story-lede">${esc(s.lede || '')}</div>
        <div class="fp-story-meta">
          ${s.sources > 1 ? `<span>${s.sources} sources</span>` : ''}
          <span>score ${s.score}</span>
          ${s.sourceDomains?.length ? `<span>${esc(s.sourceDomains.slice(0, 4).join(', '))}</span>` : ''}
          ${s.isBreaking ? '<span class="fp-breaking">BREAKING</span>' : ''}
          ${s.convergence ? '<span class="fp-convergence">CONVERGENCE</span>' : ''}
        </div>
        ${s.primaryLink ? `<a href="${esc(s.primaryLink)}" target="_blank" rel="noopener" class="fp-story-link">Open source →</a>` : ''}
      </div>
    </div>`).join('')

  const lowerHTML = (edition.lowerPriority || []).map(item => `
    <div class="fp-lp-item">
      <span class="fp-lp-bullet">•</span>
      <span>${esc(item.headline)}</span>
      <span class="fp-lp-score">${item.score}</span>
    </div>`).join('')

  const boostHTML = edition.boostCount > 0 ? `
    <div class="fp-boost">⚡ ${edition.boostCount} boost${edition.boostCount > 1 ? 's' : ''} — ${edition.boostVolume || 0} WHL from holders</div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <title>Whaleroom // ${esc(name)} — Edition #${edition.edition}</title>
  <meta name="description" content="Autonomous AI-curated intelligence for ${esc(name)}. Edition #${edition.edition}.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0b; color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; }
    a { color: #e046bf; text-decoration: none; }
    .fp-container { max-width: 680px; margin: 0 auto; padding: 20px; }
    .fp-header { padding: 20px 0 16px; border-bottom: 1px solid #27272a; }
    .fp-channel { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; color: ${color}; }
    .fp-brand { font-size: 14px; color: #71717a; margin-top: 4px; }
    .fp-brand a { color: #71717a; }
    .fp-meta { display: flex; gap: 12px; margin-top: 6px; font-size: 11px; color: #71717a; }
    .fp-siren { margin: 16px 0; padding: 14px 16px; background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.25); border-radius: 8px; }
    .fp-siren-banner { display: flex; align-items: center; gap: 8px; }
    .fp-siren-dot { animation: pulse 1.5s ease-in-out infinite; }
    .fp-siren-text { font-size: 14px; font-weight: 600; color: #dc2626; }
    .fp-siren-channels { display: flex; gap: 10px; margin-top: 6px; font-size: 11px; color: #71717a; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    .fp-story { display: flex; padding: 16px 0; border-bottom: 1px solid #27272a; }
    .fp-story-rank { width: 32px; font-size: 22px; font-weight: 700; color: #52525b; flex-shrink: 0; text-align: center; }
    .fp-story-content { flex: 1; min-width: 0; }
    .fp-story-headline { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
    .fp-story-lede { font-size: 13px; color: #a1a1aa; line-height: 1.5; margin-bottom: 6px; }
    .fp-story-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; color: #71717a; }
    .fp-breaking { color: #dc2626; font-weight: 600; }
    .fp-convergence { color: #e046bf; font-weight: 600; }
    .fp-story-link { font-size: 12px; display: inline-block; margin-top: 4px; }
    .fp-lower { padding: 16px 0; border-top: 1px solid #27272a; }
    .fp-lp-divider { text-align: center; font-size: 11px; color: #52525b; margin-bottom: 10px; }
    .fp-lp-item { display: flex; align-items: center; gap: 8px; padding: 3px 0; font-size: 13px; color: #a1a1aa; }
    .fp-lp-bullet { color: #52525b; }
    .fp-lp-score { margin-left: auto; font-size: 11px; color: #52525b; }
    .fp-boost { padding: 12px 0; font-size: 12px; color: #e046bf; border-top: 1px solid #27272a; }
    .fp-cta { margin: 24px 0; padding: 28px; text-align: center; background: #141416; border-radius: 10px; border: 1px solid #27272a; }
    .fp-cta h3 { font-size: 16px; margin-bottom: 8px; }
    .fp-cta p { font-size: 13px; color: #a1a1aa; margin: 4px 0; }
    .fp-cta a { display: inline-block; margin-top: 12px; padding: 10px 24px; background: #e046bf; color: #fff; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .fp-footer { padding: 24px 0; text-align: center; font-size: 11px; color: #52525b; }
    .fp-footer a { color: #52525b; }
  </style>
</head>
<body>
  <div class="fp-container">
    <div class="fp-header">
      <div class="fp-channel">WHALEROOM // ${esc(name).toUpperCase()}</div>
      <div class="fp-brand"><a href="/">whaleroom</a> — encrypted intelligence terminal</div>
      <div class="fp-meta">
        <span>Edition #${edition.edition}</span>
        ${updated ? `<span>Updated ${esc(updated)}</span>` : ''}
        ${nextNeeded ? `<span>Next edition: ${nextNeeded} more articles</span>` : ''}
      </div>
    </div>

    ${sirenHTML}

    <div class="fp-stories">
      ${storiesHTML}
    </div>

    ${lowerHTML ? `<div class="fp-lower"><div class="fp-lp-divider">─── lower priority ───</div>${lowerHTML}</div>` : ''}

    ${boostHTML}

    <div class="fp-cta">
      <h3>Hold WHL or stake WHLC to unlock AI analysis</h3>
      <p>Headlines and source counts are public. AI intelligence briefs are token-gated.</p>
      <p>Hold 280 WHL or stake 170 WHLC to read full analyst briefs.</p>
      <a href="/">Enter Whaleroom →</a>
    </div>

    <div class="fp-footer">
      <p>Autonomous AI curation · P2P replicated · Token-gated intelligence</p>
      <p><a href="https://etherscan.io/token/0x2af72850c504ddd3c1876c66a914caee7ff8a46a">WHL</a> · <a href="https://etherscan.io/token/0x15e5d409001eaff5076af14cd7a4f3268f266445">WHLC</a></p>
    </div>
  </div>
</body>
</html>`
}

function renderMetaHTML (channelEditions, membershipPrice = null) {
  const allStories = []
  let latestTs = 0
  let topSiren = null

  for (const { channel, edition } of channelEditions) {
    if (edition.timestamp > latestTs) latestTs = edition.timestamp
    if (edition.siren?.active && !topSiren) topSiren = edition.siren
    for (const s of (edition.stories || [])) {
      allStories.push({ ...s, channel })
    }
  }

  allStories.sort((a, b) => b.score - a.score)
  const topSection = allStories.slice(0, 3)
  const remaining = allStories.slice(3, 40)
  const col1 = remaining.filter((_, i) => i % 3 === 0)
  const col2 = remaining.filter((_, i) => i % 3 === 1)
  const col3 = remaining.filter((_, i) => i % 3 === 2)
  const updated = latestTs ? new Date(latestTs).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''

  const sirenHTML = topSiren?.active ? `
    <div class="dr-siren">
      <span class="dr-siren-dot">🔴</span>
      <span class="dr-siren-text">CONVERGENCE: ${esc(topSiren.text)}</span>
    </div>` : ''

  const mainImgHTML = topSection[0]?.topImage ? `
    <img src="${esc(topSection[0].topImage)}" class="dr-main-img" onerror="this.style.display='none'" />` : ''

  function renderSourcePillsHTML (s) {
    if (!s.sourceList || s.sourceList.length <= 1) return ''
    const colors = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c']
    return '<span class="dr-source-pills">' + s.sourceList.slice(0, 5).map((src, i) => {
      const color = colors[i % colors.length]
      return `<a href="${esc(src.link)}" target="_blank" rel="noopener" class="dr-source-pill" style="border-color:${color}">${esc(src.name)}</a>`
    }).join('') + '</span>'
  }

  const topHeadlinesHTML = topSection.map((s, i) => {
    const cls = i === 0 ? 'dr-main-headline' : 'dr-top-headline'
    let h = s.headline || ''
    if (h.length > 66) h = h.slice(0, 63) + '...'
    return `<a href="${esc(s.primaryLink || '#')}" target="_blank" rel="noopener" class="${cls}">${esc(h.toUpperCase())}</a>${renderSourcePillsHTML(s)}`
  }).join('')

  function renderColHTML (items, colIdx) {
    return items.map((s, i) => {
      const srcTag = s.sources > 1 ? ` <i>...${s.sources} sources</i>` : ''
      const divider = (i === 2 || i === 5 || i === 8) ? '<hr>' : '<br><br>'
      const showImg = s.topImage && (i % 3 === (colIdx % 2 === 0 ? 0 : 1))
      const imgHTML = showImg ? `<img src="${esc(s.topImage)}" class="dr-col-img" onerror="this.style.display='none'" />` : ''
      return `${imgHTML}<a href="${esc(s.primaryLink || '#')}" target="_blank" rel="noopener">${esc(s.headline)}${srcTag}</a>${renderSourcePillsHTML(s)}${i < items.length - 1 ? divider : ''}`
    }).join('')
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
  <title>Whaleroom — Front Page</title>
  <meta name="description" content="Autonomous AI-curated intelligence across crypto, AI, biotech, privacy, and geopolitics.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; color: #000; font-family: Arial, Verdana, Helvetica, sans-serif; }
    a { color: #000; text-decoration: none; }
    a:hover { text-decoration: underline; color: #0000ee; }
    .dr-bar { border-bottom: 1px solid #ccc; padding: 8px 20px; }
    .dr-bar-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: flex-end; }
    .dr-home { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #000; text-decoration: none; padding: 6px 14px; border: 1px solid #000; border-radius: 4px; transition: background 0.15s, color 0.15s; }
    .dr-home:hover { text-decoration: none; color: #fff; background: #000; }
    .dr-main { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .dr-siren { text-align: center; padding: 12px; margin-bottom: 16px; border: 1px solid #dc2626; }
    .dr-siren-dot { animation: dr-pulse 1.5s ease-in-out infinite; margin-right: 8px; }
    .dr-siren-text { font-size: 15px; font-weight: 700; color: #dc2626; }
    @keyframes dr-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
    .dr-tophead { text-align: center; margin-bottom: 24px; }
    .dr-main-img { width: 280px; height: 280px; object-fit: cover; object-position: center; margin: 0 auto 12px; display: block; border: 1px solid #000; }
    .dr-main-headline { font-size: 28px; font-weight: 700; color: #000; text-decoration: none; line-height: 1.2; display: block; margin-bottom: 8px; }
    .dr-main-headline:hover { text-decoration: underline; color: #0000ee; }
    .dr-top-headline { font-size: 20px; font-weight: 700; color: #000; text-decoration: none; line-height: 1.25; display: block; margin-bottom: 6px; }
    .dr-top-headline:hover { text-decoration: underline; color: #0000ee; }
    .dr-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .dr-col { width: 33%; vertical-align: top; padding: 0 12px; font-size: 15px; line-height: 1.4; }
    .dr-col tt b { font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #000; }
    .dr-divider { width: 1px; background: #000; border-left: 1px solid #000; }
    .dr-col a { color: #000; text-decoration: underline; font-family: 'Courier New', Courier, monospace; font-weight: 700; font-size: 15px; }
    .dr-col a:hover { text-decoration: underline; color: #0000ee; }
    .dr-col i { color: #666; font-size: 13px; font-weight: 400; }
    .dr-source-pills { display: flex; flex-wrap: wrap; gap: 4px; margin: 4px 0 6px; }
    .dr-source-pill { display: inline-block; font-size: 10px; font-weight: 600; font-family: Arial, sans-serif; padding: 2px 8px; border: 1px solid #ccc; border-radius: 9999px; text-decoration: none; color: #333; background: #f8f8f8; line-height: 1.4; }
    .dr-source-pill:hover { background: #eee; text-decoration: none; }
    .dr-col hr { border: none; border-top: 1px solid #000; margin: 12px 0; }
    .dr-col-img { width: 100%; max-width: 200px; height: 200px; object-fit: cover; object-position: center; display: block; margin: 8px 0; border: 1px solid #ccc; }
    .dr-cta { margin: 32px 0 24px; }
    .dr-cta-inner { text-align: center; padding: 28px 24px; border: 1px solid #000; background: #fff; }
    .dr-cta-inner h3 { font-size: 18px; font-weight: 700; margin: 0 0 10px 0; color: #000; }
    .dr-cta-inner p { font-size: 13px; color: #333; margin: 4px 0; }
    .dr-cta-btn { display: inline-block; margin-top: 16px; padding: 10px 28px; background: #000; color: #fff; font-weight: 700; font-size: 13px; text-decoration: none; }
    .dr-cta-btn:hover { background: #333; color: #fff; }
    @keyframes wobble-x { 0%,100% { transform: translateX(0); } 15% { transform: translateX(-6px); } 30% { transform: translateX(4px); } 45% { transform: translateX(-3px); } 60% { transform: translateX(2px); } 75% { transform: translateX(-1px); } }
    .dr-cta-btn.wobble { animation: wobble-x 2.5s ease-in-out infinite; }
    .dr-cta-btn.wobble:hover { animation: none; }
    .dr-footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #000; display: flex; justify-content: space-between; font-size: 11px; color: #666; }
  </style>
</head>
<body>
  <div class="dr-bar">
    <div class="dr-bar-inner">
      <a href="/" class="dr-home">ENTER WHALEROOM →</a>
    </div>
  </div>
  <div class="dr-main">
    ${sirenHTML}
    <div class="dr-tophead">
      ${mainImgHTML}
      ${topHeadlinesHTML}
    </div>
    <table class="dr-table"><tbody><tr>
      <td class="dr-col"><tt><b>${renderColHTML(col1, 0)}</b></tt></td>
      <td class="dr-divider"></td>
      <td class="dr-col"><tt><b>${renderColHTML(col2, 1)}</b></tt></td>
      <td class="dr-divider"></td>
      <td class="dr-col"><tt><b>${renderColHTML(col3, 2)}</b></tt></td>
    </tr></tbody></table>
    <div class="dr-cta">
      <div class="dr-cta-inner">
        <h3>The conversation is inside.</h3>
        <p>Headlines are public. The discussion — theses, debates, analysis from members and all around the world — is token-gated.</p>
        <a href="/" class="dr-cta-btn wobble">Join community →</a>
      </div>
    </div>
    <div class="dr-footer">
      <span>Autonomous AI curation · P2P replicated · Token-gated intelligence</span>
      ${updated ? `<span>Updated ${esc(updated)}</span>` : ''}
    </div>
  </div>
</body>
</html>`
}

function esc (s) {
  if (!s) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function handleNewsHTML (req, res, url, ctx) {
  const channel = url.pathname.split('/').pop()

  // Per-channel pages redirect to the meta homepage
  if (channel && channel !== 'news') {
    res.writeHead(302, { 'Location': '/news' })
    res.end()
    return
  }

  return handleMetaNewsHTML(req, res, url, ctx)
}

async function handleMetaNewsHTML (req, res, url, ctx) {
  try {
    if (!ctx.base || !ctx.base.view) {
      res.writeHead(503, { 'Content-Type': 'text/html' })
      res.end('<h1>Starting up...</h1>')
      return
    }
    await ctx.base.update()
    const channelEditions = []

    for await (const entry of ctx.base.view.createReadStream({
      gte: 'frontpage-latest:',
      lt: 'frontpage-latest:\xff'
    })) {
      const channel = entry.key.replace('frontpage-latest:', '')
      const { edition } = JSON.parse(entry.value)
      const editionKey = `frontpage:${channel}:${edition}`
      const editionEntry = await ctx.base.view.get(editionKey)
      if (editionEntry) {
        channelEditions.push({ channel, edition: JSON.parse(editionEntry.value) })
      }
    }

    if (channelEditions.length === 0) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' })
      res.end(renderMetaEmptyHTML())
      return
    }

    // Fetch live WHL price for membership cost estimate
    let membershipPrice = null
    try {
      const ethRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', { signal: AbortSignal.timeout(5000) })
      const ethData = await ethRes.json()
      const eth = ethData.ethereum.usd
      const POOL = '0x52A500AF09450AA8dEEF61f048313Cf57FCb30b6'
      const rpcBody = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: POOL, data: '0x0902f1ac' }, 'latest'] })
      const rpcRes = await fetch('/api/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: rpcBody, signal: AbortSignal.timeout(5000) })
      // Can't call our own /api/rpc from server-side, use direct RPC
      const RPC_URL = process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo'
      const directRpcRes = await fetch(RPC_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: rpcBody, signal: AbortSignal.timeout(5000) })
      const rpcResult = await directRpcRes.json()
      if (rpcResult.result && eth) {
        const reserveWHL = BigInt('0x' + rpcResult.result.slice(2, 66))
        const reserveWETH = BigInt('0x' + rpcResult.result.slice(66, 130))
        const whlUsd = Number(reserveWETH) / Number(reserveWHL) * eth
        membershipPrice = whlUsd * 170
      }
    } catch {}

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' })
    res.end(renderMetaHTML(channelEditions, membershipPrice))
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html' })
    res.end(`<h1>Error</h1><p>${esc(err.message)}</p>`)
  }
}

function renderEmptyHTML (channel) {
  const name = FEED_NAMES[channel] || channel
  const color = FEED_COLORS[channel] || '#e046bf'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Whaleroom // ${esc(name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0b; color: #fafafa; font-family: -apple-system, sans-serif; }
    .fp-container { max-width: 680px; margin: 0 auto; padding: 40px 20px; text-align: center; }
    .fp-channel { font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 16px; }
    .fp-empty { color: #71717a; font-size: 14px; }
    .fp-hint { color: #52525b; font-size: 12px; margin-top: 8px; }
    .fp-channels { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 24px 0; }
    .fp-channels a { padding: 6px 14px; background: #141416; border: 1px solid #27272a; border-radius: 6px; font-size: 13px; color: #71717a; text-decoration: none; }
    .fp-enter { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #e046bf; color: #fff; border-radius: 6px; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <div class="fp-container">
    <div class="fp-channel">WHALEROOM // ${esc(name).toUpperCase()}</div>
    <p class="fp-empty">No front page edition yet for this channel.</p>
    <p class="fp-hint">Front pages appear when enough news accumulates for the AI agent to curate.</p>
    <div class="fp-channels">
      <a href="/news">All</a>
      ${Object.entries(FEED_NAMES).map(([slug, n]) => `<a href="/news/${slug}">${esc(n)}</a>`).join('')}
    </div>
    <a href="/" class="fp-enter">Enter Whaleroom →</a>
  </div>
</body>
</html>`
}

function renderMetaEmptyHTML () {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Whaleroom — Front Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0b; color: #fafafa; font-family: -apple-system, sans-serif; }
    .fp-container { max-width: 680px; margin: 0 auto; padding: 40px 20px; text-align: center; }
    .fp-channel { font-size: 22px; font-weight: 700; color: #e046bf; margin-bottom: 16px; }
    .fp-empty { color: #71717a; font-size: 14px; }
    .fp-hint { color: #52525b; font-size: 12px; margin-top: 8px; }
    .fp-enter { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #e046bf; color: #fff; border-radius: 6px; font-weight: 600; text-decoration: none; }
  </style>
</head>
<body>
  <div class="fp-container">
    <div class="fp-channel">WHALEROOM</div>
    <p class="fp-empty">No front page editions yet.</p>
    <p class="fp-hint">Front pages appear when enough news accumulates for the AI agents to curate.</p>
    <a href="/" class="fp-enter">Enter Whaleroom →</a>
  </div>
</body>
</html>`
}

export const newsHTMLRoutes = [
  { method: 'GET', path: '/news', handler: handleNewsHTML, skipReady: false },
  { method: 'GET', prefix: '/news/', handler: handleNewsHTML, skipReady: false }
]
