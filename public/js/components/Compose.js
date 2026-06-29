import { html, useState, useRef, useEffect } from '../deps.js'
import { myAuthor, myUsername, selectedComposeFeed, activeFeed, feedPosts, showToast, tokenGateVerified, tokenGateEnabled } from '../state.js'
import { postMessage } from '../api.js'
import { MAX_CHARS, FEED_META } from '../utils.js'
import { StaticAvatar } from './AvatarStatic.js'
import { BadgeButton } from './BadgeButton.js'

const CIRCUMFERENCE = 62.83
const openFeeds = new Set()

export function Compose () {
  const [text, setText] = useState('')
  const [ddOpen, setDdOpen] = useState(false)
  const [btnState, setBtnState] = useState('idle')
  const [moderationMsg, setModerationMsg] = useState(null)
  const taRef = useRef(null)

  useEffect(() => {
    if (!ddOpen) return
    function handler (e) {
      const dd = document.querySelector('.feed-select-dropdown.open')
      const pill = document.querySelector('.compose-feed-pill')
      if (dd && !dd.contains(e.target) && pill && !pill.contains(e.target)) {
        setDdOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [ddOpen])

  const author = myAuthor.value
  const username = myUsername.value
  const composeFeed = selectedComposeFeed.value
  const meta = FEED_META[composeFeed]
  const len = text.length
  const canPost = len > 0 && len <= MAX_CHARS && btnState === 'idle'
  const currentFeed = activeFeed.value
  const showChannelSelector = currentFeed === 'all'

  // Hide compose box for encrypted feeds if user isn't token-verified
  const gated = tokenGateEnabled.value && !tokenGateVerified.value
  if (gated) return null

  async function doPost () {
    if (!canPost) return
    const t = text.trim()
    if (!t) return
    setModerationMsg(null)
    setBtnState('processing')
    try {
      const post = await postMessage(t, composeFeed)
      if (post.moderation && !post.moderation.approved) {
        setModerationMsg(post.moderation.reason)
        setBtnState('idle')
        return
      }
      setText('')
      setModerationMsg(null)
      if (taRef.current) taRef.current.style.height = 'auto'
      post.authorUsername = username || null
      post.authorDisplayName = null
      post.likedByMe = false
      post.likeCount = 0
      post.replyCount = 0
      // Use plaintext for immediate local display (postMessage returns encrypted text)
      if (post._plaintext) post.text = post._plaintext
      const current = activeFeed.value
      if (current === 'all' || current === post.feed) {
        feedPosts.value = [post, ...feedPosts.value]
      }
      setBtnState('success')
    } catch (err) {
      showToast(err.message, 'error')
      setText(t)
      setBtnState('error')
    }
    setTimeout(() => setBtnState('idle'), 1200)
  }

  function onInput (e) {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  function onKeyDown (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canPost) doPost()
  }

  function selectFeed (slug) {
    selectedComposeFeed.value = slug
    setDdOpen(false)
  }

  const ratio = Math.min(len / MAX_CHARS, 1)
  const offset = CIRCUMFERENCE * (1 - ratio)
  const ringClass = len > MAX_CHARS ? 'over' : len > MAX_CHARS - 20 ? 'warn' : ''

  return html`
    <div class="compose">
      <${StaticAvatar} author=${author} />
      <div class="compose-inner">
        <textarea ref=${taRef} placeholder="Share a thesis, research, or structural take..." rows="1"
          value=${text} onInput=${onInput} onKeyDown=${onKeyDown} />
        ${moderationMsg && html`
          <div class="compose-moderation">
            <span class="compose-moderation-icon">⚓</span>
            <span class="compose-moderation-text">${moderationMsg}</span>
            <button class="compose-moderation-dismiss" onClick=${() => setModerationMsg(null)}>×</button>
          </div>
        `}
        <div class="compose-actions">
          <div class="compose-left">
            <div style="position:relative">
              ${showChannelSelector
                ? html`
                  <button class="compose-feed-pill"
                    onClick=${(e) => { e.stopPropagation(); setDdOpen(!ddOpen) }}>
                    <span class="pill-dot" style="background:${meta.color}"></span>
                    <span>${composeFeed.charAt(0).toUpperCase() + composeFeed.slice(1)}</span>
                  </button>
                  <div class="feed-select-dropdown${ddOpen ? ' open' : ''}">
                    ${Object.entries(FEED_META).filter(([s]) => s !== 'all' && s !== 'following').map(([slug, m]) => html`
                      <button key=${slug}
                        class="feed-select-option${slug === composeFeed ? ' selected' : ''}"
                        onClick=${() => selectFeed(slug)}>
                        <span class="nav-dot" style="background:${m.color}"></span>${m.name}
                      </button>
                    `)}
                  </div>
                `
                : html`
                  <span class="compose-feed-pill compose-feed-static">
                    <span class="pill-dot" style="background:${meta.color}"></span>
                    <span>${composeFeed.charAt(0).toUpperCase() + composeFeed.slice(1)}</span>
                  </span>
                `
              }
            </div>
            ${len > 0 && html`
              <div class="char-ring" style="display:block">
                <svg viewBox="0 0 24 24">
                  <circle class="bg" />
                  <circle class="fg ${ringClass}"
                    stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${offset}" />
                </svg>
              </div>
            `}
            ${len > MAX_CHARS - 20 && len > 0 && html`
              <span class="char-count-text${len > MAX_CHARS ? ' over' : ''}"
                style="display:inline">${MAX_CHARS - len}</span>
            `}
          </div>
          <${BadgeButton}
            idleLabel="Post"
            busyLabel="Posting..."
            doneLabel="Posted!"
            errorLabel="Failed"
            state=${btnState}
            disabled=${!canPost}
            onClick=${doPost} />
        </div>
      </div>
    </div>
  `
}
