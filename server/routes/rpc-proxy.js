import { readBody } from '../http.js'
import { RPC_URLS } from '../token-gate.js'

const ALLOWED_METHODS = new Set([
  'eth_call',
  'eth_blockNumber',
  'eth_chainId',
  'eth_getBalance',
  'eth_getCode',
  'eth_getProof',
  'eth_getTransactionReceipt',
  'eth_getLogs',
  'eth_getStorageAt',
  'eth_getTransactionByHash',
  'eth_getBlockByNumber',
  'eth_getBlockByHash',
  'net_version',
  'web3_clientVersion'
])

export const rpcProxyRoutes = [
  {
    path: '/api/rpc',
    method: 'POST',
    skipReady: true,
    async handler (req, res) {
      let parsed
      try {
        parsed = JSON.parse(await readBody(req))
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'invalid JSON' }))
        return
      }

      const method = parsed.method || ''
      if (!ALLOWED_METHODS.has(method)) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: `method "${method}" not allowed` }))
        return
      }

      let lastErr
      for (const url of RPC_URLS) {
        try {
          const upstream = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed)
          })
          const text = await upstream.text()
          res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
          res.end(text)
          return
        } catch (err) {
          lastErr = err
        }
      }

      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'all RPC providers failed', detail: lastErr?.message }))
    }
  }
]
