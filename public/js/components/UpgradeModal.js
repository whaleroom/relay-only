import { html, useState, useEffect } from '../deps.js'
import { showUpgradeModal, tokenGateVerified, feedKeys, switchFeed, showToast } from '../state.js'
import {
  quoteExactOutput, sendTx, waitForReceipt, getWallet, encodeCall,
  stakeWHL, approveWHL, readWHLBalance, getEthUsdPrice,
  WHL_CONTRACT, WHLC_CONTRACT, V2_ROUTER, WETH
} from './Club.js'

let _onSelectPlan = null
export function setPlanCallback (fn) { _onSelectPlan = fn }

const USDC = { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 }

function parseUnits (str, decimals = 18) {
  const [whole, frac] = str.split('.')
  const fracPadded = (frac || '').padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole || '0') * BigInt(10 ** decimals) + BigInt(fracPadded || '0')
}

function formatUsdc (wei) {
  return Number(wei) / 1e6
}

export function UpgradeModal () {
  const [open, setOpen] = useState(false)
  const [proPrice, setProPrice] = useState(null)
  const [proPlusPrice, setProPlusPrice] = useState(null)
  const [step, setStep] = useState('plans')
  const [txHash, setTxHash] = useState(null)
  const [error, setError] = useState(null)
  const [proGasUsd, setProGasUsd] = useState(null)
  const [proPlusGasUsd, setProPlusGasUsd] = useState(null)
  const isHolder = tokenGateVerified.value && feedKeys.value

  useEffect(() => {
    if (showUpgradeModal.value > 0) {
      setOpen(true)
      setStep('plans')
      setError(null)
      setTxHash(null)
    }
  }, [showUpgradeModal.value])

  useEffect(() => {
    let cancelled = false
    async function fetchPrices () {
      try {
        const [proQuote, proPlusQuote, ethPrice] = await Promise.all([
          quoteExactOutput(USDC, parseUnits('280', 18)),
          quoteExactOutput(USDC, parseUnits('170', 18)),
          getEthUsdPrice(),
        ])
        if (!cancelled) {
          if (proQuote) setProPrice(formatUsdc(proQuote.inAmount))
          if (proPlusQuote) setProPlusPrice(formatUsdc(proPlusQuote.inAmount))

          // Estimate gas for swap transactions
          if (ethPrice && proQuote) {
            try {
              const wallet = await getWallet().catch(() => null)
              if (wallet) {
                const amountIn = proQuote.inAmount + (proQuote.inAmount * 50n) / 10000n
                const deadline = Math.floor(Date.now() / 1000) + 1200
                const path = [USDC.address, WETH, WHL_CONTRACT]
                const pathHex = path.map(a => BigInt(a).toString(16).padStart(64, '0')).join('')
                const toHex = BigInt(wallet).toString(16).padStart(64, '0')
                const deadlineHex = BigInt(deadline).toString(16).padStart(64, '0')
                const swapData = '0x84deebca' + amountIn.toString(16).padStart(64, '0') + '0'.padStart(64, '0') + path.length.toString(16).padStart(64, '0') + pathHex + toHex + deadlineHex

                const gasRes = await fetch('/api/rpc', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_estimateGas', params: [{ from: wallet, to: V2_ROUTER, data: swapData, value: '0x0' }] })
                })
                const gasJson = await gasRes.json()
                if (gasJson.result && !cancelled) {
                  const gasUnits = BigInt(gasJson.result)
                  // gas cost in ETH = gasUnits * gasPrice (use 20 gwei as estimate)
                  const gasEth = Number(gasUnits) * 20e-9
                  setProGasUsd(gasEth * ethPrice)
                }
              }
            } catch {}
          }

          // Pro+ gas = swap gas + stake gas (roughly 1.5x swap)
          if (proGasUsd && !cancelled) {
            setProPlusGasUsd(proGasUsd * 1.5)
          }
        }
      } catch {}
    }
    fetchPrices()
    const id = setInterval(fetchPrices, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  function close () {
    setOpen(false)
    setStep('plans')
    setError(null)
    setTxHash(null)
  }

  function fmtPrice (price) {
    return price != null ? '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'
  }

  // Execute USDC -> WHL swap via Uniswap V2
  async function executeSwap (whlAmount, label) {
    setError(null)
    setStep('swapping')
    try {
      const wallet = await getWallet()

      // Get quote
      const quote = await quoteExactOutput(USDC, whlAmount)
      if (!quote) throw new Error('No liquidity available')

      // Check allowance and approve if needed
      const allowanceData = encodeCall('0xdd62ed3e', BigInt(wallet), BigInt(V2_ROUTER))
      const allowanceRes = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: USDC.address, data: allowanceData }, 'latest'] })
      })
      const allowanceJson = await allowanceRes.json()
      const currentAllowance = BigInt(allowanceJson.result || '0x0')
      const amountWithSlippage = quote.inAmount + (quote.inAmount * 50n) / 10000n // 0.5% slippage

      if (currentAllowance < amountWithSlippage) {
        // Approve USDC spending
        const approveData = '0x095ea7b3' + BigInt(V2_ROUTER).toString(16).padStart(64, '0') + amountWithSlippage.toString(16).padStart(64, '0')
        const approveHash = await sendTx(USDC.address, approveData)
        await waitForReceipt(approveHash)
      }

      // Execute swap: swapExactTokensForTokensSupportingFeeOnTransfer
      const deadline = Math.floor(Date.now() / 1000) + 1200
      const path = [USDC.address, WETH, WHL_CONTRACT]
      const pathHex = path.map(a => BigInt(a).toString(16).padStart(64, '0')).join('')
      const toHex = BigInt(wallet).toString(16).padStart(64, '0')
      const deadlineHex = BigInt(deadline).toString(16).padStart(64, '0')
      const swapData = '0x84deebca' + amountWithSlippage.toString(16).padStart(64, '0') + '0'.padStart(64, '0') + path.length.toString(16).padStart(64, '0') + pathHex + toHex + deadlineHex

      const hash = await sendTx(V2_ROUTER, swapData)
      setTxHash(hash)
      await waitForReceipt(hash)
      showToast(`${label}: swap complete`, 'success')

      return true
    } catch (err) {
      setError(err.message || 'Swap failed')
      setStep('plans')
      showToast(err.message || 'Swap failed', 'error')
      return false
    }
  }

  // Pro: swap USDC -> 280 WHL, done
  async function selectPro () {
    const whlAmount = parseUnits('280', 18)
    const success = await executeSwap(whlAmount, 'Pro membership')
    if (success) {
      setStep('done')
    }
  }

  // Pro+: swap USDC -> 170 WHL, then stake
  async function selectProPlus () {
    const whlAmount = parseUnits('170', 18)
    const success = await executeSwap(whlAmount, 'Pro+ membership')
    if (!success) return

    // Wait for WHL balance to show up
    setStep('staking')
    try {
      const wallet = await getWallet()
      // Poll for WHL balance (up to 60 seconds)
      let balance = 0n
      for (let i = 0; i < 30; i++) {
        balance = await readWHLBalance(wallet)
        if (balance >= whlAmount) break
        await new Promise(r => setTimeout(r, 2000))
      }

      if (balance < whlAmount) {
        throw new Error('WHL balance not detected after 60 seconds. The swap may still be confirming — check your wallet and stake manually in the Club.')
      }

      // Approve WHLC contract to spend WHL
      const whlAllowanceData = encodeCall('0xdd62ed3e', BigInt(wallet), BigInt(WHLC_CONTRACT))
      const whlAllowanceRes = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: WHL_CONTRACT, data: whlAllowanceData }, 'latest'] })
      })
      const whlAllowanceJson = await whlAllowanceRes.json()
      const currentWHLAllowance = BigInt(whlAllowanceJson.result || '0x0')

      if (currentWHLAllowance < whlAmount) {
        // Max approve WHL for WHLC contract (set to max to avoid repeated approvals)
        const MAX_UINT = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
        const approveHash = await approveWHL(MAX_UINT)
        await waitForReceipt(approveHash)
      }

      // Stake WHL -> WHLC
      const ref = sessionStorage.getItem('whaleroom_ref') || null
      const stakeHash = await stakeWHL(whlAmount, ref)
      setTxHash(stakeHash)
      await waitForReceipt(stakeHash)
      showToast('Pro+ membership: staking complete', 'success')
      setStep('done')
    } catch (err) {
      setError(err.message || 'Staking failed. Your WHL is in your wallet — stake manually in the Club.')
      setStep('staking-error')
      showToast(err.message || 'Staking failed', 'error')
    }
  }

  if (!open || isHolder) return null

  return html`
    <div class="upgrade-overlay" onClick=${step === 'plans' ? close : null}>
      <div class="upgrade-modal" onClick=${(e) => e.stopPropagation()}>
        <button class="upgrade-close" onClick=${close}>×</button>

        ${step === 'plans' && html`
          <div class="upgrade-header">
            <h2>Choose your plan</h2>
            <p class="upgrade-subtitle">Lifetime membership · unlock access forever</p>
          </div>
          <div class="upgrade-body">
            <div class="upgrade-plans">
              <div class="upgrade-plan">
                <div class="upgrade-plan-name">Pro</div>
                <div class="upgrade-plan-price">${fmtPrice(proPrice)}</div>
                <div class="upgrade-plan-unit">USDC · one-time</div>
                ${proGasUsd != null && html`<div class="upgrade-plan-gas">+ ~$${proGasUsd.toFixed(2)} network fee</div>`}
                <ul class="upgrade-plan-features">
                  <li>Full feed access</li>
                  <li>Post & reply</li>
                  <li>Decrypt all content</li>
                  <li>Boost posts</li>
                  <li>Fully refundable in membership tokens</li>
                </ul>
                <button class="upgrade-cta-btn" onClick=${selectPro}>Pay ${fmtPrice(proPrice)} USDC</button>
              </div>
              <div class="upgrade-plan upgrade-plan-featured">
                <div class="upgrade-plan-badge">Best value</div>
                <div class="upgrade-plan-name">Pro+</div>
                <div class="upgrade-plan-price">${fmtPrice(proPlusPrice)}</div>
                <div class="upgrade-plan-unit">USDC · one-time</div>
                ${proPlusGasUsd != null && html`<div class="upgrade-plan-gas">+ ~$${proPlusGasUsd.toFixed(2)} network fee</div>`}
                <ul class="upgrade-plan-features">
                  <li>Everything in Pro</li>
                  <li>Community pool distributions</li>
                  <li>Supports the community long-term</li>
                  <li>Priority access to new features</li>
                  <li>19% commitment on cancel</li>
                </ul>
                <p class="upgrade-plan-footnote">Requires locking your membership into the community pool. <a href="#" onClick=${(e) => { e.preventDefault(); close(); if (_onSelectPlan) _onSelectPlan('faq') }}>Learn more →</a></p>
                <button class="upgrade-cta-btn upgrade-cta-featured" onClick=${selectProPlus}>Pay ${fmtPrice(proPlusPrice)} USDC</button>
              </div>
            </div>
            <p class="upgrade-note">Memberships at WhaleRoom are entirely token-based. Both plans grant lifetime membership. Pro is fully refundable in membership tokens (WHL). Pro+ offers a discount in exchange for 19% commitment to the community if you ever decide to cancel. All membership fees are automatically converted to WHL tokens on your behalf.</p>
          </div>
        `}

        ${step === 'swapping' && html`
          <div class="upgrade-header">
            <h2>Processing payment</h2>
            <p class="upgrade-subtitle">Converting USDC to WHL via Uniswap...</p>
          </div>
          <div class="upgrade-body">
            <div class="upgrade-progress">
              <div class="spinner" style="width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:club-spin 0.8s linear infinite;margin:0 auto 16px"></div>
              <p class="upgrade-progress-text">Confirm the transaction in your wallet. Your USDC is being converted to WHL tokens automatically.</p>
              ${txHash && html`<a href="https://etherscan.io/tx/${txHash}" target="_blank" rel="noopener" class="upgrade-tx-link">View on Etherscan →</a>`}
            </div>
          </div>
        `}

        ${step === 'staking' && html`
          <div class="upgrade-header">
            <h2>Step 2 — Community commitment</h2>
            <p class="upgrade-subtitle">Locking your membership into the community pool...</p>
          </div>
          <div class="upgrade-body">
            <div class="upgrade-progress">
              <div class="spinner" style="width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:club-spin 0.8s linear infinite;margin:0 auto 16px"></div>
              <p class="upgrade-progress-text">Your WHL has arrived. Confirm the staking transaction to lock your membership into the community pool and start earning distributions.</p>
              ${txHash && html`<a href="https://etherscan.io/tx/${txHash}" target="_blank" rel="noopener" class="upgrade-tx-link">View on Etherscan →</a>`}
            </div>
          </div>
        `}

        ${step === 'staking-error' && html`
          <div class="upgrade-header">
            <h2>Staking needed</h2>
            <p class="upgrade-subtitle">Your WHL is in your wallet — one more step</p>
          </div>
          <div class="upgrade-body">
            <p class="upgrade-desc">Your USDC was converted to WHL successfully, but the staking step didn't complete. You need to lock your WHL into the community pool to activate your Pro+ membership.</p>
            <button class="upgrade-cta-btn upgrade-cta-featured" onClick=${async () => {
              setStep('staking')
              try {
                const wallet = await getWallet()
                const balance = await readWHLBalance(wallet)
                const whlAmount = parseUnits('170', 18)
                if (balance < whlAmount) throw new Error('Not enough WHL in wallet')
                const ref = sessionStorage.getItem('whaleroom_ref') || null
                const hash = await stakeWHL(whlAmount, ref)
                setTxHash(hash)
                await waitForReceipt(hash)
                showToast('Staking complete', 'success')
                setStep('done')
              } catch (err) {
                setError(err.message)
                setStep('staking-error')
                showToast(err.message, 'error')
              }
            }}>Stake now</button>
            ${error && html`<p class="upgrade-error">${error}</p>`}
          </div>
        `}

        ${step === 'done' && html`
          <div class="upgrade-header">
            <h2>Welcome to Whaleroom</h2>
            <p class="upgrade-subtitle">Your membership is active</p>
          </div>
          <div class="upgrade-body">
            <div class="upgrade-done">
              <div class="upgrade-done-icon">✓</div>
              <p class="upgrade-done-text">Your membership has been activated. You now have full access to all feeds, encrypted content, and community features.</p>
              <p class="upgrade-done-note">Please verify your holdings using the "Verify Balances" button in the right sidebar to unlock encrypted content.</p>
              <button class="upgrade-cta-btn upgrade-cta-featured" onClick=${() => { close(); switchFeed('all') }}>Enter Whaleroom →</button>
            </div>
          </div>
        `}

        ${error && step === 'plans' && html`
          <div class="upgrade-body">
            <p class="upgrade-error">${error}</p>
          </div>
        `}
      </div>
    </div>
  `
}
