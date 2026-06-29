import { html, useState, useEffect, useRef } from '../deps.js'
import { fetchFrontpageList, fetchFrontpage } from '../api.js'
import { tokenGateVerified, feedKeys, frontpageRefreshTrigger, switchFeed, showUpgradeModal, showAuthGate } from '../state.js'
import { isAuthenticated } from '../state.js'
import { FEED_META, timeAgo } from '../utils.js'

function MetaSkeleton () {
  return html`
    <div class="whaleroom-skeleton">
      ${[0,1,2,3,4,5].map(i => html`
        <div key=${i} class="whaleroom-skel-row">
          <div class="whaleroom-skel-chan"></div>
          <div class="whaleroom-skel-head"></div>
          <div class="whaleroom-skel-lede"></div>
        </div>
      `)}
    </div>
  `
}

export function MetaFrontPage () {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [siren, setSiren] = useState(null)
  const [updatedTs, setUpdatedTs] = useState(0)

  const isHolder = tokenGateVerified.value && feedKeys.value

  useEffect(() => {
    document.body.classList.add('frontpage-active')
    return () => { document.body.classList.remove('frontpage-active') }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load () {
      setLoading(true)
      try {
        const list = await fetchFrontpageList()
        if (cancelled || !list.channels?.length) { setLoading(false); return }
        const editions = await Promise.all(
          list.channels.map(async ({ channel }) => {
            try { return await fetchFrontpage(channel) }
            catch { return null }
          })
        )
        if (cancelled) return
        const allStories = []
        let latestTs = 0
        let topSiren = null
        for (const ed of editions) {
          if (!ed || !ed.stories) continue
          if (ed.timestamp > latestTs) latestTs = ed.timestamp
          if (ed.siren?.active && !topSiren) topSiren = ed.siren
          for (const story of ed.stories) allStories.push({ ...story, channel: ed.channel })
        }
        allStories.sort((a, b) => b.score - a.score)
        setStories(allStories.slice(0, 40))
        setSiren(topSiren)
        setUpdatedTs(latestTs)
      } catch (err) {
        console.error('meta-frontpage:', err.message)
      }
      setLoading(false)
    }
    load()
    const pollId = setInterval(load, 120000)
    return () => { cancelled = true; clearInterval(pollId) }
  }, [])

  useEffect(() => {
    if (frontpageRefreshTrigger.value === 0) return
    let cancelled = false
    async function reload () {
      try {
        const list = await fetchFrontpageList()
        if (cancelled || !list.channels?.length) return
        const editions = await Promise.all(
          list.channels.map(async ({ channel }) => {
            try { return await fetchFrontpage(channel) }
            catch { return null }
          })
        )
        if (cancelled) return
        const allStories = []
        let latestTs = 0
        let topSiren = null
        for (const ed of editions) {
          if (!ed || !ed.stories) continue
          if (ed.timestamp > latestTs) latestTs = ed.timestamp
          if (ed.siren?.active && !topSiren) topSiren = ed.siren
          for (const story of ed.stories) allStories.push({ ...story, channel: ed.channel })
        }
        allStories.sort((a, b) => b.score - a.score)
        setStories(allStories.slice(0, 40))
        setSiren(topSiren)
        setUpdatedTs(latestTs)
      } catch {}
    }
    reload()
    return () => { cancelled = true }
  }, [frontpageRefreshTrigger.value])

  if (loading) return html`<${MetaSkeleton} />`

  if (stories.length === 0) {
    return html`
      <div class="whaleroom-empty">
        <div class="whaleroom-logo">W</div>
        <p class="whaleroom-empty-msg">No front page editions yet.</p>
        <p class="whaleroom-empty-hint">Front pages appear when enough news accumulates for the AI agents to curate.</p>
      </div>
    `
  }

  // Section 1: top 3 headlines (centered, with top story image)
  const topSection = stories.slice(0, 3)
  // Section 2: remaining stories split into 3 columns
  const remaining = stories.slice(3)
  const col1 = remaining.filter((_, i) => i % 3 === 0)
  const col2 = remaining.filter((_, i) => i % 3 === 1)
  const col3 = remaining.filter((_, i) => i % 3 === 2)
  const updated = updatedTs ? timeAgo(updatedTs) : ''

  function renderCol (items, colIdx) {
    return items.map((s, i) => {
      const meta = FEED_META[s.channel]
      const showImage = s.topImage && (i % 3 === (colIdx % 2 === 0 ? 0 : 1))
      return html`
        ${showImage && html`<img src=${s.topImage} class="whaleroom-col-img" onError=${(e) => { e.target.style.display = 'none' }} />`}
        <a href=${s.primaryLink || '#'} target="_blank" rel="noopener" class="whaleroom-link">
          ${s.headline}${s.sources > 1 ? html`<span class="whaleroom-src">...${s.sources} sources</span>` : ''}
        </a>
        ${renderSourcePills(s)}
        ${i < items.length - 1 && (i === 2 || i === 5 || i === 8) ? html`<hr/>` : html`<br/><br/>`}
      `
    })
  }

  function topHeadlineText (s) {
    let h = s.headline || ''
    if (h.length > 66) h = h.slice(0, 63) + '...'
    return h.toUpperCase()
  }

  function renderSourcePills (s) {
    if (!s.sourceList || s.sourceList.length <= 1) return null
    return html`
      <span class="whaleroom-source-pills">
        ${s.sourceList.slice(0, 5).map((src, i) => {
          const colors = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#ea580c']
          const color = colors[i % colors.length]
          return html`<a href=${src.link} target="_blank" rel="noopener" class="whaleroom-source-pill" style=${`border-color:${color}`}>${src.name}</a>`
        })}
      </span>
    `
  }

  return html`
    <div class="whaleroom">
      <div class="whaleroom-main">
        ${siren?.active && html`
          <div class="whaleroom-siren">
            <span class="whaleroom-siren-dot">🔴</span>
            <span class="whaleroom-siren-text">CONVERGENCE: ${siren.text}</span>
          </div>
        `}

        <div class="whaleroom-tophead">
          ${topSection[0] && topSection[0].topImage && html`
            <img src=${topSection[0].topImage} class="whaleroom-main-img" onError=${(e) => { e.target.style.display = 'none' }} />
          `}
          ${topSection.map((s, i) => {
            const cls = i === 0 ? 'whaleroom-main-headline' : 'whaleroom-top-headline'
            return html`
              <a href=${s.primaryLink || '#'} target="_blank" rel="noopener" class=${cls}>${topHeadlineText(s)}</a>
              ${renderSourcePills(s)}
            `
          })}
        </div>

        <table class="whaleroom-table"><tbody><tr>
          <td class="whaleroom-col">
            <tt><b>${renderCol(col1, 0)}</b></tt>
          </td>
          <td class="whaleroom-divider"></td>
          <td class="whaleroom-col">
            <tt><b>${renderCol(col2, 1)}</b></tt>
          </td>
          <td class="whaleroom-divider"></td>
          <td class="whaleroom-col">
            <tt><b>${renderCol(col3, 2)}</b></tt>
          </td>
        </tr></tbody></table>

        ${!isHolder && html`
          <div class="whaleroom-cta">
            <div class="whaleroom-cta-inner">
              <h3>The conversation is inside.</h3>
              <p>Headlines are public. The discussion — theses, debates, analysis from members and all around the world — is token-gated.</p>
              <button class="whaleroom-cta-btn wobble" onClick=${() => { if (isAuthenticated.value) { showUpgradeModal.value++ } else { showAuthGate.value = true } }}>Join community →</button>
            </div>
          </div>
        `}

        <div class="whaleroom-footer">
          <span>© 2026 WhaleRoom · <a href="/what-is-whaleroom" style="color:var(--text-dim);text-decoration:none">What is WhaleRoom</a> · <a href="/run-a-node" style="color:var(--text-dim);text-decoration:none">Run a Node</a></span>
          ${updated && html`<span>Updated ${updated} ago</span>`}
        </div>
      </div>
    </div>
  `
}
