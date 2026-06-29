import { myAuthor, mySecretKey, feedKeys, myWalletAddress } from './state.js'
import { signOperation, encryptText } from './crypto.js'

// ── Helper: sign an operation ──
function prepareBody (op) {
  if (!mySecretKey.value) throw new Error('Not authenticated')
  return signOperation(op, mySecretKey.value)
}

// ── Read endpoints (no signing needed) ──

export async function fetchFeed ({ feed = 'all', limit = 50, before } = {}) {
  const p = new URLSearchParams({ limit, viewer: myAuthor.value })
  if (feed !== 'all') p.set('feed', feed)
  if (before) p.set('before', before)
  const res = await fetch(`/api/feed?${p}`)
  if (res.status === 503) throw new Error('starting')
  if (!res.ok) throw new Error('fetch failed')
  return res.json()
}

export async function fetchPulseNews (slug, limit = 500, domains = '') {
  const p = new URLSearchParams({ slug, limit })
  if (domains) p.set('domain', domains)
  const res = await fetch(`/api/pulse/news?${p}`)
  if (!res.ok) return { results: [], error: 'News unavailable' }
  return res.json()
}

export async function fetchSerpNews (channel = 'all', limit = 50) {
  const p = new URLSearchParams({ channel, limit })
  const res = await fetch(`/api/serp-news?${p}`)
  if (!res.ok) return { results: [] }
  return res.json()
}

export async function fetchPolymarketMarkets (limit = 20, tag = '') {
  try {
    let url = `https://gamma-api.polymarket.com/events?limit=${limit}&active=true&closed=false&order=volume24hr&ascending=false`
    if (tag) url += `&tag=${encodeURIComponent(tag)}`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data
  } catch {
    return []
  }
}

export async function searchPosts (query, limit = 30) {
  const p = new URLSearchParams({ q: query, limit, viewer: myAuthor.value })
  const res = await fetch(`/api/search?${p}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export async function fetchReplies (postKey) {
  const res = await fetch(`/api/replies?post=${encodeURIComponent(postKey)}`)
  if (!res.ok) throw new Error('Failed to load replies')
  return res.json()
}

export async function fetchInfo () {
  const res = await fetch('/api/info')
  return res.json()
}

export async function fetchProfile (author) {
  const res = await fetch(`/api/profile?author=${author}`)
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

export async function fetchUserPosts (author, limit = 30) {
  const res = await fetch(`/api/user-posts?author=${author}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to load posts')
  return res.json()
}

export async function isFollowing (target) {
  const res = await fetch(`/api/is-following?author=${myAuthor.value}&target=${target}`)
  if (!res.ok) return { following: false }
  return res.json()
}

export async function fetchFollowing (author) {
  const res = await fetch(`/api/following?author=${author}`)
  if (!res.ok) throw new Error('Failed to load following')
  return res.json()
}

export async function fetchFollowers (author) {
  const res = await fetch(`/api/followers?author=${author}`)
  if (!res.ok) throw new Error('Failed to load followers')
  return res.json()
}

// ── Write endpoints (signed) ──

export async function postMessage (text, feed, replyTo) {
  let postText = text
  // Encrypt post text if we have the feed key
  if (feed && feedKeys.value && feedKeys.value[feed]) {
    postText = await encryptText(text, feedKeys.value[feed])
  }
  const op = { type: 'post', text: postText, timestamp: Date.now() }
  if (feed) op.feed = feed
  if (replyTo) op.replyTo = replyTo
  const res = await fetch('/api/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepareBody(op))
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Post failed')
  }
  const result = await res.json()
  // Check if post was moderated (server returns 200 with moderation object)
  if (result.moderation && !result.moderation.approved) {
    return { moderation: result.moderation }
  }
  // Return the plaintext version to the caller for immediate display
  if (result.text && result.text.includes(':')) {
    result._plaintext = text
  }
  return result
}

export async function toggleLike (postKey, unlike) {
  const op = { type: unlike ? 'unlike' : 'like', postKey, timestamp: Date.now() }
  const res = await fetch(unlike ? '/api/unlike' : '/api/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepareBody(op))
  })
  if (!res.ok) throw new Error('Like failed')
  return res.json()
}

export async function saveProfile (displayName, bio) {
  const op = { type: 'profile', displayName, bio, timestamp: Date.now() }
  const res = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepareBody(op))
  })
  if (!res.ok) throw new Error('Save failed')
  return res.json()
}

export async function followUser (target) {
  const op = { type: 'follow', target, timestamp: Date.now() }
  const res = await fetch('/api/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepareBody(op))
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Follow failed')
  }
  return res.json()
}

export async function unfollowUser (target) {
  const op = { type: 'unfollow', target, timestamp: Date.now() }
  const res = await fetch('/api/unfollow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepareBody(op))
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Unfollow failed')
  }
  return res.json()
}

export async function claimUsername (username) {
  const op = { type: 'claim-username', username, timestamp: Date.now() }
  const res = await fetch('/api/claim-username', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepareBody(op))
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to claim username')
  return data
}

export async function deletePost (postKey) {
  const op = { type: 'delete-post', postKey, timestamp: Date.now() }
  const res = await fetch('/api/delete-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prepareBody(op))
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Delete failed')
  }
  return res.json()
}

// ── Token gate ──

export async function fetchTokenGateConfig () {
  const res = await fetch('/api/token-gate/config')
  return res.json()
}

export async function verifyTokenGate (address, signature, nonce, timestamp) {
  const res = await fetch('/api/token-gate/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, signature, nonce, timestamp })
  })
  return res.json()
}

export async function fetchTokenGateStatus (address) {
  const res = await fetch(`/api/token-gate/status?address=${address}`)
  return res.json()
}

export async function fetchTokenBalances (address) {
  const res = await fetch(`/api/token-gate/balances?address=${address}`)
  if (!res.ok) throw new Error('Failed to fetch balances')
  return res.json()
}

export async function generateSyncCode (proof) {
  const res = await fetch('/api/token-gate/sync-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proof)
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Not verified')
  }
  return res.json()
}

export async function redeemSyncCode (code) {
  const res = await fetch('/api/token-gate/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  return res.json()
}

// ── Feed encryption keys (legacy: direct base key fetch) ──

export async function fetchFeedKeys (proof) {
  const res = await fetch('/api/feeds/keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proof)
  })
  if (!res.ok) return null
  return res.json()
}

// ── P2P key grants ──

export async function requestKeyGrant (proofData, x25519PubKey) {
  const res = await fetch('/api/key-grant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...proofData, x25519PubKey })
  })
  return res.json()
}

export async function fetchKeyGrant (recipientX25519PubKey) {
  const res = await fetch(`/api/key-grant?recipient=${recipientX25519PubKey}`)
  if (!res.ok) return null
  return res.json()
}

export async function fetchServerX25519PubKey () {
  const res = await fetch('/api/key-grant/server-pubkey')
  if (!res.ok) return null
  return res.json()
}

// ── Governance ──

export async function fetchGovConfig () {
  const res = await fetch('/api/governance/config')
  if (!res.ok) return null
  return res.json()
}

export async function fetchProposals () {
  const res = await fetch('/api/governance/proposals')
  if (!res.ok) return null
  return res.json()
}

export async function fetchProposal (id) {
  const res = await fetch(`/api/governance/proposal?id=${id}`)
  if (!res.ok) return null
  return res.json()
}

function getStoredProof () {
  const raw = localStorage.getItem('whaleroom_proof')
  return raw ? JSON.parse(raw) : null
}

export async function createGovernanceProposal (type, slug, name, description, color) {
  const proof = getStoredProof()
  if (!proof) throw new Error('Not verified')
  const res = await fetch('/api/governance/proposals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proof, type, slug, name, description, color })
  })
  return res.json()
}

export async function castGovernanceVote (proposalId, support, signature, nonce) {
  const proof = getStoredProof()
  if (!proof) throw new Error('Not verified')
  const res = await fetch('/api/governance/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proof, proposalId, support, signature, nonce })
  })
  return res.json()
}

export async function executeGovernanceProposal (proposalId) {
  const proof = getStoredProof()
  if (!proof) throw new Error('Not verified')
  const res = await fetch('/api/governance/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proof, proposalId })
  })
  return res.json()
}

// ── Front Page ──

export async function fetchFrontpage (channel) {
  const res = await fetch(`/api/frontpage?channel=${channel}`)
  if (!res.ok) return null
  return res.json()
}

export async function fetchFrontpageList () {
  const res = await fetch('/api/frontpage/list')
  if (!res.ok) return { channels: [] }
  return res.json()
}

export async function boostFrontpage (channel, edition, boostAmount, distributeTxHash) {
  const op = {
    channel,
    edition,
    boostAmount,
    distributeTxHash,
    boostedBy: myAuthor.value,
    boostedByEth: myWalletAddress.value,
    timestamp: Date.now()
  }
  const res = await fetch('/api/frontpage/boost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(op)
  })
  return res.json()
}
