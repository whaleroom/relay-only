import nacl from 'tweetnacl'
import b4a from 'b4a'
import crypto from 'node:crypto'
import { verifyProof } from './token-gate.js'

// ── Epoch-based feed key rotation ──
//
// Each feed has a base encryption key — a random 32-byte secret
// that is NOT derivable from the public feed ID. The seed node
// generates these keys on first boot (via bootstrap.js) and stores
// them in env vars (FEED_KEY_<SLUG>). Peer nodes receive keys only
// via the token-gated API (/api/feeds/keys) after proving they hold
// the required token balance.
//
// Per-epoch keys are derived via HMAC-SHA256(baseKey, epochNumber).
// Posts are tagged with their epoch number so clients know which key to use.
//
// Epoch length: 1 hour (3600000 ms). All nodes compute the same epoch
// keys independently from the base key — no coordination needed.
//
// Exclusion: clients must re-verify token holdings periodically.
// If verification fails, client clears all feed keys from memory.
// A user who sells their tokens is excluded within 1 epoch (1 hour)
// and regains access automatically when they re-qualify.

const EPOCH_MS = 3600000 // 1 hour

const feedBaseKeys = new Map() // slug -> Uint8Array(32) base key

export function initFeedKeys (FEEDS) {
  let initialized = 0
  let missing = 0
  for (const [slug, feed] of Object.entries(FEEDS)) {
    if (feed.keyHex && feed.keyHex.length === 64) {
      feedBaseKeys.set(slug, b4a.from(feed.keyHex, 'hex'))
      initialized++
    } else {
      // No encryption key — feed will operate unencrypted until key is provided
      missing++
    }
  }
  if (missing > 0) {
    console.warn(`feed-keys: WARNING — ${missing} feed(s) missing encryption keys. Run bootstrap.js to generate.`)
  }
  console.log(`feed-keys: initialized ${initialized} feed base keys (epoch rotation: ${EPOCH_MS / 60000}min)`)
}

export function getEpochNumber (timestamp = Date.now()) {
  return Math.floor(timestamp / EPOCH_MS)
}

export function getEpochKey (slug, epochNum) {
  const baseKey = feedBaseKeys.get(slug)
  if (!baseKey) return null
  // HMAC-SHA256(baseKey, epochNum) → 32-byte epoch key
  const hmac = crypto.createHmac('sha256', Buffer.from(baseKey))
  hmac.update(String(epochNum))
  return new Uint8Array(hmac.digest().subarray(0, 32))
}

export function getCurrentEpochKey (slug) {
  return getEpochKey(slug, getEpochNumber())
}

export function getFeedBaseKey (slug) {
  return feedBaseKeys.get(slug)
}

export function hasFeedKey (slug) {
  return feedBaseKeys.has(slug)
}

// Return base keys (needed by client to derive all epoch keys independently)
// Only returns keys that have been explicitly set — never derives from feed ID.
export function getAllFeedBaseKeys () {
  const out = {}
  for (const [slug, key] of feedBaseKeys) {
    out[slug] = b4a.toString(key, 'hex')
  }
  return out
}

export function setFeedKey (slug, keyHex) {
  if (keyHex && keyHex.length === 64) {
    feedBaseKeys.set(slug, b4a.from(keyHex, 'hex'))
  }
}

// Check if text is already encrypted (matches epoch or legacy format)
export function isEncrypted (text) {
  if (typeof text !== 'string') return false
  if (/^\d+:[0-9a-f]{48}:[0-9a-f]+$/.test(text)) return true
  if (/^[0-9a-f]{48}:[0-9a-f]+$/.test(text)) return true
  return false
}

// Encrypt post text for the current epoch. Returns packed ciphertext.
export function encryptPost (plaintext, feedSlug) {
  const baseKey = feedBaseKeys.get(feedSlug)
  if (!baseKey) return { text: plaintext, enc: false }
  const epoch = getEpochNumber()
  const epochKey = getEpochKey(feedSlug, epoch)
  const message = new TextEncoder().encode(plaintext)
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const box = nacl.secretbox(message, nonce, epochKey)
  // Pack as: epoch:nonce(hex):ciphertext(hex)
  const packed = `${epoch}:${b4a.toString(nonce, 'hex')}:${b4a.toString(box, 'hex')}`
  return { text: packed, enc: true }
}

// Decrypt post text. packedText format: "epoch:nonce:ciphertext"
export function decryptPost (packedText, feedSlug) {
  if (!packedText || typeof packedText !== 'string') return packedText
  const parts = packedText.split(':')
  if (parts.length !== 3) {
    // Legacy format (no epoch prefix) — try old 2-part format
    if (parts.length === 2) {
      const baseKey = feedBaseKeys.get(feedSlug)
      if (!baseKey) return null
      const nonce = b4a.from(parts[0], 'hex')
      const box = b4a.from(parts[1], 'hex')
      const opened = nacl.secretbox.open(box, nonce, baseKey)
      if (!opened) return null
      return new TextDecoder().decode(opened)
    }
    return null
  }
  const epoch = parseInt(parts[0], 10)
  const epochKey = getEpochKey(feedSlug, epoch)
  if (!epochKey) return null
  const nonce = b4a.from(parts[1], 'hex')
  const box = b4a.from(parts[2], 'hex')
  const opened = nacl.secretbox.open(box, nonce, epochKey)
  if (!opened) return null
  return new TextDecoder().decode(opened)
}

// Verify a proof and return all feed base keys if valid.
// Clients use base keys to derive epoch keys for any epoch (past + present).
// This means re-qualified users get access to historical posts too.
// If you want forward-only access, return only the current epoch key instead.
export async function getFeedKeysForProof (proof) {
  const result = await verifyProof(proof.address, proof.signature, proof.nonce, proof.timestamp)
  if (!result.valid) return null
  return getAllFeedBaseKeys()
}

// Get all epoch keys a client needs (current + all past epochs).
// Clients can derive these locally from the base key, so this is
// only used if we want server-side epoch key distribution.
export function getEpochKeysForProof (proof, slug) {
  // Not currently used — clients derive epoch keys from base key
  return null
}
