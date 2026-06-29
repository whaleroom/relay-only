import nacl from 'tweetnacl'
import b4a from 'b4a'
import crypto from 'node:crypto'
import { getAllFeedBaseKeys, getEpochNumber } from './feed-keys.js'

// ── Per-user key delivery via Autobase ──
//
// The seed node encrypts feed base keys to each user's Ed25519 public key
// using nacl.box (X25519 curve25519 + XSalsa20-Poly1305). The encrypted
// grant is appended to the Autobase, so every P2P node replicates it.
//
// Clients fetch their grant from any node and decrypt locally.
// Relay nodes never hold base keys in plaintext.

// Convert Ed25519 keypair to X25519 (for nacl.box)
// The client derives its X25519 keypair from the same seed used for Ed25519
// and sends its X25519 public key to the server. The server doesn't need
// to convert — it receives the X25519 public key directly.

export function deriveX25519FromEd25519SecretKey (ed25519SecretKey) {
  // Ed25519 secret key in tweetnacl is 64 bytes: first 32 = seed, last 32 = public key
  // X25519 secret key = SHA-512(seed)[0:32] in libsodium, but tweetnacl uses a different approach:
  // nacl.box.keyPair.fromSecretKey expects a 32-byte X25519 secret key
  // The standard conversion: take the Ed25519 seed (first 32 bytes), hash with SHA-512, take first 32 bytes
  // tweetnacl doesn't have SHA-512, but it has nacl.box.keyPair.fromSecretKey
  // Actually, the simplest approach: the client generates a dedicated X25519 keypair
  // from the same seed used for their Ed25519 keypair.
  const seed = ed25519SecretKey.subarray(0, 32)
  const x25519 = nacl.box.keyPair.fromSecretKey(seed)
  return x25519
}

// Server-side: encrypt all feed base keys to a recipient's X25519 public key
// M10 fix: If FORWARD_ONLY_KEYS=true, encrypt only current epoch keys (not base keys)
// This prevents users who sell tokens from decrypting future posts after the current epoch
export function createKeyGrant (recipientX25519PubKeyHex) {
  const recipientPk = b4a.from(recipientX25519PubKeyHex, 'hex')
  const serverX25519 = getServerX25519Keypair()
  if (!serverX25519) return null

  const forwardOnly = process.env.FORWARD_ONLY_KEYS === 'true'
  const epoch = getEpochNumber()
  const encryptedKeys = {}

  if (forwardOnly) {
    // F7 fix: Encrypt epoch key hex string (same format as default path)
    // The client's decryptKeyGrant converts bytes to hex, matching this format.
    // Epoch info is stored in the grant wrapper, not in the encrypted payload.
    for (const [slug] of feedBaseKeysIter()) {
      const epochKey = getEpochKey(slug, epoch)
      if (!epochKey) continue
      const epochKeyHex = b4a.toString(epochKey, 'hex')
      const message = b4a.from(epochKeyHex, 'hex')
      const nonce = nacl.randomBytes(nacl.box.nonceLength)
      const box = nacl.box(message, nonce, recipientPk, serverX25519.secretKey)
      encryptedKeys[slug] = `${b4a.toString(nonce, 'hex')}:${b4a.toString(box, 'hex')}`
    }
  } else {
    // Encrypt base keys (default — allows deriving all epoch keys, past + present + future)
    const baseKeys = getAllFeedBaseKeys()
    if (!baseKeys || Object.keys(baseKeys).length === 0) return null

    for (const [slug, keyHex] of Object.entries(baseKeys)) {
      const message = b4a.from(keyHex, 'hex')
      const nonce = nacl.randomBytes(nacl.box.nonceLength)
      const box = nacl.box(message, nonce, recipientPk, serverX25519.secretKey)
      encryptedKeys[slug] = `${b4a.toString(nonce, 'hex')}:${b4a.toString(box, 'hex')}`
    }
  }

  return {
    encryptedKeys,
    serverX25519PubKey: b4a.toString(serverX25519.publicKey, 'hex'),
    grantEpoch: epoch,
    forwardOnly,
    timestamp: Date.now()
  }
}

// Helper to iterate feed base keys
function * feedBaseKeysIter () {
  // Import the Map from feed-keys module — we need access
  // Since feedBaseKeys is private to feed-keys.js, use getAllFeedBaseKeys
  const allKeys = getAllFeedBaseKeys()
  for (const [slug, keyHex] of Object.entries(allKeys)) {
    yield [slug, keyHex]
  }
}

// We need getEpochKey — import it
import { getEpochKey } from './feed-keys.js'

// Server X25519 keypair — dedicated key for key grants
// M6+L3 fix: Derive from env var (GRANT_X25519_KEY) or SHA-256(Autobase local key)
// This separates the grant encryption key from the Autobase writer key,
// so losing the data dir doesn't compromise past grants if env var is set.
let _serverX25519 = null

export function initServerX25519 (autobaseLocalKey) {
  // Prefer dedicated env var for key separation (M6 fix)
  const envKey = process.env.GRANT_X25519_KEY
  if (envKey && envKey.length === 64) {
    _serverX25519 = nacl.box.keyPair.fromSecretKey(b4a.from(envKey, 'hex'))
    console.log('key-grants: using dedicated X25519 key from GRANT_X25519_KEY env')
    return _serverX25519
  }
  // Fallback: derive from Autobase local key via SHA-256 (key separation from raw Ed25519)
  const hash = crypto.createHash('sha256').update(Buffer.from(autobaseLocalKey)).digest()
  _serverX25519 = nacl.box.keyPair.fromSecretKey(new Uint8Array(hash))
  return _serverX25519
}

export function getServerX25519Keypair () {
  return _serverX25519
}

export function getServerX25519PublicKeyHex () {
  return _serverX25519 ? b4a.toString(_serverX25519.publicKey, 'hex') : null
}

// Client-side: decrypt a key grant using your X25519 secret key
export function decryptKeyGrant (encryptedKeys, serverX25519PubKeyHex, clientX25519SecretKey) {
  const serverPk = b4a.from(serverX25519PubKeyHex, 'hex')
  const decrypted = {}

  for (const [slug, packed] of Object.entries(encryptedKeys)) {
    try {
      const [nonceHex, boxHex] = packed.split(':')
      const nonce = b4a.from(nonceHex, 'hex')
      const box = b4a.from(boxHex, 'hex')
      const opened = nacl.box.open(box, nonce, serverPk, clientX25519SecretKey)
      if (opened) {
        decrypted[slug] = b4a.toString(opened, 'hex')
      }
    } catch { /* skip failed decryption */ }
  }

  return Object.keys(decrypted).length > 0 ? decrypted : null
}

// Query the Autobase view for a user's latest key grant
export async function getKeyGrantForRecipient (view, recipientPubKeyHex) {
  const entry = await view.get(`key-grant:${recipientPubKeyHex}`)
  if (!entry) return null
  return JSON.parse(entry.value)
}

// Check if a recipient has been revoked
export async function isRecipientRevoked (view, recipientPubKeyHex) {
  const entry = await view.get(`key-revoke:${recipientPubKeyHex}`)
  if (!entry) return false
  const revoke = JSON.parse(entry.value)
  const grant = await getKeyGrantForRecipient(view, recipientPubKeyHex)
  if (!grant) return true
  // Revoked after grant
  return revoke.timestamp > grant.timestamp
}
