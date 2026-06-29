import { readBody } from '../http.js'
import {
  isTokenGateEnabled, getGateConfig, verifyProof, checkHoldings,
  getTokenBalances, createSyncCode, redeemSyncCode
} from '../token-gate.js'
import { getEffectiveGateConfig } from '../gate-config.js'

export const tokenGateRoutes = [
  {
    path: '/api/token-gate/config',
    method: 'GET',
    skipReady: false,
    async handler (req, res, url, ctx) {
      // Read gate config from Autobase (published by seed node).
      // Non-seed nodes don't need TOKEN_CONTRACT/MIN_BALANCE env vars.
      const config = await getEffectiveGateConfig(ctx)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(config))
    }
  },
  {
    path: '/api/token-gate/verify',
    method: 'POST',
    skipReady: true,
    async handler (req, res) {
      const body = await readBody(req)
      let parsed
      try { parsed = JSON.parse(body) } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ valid: false, reason: 'invalid JSON' }))
        return
      }

      const { address, signature, nonce, timestamp } = parsed
      if (!address || !signature || nonce == null || !timestamp) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ valid: false, reason: 'missing fields' }))
        return
      }

      let result
      try {
        result = await verifyProof(address, signature, nonce, timestamp)
      } catch (err) {
        console.error('[token-gate] verifyProof error:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ valid: false, reason: 'server error: ' + err.message }))
        return
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result))
    }
  },
  {
    path: '/api/token-gate/check',
    method: 'GET',
    skipReady: true,
    async handler (req, res, url) {
      // F17 fix: Don't expose whether an arbitrary address holds tokens.
      // Only return a boolean — sufficient for the client UI, not for enumeration.
      const address = url.searchParams.get('address')
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ valid: false, reason: 'valid address required' }))
        return
      }
      const result = await checkHoldings(address)
      // Only return valid boolean + symbol, not the actual balance
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ valid: result.valid, symbol: result.symbol || null }))
    }
  },
  {
    path: '/api/token-gate/sync-code',
    method: 'POST',
    skipReady: true,
    async handler (req, res) {
      const body = await readBody(req)
      let parsed
      try { parsed = JSON.parse(body) } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'invalid JSON' }))
        return
      }

      const { address, signature, nonce, timestamp } = parsed
      if (!address || !signature || nonce == null || !timestamp) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'missing proof fields' }))
        return
      }

      const result = await verifyProof(address, signature, nonce, timestamp)
      if (!result.valid) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: result.reason || 'proof invalid' }))
        return
      }

      const code = createSyncCode({ address, signature, nonce, timestamp })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ code, expiresIn: 60 }))
    }
  },
  {
    path: '/api/token-gate/sync',
    method: 'POST',
    skipReady: true,
    async handler (req, res) {
      const body = await readBody(req)
      let parsed
      try { parsed = JSON.parse(body) } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'invalid JSON' }))
        return
      }

      const { code } = parsed
      if (!code || !/^\d{6}$/.test(code)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'valid 6-digit code required' }))
        return
      }

      const result = redeemSyncCode(code)
      if (!result) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'code not found or expired' }))
        return
      }

      const proof = result.proof
      const verification = await verifyProof(proof.address, proof.signature, proof.nonce, proof.timestamp)
      if (!verification.valid) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: verification.reason || 'proof no longer valid' }))
        return
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        valid: true,
        address: proof.address,
        signature: proof.signature,
        nonce: proof.nonce,
        timestamp: proof.timestamp
      }))
    }
  },
  {
    path: '/api/token-gate/balances',
    method: 'GET',
    skipReady: true,
    async handler (req, res, url) {
      // F17 revert: Allow balance lookup without proof — rate limiting (F5) mitigates enumeration.
      // Balance data is publicly available on Etherscan anyway; requiring proof breaks the UI widget.
      const address = url.searchParams.get('address')
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'valid address required' }))
        return
      }
      try {
        const balances = await getTokenBalances(address)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ balances }))
      } catch (err) {
        res.writeHead(502, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'failed to fetch balances', detail: err.message }))
      }
    }
  }
]
