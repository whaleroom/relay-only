import nacl from 'tweetnacl'

export function hexToBytes (hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

// L4 fix: Deep canonical JSON — recursively sort all object keys
export function canonicalize (obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']'
  const keys = Object.keys(obj).sort()
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}'
}

export function verifyAndExtractAuthor (parsed, fallbackAuthor) {
  const { signature, publicKey, author: clientAuthor, ...payload } = parsed
  // Signed operation — verify cryptographically
  if (signature && publicKey) {
    if (!/^[a-f0-9]{128}$/i.test(signature)) return { error: 'invalid signature format' }
    if (!/^[a-f0-9]{64}$/i.test(publicKey)) return { error: 'invalid public key format' }
    const message = new TextEncoder().encode(canonicalize(payload))
    const sigBytes = hexToBytes(signature)
    const pkBytes = hexToBytes(publicKey)
    const valid = nacl.sign.detached.verify(message, sigBytes, pkBytes)
    if (!valid) return { error: 'signature verification failed' }
    const author = publicKey.slice(0, 8).toLowerCase()
    return { author, verified: true }
  }
  // M8 fix: No unsigned fallback — require signatures for all operations
  return { error: 'signature required' }
}
