import nacl from 'tweetnacl'

// ── Hex conversions ──

export function bytesToHex (bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

export function hexToBytes (hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

// ── iOS detection ──
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

// ── Deterministic JSON serialization (sorted keys) ──

// L4 fix: Deep canonical JSON — recursively sort all object keys
export function canonicalize (obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']'
  const keys = Object.keys(obj).sort()
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}'
}

// ── Keypair generation ──

export function generateKeypair () {
  const seed = nacl.randomBytes(32)
  return keypairFromSeed(bytesToHex(seed))
}

export function keypairFromSeed (seedHex) {
  const seed = hexToBytes(seedHex.toLowerCase())
  const kp = nacl.sign.keyPair.fromSeed(seed)
  return {
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
    seed,
    publicKeyHex: bytesToHex(kp.publicKey),
    seedHex: bytesToHex(seed)
  }
}

// ── EIP-6963 wallet discovery ──

export async function discoverWallets (timeout = 1500) {
  return new Promise(resolve => {
    const wallets = []
    function onAnnounce (event) {
      const { info, provider } = event.detail
      if (info && provider) wallets.push({ info, provider })
    }
    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    // Poll for window.ethereum in case the extension injects late
    const pollInterval = setInterval(() => {
      if (wallets.length === 0 && window.ethereum) {
        wallets.push({
          info: { name: 'Browser Wallet', icon: null, uuid: 'fallback', rdns: 'unknown' },
          provider: window.ethereum
        })
      }
    }, 200)

    setTimeout(() => {
      clearInterval(pollInterval)
      window.removeEventListener('eip6963:announceProvider', onAnnounce)
      // Final fallback check
      if (wallets.length === 0 && window.ethereum) {
        wallets.push({
          info: { name: 'Browser Wallet', icon: null, uuid: 'fallback', rdns: 'unknown' },
          provider: window.ethereum
        })
      }
      resolve(wallets)
    }, timeout)
  })
}

// ── Wallet → Ed25519 keypair derivation ──

async function requestAccounts (eth) {
  // Strategy 1: standard eth_requestAccounts
  try {
    return await eth.request({ method: 'eth_requestAccounts' })
  } catch (err) {
    const msg = err?.message || ''
    if (err?.code !== 5000 && err?.code !== 4001 && err?.code !== -32603 && !/caip.?25/i.test(msg)) throw err
  }

  // Strategy 2: wallet_requestPermissions + eth_accounts
  try {
    await eth.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    })
    return await eth.request({ method: 'eth_accounts' })
  } catch (err) {
    const msg = err?.message || ''
    // Swallow CAIP-25 scope errors, user rejections, and unsupported method errors (e.g. Phantom)
    if (!/authorizedScopes|bip122|caip.?25/i.test(msg) && err?.code !== 5000 && err?.code !== 4001 && err?.code !== -32603) throw err
  }

  // Strategy 3: eth_accounts directly — permission may already exist
  const accounts = await eth.request({ method: 'eth_accounts' })
  if (accounts?.length) return accounts

  throw new Error('Wallet returned no accounts. If you have a Bitcoin Snap enabled, try disabling it and reconnecting.')
}

export async function keypairFromWallet (provider) {
  const eth = provider || window.ethereum
  if (!eth) throw new Error('No wallet detected')
  const accounts = await requestAccounts(eth)
  const address = accounts[0]
  // Deterministic message — FROZEN, never change this format
  const message = `Whaleroom Identity\nAddress: ${address}`
  const signature = await eth.request({
    method: 'personal_sign',
    params: [message, address]
  })
  // Hash signature → 32-byte Ed25519 seed
  const sigBytes = hexToBytes(signature.slice(2)) // strip 0x
  const hashBuffer = await crypto.subtle.digest('SHA-256', sigBytes)
  const seed = new Uint8Array(hashBuffer)
  const kp = nacl.sign.keyPair.fromSeed(seed)
  return {
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
    seed,
    publicKeyHex: bytesToHex(kp.publicKey),
    seedHex: bytesToHex(seed),
    walletAddress: address
  }
}

// ── Sign an operation ──

export function signOperation (op, secretKey) {
  const { signature: _, publicKey: __, ...payload } = op
  const message = new TextEncoder().encode(canonicalize(payload))
  const sig = nacl.sign.detached(message, secretKey)
  return {
    ...payload,
    signature: bytesToHex(sig),
    publicKey: bytesToHex(secretKey.subarray(32)) // last 32 bytes = public key
  }
}

// ── Verify an operation (used server-side, exported for symmetry) ──

export function verifyOperation (op) {
  const { signature, publicKey, ...payload } = op
  if (!signature || !publicKey) return { valid: false }
  try {
    const message = new TextEncoder().encode(canonicalize(payload))
    const sigBytes = hexToBytes(signature)
    const pkBytes = hexToBytes(publicKey)
    const valid = nacl.sign.detached.verify(message, sigBytes, pkBytes)
    return {
      valid,
      author: valid ? publicKey.slice(0, 8).toLowerCase() : null,
      payload
    }
  } catch {
    return { valid: false }
  }
}

// ── Symmetric encryption (tweetnacl secretbox: XSalsa20-Poly1305) ──
// Epoch-based key rotation: epoch = floor(timestamp / 3600000)
// Epoch key = HMAC-SHA256(baseKey, epoch) using Web Crypto API

export const EPOCH_MS = 3600000

export function getEpochNumber (timestamp = Date.now()) {
  return Math.floor(timestamp / EPOCH_MS)
}

export async function deriveEpochKey (baseKeyHex, epochNum) {
  const baseKey = hexToBytes(baseKeyHex)
  const keyData = await crypto.subtle.importKey(
    'raw', baseKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', keyData, new TextEncoder().encode(String(epochNum)))
  return new Uint8Array(sig)
}

export async function encryptText (plaintext, baseKeyHex) {
  if (!baseKeyHex) return plaintext
  const epoch = getEpochNumber()
  const epochKey = await deriveEpochKey(baseKeyHex, epoch)
  const message = new TextEncoder().encode(plaintext)
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const box = nacl.secretbox(message, nonce, epochKey)
  return `${epoch}:${bytesToHex(nonce)}:${bytesToHex(box)}`
}

export async function decryptText (packed, baseKeyHex) {
  if (!packed || typeof packed !== 'string' || !baseKeyHex) return null
  const parts = packed.split(':')
  try {
    if (parts.length === 3) {
      // Epoch format: epoch:nonce:ciphertext
      const epoch = parseInt(parts[0], 10)
      const epochKey = await deriveEpochKey(baseKeyHex, epoch)
      const nonce = hexToBytes(parts[1])
      const box = hexToBytes(parts[2])
      const opened = nacl.secretbox.open(box, nonce, epochKey)
      if (!opened) return null
      return new TextDecoder().decode(opened)
    } else if (parts.length === 2) {
      // Legacy format: nonce:ciphertext (base key)
      const key = hexToBytes(baseKeyHex)
      const nonce = hexToBytes(parts[0])
      const box = hexToBytes(parts[1])
      const opened = nacl.secretbox.open(box, nonce, key)
      if (!opened) return null
      return new TextDecoder().decode(opened)
    }
    return null
  } catch {
    return null
  }
}

export function isEncrypted (text) {
  if (typeof text !== 'string') return false
  // Epoch format: epoch:nonce:ciphertext
  if (/^\d+:[0-9a-f]{48}:[0-9a-f]+$/.test(text)) return true
  // Legacy format: nonce:ciphertext
  if (/^[0-9a-f]{48}:[0-9a-f]+$/.test(text)) return true
  return false
}

// ── X25519 key derivation (for P2P key grants) ──
// Derive an X25519 keypair from the user's Ed25519 seed
// M5 fix: hash the seed with SHA-256 before using as X25519 secret key
// to ensure key separation between signing (Ed25519) and encryption (X25519)

export async function deriveX25519FromSeed (seedHex) {
  const seed = hexToBytes(seedHex.toLowerCase())
  // Hash the Ed25519 seed to derive a separate X25519 secret key
  const hashBuffer = await crypto.subtle.digest('SHA-256', seed)
  const x25519Seed = new Uint8Array(hashBuffer)
  const x25519 = nacl.box.keyPair.fromSecretKey(x25519Seed)
  return {
    publicKey: x25519.publicKey,
    secretKey: x25519.secretKey,
    publicKeyHex: bytesToHex(x25519.publicKey)
  }
}

// Decrypt a key grant: each feed's base key is encrypted with nacl.box
// encryptedKeys: { slug: "nonceHex:boxHex", ... }
// serverX25519PubKeyHex: hex string of server's X25519 public key
// clientX25519SecretKey: Uint8Array(32) of client's X25519 secret key
export function decryptKeyGrant (encryptedKeys, serverX25519PubKeyHex, clientX25519SecretKey) {
  const serverPk = hexToBytes(serverX25519PubKeyHex)
  const decrypted = {}

  for (const [slug, packed] of Object.entries(encryptedKeys)) {
    try {
      const [nonceHex, boxHex] = packed.split(':')
      const nonce = hexToBytes(nonceHex)
      const box = hexToBytes(boxHex)
      const opened = nacl.box.open(box, nonce, serverPk, clientX25519SecretKey)
      if (opened) {
        decrypted[slug] = bytesToHex(opened)
      }
    } catch { /* skip */ }
  }

  return Object.keys(decrypted).length > 0 ? decrypted : null
}
