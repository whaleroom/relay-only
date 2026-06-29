import { checkHoldings } from './token-gate.js'
import { getKeyGrantForRecipient, isRecipientRevoked } from './key-grants.js'

// ── Background Grant Revocation ──
//
// The seed node periodically scans all key grants on the Autobase and
// re-checks the token balance of each recipient. If a user no longer
// holds sufficient tokens, a key-revoke op is appended.
//
// This ensures that users who sell their tokens are excluded within
// the re-check interval, not just from new grants but from existing ones.

const REVOKE_CHECK_INTERVAL = 15 * 60 * 1000 // 15 minutes

export function startRevocationLoop (ctx) {
  if (!ctx.base || !ctx.base.writable) return

  async function checkGrants () {
    try {
      await ctx.base.update()
      const grants = []
      for await (const entry of ctx.base.view.createReadStream({
        gte: 'key-grant:',
        lt: 'key-grant:\xff'
      })) {
        const grant = JSON.parse(entry.value)
        if (grant.type === 'key-grant') {
          // Skip already-revoked grants
          const revoked = await isRecipientRevoked(ctx.base.view, grant.recipient)
          if (!revoked) {
            grants.push(grant)
          }
        }
      }

      console.log(`[revocation] checking ${grants.length} active grants`)

      for (const grant of grants) {
        // The recipient is an X25519 public key, not an Ethereum address.
        // We need to map it back to an address. The key-grant op doesn't
        // store the Ethereum address (by design — for privacy in ZK path).
        // For the legacy/storage-proof path, we stored it in the op.
        // For the ZK path, we can't re-check on-chain balance because
        // we don't know the address.
        //
        // Solution: key-grant ops now include the verified address (for
        // non-ZK paths). For ZK-only grants, revocation relies on the
        // epoch rotation + the client's periodic re-verification.
        const ethAddress = grant.ethAddress
        if (!ethAddress) {
          // ZK-only grant — can't re-verify on-chain. Skip.
          // Epoch rotation limits exposure to 1 hour.
          continue
        }

        try {
          const result = await checkHoldings(ethAddress)
          if (!result.valid) {
            console.log(`[revocation] revoking grant for ${ethAddress.slice(0, 10)}... (insufficient balance)`)
            await ctx.base.append(JSON.stringify({
              type: 'key-revoke',
              recipient: grant.recipient,
              ethAddress,
              timestamp: Date.now()
            }))
          }
        } catch (err) {
          console.error(`[revocation] check failed for ${ethAddress.slice(0, 10)}...:`, err.message)
        }

        // Small delay between checks to avoid RPC rate limits
        await new Promise(r => setTimeout(r, 500))
      }
    } catch (err) {
      console.error('[revocation] loop error:', err.message)
    }
  }

  // Start after initial delay to let the node sync
  const timer = setInterval(checkGrants, REVOKE_CHECK_INTERVAL)
  setTimeout(checkGrants, 30_000) // first check after 30s

  return () => clearInterval(timer)
}
