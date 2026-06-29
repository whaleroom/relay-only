import { html, useState, useEffect, useRef, useCallback } from '../deps.js'
import { myAuthor, activeFeed } from '../state.js'
import { searchPosts } from '../api.js'
import { timeAgo, fullDate, FEED_META } from '../utils.js'
import { StaticAvatar } from './AvatarStatic.js'

// Highlight matching text segments
function HighlightText ({ text, query }) {
  if (!query) return text
  const parts = []
  const lower = text.toLowerCase()
  const q = query.toLowerCase()
  let last = 0
  let idx = lower.indexOf(q, last)
  while (idx !== -1) {
    if (idx > last) parts.push(html`<span key=${'t' + last}>${text.slice(last, idx)}</span>`)
    parts.push(html`<mark key=${'m' + idx} class="search-highlight">${text.slice(idx, idx + q.length)}</mark>`)
    last = idx + q.length
    idx = lower.indexOf(q, last)
  }
  if (last < text.length) parts.push(html`<span key=${'e' + last}>${text.slice(last)}</span>`)
  return parts
}

function SearchResultPost ({ post, query, onAuthorClick, onAvatarClick, onClose }) {
  const feedMeta = FEED_META[post.feed]
  const feedColor = feedMeta?.color || 'var(--accent)'
  const displayName = post.authorDisplayName || post.authorUsername || post.author

  return html`
    <div class="search-result-post" onClick=${onClose}>
      <${StaticAvatar} author=${post.author} size=${36}
        onClick=${(e) => { e.stopPropagation(); onClose(); onAvatarClick?.(post.author) }} />
      <div class="search-result-content">
        <div class="search-result-header">
          <span class="search-result-author"
            onClick=${(e) => { e.stopPropagation(); onClose(); onAuthorClick?.(post.author) }}>${displayName}</span>
          ${post.authorUsername && html`
            <span class="search-result-handle">@${post.authorUsername}</span>
          `}
          <span class="post-sep">${'\u00b7'}</span>
          <span class="search-result-time" title=${fullDate(post.timestamp)}>${timeAgo(post.timestamp)}</span>
          ${feedMeta && html`
            <span class="post-feed-badge"
              style="color:${feedColor};background:${feedColor}14">${feedMeta.name}</span>
          `}
        </div>
        <div class="search-result-text">
          <${HighlightText} text=${post.text} query=${query} />
        </div>
        <div class="search-result-stats">
          <span>${post.replyCount || 0} repl${post.replyCount === 1 ? 'y' : 'ies'}</span>
          <span>${'\u00b7'}</span>
          <span>${post.likeCount || 0} like${post.likeCount === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  `
}

function SearchResultUser ({ user, query, onAuthorClick, onClose }) {
  return html`
    <div class="search-result-user"
      onClick=${() => { onClose(); onAuthorClick?.(user.author) }}>
      <${StaticAvatar} author=${user.author} size=${32} />
      <div class="search-result-user-info">
        <span class="search-result-user-name">
          <${HighlightText} text=${user.displayName || user.username || user.author} query=${query} />
        </span>
        ${user.username && html`
          <span class="search-result-user-handle">@<${HighlightText} text=${user.username} query=${query} /></span>
        `}
      </div>
    </div>
  `
}

export function SearchModal ({ open, onClose, onAuthorClick, onAvatarClick }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ posts: [], users: [] })
  const [loading, setLoading] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const resultsRef = useRef(null)

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults({ posts: [], users: [] })
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ posts: [], users: [] })
      setLoading(false)
      return
    }
    setLoading(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchPosts(query.trim())
        setResults(data)
        setSelectedIdx(0)
      } catch {
        setResults({ posts: [], users: [] })
      }
      setLoading(false)
    }, 200)
    return () => clearTimeout(timerRef.current)
  }, [query])

  // Total results for keyboard nav
  const totalResults = results.users.length + results.posts.length

  function onKeyDown (e) {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, totalResults - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
      return
    }
    if (e.key === 'Enter' && totalResults > 0) {
      e.preventDefault()
      const idx = selectedIdx
      if (idx < results.users.length) {
        onClose()
        onAuthorClick?.(results.users[idx].author)
      } else {
        // Just close on post selection for now
        onClose()
      }
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return
    const el = resultsRef.current.querySelector('.selected')
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  if (!open) return null

  const hasQuery = query.trim().length > 0
  const hasResults = results.users.length > 0 || results.posts.length > 0
  let itemIdx = 0

  return html`
    <div class="search-overlay" onClick=${(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div class="search-modal">
        <div class="search-input-row">
          <svg class="search-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input ref=${inputRef} type="text"
            class="search-input"
            placeholder="Search posts, users, hashtags..."
            value=${query}
            onInput=${(e) => setQuery(e.target.value)}
            onKeyDown=${onKeyDown} />
          <button class="search-close" onClick=${onClose} aria-label="Close search">
            <kbd class="search-kbd">ESC</kbd>
            <svg class="search-close-x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="search-results" ref=${resultsRef}>
          ${loading && hasQuery && html`
            <div class="search-loading">
              <div class="search-loading-dots">
                <span /><span /><span />
              </div>
            </div>
          `}

          ${!loading && hasQuery && !hasResults && html`
            <div class="search-empty">
              <div class="search-empty-icon">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <div class="search-empty-text">No results for "${query}"</div>
              <div class="search-empty-hint">Try different keywords or check your spelling</div>
            </div>
          `}

          ${!hasQuery && html`
            <div class="search-hints">
              <div class="search-hint-title">Search tips</div>
              <div class="search-hint-item">
                <kbd>#</kbd>
                <span>Search hashtags</span>
              </div>
              <div class="search-hint-item">
                <kbd>$</kbd>
                <span>Search cashtags</span>
              </div>
              <div class="search-hint-item">
                <kbd>@</kbd>
                <span>Find users</span>
              </div>
            </div>
          `}

          ${results.users.length > 0 && html`
            <div class="search-section">
              <div class="search-section-title">People</div>
              ${results.users.map((u) => {
                const idx = itemIdx++
                return html`
                  <div key=${u.author} class="search-item-wrap${idx === selectedIdx ? ' selected' : ''}"
                    onMouseEnter=${() => setSelectedIdx(idx)}>
                    <${SearchResultUser} user=${u} query=${query}
                      onAuthorClick=${onAuthorClick} onClose=${onClose} />
                  </div>
                `
              })}
            </div>
          `}

          ${results.posts.length > 0 && html`
            <div class="search-section">
              <div class="search-section-title">Posts</div>
              ${results.posts.map((p) => {
                const idx = itemIdx++
                return html`
                  <div key=${p.timestamp + ':' + p.author}
                    class="search-item-wrap${idx === selectedIdx ? ' selected' : ''}"
                    onMouseEnter=${() => setSelectedIdx(idx)}>
                    <${SearchResultPost} post=${p} query=${query}
                      onAuthorClick=${onAuthorClick} onAvatarClick=${onAvatarClick}
                      onClose=${onClose} />
                  </div>
                `
              })}
            </div>
          `}
        </div>
      </div>
    </div>
  `
}
