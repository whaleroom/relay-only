import { html, useState, useEffect, useRef } from '../deps.js'
import { myAuthor, myUsername, myPeerId, timeTick, newReplyEvent, newLikeEvent, feedPosts, showToast, feedKeys, tokenGateVerified, tokenGateEnabled } from '../state.js'
import { fetchReplies, toggleLike, postMessage, deletePost } from '../api.js'
import { timeAgo, fullDate, linkParts, extractImageUrls, FEED_META, MAX_CHARS } from '../utils.js'
import { StaticAvatar } from './AvatarStatic.js'
import { EmbedCard, extractEmbedUrl } from './Embed.js'
import { BadgeButton } from './BadgeButton.js'
import { AnimatedCount } from './AnimatedCount.js'
import { decryptText, isEncrypted } from '../crypto.js'

function decryptPostText (text, feed, keys) {
  if (!text) return text
  if (!isEncrypted(text)) return text
  if (!keys || !feed || !keys[feed]) return null
  return decryptText(text, keys[feed])
}

function useDecryptedText (text, feed) {
  const [decrypted, setDecrypted] = useState(() => {
    if (!text || !isEncrypted(text)) return text
    return text // show ciphertext until decrypted
  })
  useEffect(() => {
    if (!text || !isEncrypted(text)) { setDecrypted(text); return }
    const keys = feedKeys.value
    if (!keys || !feed || !keys[feed]) { setDecrypted(text); return }
    let active = true
    decryptText(text, keys[feed]).then(result => {
      if (active) setDecrypted(result || text)
    }).catch(() => { if (active) setDecrypted(text) })
    return () => { active = false }
  }, [text, feed, feedKeys.value])
  return decrypted
}

function PostText ({ text, skipUrls, encrypted }) {
  if (!text) return html`<div class="post-text"></div>`
  if (encrypted) return html`<div class="post-text encrypted-post-text">${text}</div>`
  const parts = linkParts(text)
  return html`
    <div class="post-text">
      ${parts.map((p, i) =>
        p.url
          ? (skipUrls && skipUrls.includes(p.url))
            ? null
            : html`<a key=${i} href=${p.url} target="_blank" rel="noopener">${p.url}</a>`
          : p.hashtag
            ? html`<span key=${i} class="hashtag">${p.hashtag}</span>`
            : p.cashtag
              ? html`<span key=${i} class="cashtag">${p.cashtag}</span>`
              : p.text
      )}
    </div>
  `
}

function PostImages ({ urls }) {
  if (!urls.length) return null
  return html`
    <div class="post-images${urls.length > 1 ? ' post-images-grid' : ''}">
      ${urls.map((url, i) => html`
        <img key=${i} src=${url} alt="" loading="lazy" class="post-image"
          onError=${(e) => { e.target.style.display = 'none' }} />
      `)}
    </div>
  `
}

function TimeDisplay ({ ts }) {
  timeTick.value // subscribe → re-render every 15 s
  return html`<span class="post-time" title=${fullDate(ts)}>${timeAgo(ts)}</span>`
}

// ── Reply compose ──

function ReplyCompose ({ postKey, onReply }) {
  const [text, setText] = useState('')
  const [btnState, setBtnState] = useState('idle')
  const taRef = useRef(null)

  useEffect(() => { if (taRef.current) taRef.current.focus() }, [])

  const canReply = text.trim().length > 0 && text.length <= MAX_CHARS && btnState === 'idle'

  async function submit () {
    const t = text.trim()
    if (!t || !canReply) return
    setBtnState('processing')
    try {
      const reply = await postMessage(t, null, postKey)
      reply.authorUsername = myUsername.value || null
      if (reply._plaintext) reply.text = reply._plaintext
      setText('')
      if (taRef.current) taRef.current.style.height = 'auto'
      onReply(reply)
      setBtnState('success')
    } catch (err) {
      showToast(err.message, 'error')
      setBtnState('error')
    }
    setTimeout(() => setBtnState('idle'), 1200)
  }

  function onInput (e) {
    setText(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  return html`
    <div class="reply-compose" style="display:flex">
      <textarea ref=${taRef} placeholder="Write a reply..." rows="1"
        value=${text} onInput=${onInput}
        onKeyDown=${(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit() }} />
      <${BadgeButton}
        idleLabel="Reply"
        busyLabel="Replying..."
        doneLabel="Sent!"
        errorLabel="Failed"
        state=${btnState}
        disabled=${!canReply}
        onClick=${submit} />
    </div>
  `
}

// ── Main PostCard ──

export function PostCard ({ post, isReply, highlight, isNew, onAuthorClick, onAvatarClick }) {
  const postKey = `${post.timestamp}:${post.author}`

  const [liked, setLiked] = useState(!!post.likedByMe)
  const [likeCount, setLikeCount] = useState(post.likeCount || 0)
  const [replyCount, setReplyCount] = useState(post.replyCount || 0)
  const [threadOpen, setThreadOpen] = useState(false)
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [repliesLoaded, setRepliesLoaded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const me = myAuthor.value
  const isMe = post.author === me
  const canInteract = !tokenGateEnabled.value || tokenGateVerified.value
  const displayName = post.authorDisplayName
    || (isMe ? (myUsername.value || 'You') : (post.authorUsername || 'anon'))
  const handle = post.authorUsername || post.author
  // Decrypt post text if encrypted (async via epoch key derivation)
  const displayText = useDecryptedText(post.text, post.feed)
  const isCipher = isEncrypted(post.text) && displayText === post.text
  const imageUrls = displayText && !isCipher ? extractImageUrls(displayText) : []
  const embedUrl = displayText && !isCipher ? extractEmbedUrl(displayText) : null
  const feedMeta = FEED_META[post.feed]
  const feedColor = feedMeta?.color || 'var(--accent)'

  // SSE live-reply
  useEffect(() => {
    const ev = newReplyEvent.value
    if (!ev || ev.replyTo !== postKey) return
    setReplyCount(c => c + 1)
    if (threadOpen) setReplies(prev => [...prev, ev])
  }, [newReplyEvent.value])

  // SSE live-like
  useEffect(() => {
    const ev = newLikeEvent.value
    if (!ev || ev.postKey !== postKey) return
    if (ev.type === 'like') setLikeCount(c => c + 1)
    if (ev.type === 'unlike') setLikeCount(c => Math.max(0, c - 1))
  }, [newLikeEvent.value])

  async function toggleThread () {
    if (threadOpen) { setThreadOpen(false); return }
    setThreadOpen(true)
    if (replyCount > 0 && !repliesLoaded) {
      setLoadingReplies(true)
      try {
        const data = await fetchReplies(postKey)
        setReplies(data.replies || [])
        setRepliesLoaded(true)
      } catch { /* ignore */ }
      setLoadingReplies(false)
    }
  }

  async function onLikeClick () {
    const was = liked
    setLiked(!was)
    setLikeCount(c => was ? c - 1 : c + 1)
    try {
      const data = await toggleLike(postKey, was)
      setLikeCount(data.likeCount)
    } catch {
      setLiked(was)
      setLikeCount(c => was ? c + 1 : c - 1)
    }
  }

  async function doDelete () {
    try {
      await deletePost(postKey)
      feedPosts.value = feedPosts.value.filter(p => `${p.timestamp}:${p.author}` !== postKey)
      setConfirmDelete(false)
    } catch (err) {
      showToast(err.message, 'error')
      setConfirmDelete(false)
    }
  }

  function onReplyAdded (reply) {
    setReplies(prev => [...prev, reply])
    setReplyCount(c => c + 1)
    setRepliesLoaded(true)
  }

  return html`
    <div class="post-wrapper">
      <div class="post${isNew ? ' new' : ''}${highlight ? ' highlight' : ''}"
        data-timestamp=${post.timestamp}>
        <${StaticAvatar} author=${post.author}
          onClick=${() => onAvatarClick?.(post.author)} />
        <div class="post-content">
          ${post.replyTo && html`<div class="reply-indicator">replying to a post</div>`}
          <div class="post-header">
            <span class="post-author"
              onClick=${() => onAuthorClick?.(post.author)}>${displayName}</span>
            <span class="post-handle"
              onClick=${() => onAuthorClick?.(post.author)}>@${handle}</span>
            <span class="post-sep">\u00b7</span>
            <${TimeDisplay} ts=${post.timestamp} />
            ${feedMeta && html`
              <span class="post-feed-badge"
                style="color:${feedColor};background:${feedColor}14">
                ${feedMeta.name}
              </span>
            `}
          </div>
          <${PostText} text=${displayText} skipUrls=${imageUrls} encrypted=${isCipher} />
          <${PostImages} urls=${imageUrls} />
          ${embedUrl && html`<${EmbedCard} url=${embedUrl} />`}
          ${!isReply && html`
            <div class="post-footer">
              <div class="post-action reply-btn${canInteract ? '' : ' disabled'}"
                onClick=${canInteract ? toggleThread : undefined}
                title=${canInteract ? '' : 'Verify your token holdings to reply'}>
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <${AnimatedCount} value=${replyCount} class="count" />
              </div>
              <div class="post-action like-btn${liked ? ' liked' : ''}${canInteract ? '' : ' disabled'}"
                onClick=${canInteract ? onLikeClick : undefined}
                title=${canInteract ? '' : 'Verify your token holdings to react'}>
                <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <${AnimatedCount} value=${likeCount} class="count" />
              </div>
              ${isMe && html`
                <div class="post-action delete-btn" onClick=${() => setConfirmDelete(true)}>
                  <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg>
                </div>
              `}
            </div>
          `}
        </div>
      </div>
      ${!isReply && threadOpen && html`
        <div class="reply-thread" style="display:block">
          ${loadingReplies && html`<div class="thread-loading">Loading replies...</div>`}
          ${replies.map(r => html`
            <${PostCard} key=${r.timestamp + ':' + r.author}
              post=${r} isReply=${true} onAuthorClick=${onAuthorClick}
              onAvatarClick=${onAvatarClick} />
          `)}
        </div>
        ${canInteract
          ? html`<${ReplyCompose} postKey=${postKey} onReply=${onReplyAdded} />`
          : html`<div class="reply-gate-notice">Verify your token holdings to reply.</div>`
        }
      `}
      ${confirmDelete && html`
        <div class="id-confirm-overlay" onClick=${() => setConfirmDelete(false)}>
          <div class="id-confirm-modal" onClick=${(e) => e.stopPropagation()}>
            <p>Delete this post? This can't be undone.</p>
            <div class="id-panel-actions">
              <button class="id-btn" onClick=${() => setConfirmDelete(false)}>Cancel</button>
              <button class="id-btn id-btn-danger" onClick=${doDelete}>Delete</button>
            </div>
          </div>
        </div>
      `}
    </div>
  `
}
