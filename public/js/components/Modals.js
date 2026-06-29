import { html, useState, useEffect, useRef } from '../deps.js'
import {
  myPeerId, myAuthor, myUsername, myPublicKey, myWalletAddress, mySecretKey,
  authMethod, connectWallet, logout,
  showToast, myFollowing, saveProof, clearProof,
  tokenGateEnabled, tokenGateConfig, tokenGateVerified, tokenGateChecking,
  performTokenGateVerification, showAuthGate
} from '../state.js'
import { claimUsername, fetchUserPosts, saveProfile, isFollowing, followUser, unfollowUser, fetchFollowing, fetchFollowers, generateSyncCode, redeemSyncCode } from '../api.js'
import { keyColor, timeAgo, fullDate, linkParts, FEED_META } from '../utils.js'
import { EmbedCard, extractEmbedUrl } from './Embed.js'
import { discoverWallets, decryptText, isEncrypted, isIOS } from '../crypto.js'
import { AnimatedCount } from './AnimatedCount.js'
import { feedKeys } from '../state.js'

// ─────────────────────────────────────────────
// IdPanel  (header avatar dropdown)
// ─────────────────────────────────────────────

export function IdPanel ({ open, onClose, onViewProfile }) {
  const pubKey = myPublicKey.value || myPeerId.value
  const method = authMethod.value
  const wallet = myWalletAddress.value
  const username = myUsername.value

  const [unInput, setUnInput] = useState(username)
  const [unStatus, setUnStatus] = useState('')
  const [unColor, setUnColor] = useState('')
  const [walletLoading, setWalletLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null) // { message, onConfirm }
  const [walletPicker, setWalletPicker] = useState(null)   // null or { wallets, connecting }
  const [syncCode, setSyncCode] = useState('')
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMode, setSyncMode] = useState(false)
  const [syncInput, setSyncInput] = useState('')
  const [syncError, setSyncError] = useState('')
  const [gateError, setGateError] = useState('')
  const [gateVerifying, setGateVerifying] = useState(false)
  const gateCfg = tokenGateConfig.value

  useEffect(() => { setUnInput(myUsername.value) }, [myUsername.value])

  function copyKey () {
    navigator.clipboard.writeText(pubKey).then(() => showToast('Public key copied', 'success'))
  }

  async function openWalletPicker () {
    setWalletLoading(true)
    const wallets = await discoverWallets(2000)
    setWalletLoading(false)
    if (wallets.length === 0) {
      if (isIOS) {
        return startWalletConnect()
      } else {
        showToast('No wallet found. Make sure MetaMask is installed, unlocked, and enabled on this site.', 'error')
      }
      return
    }
    if (wallets.length === 1) {
      return pickWallet(wallets[0].provider)
    }
    setWalletPicker({ wallets, connecting: null })
  }

  async function startWalletConnect () {
    setWalletLoading(true)
    try {
      const wc = await import('/js/wallet-connector.js')
      const { uri, approval } = await wc.connectWallet()
      const wcUrl = uri ? `wc:${uri}@2?relay-protocol=irn&relay-data=%7B%22protocol%22%3A%22irn%22%7D` : ''
      const deepLink = `https://wallet.metamask.io/wc?uri=${encodeURIComponent(wcUrl)}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(wcUrl)}`
      setWalletPicker({ wc: true, qrUrl, deepLink, connecting: false })
      setWalletLoading(false)
      const addr = await wc.awaitApproval(approval)
      if (addr) {
        const provider = wc.getProvider()
        await pickWallet(provider)
      }
    } catch (err) {
      showToast(err.message || 'WalletConnect failed', 'error')
      setWalletPicker(null)
      setWalletLoading(false)
    }
  }

  async function pickWallet (provider) {
    setWalletPicker(prev => prev ? { ...prev, connecting: provider } : null)
    setWalletLoading(true)
    try {
      await connectWallet(provider)
      showToast('Wallet connected — identity derived', 'success')
      setWalletPicker(null)
      onClose()
    } catch (err) {
      showToast(err.message || 'Wallet connection failed', 'error')
    }
    setWalletLoading(false)
  }

  function doLogout () {
    setConfirmAction({
      message: 'Log out? You will need to sign in again.',
      onConfirm () {
        clearProof()
        logout()
        showToast('Logged out', 'success')
        setConfirmAction(null)
        onClose()
      }
    })
  }

  async function doGetSyncCode () {
    setSyncBusy(true)
    try {
      const stored = localStorage.getItem('whaleroom_proof')
      if (!stored) { showToast('No proof found', 'error'); setSyncBusy(false); return }
      const proof = JSON.parse(stored)
      const data = await generateSyncCode(proof)
      setSyncCode(data.code)
      setTimeout(() => setSyncCode(''), 60000)
    } catch (err) {
      showToast(err.message || 'Failed to generate sync code', 'error')
    }
    setSyncBusy(false)
  }

  async function doTokenGateVerify () {
    if (!myWalletAddress.value) {
      setGateError('No wallet connected. Connect a wallet first.')
      return
    }
    setGateVerifying(true)
    setGateError('')
    try {
      await performTokenGateVerification()
      showToast('Token ownership verified', 'success')
    } catch (err) {
      setGateError(err.message || 'Verification failed')
    }
    setGateVerifying(false)
  }

  async function doRedeemSyncCode () {
    const code = syncInput.trim()
    if (!/^\d{6}$/.test(code)) {
      setSyncError('Enter a 6-digit code')
      return
    }
    setSyncBusy(true)
    setSyncError('')
    try {
      const result = await redeemSyncCode(code)
      if (result.valid && result.signature) {
        saveProof(result.address, result.signature, result.nonce, result.timestamp)
        showToast('Device synced', 'success')
        setSyncMode(false)
      } else {
        setSyncError(result.error || 'Invalid or expired code')
      }
    } catch (err) {
      setSyncError(err.message || 'Sync failed')
    }
    setSyncBusy(false)
  }

  async function doClaim () {
    const name = unInput.trim()
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) {
      setUnStatus('3-20 chars, letters/numbers/underscore')
      setUnColor('var(--danger)')
      return
    }
    try {
      const data = await claimUsername(name)
      myUsername.value = data.username
      setUnStatus(`Claimed: @${data.username}`)
      setUnColor('var(--green)')
      showToast(`Username set to @${data.username}`, 'success')
    } catch (err) {
      setUnStatus(err.message)
      setUnColor('var(--danger)')
    }
  }

  const methodLabel = method === 'wallet' ? `Wallet ${wallet ? wallet.slice(0, 6) + '...' + wallet.slice(-4) : ''}`
    : 'Keypair'

  return html`
    <div class="id-panel${open ? ' open' : ''}">
      <h3>Your Identity</h3>

      <div class="id-panel-section">
        <div class="id-panel-label">
          Public Key
          <span class="id-auth-badge id-auth-${method}">${methodLabel}</span>
        </div>
        <div class="id-panel-key" onClick=${copyKey}>${pubKey}</div>
      </div>

      <div class="id-panel-divider" />

      <div class="id-panel-section">
        <div class="id-panel-label">Username</div>
        <div class="id-panel-username">
          <input type="text" placeholder="Pick a username..." maxlength="20"
            value=${unInput} onInput=${(e) => setUnInput(e.target.value)}
            onKeyDown=${(e) => { if (e.key === 'Enter') doClaim() }} />
          <button class="id-btn id-btn-primary"
            style="flex:0 0 auto;padding:10px 16px" onClick=${doClaim}>Claim</button>
        </div>
        ${unStatus && html`
          <div class="id-panel-hint" style="color:${unColor}">${unStatus}</div>
        `}
      </div>

      <div class="id-panel-divider" />

      <div class="id-panel-section id-panel-links">
        <button class="id-panel-link" onClick=${() => onViewProfile?.()}>
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          View Profile
        </button>
        <button class="id-panel-link" onClick=${() => onViewProfile?.('edit')}>
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit Profile
        </button>
      </div>

      <div class="id-panel-divider" />

      ${tokenGateEnabled.value && !tokenGateVerified.value && html`
        <div class="id-panel-section">
          <div class="id-panel-label">Token Verification</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">
            Hold at least 280 WHL or 170 WHLC to unlock the feed.
          </div>
          ${myWalletAddress.value && html`
            <div style="font-family:monospace;font-size:11px;color:var(--text-secondary);margin-bottom:8px;word-break:break-all">
              ${myWalletAddress.value}
            </div>
          `}
          ${gateError && html`<div style="color:var(--danger);font-size:13px;margin-bottom:8px">${gateError}</div>`}
          <button class="id-btn id-btn-primary" style="width:100%" onClick=${doTokenGateVerify}
            disabled=${gateVerifying}>
            ${gateVerifying ? 'Verify in wallet...' : 'Prove Token Ownership'}
          </button>
          ${!myWalletAddress.value && html`
            <button class="id-btn id-btn-wallet" style="width:100%;margin-top:8px"
              onClick=${openWalletPicker} disabled=${walletLoading}>
              ${walletLoading ? 'Connecting...' : 'Connect Wallet First'}
            </button>
          `}
          <button class="id-btn" style="width:100%;margin-top:8px" onClick=${() => { setSyncMode(true) }}>
            Sync from another device
          </button>
        </div>
        ${syncMode && html`
          <div class="id-panel-section" style="margin-top:8px">
            <input type="text" placeholder="6-digit code" maxlength="6"
              value=${syncInput} onInput=${(e) => setSyncInput(e.target.value)}
              onKeyDown=${(e) => { if (e.key === 'Enter') doRedeemSyncCode() }} />
            ${syncError && html`<div style="color:var(--danger);font-size:13px;margin-top:4px">${syncError}</div>`}
            <div class="id-panel-actions">
              <button class="id-btn" onClick=${() => { setSyncMode(false); setSyncError('') }}>Cancel</button>
              <button class="id-btn id-btn-primary" onClick=${doRedeemSyncCode} disabled=${syncBusy}>
                ${syncBusy ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
        `}
        <div class="id-panel-divider" />
      `}

      ${tokenGateVerified.value && html`
        <div class="id-panel-section">
          <div class="id-panel-label">Sync Device</div>
          ${syncCode
            ? html`<div style="font-family:monospace;font-size:28px;letter-spacing:6px;text-align:center;padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px">${syncCode}</div>
               <div class="id-panel-hint">Expires in 60 seconds. Enter this code on another device to sync your session.</div>`
            : html`<button class="id-btn id-btn-wallet" style="width:100%" onClick=${doGetSyncCode} disabled=${syncBusy}>
                 ${syncBusy ? 'Generating...' : 'Generate Sync Code'}
               </button>`
          }
        </div>

        <div class="id-panel-divider" />
      `}

      <div class="id-panel-divider" />

      <div class="id-panel-section">
        <div class="id-panel-actions">
          <button class="id-btn id-btn-logout" onClick=${doLogout}>Log Out</button>
        </div>
      </div>

      ${confirmAction && html`
        <div class="id-confirm-overlay" onClick=${() => setConfirmAction(null)}>
          <div class="id-confirm-modal" onClick=${(e) => e.stopPropagation()}>
            <p>${confirmAction.message}</p>
            <div class="id-panel-actions">
              <button class="id-btn" onClick=${() => setConfirmAction(null)}>Cancel</button>
              <button class="id-btn id-btn-danger" onClick=${confirmAction.onConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      `}

      ${walletPicker && html`
        <div class="id-confirm-overlay" onClick=${() => !walletPicker.wc && setWalletPicker(null)}>
          <div class="wallet-picker" onClick=${(e) => e.stopPropagation()}>
            ${walletPicker.wc ? html`
              <h4>Connect via WalletConnect</h4>
              <p style="font-size:12px;color:var(--text-secondary);margin:6px 0 12px;line-height:1.5">
                Scan with MetaMask or tap to open.
              </p>
              ${walletPicker.qrUrl && html`
                <div style="display:flex;justify-content:center;margin-bottom:12px">
                  <img src=${walletPicker.qrUrl} alt="QR" style="width:160px;height:160px;border-radius:8px;border:1px solid var(--border)" />
                </div>
              `}
              ${walletPicker.deepLink && html`
                <a href=${walletPicker.deepLink} style="display:block;padding:10px;text-align:center;background:var(--accent);color:#fff;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:8px">
                  Open in MetaMask
                </a>
              `}
              <p style="font-size:11px;color:var(--text-secondary);text-align:center">Waiting for approval...</p>
            ` : html`
              <h4>Connect Wallet</h4>
              <div class="wallet-picker-list">
                ${walletPicker.wallets.map(w => html`
                  <button key=${w.info.uuid} class="wallet-picker-item"
                    disabled=${walletPicker.connecting === w.provider}
                    onClick=${() => pickWallet(w.provider)}>
                    ${w.info.icon
                      ? html`<img src=${w.info.icon} class="wallet-picker-icon" alt="" />`
                      : html`<div class="wallet-picker-icon wallet-picker-icon-fallback">
                          <svg viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
                        </div>`
                    }
                    <span class="wallet-picker-name">${w.info.name}</span>
                    ${walletPicker.connecting === w.provider
                      ? html`<span class="wallet-picker-status">Connecting...</span>`
                      : null
                    }
                  </button>
                `)}
              </div>
            `}
          </div>
        </div>
      `}
    </div>
  `
}

// ─────────────────────────────────────────────
// Onboarding
// ─────────────────────────────────────────────

export function AuthGate () {
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletPicker, setWalletPicker] = useState(null)
  const isTauri = !!window.__TAURI_INTERNALS__

  async function openWalletPicker () {
    setWalletLoading(true)
    const wallets = await discoverWallets(2000)
    setWalletLoading(false)
    if (wallets.length === 0) {
      if (isIOS) {
        return startWalletConnect()
      } else {
        showToast('No wallet found. Make sure MetaMask is installed, unlocked, and enabled on this site.', 'error')
      }
      return
    }
    if (wallets.length === 1) {
      return pickWallet(wallets[0].provider)
    }
    setWalletPicker({ wallets, connecting: null })
  }

  async function startWalletConnect () {
    setWalletLoading(true)
    try {
      const wc = await import('/js/wallet-connector.js')
      const { uri, approval } = await wc.connectWallet()
      const wcUrl = uri ? `wc:${uri}@2?relay-protocol=irn&relay-data=%7B%22protocol%22%3A%22irn%22%7D` : ''
      const deepLink = `https://wallet.metamask.io/wc?uri=${encodeURIComponent(wcUrl)}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(wcUrl)}`
      setWalletPicker({ wc: true, qrUrl, deepLink, connecting: false })
      setWalletLoading(false)
      const addr = await wc.awaitApproval(approval)
      if (addr) {
        const provider = wc.getProvider()
        await pickWallet(provider)
      }
    } catch (err) {
      showToast(err.message || 'WalletConnect failed', 'error')
      setWalletPicker(null)
      setWalletLoading(false)
    }
  }

  async function pickWallet (provider) {
    setWalletPicker(prev => prev ? { ...prev, connecting: provider } : null)
    setWalletLoading(true)
    try {
      await connectWallet(provider)
      showToast('Wallet connected', 'success')
      setWalletPicker(null)
      showAuthGate.value = false
    } catch (err) {
      showToast(err.message || 'Wallet connection failed', 'error')
    }
    setWalletLoading(false)
  }

  return html`
    <div class="login-overlay" onClick=${(e) => { if (e.target === e.currentTarget) showAuthGate.value = false }}>
      <div class="login-card">
        <div class="login-logo">
          <img src="/icons/whaleroom-logo.svg" alt="Whaleroom" />
        </div>
        <h2 class="login-title">Connect your wallet</h2>
        <p class="login-desc">Sign in to join the community and access encrypted feeds.</p>

        ${!isTauri && html`
          <button class="id-btn id-btn-primary login-btn" onClick=${openWalletPicker}
            disabled=${walletLoading}>
            ${walletLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        `}
        ${isTauri && html`
          <a class="id-btn id-btn-primary login-btn" href="/auth.html" target="_blank" rel="noopener">
            Sign in with Browser Wallet
          </a>
        `}

        <button class="login-back" onClick=${() => showAuthGate.value = false}>← Back to front page</button>
      </div>

      ${walletPicker && html`
        <div class="id-confirm-overlay" onClick=${() => !walletPicker.wc && setWalletPicker(null)}>
          <div class="wallet-picker" onClick=${(e) => e.stopPropagation()}>
            ${walletPicker.wc ? html`
              <h4>Connect via WalletConnect</h4>
              <p style="font-size:12px;color:var(--text-secondary);margin:6px 0 12px;line-height:1.5">
                Scan with MetaMask or tap to open.
              </p>
              ${walletPicker.qrUrl && html`
                <div style="display:flex;justify-content:center;margin-bottom:12px">
                  <img src=${walletPicker.qrUrl} alt="QR" style="width:160px;height:160px;border-radius:8px;border:1px solid var(--border)" />
                </div>
              `}
              ${walletPicker.deepLink && html`
                <a href=${walletPicker.deepLink} style="display:block;padding:10px;text-align:center;background:var(--accent);color:#fff;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:8px">
                  Open in MetaMask
                </a>
              `}
              <p style="font-size:11px;color:var(--text-secondary);text-align:center">Waiting for approval...</p>
            ` : html`
              <h4>Connect Wallet</h4>
              <div class="wallet-picker-list">
                ${walletPicker.wallets.map(w => html`
                  <button key=${w.info.uuid} class="wallet-picker-item"
                    disabled=${walletPicker.connecting === w.provider}
                    onClick=${() => pickWallet(w.provider)}>
                    ${w.info.icon
                      ? html`<img src=${w.info.icon} class="wallet-picker-icon" alt="" />`
                      : html`<div class="wallet-picker-icon wallet-picker-icon-fallback">
                          <svg viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/></svg>
                        </div>`
                    }
                    <span class="wallet-picker-name">${w.info.name}</span>
                    ${walletPicker.connecting === w.provider
                      ? html`<span class="wallet-picker-status">Connecting...</span>`
                      : null
                    }
                  </button>
                `)}
              </div>
            `}
          </div>
        </div>
      `}
    </div>
  `
}

// ─────────────────────────────────────────────
// ProfileModal
// ─────────────────────────────────────────────

function ProfilePostItem ({ post, profileUsername, profileDisplayName }) {
  const [displayText, setDisplayText] = useState(post.text)
  const isEnc = post.text && isEncrypted(post.text)
  useEffect(() => {
    if (!post.text || !isEncrypted(post.text)) { setDisplayText(post.text); return }
    if (!post.feed || !feedKeys.value || !feedKeys.value[post.feed]) { setDisplayText(post.text); return }
    let active = true
    decryptText(post.text, feedKeys.value[post.feed]).then(dec => {
      if (active) setDisplayText(dec || post.text)
    }).catch(() => { if (active) setDisplayText(post.text) })
    return () => { active = false }
  }, [post.text, post.feed, feedKeys.value])
  const stillEncrypted = isEnc && displayText === post.text
  const parts = linkParts(displayText)
  const embedUrl = extractEmbedUrl(displayText)
  const feedMeta = FEED_META[post.feed]
  const feedColor = feedMeta?.color || 'var(--accent)'
  const uname = post.authorUsername || profileUsername
  const dname = post.authorDisplayName || profileDisplayName
  const initials = uname
    ? uname[0].toUpperCase()
    : post.author.slice(0, 2).toUpperCase()
  const isMe = post.author === myAuthor.value

  return html`
    <div class="post">
      <div class="avatar ${isMe ? 'avatar-me' : 'avatar-peer'}"
        style=${isMe ? undefined : { background: keyColor(post.author) }}>
        ${initials}
      </div>
      <div class="post-content">
        <div class="post-header">
          <span class="post-author">${dname || uname || post.author}</span>
          <span class="post-sep">\u00b7</span>
          <span class="post-time" title=${fullDate(post.timestamp)}>${timeAgo(post.timestamp)}</span>
          ${feedMeta && html`
            <span class="post-feed-badge"
              style="color:${feedColor};background:${feedColor}14">${feedMeta.name}</span>
          `}
        </div>
        ${stillEncrypted
          ? html`<div class="post-text encrypted-post-text">${displayText}</div>`
          : html`<div class="post-text">
              ${parts.map((p, i) =>
                p.url
                  ? html`<a key=${i} href=${p.url} target="_blank" rel="noopener">${p.url}</a>`
                  : p.text
              )}
            </div>`
        }
        ${embedUrl && html`<${EmbedCard} url=${embedUrl} />`}
        <div class="post-footer">
          <div class="post-action">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <${AnimatedCount} value=${post.replyCount || 0} class="count" />
          </div>
          <div class="post-action">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            <${AnimatedCount} value=${post.likeCount || 0} class="count" />
          </div>
        </div>
      </div>
    </div>
  `
}

function SkeletonList () {
  return html`
    ${[0,1,2].map(i => html`
      <div key=${i} class="skeleton-post">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div>
        </div>
      </div>
    `)}
  `
}

export function ProfileModal ({ author, open, onClose }) {
  const [profile, setProfile] = useState(null)
  const [username, setUsername] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('posts')
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [iFollow, setIFollow] = useState(false)
  const [followingCount, setFollowingCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)

  const isMe = author === myAuthor.value

  useEffect(() => {
    if (!author || !open) return
    setLoading(true)
    setTab('posts')
    setEditing(false)
    setIFollow(false)
    setFollowingCount(0)
    setFollowerCount(0)
    fetchUserPosts(author, 30).then(data => {
      setProfile(data.profile)
      setUsername(data.username)
      setPosts(data.posts || [])
      if (data.profile?.displayName) setEditName(data.profile.displayName)
      if (data.profile?.bio) setEditBio(data.profile.bio)
      setLoading(false)
    }).catch(() => {
      setPosts([])
      setLoading(false)
    })
    // Load follow state
    if (!isMe && myAuthor.value) {
      isFollowing(author).then(d => setIFollow(d.following)).catch(() => {})
    }
    fetchFollowing(author).then(d => setFollowingCount(d.following.length)).catch(() => {})
    fetchFollowers(author).then(d => setFollowerCount(d.followers.length)).catch(() => {})
  }, [author, open])

  async function doSave () {
    setSaving(true)
    try {
      await saveProfile(editName.trim(), editBio.trim())
      setProfile(prev => ({ ...prev, displayName: editName.trim(), bio: editBio.trim() }))
      showToast('Profile saved', 'success')
      setEditing(false)
    } catch { showToast('Failed to save profile', 'error') }
    setSaving(false)
  }

  async function toggleFollow () {
    if (followLoading || isMe) return
    setFollowLoading(true)
    try {
      if (iFollow) {
        await unfollowUser(author)
        setIFollow(false)
        setFollowerCount(c => Math.max(0, c - 1))
        const next = new Set(myFollowing.value)
        next.delete(author)
        myFollowing.value = next
      } else {
        await followUser(author)
        setIFollow(true)
        setFollowerCount(c => c + 1)
        const next = new Set(myFollowing.value)
        next.add(author)
        myFollowing.value = next
      }
    } catch (err) {
      showToast(err.message, 'error')
    }
    setFollowLoading(false)
  }

  const displayName = profile?.displayName || (isMe ? 'You' : 'anon')
  const bio = profile?.bio || ''
  const initials = username ? username[0].toUpperCase() : (author || '??').slice(0, 2).toUpperCase()
  const avatarBg = isMe
    ? 'background:linear-gradient(135deg,#e046bf,#af4093)'
    : `background:${keyColor(author || '00')}`

  // Replies tab just shows empty for now (needs server endpoint)
  const visiblePosts = tab === 'replies' ? [] : posts

  return html`
    <div class="profile-overlay${open ? ' open' : ''}"
      onClick=${(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div class="profile-modal">
        <div class="profile-header">
          <div class="profile-avatar" style=${avatarBg}>${initials}</div>
          <div class="profile-info">
            <div class="profile-name-row">
              <div class="profile-display-name">${displayName}</div>
              ${isMe && html`
                <button class="profile-edit-icon" onClick=${() => setEditing(!editing)}
                  title="Edit profile">
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                </button>
              `}
            </div>
            ${username && html`<div class="profile-username">@${username}</div>`}
            <div class="profile-handle">@${author || '...'}</div>
            <div class="profile-stats">
              <span><strong><${AnimatedCount} value=${followingCount} /></strong> Following</span>
              <span><strong><${AnimatedCount} value=${followerCount} /></strong> Follower${followerCount !== 1 ? 's' : ''}</span>
            </div>
            ${bio && html`<div class="profile-bio">${bio}</div>`}
          </div>
          ${!isMe && html`
            <button class="follow-btn${iFollow ? ' following' : ''}"
              disabled=${followLoading}
              onClick=${toggleFollow}>
              ${iFollow ? 'Unfollow' : 'Follow'}
            </button>
          `}
          <button class="profile-close" onClick=${onClose}>\u00d7</button>
        </div>

        ${isMe && (editing || !profile?.displayName) && html`
          <div class="profile-edit-section">
            <div class="profile-edit-row">
              <input type="text" placeholder="Display name" maxlength="50"
                value=${editName} onInput=${(e) => setEditName(e.target.value)} />
            </div>
            <div class="profile-edit-row">
              <textarea placeholder="Bio (160 chars)" maxlength="160"
                value=${editBio} onInput=${(e) => setEditBio(e.target.value)} />
            </div>
            <div class="profile-edit-row" style="gap:8px">
              <button class="id-btn id-btn-primary" disabled=${saving}
                onClick=${doSave}>${saving ? 'Saving...' : 'Save'}</button>
              ${profile?.displayName && html`
                <button class="id-btn" style="background:var(--bg);border:1px solid var(--border);color:var(--text-secondary)"
                  onClick=${() => setEditing(false)}>Cancel</button>
              `}
            </div>
          </div>
        `}

        <div class="profile-tabs">
          <button class="profile-tab-btn${tab === 'posts' ? ' active' : ''}"
            onClick=${() => setTab('posts')}>Posts</button>
          <button class="profile-tab-btn${tab === 'replies' ? ' active' : ''}"
            onClick=${() => setTab('replies')}>Replies</button>
        </div>

        <div class="profile-posts">
          ${loading
            ? html`<${SkeletonList} />`
            : visiblePosts.length === 0
              ? html`<div style="padding:32px;text-align:center;color:var(--text-secondary)">
                  ${tab === 'replies' ? 'Nothing here yet' : 'No posts yet'}
                </div>`
              : visiblePosts.map(p => html`
                  <${ProfilePostItem} key=${p.timestamp + ':' + p.author} post=${p}
                    profileUsername=${username} profileDisplayName=${profile?.displayName} />
                `)
          }
        </div>
      </div>
    </div>
  `
}
