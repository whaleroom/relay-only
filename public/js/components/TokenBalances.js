import { html, useEffect, useState } from '../deps.js'
import { myWalletAddress, tokenGateVerified, tokenGateEnabled, performTokenGateVerification, showToast } from '../state.js'
import { fetchTokenBalances } from '../api.js'

function formatBalance (b) {
  if (b.error) return '\u2014'
  return parseFloat(b.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export function TokenBalances () {
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [showUpgradeTip, setShowUpgradeTip] = useState(false)
  const wallet = myWalletAddress.value

  useEffect(() => {
    if (!wallet) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchTokenBalances(wallet)
      .then(data => {
        if (!cancelled) setBalances(data.balances)
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    const id = setInterval(() => {
      fetchTokenBalances(wallet)
        .then(data => { if (!cancelled) setBalances(data.balances) })
        .catch(() => {})
    }, 30000)
    return () => { cancelled = true; clearInterval(id) }
  }, [wallet])

  async function doVerify () {
    setVerifying(true)
    try {
      const result = await performTokenGateVerification()
      if (result.valid) showToast('Access verified', 'success')
    } catch (err) {
      showToast(err.message || 'Verification failed', 'error')
    }
    setVerifying(false)
  }

  if (!wallet) return null

  const verified = tokenGateVerified.value
  const gateEnabled = tokenGateEnabled.value
  const gateSkipped = localStorage.getItem('whaleroom_gate_skipped')

  return html`
    <div class="widget">
      <div class="widget-title-row">
        <span class="widget-title">Token Balances</span>
        ${gateEnabled && html`
          <button class="verify-icon-btn${verified ? ' verified' : ''}"
            onClick=${doVerify}
            disabled=${verifying}
            title=${verified ? 'Access verified \u2014 click to re-verify' : 'Click to verify holdings'}>
            ${verifying ? html`
              <svg viewBox="0 0 24 24" class="spin"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31 31" stroke-linecap="round"/></svg>
            ` : verified ? html`
              <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            ` : html`
              <svg viewBox="0 0 24 24"><path d="M12 2L3 7v6c0 5 3.5 9 9 11 5.5-2 9-6 9-11V7l-9-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            `}
          </button>
        `}
      </div>
      ${gateEnabled && verified && html`
        <div class="widget-gate-status widget-gate-verified">
          <svg viewBox="0 0 24 24" width="12" height="12"><path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Verified
          <button class="widget-gate-reverify" onClick=${doVerify} disabled=${verifying} title="Re-verify holdings">
            <svg viewBox="0 0 24 24" width="11" height="11"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      `}
      ${gateEnabled && !verified && html`
        <div class="widget-gate-upgrade">
          <button class="widget-gate-upgrade-btn" onClick=${doVerify} disabled=${verifying}>
            ${verifying ? 'Verifying...' : 'Verify Balances'}
          </button>
          <button class="widget-gate-info-btn" onClick=${() => setShowUpgradeTip(!showUpgradeTip)} title="What is this?">
            <svg viewBox="0 0 24 24" width="13" height="13"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
        ${showUpgradeTip && html`
          <div class="widget-gate-tooltip">
            Hold 280 WHL or 170 WHLC to unlock all feeds, posting, and encrypted content. Verify your on-chain holdings with a single wallet signature — no keys leave your device.
          </div>
        `}
      `}
      ${loading && !balances && html`<div style="font-size:13px;color:var(--text-secondary)">Loading...</div>`}
      ${error && html`<div style="font-size:13px;color:var(--text-secondary)">${error}</div>`}
      ${balances && balances.map(b => html`
        <div key=${b.symbol} class="widget-stat-row">
          <span class="widget-stat-label">${b.symbol}</span>
          <span class="widget-stat-value">${formatBalance(b)}</span>
        </div>
      `)}
    </div>
  `
}
