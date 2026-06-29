import { readBody } from '../http.js'
import { verifyProof } from '../token-gate.js'
import { createKeyGrant, getKeyGrantForRecipient, isRecipientRevoked, getServerX25519PublicKeyHex } from '../key-grants.js'
import { hasFeedKey } from '../feed-keys.js'
import { verifyBalanceProof } from '../storage-proof.js'
import { verifyZKBalanceProof, hasZKCircuitArtifacts, getZKeyPath, getWasmPath, computeRecipientHash } from '../zk-verify.js'
import { verifyAndExtractAuthor } from '../auth.js'
import fs from 'node:fs'

// POST /api/key-grant — seed node only: verify proof, encrypt keys, append to Autobase
async function handleKeyGrantRequest (req, res, url, ctx) {
  if (!ctx.base || !ctx.base.writable) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'This node cannot issue key grants' }))
    return
  }

  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return
  }

  const { proof, x25519PubKey, storageProof, zkProof, zkPublicSignals } = parsed
  if (!x25519PubKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'x25519PubKey required' }))
    return
  }

  if (!/^[a-f0-9]{64}$/i.test(x25519PubKey)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'x25519PubKey must be 64 hex chars' }))
    return
  }

  // Three verification paths:
  // 1. ZK proof (privacy-preserving): client proves balance >= threshold in ZK
  // 2. Storage proof (trustless): client proves balance via Merkle-Patricia trie
  // 3. EIP-712 proof (legacy fallback): server checks balance via RPC
  let verified = false
  let verifiedAddress = null
  let isZKPath = false

  if (zkProof && zkPublicSignals) {
    if (!hasZKCircuitArtifacts()) {
      res.writeHead(503, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'ZK verification not available on this node' }))
      return
    }
    // ZK path REQUIRES a storage proof to bind the ZK proof to on-chain state.
    // The client cannot just claim any balance — the server verifies the
    // storage proof to get the real balance, then checks that the ZK proof's
    // public threshold signal matches the server's expected threshold.
    if (!storageProof) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'ZK proof requires a storage proof to bind to on-chain state' }))
      return
    }

    // Step 1: Verify the storage proof — get the real balance + address
    const spResult = await verifyBalanceProof(storageProof)
    if (!spResult.valid) {
      console.log('[key-grant] ZK path: storage proof rejected:', spResult.reason)
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Storage proof invalid: ' + spResult.reason }))
      return
    }

    // Step 2: Verify the ZK proof — proves balance >= threshold, bound to recipient
    const threshold = process.env.TOKEN_MIN_BALANCE || '280'
    const thresholdWei = (BigInt(threshold) * BigInt(10) ** BigInt(18)).toString()
    const expectedRecipientHash = computeRecipientHash(x25519PubKey)
    const zkResult = await verifyZKBalanceProof(zkProof, zkPublicSignals, thresholdWei, expectedRecipientHash)
    if (zkResult.valid) {
      verified = true
      isZKPath = true
    } else {
      console.log('[key-grant] ZK path: ZK proof rejected:', zkResult.reason)
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'ZK proof invalid: ' + zkResult.reason }))
      return
    }
  } else if (storageProof) {
    const result = await verifyBalanceProof(storageProof)
    if (result.valid) {
      verified = true
      verifiedAddress = result.address
    } else {
      console.log('[key-grant] storage proof path rejected:', result.reason)
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Storage proof invalid: ' + result.reason }))
      return
    }
  } else if (proof) {
    const result = await verifyProof(proof.address, proof.signature, proof.nonce, proof.timestamp)
    if (result.valid) {
      verified = true
      verifiedAddress = result.address
    } else {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: result.reason || 'Invalid proof' }))
      return
    }
  } else {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Either zkProof, storageProof, or proof (EIP-712) is required' }))
    return
  }

  // Make sure we have feed keys to grant
  if (!hasFeedKey(Object.keys(ctx.FEEDS)[0])) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'No feed keys available on this node' }))
    return
  }

  // Create encrypted key grant
  const grant = createKeyGrant(x25519PubKey)
  if (!grant) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Failed to create key grant' }))
    return
  }

  // Append to Autobase — all P2P nodes will replicate this
  // Include ethAddress for non-ZK paths so the revocation loop can re-check balance
  const op = {
    type: 'key-grant',
    recipient: x25519PubKey,
    encryptedKeys: grant.encryptedKeys,
    serverX25519PubKey: grant.serverX25519PubKey,
    grantEpoch: grant.grantEpoch,
    timestamp: grant.timestamp
  }
  // Only store ethAddress for non-ZK paths so the revocation loop can re-check balance
  // ZK path intentionally hides the address for privacy
  if (verifiedAddress && !isZKPath) {
    op.ethAddress = verifiedAddress
  }

  try {
    await ctx.base.append(JSON.stringify(op))
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Failed to publish key grant: ' + err.message }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    ok: true,
    recipient: x25519PubKey,
    serverX25519PubKey: grant.serverX25519PubKey,
    grantEpoch: grant.grantEpoch
  }))
}

// GET /api/key-grant?recipient=<x25519PubKey> — any node: return the user's encrypted key grant
async function handleKeyGrantFetch (req, res, url, ctx) {
  const recipient = url.searchParams.get('recipient')
  if (!recipient || !/^[a-f0-9]{64}$/i.test(recipient)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'valid recipient (64 hex chars) required' }))
    return
  }

  if (!ctx.ready) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'starting up' }))
    return
  }

  await ctx.base.update()

  // L1 fix: Uniform error for revoked and not-found (prevent information leakage)
  const revoked = await isRecipientRevoked(ctx.base.view, recipient)
  if (revoked) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'No key grant found' }))
    return
  }

  const grant = await getKeyGrantForRecipient(ctx.base.view, recipient)
  if (!grant) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'No key grant found' }))
    return
  }

  // M11 fix: Re-check revocation after fetching grant (race condition mitigation)
  // F14 fix: Use same 404 status code as the first check (prevent timing side-channel)
  const revokedAfterFetch = await isRecipientRevoked(ctx.base.view, recipient)
  if (revokedAfterFetch) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'No key grant found' }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(grant))
}

// GET /api/key-grant/server-pubkey — any node: return the seed node's X25519 public key
async function handleServerPubKey (req, res, url, ctx) {
  const pubKey = getServerX25519PublicKeyHex()
  if (!pubKey) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Server X25519 key not initialized' }))
    return
  }
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ serverX25519PubKey: pubKey }))
}

// POST /api/key-grant/revoke — seed node only: revoke a key grant
// Protected: requires a signature from the node's Ed25519 key
async function handleKeyGrantRevoke (req, res, url, ctx) {
  if (!ctx.base || !ctx.base.writable) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'This node cannot revoke key grants' }))
    return
  }

  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return
  }

  const { recipient, signature } = parsed
  if (!recipient || !/^[a-f0-9]{64}$/i.test(recipient)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'valid recipient (64 hex chars) required' }))
    return
  }

  // H2 fix: Require a signature proving the request is authorized by the seed node
  // The signature is over the recipient hex string, verified against the node's public key
  if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Valid signature required for revocation' }))
    return
  }

  // F1 fix: Explicitly check for error before accessing author
  const authResult = verifyAndExtractAuthor({ signature, publicKey: ctx.localKey, recipient }, ctx.shortKey)
  if (authResult.error || authResult.author !== ctx.shortKey) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Revocation not authorized — must be signed by seed node operator' }))
    return
  }

  try {
    await ctx.base.append(JSON.stringify({
      type: 'key-revoke',
      recipient,
      timestamp: Date.now()
    }))
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Failed to publish revocation: ' + err.message }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true, revoked: recipient }))
}

// POST /api/key-grant/verify-storage — any node: verify a storage proof (no key issuance)
async function handleVerifyStorage (req, res, url, ctx) {
  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return
  }

  const result = await verifyBalanceProof(parsed)
  res.writeHead(result.valid ? 200 : 403, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

// GET /api/circuits/main.wasm — serve the circuit WASM for client-side proof generation
async function handleCircuitWasm (req, res, url, ctx) {
  const wasmPath = getWasmPath()
  if (!wasmPath) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Circuit WASM not available' }))
    return
  }
  const data = fs.readFileSync(wasmPath)
  res.writeHead(200, { 'Content-Type': 'application/wasm' })
  res.end(data)
}

// GET /api/circuits/circuit_final.zkey — serve the circuit zkey
async function handleCircuitZKey (req, res, url, ctx) {
  const zkeyPath = getZKeyPath()
  if (!zkeyPath) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Circuit zkey not available' }))
    return
  }
  const data = fs.readFileSync(zkeyPath)
  res.writeHead(200, { 'Content-Type': 'application/octet-stream' })
  res.end(data)
}

// GET /api/circuits/available — check if ZK circuit artifacts are available
async function handleCircuitAvailable (req, res, url, ctx) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ available: hasZKCircuitArtifacts() }))
}

export const keyGrantRoutes = [
  { method: 'POST', path: '/api/key-grant', handler: handleKeyGrantRequest },
  { method: 'GET', path: '/api/key-grant', handler: handleKeyGrantFetch },
  { method: 'POST', path: '/api/key-grant/revoke', handler: handleKeyGrantRevoke },
  { method: 'GET', path: '/api/key-grant/server-pubkey', handler: handleServerPubKey },
  { method: 'POST', path: '/api/key-grant/verify-storage', handler: handleVerifyStorage, skipReady: true },
  { method: 'GET', path: '/api/circuits/main.wasm', handler: handleCircuitWasm, skipReady: true },
  { method: 'GET', path: '/api/circuits/circuit_final.zkey', handler: handleCircuitZKey, skipReady: true },
  { method: 'GET', path: '/api/circuits/available', handler: handleCircuitAvailable, skipReady: true }
]
