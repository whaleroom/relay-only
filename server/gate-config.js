import { getGateConfig } from './token-gate.js'

// ── Gate config distribution via Autobase ──
//
// The seed node publishes token gate config (contract addresses, min balances,
// chain ID, EIP-712 domain) to the Autobase as a gate-config op.
// Non-seed nodes read it from the replicated view — they don't need
// TOKEN_CONTRACT, TOKEN_MIN_BALANCE etc. in their env vars.
//
// This ensures the seed node is the only one that knows the threshold.
// Non-seed nodes serve the config to clients but can't modify it.

let _cachedConfig = null

// Seed node: publish gate config to the Autobase
export async function publishGateConfig (ctx) {
  if (!ctx.base || !ctx.base.writable) return

  const config = getGateConfig()
  if (!config.enabled) return

  const op = {
    type: 'gate-config',
    config: {
      enabled: config.enabled,
      tokenContract: config.tokenContract,
      chainId: config.chainId,
      domain: config.domain,
      types: config.types,
      minBalance: config.minBalance,
      requirements: config.requirements
    },
    timestamp: Date.now()
  }

  try {
    await ctx.base.append(JSON.stringify(op))
    console.log('[gate-config] published to Autobase')
  } catch (err) {
    console.error('[gate-config] failed to publish:', err.message)
  }
}

// Any node: read gate config from the Autobase view
export async function getGateConfigFromView (ctx) {
  if (!ctx.base || !ctx.ready) return null

  try {
    await ctx.base.update()
    const entry = await ctx.base.view.get('gate-config')
    if (!entry) return null
    const data = JSON.parse(entry.value)
    _cachedConfig = data.config
    return data.config
  } catch {
    return null
  }
}

// Get the effective gate config — from Autobase view first, then env fallback
export async function getEffectiveGateConfig (ctx) {
  const viewConfig = await getGateConfigFromView(ctx)
  if (viewConfig) return viewConfig

  // Fallback to env-based config (seed node or before Autobase syncs)
  return getGateConfig()
}
