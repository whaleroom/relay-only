import { html, useState, useEffect, useRef } from '../deps.js'
import {
  feedPosts, pendingPosts, hasMore, loadingMore,
  feedLoading, activeFeed, myAuthor, tokenGateVerified, tokenGateEnabled, feedKeys,
  showUpgradeModal
} from '../state.js'
import { fetchFeed, fetchPulseNews, fetchSerpNews, fetchPolymarketMarkets, fetchFrontpage } from '../api.js'
import { PostCard } from './Post.js'
import { Compose } from './Compose.js'
import { MetaFrontPage } from './MetaFrontPage.js'
import { FEED_META, timeAgo, fullDate } from '../utils.js'
import { isEncrypted, decryptText } from '../crypto.js'

function Skeleton () {
  return html`
    ${[0,1,2,3].map(i => html`
      <div key=${i} class="skeleton-post">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    `)}
  `
}

function EmptyState ({ feed, locked }) {
  if (locked) {
    const meta = FEED_META[feed]
    return html`
      <div class="empty">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="5" y="11" width="14" height="10" rx="2"/>
            <path d="M8 11V7a4 4 0 018 0v4"/>
          </svg>
        </div>
        <h2>Encrypted Channel</h2>
        <p>Hold 280 WHL or 170 WHLC to decrypt posts in ${meta ? meta.name : 'this feed'}. Verify your holdings using the shield icon in the right sidebar.</p>
      </div>
    `
  }
  return html`
    <div class="empty">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24">
          <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </div>
      <h2>Start the conversation</h2>
      <p>This feed is empty. Write something and it will replicate across the swarm.</p>
    </div>
  `
}

function NewsTicker ({ item }) {
  const [expanded, setExpanded] = useState(false)
  const [enriching, setEnriching] = useState(false)
  const [entry, setEntry] = useState(null)
  const [enrichedEntry, setEnrichedEntry] = useState(null)
  const [decryptedContent, setDecryptedContent] = useState(null)
  const [decryptedFields, setDecryptedFields] = useState(null)
  const published = item.published_utc ? new Date(item.published_utc) : null
  const currentEntry = enrichedEntry || entry
  const isEnriched = item.enrich_state === 'done' || (currentEntry && currentEntry.article)
  const topImage = currentEntry?.article?.top_image || item.topImage || null
  const articleBody = currentEntry?.article?.body || null
  const isSerp = item.source === 'serp'
  const hasEncrypted = isSerp && item.encryptedText && isEncrypted(item.encryptedText)
  const isHolder = tokenGateVerified.value && feedKeys.value
  const isLockedSerp = isSerp && hasEncrypted && !isHolder

  // Decrypt all encrypted fields (title, sourceName, sourceUrl, content) for holders
  useEffect(() => {
    if (!isSerp || !isHolder) return
    if (decryptedFields) return
    const keys = feedKeys.value
    if (!keys || !keys['news']) return
    let active = true
    const fields = {}
    const decrypts = []
    if (isEncrypted(item.title)) {
      decrypts.push(decryptText(item.title, keys['news']).then(r => { fields.title = r }).catch(() => {}))
    }
    if (item.encryptedSourceName && isEncrypted(item.encryptedSourceName)) {
      decrypts.push(decryptText(item.encryptedSourceName, keys['news']).then(r => { fields.sourceName = r }).catch(() => {}))
    }
    if (item.encryptedSourceUrl && isEncrypted(item.encryptedSourceUrl)) {
      decrypts.push(decryptText(item.encryptedSourceUrl, keys['news']).then(r => { fields.sourceUrl = r }).catch(() => {}))
    }
    if (item.encryptedText && isEncrypted(item.encryptedText)) {
      decrypts.push(decryptText(item.encryptedText, keys['news']).then(r => { fields.content = r }).catch(() => {}))
    }
    Promise.all(decrypts).then(() => { if (active) setDecryptedFields(fields) })
    return () => { active = false }
  }, [isSerp, isHolder, item.title, item.encryptedSourceName, item.encryptedSourceUrl, item.encryptedText, feedKeys.value])

  // Use decrypted fields if available, otherwise fall back to plaintext or encrypted
  const displayTitle = isSerp
    ? (decryptedFields?.title || (isLockedSerp ? '' : item.title))
    : item.title
  const displaySourceName = isSerp
    ? (decryptedFields?.sourceName || (isLockedSerp ? '' : item.sourceName))
    : (item.sourceName || item.domain)
  const displaySourceUrl = isSerp
    ? (decryptedFields?.sourceUrl || (isLockedSerp ? null : item.link))
    : item.link
  const displayContent = isSerp
    ? (decryptedFields?.content || (isHolder ? null : null))
    : null

  // Decrypt content when expanded (for holders)
  useEffect(() => {
    if (!expanded || !hasEncrypted || !isHolder) return
    if (decryptedContent || decryptedFields?.content) return
    const keys = feedKeys.value
    if (!keys || !keys['news']) return
    let active = true
    if (!decryptedFields?.content) {
      decryptText(item.encryptedText, keys['news']).then(result => {
        if (active) setDecryptedContent(result || item.encryptedText)
      }).catch(() => { if (active) setDecryptedContent(item.encryptedText) })
    }
    return () => { active = false }
  }, [expanded, hasEncrypted, isHolder, decryptedContent, decryptedFields, item.encryptedText, feedKeys.value])

  async function expand () {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    // Only fetch from Pulse for non-SerpAPI articles
    if (!isSerp && !entry) {
      setEnriching(true)
      try {
        const res = await fetch(`/api/pulse/entry?uid=${item.uid}`)
        if (res.ok) setEntry(await res.json())
      } catch {}
      setEnriching(false)
    }
  }

  async function doEnrich () {
    setEnriching(true)
    try {
      const res = await fetch(`/api/pulse/enrich?uid=${item.uid}`, { method: 'POST' })
      if (res.ok) setEnrichedEntry(await res.json())
    } catch {}
    setEnriching(false)
  }

  const showEnrichBtn = !isEnriched && !enriching && !isSerp
  const holderContent = decryptedFields?.content || decryptedContent

  return html`
    <div class="news-ticker${expanded ? ' expanded' : ''}${isSerp ? ' serp-article' : ''}${isLockedSerp ? ' serp-locked' : ''}" onClick=${expand}>
      <div class="news-ticker-row">
        <span class="news-ticker-time">${published ? timeAgo(published.getTime()) : ''}</span>
        ${item.channel && FEED_META[item.channel] && activeFeed.value === 'all' && html`<span class="news-ticker-channel" style=${`color:${FEED_META[item.channel].color}`}>${FEED_META[item.channel].name}</span>`}
        <span class="news-ticker-title${isLockedSerp ? ' title-encrypted' : ''}">${isLockedSerp ? '░░░░░░░░░░░░░░░░░░░░░░' : displayTitle}</span>
        ${isSerp && html`<span class="news-ticker-serp-badge">🔒</span>`}
        ${isEnriched && html`<span class="news-ticker-dot"></span>`}
      </div>
      ${expanded && html`
        <div class="news-ticker-detail" onClick=${(e) => e.stopPropagation()}>
          ${topImage && !isLockedSerp && html`<img src=${topImage} alt="" class="news-ticker-image" onError=${(e) => { e.target.style.display = 'none' }} />`}
          <div class="news-ticker-meta">
            <span class=${isLockedSerp ? 'meta-encrypted' : ''}>${isLockedSerp ? '░░░░░░░░░░' : displaySourceName}</span>
            ${published && html`<span>${fullDate(published.getTime())}</span>`}
          </div>
          ${hasEncrypted
            ? (isHolder && holderContent
              ? html`<div class="news-ticker-summary">${holderContent}</div>`
              : isHolder
                ? html`<div class="news-ticker-loading"><div class="spinner" style="width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:club-spin 0.8s linear infinite"></div><span>Decrypting...</span></div>`
                : html`<div class="news-ticker-locked" onClick=${(e) => { e.stopPropagation(); showUpgradeModal.value++ }}><div class="news-ticker-lock-prompt"><span class="lock-icon">🔒</span><span>Sign up for membership to get full access</span></div></div>`)
            : enriching ? html`
            <div class="news-ticker-loading">
              <div class="spinner" style="width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:club-spin 0.8s linear infinite"></div>
              <span>Extracting article...</span>
            </div>
          ` : articleBody ? html`
            <div class="news-ticker-summary">${articleBody.slice(0, 1200)}${articleBody.length > 1200 ? '...' : ''}</div>
          ` : item.summary ? html`
            <div class="news-ticker-summary">${item.summary}</div>
          ` : showEnrichBtn ? html`
            <div class="news-ticker-summary news-ticker-hint">Click Enrich to extract the full article.</div>
          ` : html`<div class="news-ticker-summary">No content available.</div>`}
          <div class="news-ticker-actions">
            ${showEnrichBtn ? html`<button class="news-ticker-enrich-btn" onClick=${doEnrich}>Enrich</button>` : null}
            ${isLockedSerp
              ? html`<span class="news-ticker-link disabled">Open source</span>`
              : html`<a href=${displaySourceUrl} target="_blank" rel="noopener" class="news-ticker-link">Open source</a>`}
          </div>
        </div>
      `}
    </div>
  `
}

function MarketTicker ({ event }) {
  const [expanded, setExpanded] = useState(false)
  const markets = event.markets || []
  const vol24 = event.volume24hr ? parseFloat(event.volume24hr) : 0
  const endDate = event.endDate ? new Date(event.endDate) : null
  const topMarket = markets[0] || {}
  const prices = topMarket.outcomePrices ? JSON.parse(topMarket.outcomePrices) : []
  const yesPrice = prices[0] ? parseFloat(prices[0]) : null
  const tags = (event.tags || []).filter(t => !t.forceHide && t.label !== 'Hide From New').slice(0, 3)

  function fmtVol (v) {
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K'
    return '$' + v.toFixed(0)
  }

  return html`
    <div class="news-ticker${expanded ? ' expanded' : ''}" onClick=${() => setExpanded(!expanded)}>
      <div class="news-ticker-row">
        ${yesPrice != null ? html`<span class="market-ticker-price">${(yesPrice * 100).toFixed(0)}%</span>` : html`<span class="market-ticker-price">—</span>`}
        <span class="news-ticker-title">${event.title}</span>
        <span class="market-ticker-vol">${fmtVol(vol24)}</span>
      </div>
      ${expanded && html`
        <div class="news-ticker-detail" onClick=${(e) => e.stopPropagation()}>
          <div class="news-ticker-meta">
            ${tags.map(t => html`<span class="news-ticker-category">${t.label}</span>`)}
            ${vol24 > 0 && html`<span>24h Vol: ${fmtVol(vol24)}</span>`}
            ${endDate && html`<span>·</span>`}
            ${endDate && html`<span>Ends ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>`}
            <span>·</span>
            <span>${markets.length} market${markets.length > 1 ? 's' : ''}</span>
          </div>
          ${event.description && html`<div class="news-ticker-summary">${event.description.slice(0, 400)}</div>`}
          ${markets.length > 1 && html`
            <div class="market-outcomes">
              ${markets.slice(0, 10).map(m => {
                const mp = m.outcomePrices ? JSON.parse(m.outcomePrices) : []
                const yp = mp[0] ? parseFloat(mp[0]) : null
                return html`
                  <div class="market-outcome-row" key=${m.id}>
                    <span class="market-outcome-label">${m.question || m.groupItemTitle || ''}</span>
                    <span class="market-outcome-price">${yp != null ? (yp * 100).toFixed(0) + '%' : '—'}</span>
                  </div>
                `
              })}
            </div>
          `}
          <a href=${`https://polymarket.com/event/${event.slug}`} target="_blank" rel="noopener" class="news-ticker-link">Trade on Polymarket →</a>
        </div>
      `}
    </div>
  `
}

function MarketFilters ({ activeTag, setTag, tags }) {
  return html`
    <div class="market-filters">
      <button class="market-filter${!activeTag ? ' active' : ''}" onClick=${() => setTag('')}>All</button>
      ${tags.map(t => html`
        <button key=${t} class="market-filter${activeTag === t ? ' active' : ''}" onClick=${() => setTag(t)}>${t}</button>
      `)}
    </div>
  `
}

function NewsSkeleton () {
  return html`
    ${[0,1,2,3,4,5,6,7].map(i => html`
      <div key=${i} class="news-ticker">
        <div class="news-ticker-row">
          <span class="skeleton-line" style="width:30px;display:inline-block"></span>
          <span class="skeleton-line" style="flex:1;display:inline-block"></span>
        </div>
      </div>
    `)}
  `
}

const SOURCE_GROUPS = {
  crypto: [
    { label: 'All Sources', domains: '' },
    { label: 'Exchanges', domains: 'blog.kraken.com,www.binance.com,blog.bitfinex.com,www.okx.com,blog.bybit.com,blog.bitstamp.net,www.kucoin.com,www.gate.io,crypto.com,www.gemini.com,blog.coinbase.com' },
    { label: 'Core Projects', domains: 'blog.ethereum.org,bitcoincore.org,medium.com/lightninglabs,blog.chain.link,uniswap.org,medium.com/compound-finance,blog.lido.fi' },
    { label: 'L2s', domains: 'optimism.mirror.xyz,medium.com/offchainlabs,medium.com/starkware,medium.com/matterlabs,blog.celestia.org,blog.eigenlayer.xyz' },
    { label: 'Research', domains: 'www.paradigm.xyz,a16zcrypto.com,medium.com/electric-capital,messari.io,members.delphidigital.io,www.theblock.co,insights.glassnode.com,coinmetrics.substack.com,www.galaxy.com' },
    { label: 'News Outlets', domains: 'www.coindesk.com,cointelegraph.com,decrypt.co,www.theblock.co,bitcoinmagazine.com,cryptonews.com,cryptoslate.com,beincrypto.com,u.today,news.bitcoin.com' },
  ],
  biotech: [
    { label: 'All Sources', domains: '' },
    { label: 'Biopharma', domains: 'www.fiercebiotech.com,www.biopharmadive.com,endpts.com,www.statnews.com,www.labiotech.eu,www.biocentury.com,bioengineer.org,www.biospace.com,www.fiercepharma.com,www.biopharminternational.com' },
    { label: 'Synthetic Bio', domains: 'www.genengnews.com,www.technologyreview.com,www.synbiobeta.com,www.genomeweb.com,blog.latch.bio,decodingbio.substack.com,geneticliteracyproject.org,medicalxpress.com,scitechdaily.com,www.news-medical.net' },
    { label: 'MedTech', domains: 'www.medtechdive.com,www.medtechintelligence.com,www.greenlight.guru,www.medicaldesignandoutsourcing.com,www.fiercebiotech.com,insights.citeline.com,namsa.com,www.rimsys.io,www.cytivalifesciences.com,www.biotechniques.com,www.medtecheurope.org,med-techinsights.com' },
    { label: 'VC & Legal', domains: 'lifescivc.com,www.baybridgebio.com,scalingbiotech.com,sarahconstantin.substack.com,blogs.duanemorris.com,lifesciences.mofo.com,lifescivoice.com,www.lifesciencesperspectives.com,www.biopharmconsortium.com,pharmaceutical-technology.com,allenovery.com,www.freyrsolutions.com,www.lifescienceleader.com,xtalks.com' },
    { label: 'Academic & Longevity', domains: 'www.the-scientist.com,www.nature.com,stanfordbiotechgroup.com,biotech.ucdavis.edu,labcentral.org,sdbn.org,www.ncbiotech.org,www.biotech.ca,lifesciencesontario.ca,www.marsdd.com,www.signalsblog.ca,indiabioscience.org,www.nordicbiosite.com,lifespan.io,www.fightaging.org,longevity.technology,www.sens.org,www.amgenbiotechexperience.com,www.adaptivebiotech.com' },
  ]
}

export function Feed ({ onAuthorClick, onAvatarClick }) {
  const sentinelRef = useRef(null)
  const feed = activeFeed.value
  const posts = feedPosts.value
  const loading = feedLoading.value
  const pending = pendingPosts.value
  const [subTab, setSubTab] = useState('news')
  const [newsItems, setNewsItems] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [pendingNews, setPendingNews] = useState(0)
  const [markets, setMarkets] = useState([])
  const [marketsLoading, setMarketsLoading] = useState(false)
  const [marketTag, setMarketTag] = useState('')
  const [marketTags, setMarketTags] = useState([])
  const [sourceGroup, setSourceGroup] = useState(0)

  const hasNewsTab = (feed !== 'frontpage' && feed !== 'following') && (FEED_META[feed] || feed === 'all')
  const hasMarketsTab = feed === 'predictions'
  const sourceGroups = SOURCE_GROUPS[feed] || null

  // Reset to news tab when feed changes
  useEffect(() => {
    if (hasNewsTab) setSubTab('news')
  }, [feed, hasNewsTab])

  // Load Polymarket markets when markets tab is selected
  useEffect(() => {
    if (subTab !== 'markets' || !hasMarketsTab) return
    let cancelled = false
    setMarketsLoading(true)
    setMarkets([])
    fetchPolymarketMarkets(50, marketTag).then(data => {
      if (cancelled) return
      setMarkets(data)
      if (!marketTag && data.length > 0) {
        const tagSet = new Set()
        data.forEach(e => {
          (e.tags || []).forEach(t => {
            if (!t.forceHide && t.label && t.label !== 'Hide From New') tagSet.add(t.label)
          })
        })
        setMarketTags(Array.from(tagSet).slice(0, 12))
      }
    }).catch(() => {
      if (!cancelled) setMarkets([])
    }).finally(() => {
      if (!cancelled) setMarketsLoading(false)
    })
    return () => { cancelled = true }
  }, [subTab, feed, marketTag])

  // Load feed when activeFeed changes
  useEffect(() => {
    let cancelled = false
    async function load () {
      feedLoading.value = true
      feedPosts.value = []
      try {
        const data = await fetchFeed({ feed })
        if (cancelled) return
        feedPosts.value = data
        hasMore.value = data.length >= 50
      } catch (err) {
        if (cancelled) return
        if (err.message === 'starting') { setTimeout(load, 2000); return }
        feedPosts.value = []
        hasMore.value = false
      }
      feedLoading.value = false
    }
    load()
    return () => { cancelled = true }
  }, [feed])

  // News: cache + auto-refresh system
  useEffect(() => {
    if (subTab !== 'news' || !hasNewsTab) return
    let cancelled = false
    const CACHE_KEY = `pulse_news_v2_${feed}_${sourceGroup}`
    const POLL_INTERVAL = 120000

    function loadCache () {
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        return JSON.parse(raw)
      } catch { return null }
    }

    function saveCache (items) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items: items.slice(0, 300) }))
      } catch {}
    }

    function sortByDate (items) {
      return items.sort((a, b) => {
        const da = a.published_utc ? new Date(a.published_utc).getTime() : 0
        const db = b.published_utc ? new Date(b.published_utc).getTime() : 0
        return db - da
      })
    }

    function mergeDedup (existing, fresh) {
      const seen = new Set(existing.map(i => i.uid))
      const newOnes = fresh.filter(i => !seen.has(i.uid))
      return { items: sortByDate([...newOnes, ...existing]), newCount: newOnes.length }
    }

    // Instant load from cache
    const cached = loadCache()
    if (cached?.items?.length > 0) {
      setNewsItems(cached.items)
      setNewsLoading(false)
    } else {
      setNewsLoading(true)
      setNewsItems([])
    }

    async function fetchFresh () {
      try {
        const domains = sourceGroups ? sourceGroups[sourceGroup]?.domains : ''
        const serpChannel = feed === 'all' ? 'all' : feed

        // Fetch from both Pulse RSS and encrypted SerpAPI feed in parallel
        const [pulseData, serpData] = await Promise.all([
          fetchPulseNews(feed, 500, domains),
          fetchSerpNews(serpChannel, 50),
        ])
        if (cancelled) return

        const pulseResults = sortByDate(pulseData.results || [])
        const serpResults = sortByDate(serpData.results || [])

        // Merge both sources, dedup by URL
        const seenUrls = new Set()
        const fresh = []
        for (const item of [...pulseResults, ...serpResults]) {
          const url = item.link || item.sourceUrl || ''
          if (url && seenUrls.has(url)) continue
          if (url) seenUrls.add(url)
          // Normalize SerpAPI articles to match Pulse shape
          if (item.sourceUrl && !item.link) {
            // SerpAPI article — title, sourceName, sourceUrl are encrypted
            item.encryptedTitle = item.title
            item.encryptedSourceName = item.sourceName
            item.encryptedSourceUrl = item.sourceUrl
            // Don't set item.link to the encrypted URL — it would be useless
            // Holders decrypt displaySourceUrl from encryptedSourceUrl
            item.link = null
            item.uid = item.uid || `serp:${item.domain}:${item.timestamp}`
            item.source = 'serp'
            item.encryptedText = item.text
            item.feed = 'news'
            item.summary = ''
          }
          fresh.push(item)
        }

        if (fresh.length === 0) { setNewsLoading(false); return }

        setNewsItems(prev => {
          const result = mergeDedup(prev, fresh)
          saveCache(result.items)
          if (result.newCount > 0 && prev.length > 0) {
            const scrollTop = window.scrollY
            if (scrollTop < 200) {
              return result.items
            } else {
              setPendingNews(result.newCount)
              return prev
            }
          }
          return result.items
        })
      } catch {}
      setNewsLoading(false)
    }

    fetchFresh()
    const pollId = setInterval(fetchFresh, POLL_INTERVAL)

    return () => {
      cancelled = true
      clearInterval(pollId)
    }
  }, [subTab, feed, sourceGroup])

  function showPendingNews () {
    const cacheKey = `pulse_news_v2_${feed}_${sourceGroup}`
    try {
      const raw = localStorage.getItem(cacheKey)
      if (raw) {
        const cached = JSON.parse(raw)
        setNewsItems(cached.items)
      }
    } catch {}
    setPendingNews(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Infinite scroll (feed tab only)
  useEffect(() => {
    if (!sentinelRef.current || subTab !== 'feed') return
    const observer = new IntersectionObserver(async (entries) => {
      if (!entries[0].isIntersecting) return
      if (loadingMore.value || !hasMore.value || feedPosts.value.length === 0) return
      if (feedLoading.value) return
      loadingMore.value = true
      const all = feedPosts.value
      const last = all[all.length - 1]
      const before = `${last.timestamp}:${last.author}`
      try {
        const more = await fetchFeed({ feed: activeFeed.value, limit: 20, before })
        if (more.length === 0) { hasMore.value = false }
        else {
          feedPosts.value = [...feedPosts.value, ...more]
          hasMore.value = more.length >= 20
        }
      } catch { /* ignore */ }
      loadingMore.value = false
    }, { rootMargin: '400px' })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [feed, subTab])

  function showPending () {
    feedPosts.value = [...pending, ...feedPosts.value]
    pendingPosts.value = []
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return html`
    <div>
      ${feed === 'frontpage' && html`<${MetaFrontPage} />`}

      ${feed !== 'frontpage' && html`
        ${hasNewsTab && html`
          <div class="feed-subtabs">
            <button class="feed-subtab${subTab === 'news' ? ' active' : ''}" onClick=${() => setSubTab('news')}>News</button>
            ${hasMarketsTab && html`<button class="feed-subtab${subTab === 'markets' ? ' active' : ''}" onClick=${() => setSubTab('markets')}>Markets</button>`}
            <button class="feed-subtab${subTab === 'feed' ? ' active' : ''}" onClick=${() => setSubTab('feed')}>${feed === 'all' ? 'Discussion' : 'Feed'}</button>
          </div>
        `}

        ${subTab === 'markets' && hasMarketsTab
          ? html`
          <${MarketFilters} activeTag=${marketTag} setTag=${setMarketTag} tags=${marketTags} />
          ${marketsLoading
            ? html`<${NewsSkeleton} />`
            : markets.length === 0
              ? html`<div class="empty"><p>No active markets found.</p></div>`
              : markets.map(m => html`<${MarketTicker} key=${m.id} event=${m} />`)
          }
        `
        : subTab === 'news' && hasNewsTab
        ? html`
          ${pendingNews > 0 && html`
            <div class="new-posts-bar" style="display:block;cursor:pointer"
              onClick=${showPendingNews}>
              ${pendingNews} new article${pendingNews > 1 ? 's' : ''}
            </div>
          `}
          ${newsLoading
            ? html`<${NewsSkeleton} />`
            : newsItems.length === 0
              ? html`<div class="empty"><p>No news available for this channel right now.</p></div>`
              : newsItems.map(item => html`<${NewsTicker} key=${item.uid} item=${item} />`)
          }
        `
        : html`
          ${(!hasNewsTab || subTab === 'feed') && html`<${Compose} />`}
          ${pending.length > 0 && html`
            <div class="new-posts-bar" style="display:block;cursor:pointer"
              onClick=${showPending}>
              Show ${pending.length} new post${pending.length > 1 ? 's' : ''}
            </div>
          `}
          ${loading
            ? html`<${Skeleton} />`
            : posts.length === 0
              ? html`<${EmptyState} feed=${feed} locked=${(tokenGateEnabled.value && !tokenGateVerified.value && feed !== 'all' && feed !== 'following' && feed !== 'frontpage') || (!feedKeys.value && feed !== 'all' && feed !== 'following' && feed !== 'frontpage')} />`
              : posts.map(p => html`
                  <${PostCard} key=${p.timestamp + ':' + p.author}
                    post=${p} onAuthorClick=${onAuthorClick}
                    onAvatarClick=${onAvatarClick} />
                `)
          }
          <div ref=${sentinelRef} class="scroll-sentinel" />
        `}
      `}
    </div>
  `
}
