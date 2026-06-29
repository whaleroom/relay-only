import { html, render, useState, useEffect, useCallback } from './deps.js'

// BigInt-safe JSON.stringify — prevents "Do not know how to serialize a BigInt"
const _origStringify = JSON.stringify
JSON.stringify = function (value, replacer, space) {
  const bigIntReplacer = (key, val) => {
    if (typeof val === 'bigint') return val.toString()
    if (typeof replacer === 'function') return replacer(key, val)
    return val
  }
  if (typeof replacer === 'function') {
    return _origStringify.call(JSON, value, bigIntReplacer, space)
  }
  return _origStringify.call(JSON, value, replacer, space)
}

import {
  myAuthor, myUsername, myPeerId, isAuthenticated, myWalletAddress,
  activeFeed, selectedComposeFeed, switchFeed,
  pendingPosts, peerCount, onlineUsers, myFollowing, feedPosts,
  initIdentity, checkTokenGate, startPeriodicReverification, newReplyEvent, newLikeEvent, newDeleteEvent,
  tokenGateEnabled, tokenGateVerified, tokenGateChecking, performTokenGateVerification,
  theme, initTheme, toggleTheme
} from './state.js'
import { fetchInfo, fetchProfile, fetchFollowing } from './api.js'
import { NAV_META, FEED_META } from './utils.js'

import { Compose } from './components/Compose.js'
import { Feed } from './components/Feed.js'
import { PostCard } from './components/Post.js'
import { ToastContainer } from './components/Toast.js'
import { IdPanel, AuthGate, ProfileModal } from './components/Modals.js'
import { AvatarModal } from './components/AvatarModal.js'
import { StaticAvatar } from './components/AvatarStatic.js'
import { SearchModal } from './components/Search.js'
import { AnimatedCount } from './components/AnimatedCount.js'
import { TokenBalances } from './components/TokenBalances.js'
import { Governance } from './components/Governance.js'
import { ClubView } from './components/Club.js'
import { MetaFrontPage } from './components/MetaFrontPage.js'
import { UpgradeModal, setPlanCallback } from './components/UpgradeModal.js'
import { showUpgradeModal, showAuthGate } from './state.js'

// ── Logo (shared) ──
function Logo ({ size = 28 }) {
  return html`<img src="/icons/favicon.png" width="${size}" height="${size}" alt="Whaleroom" style="border-radius:6px" />`
}

// ── Feed strip (horizontal feed filter bar below header) ──
function FeedStrip () {
  const feed = activeFeed.value
  return html`
    <div class="feed-strip">
      <div class="feed-strip-inner">
        ${Object.entries(NAV_META).map(([slug, meta]) => html`
          <button key=${slug}
            class="feed-strip-pill${slug === feed ? ' active' : ''}"
            onClick=${() => switchFeed(slug)}>
            <span class="feed-strip-label">${meta.name}</span>
          </button>
        `)}
        <div class="feed-strip-sep"></div>
        ${Object.entries(FEED_META).map(([slug, meta]) => html`
          <button key=${slug}
            class="feed-strip-pill${slug === feed ? ' active' : ''}"
            onClick=${() => switchFeed(slug)}>
            ${slug !== 'all' && html`
              <span class="feed-strip-dot" style="background:${meta.color}"></span>
            `}
            <span class="feed-strip-label">${slug === 'all' ? 'All' : meta.name}</span>
          </button>
        `)}
      </div>
    </div>
  `
}

// ── Header ──
function Header ({ onAvatarClick, onSearchClick, hideExtras, onEnter }) {
  const author = myAuthor.value
  const isDark = theme.value === 'dark'

  return html`
    <div class="header">
      <div class="header-inner">
        <div class="header-brand" onClick=${() => switchFeed('frontpage')} style="cursor:pointer">
          <${Logo} />
          <h1>whaleroom</h1>
        </div>
        ${hideExtras
          ? html`
            <div class="header-right">
              <button class="theme-toggle" onClick=${toggleTheme} title=${isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                ${isDark
                  ? html`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
                  : html`<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
                }
              </button>
              <button class="header-enter-btn wobble" onClick=${onEnter || (() => switchFeed('all'))}>ENTER WHALEROOM →</button>
            </div>
          `
          : html`
            <div class="header-right">
              <button class="header-search" onClick=${onSearchClick}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <span>Search</span>
                <kbd>${'\u2318'}K</kbd>
              </button>
              <button class="theme-toggle" onClick=${toggleTheme} title=${isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                ${isDark
                  ? html`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
                  : html`<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
                }
              </button>
              <div class="header-avatar" onClick=${onAvatarClick}>
                ${author && html`<${StaticAvatar} author=${author} size=${32} />`}
              </div>
            </div>
          `
        }
      </div>
    </div>
  `
}

// ── Right sidebar ──
function RightSidebar ({ onGovernance, onClub, onGetWhl }) {
  const peers = peerCount.value
  const users = onlineUsers.value
  const online = peers > 0 || users > 0
  const [aboutOpen, setAboutOpen] = useState(false)

  return html`
    <div class="sidebar-right">
      <${TokenBalances} />
      <div class="widget">
        <div class="widget-title">Network</div>
        <div class="widget-stat-row">
          <span class="widget-stat-label">Users online</span>
          <span class="widget-stat-value" style="color:#fff">${users}</span>
        </div>
        <div class="widget-stat-row">
          <span class="widget-stat-label">P2P nodes</span>
          <span class="widget-stat-value" style="color:#fff">${peers}</span>
        </div>
        <div class="widget-stat-row">
          <span class="widget-stat-label">Status</span>
          <span class="widget-stat-value"
            style="color:${online ? 'var(--green)' : 'var(--text-secondary)'}">
            ${online ? 'Online' : 'Waiting for peers'}
          </span>
        </div>
      </div>
      <div class="sidebar-links">
        <button class="sidebar-link" onClick=${onGovernance}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Governance</span>
        </button>
        <button class="sidebar-link sidebar-upgrade" onClick=${() => showUpgradeModal.value++}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>Upgrade</span>
        </button>
      </div>
      <div class="widget collapsible${aboutOpen ? '' : ' collapsed'}">
        <div class="widget-header" onClick=${() => setAboutOpen(!aboutOpen)}>
          <div class="widget-title">About Whaleroom</div>
          <svg class="widget-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="widget-body">
          <p>A peer-to-peer social protocol for crypto-native communities. Token-gated feeds, encrypted messaging, and on-chain identity — no central servers, no algorithms.</p>
        </div>
      </div>
    </div>
  `
}

// ── Mobile feed tabs ──
function FeedTabsMobile () {
  const feed = activeFeed.value
  return html`
    <div class="feed-tabs-mobile">
      ${Object.entries(NAV_META).map(([slug, meta]) => html`
        <button key=${slug}
          class="feed-tab${slug === feed ? ' active' : ''}"
          onClick=${() => switchFeed(slug)}>
          ${meta.name}
        </button>
      `)}
      ${Object.entries(FEED_META).map(([slug, meta]) => html`
        <button key=${slug}
          class="feed-tab${slug === feed ? ' active' : ''}"
          onClick=${() => switchFeed(slug)}>
          ${slug === 'all' ? 'All' : meta.name}
        </button>
      `)}
    </div>
  `
}

// ── Root App ──
function App () {
  const [idOpen, setIdOpen] = useState(false)
  const [profileAuthor, setProfileAuthor] = useState(null)
  const [avatarAuthor, setAvatarAuthor] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [govOpen, setGovOpen] = useState(false)
  const [clubOpen, setClubOpen] = useState(false)
  const [clubTab, setClubTab] = useState('overview')

  // Plan selection from front page — routes to Club swap widget
  useEffect(() => {
    setPlanCallback((plan) => {
      if (plan === 'pro') {
        setClubTab('getwhl')
        setClubOpen(true)
      } else if (plan === 'proplus') {
        setClubTab('stake')
        setClubOpen(true)
      } else if (plan === 'faq') {
        setClubTab('faq')
        setClubOpen(true)
      }
    })
  }, [])

  // Init identity + theme + token gate on mount
  useEffect(() => { initIdentity(); initTheme(); checkTokenGate(); startPeriodicReverification() }, [])

  // After login, switch to 'all' feed (chat screen)
  useEffect(() => {
    if (isAuthenticated.value && activeFeed.value === 'frontpage') {
      switchFeed('all')
    }
  }, [isAuthenticated.value])

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function handler (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Load username + following list on mount
  useEffect(() => {
    const author = myAuthor.value
    if (!author) return
    fetchProfile(author).then(data => {
      if (data.username) myUsername.value = data.username
    }).catch(() => {})
    fetchFollowing(author).then(data => {
      myFollowing.value = new Set(data.following)
    }).catch(() => {})
  }, [myPeerId.value])

  // Poll network info
  useEffect(() => {
    async function poll () {
      try {
        const info = await fetchInfo()
        peerCount.value = info.peers
        onlineUsers.value = info.onlineUsers || 0
      } catch {}
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [])

  // SSE for live posts, likes, unlikes
  useEffect(() => {
    const sse = new EventSource('/api/live?peer=' + encodeURIComponent(myPeerId.value))
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data)

      // Delete → remove post from feed in real-time
      if (data.type === 'delete') {
        feedPosts.value = feedPosts.value.filter(p => `${p.timestamp}:${p.author}` !== data.postKey)
        pendingPosts.value = pendingPosts.value.filter(p => `${p.timestamp}:${p.author}` !== data.postKey)
        return
      }

      // Like/unlike → update counts in real-time
      if (data.type === 'like' || data.type === 'unlike') {
        if (data.author !== myAuthor.value) {
          newLikeEvent.value = { ...data, _t: Date.now() }
        }
        return
      }

      // Posts from self already added by Compose
      if (data.author === myAuthor.value) return

      // Reply → bump count via signal event
      if (data.replyTo) {
        newReplyEvent.value = { ...data, _t: Date.now() }
        return
      }

      // Filter by active feed
      const feed = activeFeed.value
      if (feed === 'following') {
        if (!myFollowing.value.has(data.author)) return
      } else if (feed !== 'all' && data.feed !== feed) return

      // Show pending bar so user isn't disrupted
      pendingPosts.value = [...pendingPosts.value, data]
    }
    return () => sse.close()
  }, [])

  // Close id-panel on outside click
  useEffect(() => {
    function handler (e) {
      if (!idOpen) return
      const panel = document.querySelector('.id-panel')
      const avatar = document.querySelector('.header-avatar')
      if (panel && !panel.contains(e.target) && avatar && !avatar.contains(e.target)) {
        setIdOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [idOpen])

  const openProfile = useCallback((author) => setProfileAuthor(author), [])
  const openAvatar = useCallback((author) => setAvatarAuthor(author), [])

  const authenticated = isAuthenticated.value

  return html`
    ${!authenticated && html`
      <${Header} onAvatarClick=${(e) => { e.stopPropagation(); showAuthGate.value = true }}
        onSearchClick=${() => showAuthGate.value = true}
        hideExtras=${true}
        onEnter=${() => showAuthGate.value = true} />
      <div class="landing-with-frontpage">
        <div class="landing-frontpage-bg">
          <${MetaFrontPage} />
        </div>
        ${showAuthGate.value && html`<${AuthGate} />`}
      </div>
    `}

    ${authenticated && html`
      <${Header} onAvatarClick=${(e) => { e.stopPropagation(); setIdOpen(!idOpen) }}
        onSearchClick=${() => setSearchOpen(true)}
        hideExtras=${activeFeed.value === 'frontpage' && !tokenGateVerified.value}
        onEnter=${() => switchFeed('all')} />
      ${activeFeed.value !== 'frontpage' && html`<${FeedStrip} />`}
      <${IdPanel} open=${idOpen} onClose=${() => setIdOpen(false)}
        onViewProfile=${() => { setIdOpen(false); setProfileAuthor(myAuthor.value) }} />

      <div class="main ${activeFeed.value === 'frontpage' ? 'frontpage-mode' : ''} ${clubOpen ? 'club-mode' : ''}">
        <div class="center-col ${activeFeed.value === 'frontpage' ? 'frontpage-center' : ''} ${clubOpen ? 'club-center' : ''}">
          ${clubOpen ? html`
            <${ClubView} onBack=${() => setClubOpen(false)} initialTab=${clubTab} />
          ` : html`
            ${activeFeed.value !== 'frontpage' && html`<${FeedTabsMobile} />`}
            <${Feed} onAuthorClick=${openProfile} onAvatarClick=${openAvatar} />
          `}
        </div>
        ${activeFeed.value !== 'frontpage' && !clubOpen && html`
          <${RightSidebar} onGovernance=${() => setGovOpen(true)}
            onClub=${() => { setClubTab('overview'); setClubOpen(true) }}
            onGetWhl=${() => { setClubTab('getwhl'); setClubOpen(true) }} />
        `}
      </div>

      <${ProfileModal} author=${profileAuthor} open=${!!profileAuthor}
        onClose=${() => setProfileAuthor(null)} />
      ${avatarAuthor && html`<${AvatarModal} author=${avatarAuthor}
        onClose=${() => setAvatarAuthor(null)} />`}
      <${SearchModal} open=${searchOpen} onClose=${() => setSearchOpen(false)}
        onAuthorClick=${openProfile} onAvatarClick=${openAvatar} />
      <${Governance} open=${govOpen} onClose=${() => setGovOpen(false)} />
      <${UpgradeModal} />
    `}

    ${!authenticated && html`
      <${UpgradeModal} />
    `}

    <${ToastContainer} />
  `
}

// ── Mount ──
render(html`<${App} />`, document.getElementById('app'))
