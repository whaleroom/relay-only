import { html, useState, useEffect } from '../deps.js'
import { fetchFrontpage } from '../api.js'
import { tokenGateVerified, tokenGateEnabled, feedKeys } from '../state.js'
import { FEED_META, timeAgo } from '../utils.js'

function Siren ({ siren, channel }) {
  if (!siren?.active) return null
  const meta = FEED_META[channel]

  return html`
    <div class="frontpage-siren">
      <div class="siren-banner">
        <span class="siren-dot">🔴</span>
        <span class="siren-text">CONVERGENCE: ${siren.text}</span>
      </div>
      ${siren.channels && html`
        <div class="siren-channels">
          ${siren.channels.map(c => {
            const m = FEED_META[c]
            return html`<span key=${c} class="siren-channel" style=${m ? `color:${m.color}` : ''}>${m ? m.name : c}</span>`
          })}
          ${siren.convergenceScore && html`<span class="siren-score">score ${siren.convergenceScore}</span>`}
        </div>
      `}
    </div>
  `
}

function Story ({ story, isHolder, channel }) {
  const [expanded, setExpanded] = useState(false)
  const meta = FEED_META[channel]
  const sourceList = story.sourceDomains?.length > 0
    ? story.sourceDomains.slice(0, 4).join(', ')
    : story.primaryLink || ''

  return html`
    <div class="frontpage-story" onClick=${() => setExpanded(!expanded)}>
      <div class="story-rank">${story.rank}</div>
      <div class="story-content">
        <h3 class="story-headline">${story.headline}</h3>
        ${isHolder
          ? html`
            <div class="story-lede">${story.lede}</div>
            ${expanded && story.aiSummary && html`
              <div class="story-ai-summary">${story.aiSummary}</div>
            `}
            ${expanded && html`
              <div class="story-actions">
                <a href=${story.primaryLink} target="_blank" rel="noopener" class="story-link">Open source</a>
              </div>
            `}
          `
          : html`
            <div class="story-lede-locked">
              <span class="lock-icon">🔒</span>
              <span>${story.sources} source${story.sources > 1 ? 's' : ''} | score ${story.score}</span>
              <span class="lock-text">AI analysis locked</span>
            </div>
          `
        }
        <div class="story-meta">
          ${story.sources > 1 && html`<span class="story-sources">${story.sources} sources</span>`}
          <span class="story-score">score ${story.score}</span>
          ${sourceList && html`<span class="story-domains">${sourceList}</span>`}
          ${story.isBreaking && html`<span class="story-breaking">BREAKING</span>`}
          ${story.convergence && html`<span class="story-convergence-tag">CONVERGENCE</span>`}
        </div>
      </div>
    </div>
  `
}

function FrontpageSkeleton () {
  return html`
    <div class="frontpage-skeleton">
      ${[0,1,2,3,4].map(i => html`
        <div key=${i} class="fp-skeleton-row">
          <div class="fp-skeleton-rank"></div>
          <div class="fp-skeleton-content">
            <div class="fp-skeleton-headline"></div>
            <div class="fp-skeleton-lede"></div>
          </div>
        </div>
      `)}
    </div>
  `
}

function UnlockCTA () {
  return html`
    <div class="frontpage-unlock-cta">
      <div class="unlock-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="5" y="11" width="14" height="10" rx="2"/>
          <path d="M8 11V7a4 4 0 018 0v4"/>
        </svg>
      </div>
      <h3>Hold WHL or stake WHLC to unlock</h3>
      <p>Headlines and source counts are public. AI analysis is token-gated.</p>
      <p>Hold WHL or stake WHLC to read full intelligence briefs.</p>
    </div>
  `
}

export function FrontPage ({ channel }) {
  const [edition, setEdition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isHolder = tokenGateVerified.value && feedKeys.value

  useEffect(() => {
    if (!channel) return
    let cancelled = false
    setLoading(true)
    setEdition(null)
    setError(null)

    fetchFrontpage(channel).then(data => {
      if (cancelled) return
      if (!data || data.error) {
        setError(data?.error || 'No edition available')
      } else {
        setEdition(data)
      }
    }).catch(err => {
      if (!cancelled) setError(err.message)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [channel])

  if (loading) return html`<${FrontpageSkeleton} />`
  if (error) return html`
    <div class="frontpage-empty">
      <p>${error}</p>
      <p class="frontpage-empty-hint">Front page updates when ${10} new articles accumulate.</p>
    </div>
  `
  if (!edition) return null

  const meta = FEED_META[channel]
  const updatedAgo = edition.timestamp ? timeAgo(edition.timestamp) : ''

  return html`
    <div class="frontpage">
      <div class="frontpage-header">
        <div class="frontpage-title">
          <span class="frontpage-channel" style=${meta ? `color:${meta.color}` : ''}>
            WHALEROOM // ${meta ? meta.name.toUpperCase() : channel.toUpperCase()}
          </span>
        </div>
        <div class="frontpage-meta">
          <span>Edition #${edition.edition}</span>
          <span>Updated ${updatedAgo} ago</span>
          ${edition.triggerCount != null && html`
            <span>Next edition: ${Math.max(0, edition.triggerThreshold - edition.triggerCount)} more articles</span>
          `}
        </div>
      </div>

      <${Siren} siren=${edition.siren} channel=${channel} />

      ${edition.stories && edition.stories.length > 0
        ? html`
          <div class="frontpage-stories">
            ${edition.stories.map(story => html`
              <${Story} key=${story.rank} story=${story} isHolder=${isHolder} channel=${channel} />
            `)}
          </div>
        `
        : html`<div class="frontpage-empty"><p>No stories met the quality threshold for this edition.</p></div>`
      }

      ${edition.lowerPriority && edition.lowerPriority.length > 0 && html`
        <div class="frontpage-lower-priority">
          <div class="lp-divider">─── lower priority ───</div>
          ${edition.lowerPriority.map((item, i) => html`
            <div key=${i} class="lp-item">
              <span class="lp-bullet">•</span>
              <span class="lp-headline">${item.headline}</span>
              <span class="lp-score">${item.score}</span>
            </div>
          `)}
        </div>
      `}

      ${edition.boostCount > 0 && html`
        <div class="frontpage-boost">
          <span>⚡ ${edition.boostCount} boost${edition.boostCount > 1 ? 's' : ''} — ${edition.boostVolume} WHL from holders</span>
        </div>
      `}

      ${!isHolder && html`<${UnlockCTA} />`}
    </div>
  `
}
