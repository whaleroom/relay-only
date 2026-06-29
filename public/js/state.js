import { signal, computed, batch } from './deps.js'
import { generateKeypair, keypairFromSeed, keypairFromWallet, deriveX25519FromSeed, decryptKeyGrant } from './crypto.js'

// ── Identity ──
export const myPeerId = signal('')
export const myPublicKey = signal('')
export const mySeedHex = signal('')
export const mySecretKey = signal(null)   // Uint8Array(64), in-memory only
export const myWalletAddress = signal('')
export const authMethod = signal('')      // 'keypair' | 'wallet'

export const isAuthenticated = computed(() => !!myPublicKey.value && !!mySecretKey.value)

export const myAuthor = computed(() => {
  if (myPublicKey.value) return myPublicKey.value.slice(0, 8).toLowerCase()
  return ''
})
export const myUsername = signal('')

// ── X25519 keypair for P2P key grants ──
export const myX25519 = signal(null) // { publicKeyHex, secretKey }

// ── Feed ──
export const activeFeed = signal('frontpage')
export const frontpageRefreshTrigger = signal(0)
export const selectedComposeFeed = signal('bitcoin')
export const feedPosts = signal([])
export const pendingPosts = signal([])
export const hasMore = signal(true)
export const showUpgradeModal = signal(0) // increment to trigger
export const showAuthGate = signal(false) // show login screen for unauth users
export const loadingMore = signal(false)
export const feedLoading = signal(true)

// ── Follow ──
export const myFollowing = signal(new Set())

// ── Theme ──
export const theme = signal(localStorage.getItem('whaleroom_theme') || 'dark')

export function initTheme () {
  const t = theme.value
  document.documentElement.dataset.theme = t
}

export function toggleTheme () {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  theme.value = next
  document.documentElement.dataset.theme = next
  localStorage.setItem('whaleroom_theme', next)
}

// ── Token gate ──
export const tokenGateEnabled = signal(false)
export const tokenGateConfig = signal(null)
export const tokenGateVerified = signal(false)
export const tokenGateChecking = signal(false)

// ── Feed encryption keys (slug -> hex key) ──
export const feedKeys = signal(null)

// ── Network ──
export const peerCount = signal(0)
export const onlineUsers = signal(0)

// ── Sidebar collapse state ──
export const sidebarCollapsed = signal(localStorage.getItem('whaleroom_sidebar_collapsed') === '1')

export function toggleSidebar () {
  const next = !sidebarCollapsed.value
  sidebarCollapsed.value = next
  localStorage.setItem('whaleroom_sidebar_collapsed', next ? '1' : '0')
}

// ── Time ticker (forces relative-time re-renders) ──
export const timeTick = signal(0)
setInterval(() => { timeTick.value = Date.now() }, 15000)

// ── SSE events (consumed by PostCard) ──
export const newReplyEvent = signal(null)
export const newLikeEvent = signal(null)
export const newDeleteEvent = signal(null)

// ── Toast queue ──
export const toasts = signal([])
let _tid = 0
export function showToast (msg, type = '') {
  const id = ++_tid
  toasts.value = [...toasts.value, { id, msg, type }]
  setTimeout(() => {
    toasts.value = toasts.value.map(t => t.id === id ? { ...t, exiting: true } : t)
    setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 200)
  }, 3500)
}

// ── Identity helpers ──

function saveKeypair (kp, method = 'keypair', walletAddress = '') {
  deriveX25519FromSeed(kp.seedHex).then(x25519 => {
    batch(() => {
      myPublicKey.value = kp.publicKeyHex
      mySeedHex.value = kp.seedHex
      mySecretKey.value = kp.secretKey
      myPeerId.value = kp.publicKeyHex
      authMethod.value = method
      myWalletAddress.value = walletAddress
      myUsername.value = ''
      myX25519.value = { publicKeyHex: x25519.publicKeyHex, secretKey: x25519.secretKey }
    })
    localStorage.setItem('whaleroom_seed', kp.seedHex)
    localStorage.setItem('whaleroom_public_key', kp.publicKeyHex)
    localStorage.setItem('whaleroom_auth_method', method)
    localStorage.setItem('whaleroom_peer_id', kp.publicKeyHex)
    if (walletAddress) localStorage.setItem('whaleroom_wallet_address', walletAddress)
  })
}

export async function initIdentity () {
  const storedSeed = localStorage.getItem('whaleroom_seed')
  const storedPubKey = localStorage.getItem('whaleroom_public_key')
  const storedMethod = localStorage.getItem('whaleroom_auth_method')
  const storedWallet = localStorage.getItem('whaleroom_wallet_address')

  // Restore keypair from seed if available
  if (storedSeed && /^[a-f0-9]{64}$/i.test(storedSeed) && storedPubKey) {
    const kp = keypairFromSeed(storedSeed)
    const x25519 = await deriveX25519FromSeed(storedSeed)
    batch(() => {
      myPublicKey.value = kp.publicKeyHex
      mySeedHex.value = kp.seedHex
      mySecretKey.value = kp.secretKey
      myPeerId.value = kp.publicKeyHex
      authMethod.value = storedMethod || 'keypair'
      if (storedWallet) myWalletAddress.value = storedWallet
      myX25519.value = { publicKeyHex: x25519.publicKeyHex, secretKey: x25519.secretKey }
    })
    return
  }

  // No stored identity — signals stay empty, isAuthenticated remains false.
  // The auth gate in App.js will show the auth modal.
}

// ── Token gate helpers ──

export async function checkTokenGate () {
  const { fetchTokenGateConfig, verifyTokenGate } = await import('./api.js')
  tokenGateChecking.value = true
  try {
    const cfg = await fetchTokenGateConfig()
    tokenGateConfig.value = cfg
    tokenGateEnabled.value = cfg.enabled
    if (!cfg.enabled) return

    const stored = localStorage.getItem('whaleroom_proof')
    if (stored) {
      try {
        const proof = JSON.parse(stored)
        const result = await verifyTokenGate(proof.address, proof.signature, proof.nonce, proof.timestamp)
        if (result.valid) {
          myWalletAddress.value = result.address || proof.address
          tokenGateVerified.value = true
          loadFeedKeys(proof)
          return
        }
      } catch { /* ignore */ }
  localStorage.removeItem('whaleroom_proof')
  localStorage.removeItem('whaleroom_gate_skipped')
    }

    // User has no valid proof. If they previously skipped the gate,
    // don't show the overlay again — let them browse with ciphertext.
    if (localStorage.getItem('whaleroom_gate_skipped')) {
      tokenGateVerified.value = false
    }
  } finally {
    tokenGateChecking.value = false
  }
}

export function saveProof (address, signature, nonce, timestamp) {
  localStorage.setItem('whaleroom_proof', JSON.stringify({ address, signature, nonce, timestamp }))
  myWalletAddress.value = address
  tokenGateVerified.value = true
  // Fetch feed encryption keys now that we have a valid proof
  loadFeedKeys({ address, signature, nonce, timestamp })
}

export async function loadFeedKeys (proof) {
  // Try P2P key grant first, fall back to legacy direct fetch
  try {
    const x25519 = myX25519.value
    if (x25519) {
      const { fetchKeyGrant, requestKeyGrant } = await import('./api.js')

      // First, try to fetch an existing grant from any node
      let grant = await fetchKeyGrant(x25519.publicKeyHex)

      // If no grant exists yet, request one from the seed node
      if (!grant) {
        const result = await requestKeyGrant({ proof }, x25519.publicKeyHex)
        if (result && result.ok) {
          // Grant was published to Autobase — fetch it with retries
          grant = await fetchKeyGrantWithRetry(x25519.publicKeyHex)
        } else if (result && result.error) {
          console.error('key-grant: server rejected:', result.error)
        }
      }

      if (grant && grant.encryptedKeys && grant.serverX25519PubKey) {
        const keys = decryptKeyGrant(grant.encryptedKeys, grant.serverX25519PubKey, x25519.secretKey)
        if (keys) {
          feedKeys.value = keys
          console.log(`key-grant: decrypted ${Object.keys(keys).length} feed keys via P2P grant`)
          return
        }
      }
    }
  } catch (err) {
    console.error('key-grant: failed:', err.message)
  }

  // Legacy fallback: fetch base keys directly from this node
  // Only works on non-seed nodes (seed node returns 410)
  try {
    const { fetchFeedKeys } = await import('./api.js')
    const data = await fetchFeedKeys(proof)
    if (data && data.keys) {
      feedKeys.value = data.keys
      console.log(`feed-keys: loaded ${Object.keys(data.keys).length} feed keys (legacy)`)
    }
  } catch (err) {
    console.error('feed-keys: legacy fallback failed:', err.message)
  }
}

// Helper: fetch key grant with retry for P2P replication delay
async function fetchKeyGrantWithRetry (pubKeyHex, maxRetries = 5, delay = 1000) {
  const { fetchKeyGrant } = await import('./api.js')
  for (let i = 0; i < maxRetries; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, delay))
    const grant = await fetchKeyGrant(pubKeyHex)
    if (grant) return grant
  }
  return null
}

export function clearProof () {
  localStorage.removeItem('whaleroom_proof')
  feedKeys.value = null
  tokenGateVerified.value = false
}

const REVERIFY_INTERVAL = 15 * 60 * 1000 // 15 minutes
let reverifyTimer = null

export function startPeriodicReverification () {
  if (reverifyTimer) clearInterval(reverifyTimer)
  reverifyTimer = setInterval(async () => {
    if (!tokenGateEnabled.value) return
    const x25519 = myX25519.value
    if (!x25519) return

    // Try to re-verify using the existing grant first (no wallet signature needed)
    try {
      const { fetchKeyGrant } = await import('./api.js')
      const grant = await fetchKeyGrant(x25519.publicKeyHex)
      if (grant) {
        // Grant still exists and not revoked — re-derive keys
        const keys = decryptKeyGrant(grant.encryptedKeys, grant.serverX25519PubKey, x25519.secretKey)
        if (keys) {
          feedKeys.value = keys
          tokenGateVerified.value = true
          console.log('re-verification: grant still valid')
          return
        }
      }
    } catch { /* fall through to EIP-712 */ }

    // Grant was revoked or not found — try to get a new one
    const stored = localStorage.getItem('whaleroom_proof')
    if (!stored) {
      console.log('re-verification: no stored proof, clearing')
      clearProof()
      return
    }

    try {
      const proof = JSON.parse(stored)
      const { verifyTokenGate } = await import('./api.js')
      const result = await verifyTokenGate(proof.address, proof.signature, proof.nonce, proof.timestamp)
      if (result.valid) {
        tokenGateVerified.value = true
        loadFeedKeys(proof)
      } else {
        console.log('re-verification: proof no longer valid — clearing keys')
        clearProof()
      }
    } catch (err) {
      console.error('re-verification failed:', err.message)
      clearProof()
    }
  }, REVERIFY_INTERVAL)
}

export async function performTokenGateVerification () {
  if (!myWalletAddress.value) throw new Error('No wallet connected')
  const { fetchTokenGateConfig, verifyTokenGate, requestKeyGrant } = await import('./api.js')
  const cfg = tokenGateConfig.value || await fetchTokenGateConfig()
  if (!cfg || !cfg.domain) throw new Error('Token gate config not loaded')

  const x25519 = myX25519.value

  // Step 1: Try storage proof (trustless — server verifies MPT, no RPC trust for balance)
  if (x25519) {
    try {
      const { generateBalanceProof } = await import('./storage-proof.js')
      const tokenConfigs = (cfg.requirements || []).map(r => ({
        symbol: r.symbol, address: r.address, minBalance: r.minBalance, decimals: 18,
        balanceSlot: r.symbol === 'WHLC' ? 11 : 0
      }))
      const { proof: storageProof, token } = await generateBalanceProof(myWalletAddress.value, tokenConfigs)
      console.log(`storage-proof: generated proof for ${token.symbol} balance`)

      // Try ZK proof on top of storage proof (privacy-preserving)
      try {
        const { checkZKAvailable, generateZKProof } = await import('./zk-proof.js')
        const zkAvailable = await checkZKAvailable()
        if (zkAvailable) {
          const balanceValue = storageProof.storageProof[0]?.value || '0'
          const balance = BigInt(balanceValue)
          const threshold = BigInt(token.minBalance) * BigInt(10) ** BigInt(18)
          const addressInt = BigInt(myWalletAddress.value)
          const recipientHash = BigInt('0x' + x25519.publicKeyHex).toString()

          const { proof: zkProof, publicSignals: zkPublicSignals } = await generateZKProof(
            balance.toString(),
            threshold.toString(),
            addressInt.toString(),
            storageProof.blockNumber.toString(),
            recipientHash
          )
          console.log('zk-proof: generated proof, submitting to server')

          const zkResult = await requestKeyGrant({ zkProof, zkPublicSignals, storageProof }, x25519.publicKeyHex)
          if (zkResult && zkResult.ok) {
            await loadFeedKeysViaGrant(x25519)
            tokenGateVerified.value = true
            return { valid: true, method: 'zk-proof', symbol: token.symbol }
          }
        }
      } catch (err) {
        console.log('zk-proof: failed, trying storage proof directly:', err.message)
      }

      // Storage proof without ZK
      const result = await requestKeyGrant({ storageProof }, x25519.publicKeyHex)
      if (result && result.ok) {
        await loadFeedKeysViaGrant(x25519)
        tokenGateVerified.value = true
        return { valid: true, method: 'storage-proof', symbol: token.symbol }
      }
    } catch (err) {
      console.log('storage-proof: failed, falling back to EIP-712:', err.message)
    }
  }

  // Step 2: EIP-712 fallback (server checks balance via RPC)
  const nonce = BigInt(Math.floor(Math.random() * 1e15))
  const timestamp = BigInt(Date.now())
  const message = {
    address: myWalletAddress.value,
    nonce: nonce.toString(),
    timestamp: timestamp.toString()
  }
  const provider = window.ethereum
  if (!provider) throw new Error('No wallet found. Install MetaMask or enable your wallet extension.')
  const sig = await provider.request({
    method: 'eth_signTypedData_v4',
    params: [myWalletAddress.value, JSON.stringify({
      domain: cfg.domain,
      types: { ...cfg.types, EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ] },
      primaryType: 'Proof',
      message
    })]
  })
  const result = await verifyTokenGate(myWalletAddress.value, sig, nonce.toString(), timestamp.toString())
  if (result.valid) {
    saveProof(myWalletAddress.value, sig, nonce.toString(), timestamp.toString())
    if (x25519) {
      const grantResult = await requestKeyGrant({ proof: { address: myWalletAddress.value, signature: sig, nonce: nonce.toString(), timestamp: timestamp.toString() } }, x25519.publicKeyHex)
      if (grantResult && grantResult.ok) {
        await loadFeedKeysViaGrant(x25519)
      }
    }
    return result
  }

  // EIP-712 failed — user doesn't hold enough tokens.
  // Let them in with ciphertext-only view.
  localStorage.setItem('whaleroom_gate_skipped', '1')
  tokenGateVerified.value = false
  feedKeys.value = null
  throw new Error(result.reason || 'Insufficient token holdings — you can browse but posts will be encrypted')
}

// Fetch and decrypt a key grant from any P2P node (with retry for replication delay)
async function loadFeedKeysViaGrant (x25519) {
  const { fetchKeyGrant } = await import('./api.js')
  const maxRetries = 5
  const retryDelay = 1000

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`key-grant: retry ${attempt + 1}/${maxRetries}...`)
      await new Promise(r => setTimeout(r, retryDelay))
    }

    const grant = await fetchKeyGrant(x25519.publicKeyHex)
    if (grant && grant.encryptedKeys && grant.serverX25519PubKey) {
      const keys = decryptKeyGrant(grant.encryptedKeys, grant.serverX25519PubKey, x25519.secretKey)
      if (keys) {
        feedKeys.value = keys
        console.log(`key-grant: decrypted ${Object.keys(keys).length} feed keys via P2P grant`)
        return true
      }
    }
  }

  console.error('key-grant: could not fetch grant after retries')
  return false
}

export function importSeed (seedHex, walletAddress = '') {
  if (!/^[a-f0-9]{64}$/i.test(seedHex)) throw new Error('Invalid seed — must be 64 hex characters')
  const kp = keypairFromSeed(seedHex)
  saveKeypair(kp, walletAddress ? 'wallet' : 'keypair', walletAddress)
}

export async function connectWallet (provider) {
  const kp = await keypairFromWallet(provider)
  saveKeypair(kp, 'wallet', kp.walletAddress)
  return kp
}

export function newIdentity () {
  const kp = generateKeypair()
  saveKeypair(kp, 'keypair')
}

export function setIdentity (id) {
  // Backwards compat: treat 64-char hex as a seed
  if (/^[a-f0-9]{64}$/i.test(id)) {
    importSeed(id)
    return
  }
  // Invalid format
  throw new Error('Invalid identity — must be 64 hex characters')
}

export function logout () {
  localStorage.removeItem('whaleroom_seed')
  localStorage.removeItem('whaleroom_public_key')
  localStorage.removeItem('whaleroom_auth_method')
  localStorage.removeItem('whaleroom_wallet_address')
  localStorage.removeItem('whaleroom_peer_id')
  localStorage.removeItem('whaleroom_onboarded')
  localStorage.removeItem('whaleroom_proof')
  batch(() => {
    myPublicKey.value = ''
    mySeedHex.value = ''
    mySecretKey.value = null
    myWalletAddress.value = ''
    authMethod.value = ''
    myPeerId.value = ''
    myUsername.value = ''
    myFollowing.value = new Set()
    myX25519.value = null
  })
  // No auto-generate — auth gate will show
}

// ── Feed switching ──
export function switchFeed (slug) {
  if (slug === activeFeed.value) return
  batch(() => {
    activeFeed.value = slug
    if (slug !== 'all' && slug !== 'following') selectedComposeFeed.value = slug
    pendingPosts.value = []
    hasMore.value = true
    feedLoading.value = true
  })
}
