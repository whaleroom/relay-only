import { html, render, useState, useEffect, useCallback, useRef } from './deps.js'

// ── Constants ──

const WHL_CONTRACT = '0x2af72850c504ddd3c1876c66a914caee7ff8a46a'
const WHLC_CONTRACT = '0x15e5d409001EAfF5076Af14cd7a4f3268f266445'
const CHAIN_ID = '0x1' // Ethereum mainnet

// Uniswap V2 Router
const V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
const V2_FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const SWAP_TOKENS = [
  { symbol: 'ETH', address: 'NATIVE', decimals: 18 },
  { symbol: 'WETH', address: WETH, decimals: 18 },
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
]

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
]

const WHLC_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function myTokens() view returns (uint256)',
  'function dividendsOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function totalPowerBalance() view returns (uint256)',
  'function buyPrice() view returns (uint256)',
  'function sellPrice() view returns (uint256)',
  'function calculateTokensReceived(uint256) view returns (uint256)',
  'function calculatePowerReceived(uint256) view returns (uint256)',
  'function buy(uint256, address) returns (uint256)',
  'function sell(uint256)',
  'function withdraw()',
  'function reinvest()',
  'function distribute(uint256) returns (uint256)',
  'function exit()',
  'function getInvested() view returns (uint256)'
]

// ── Helpers ──

const DECIMALS = 18
const MAX_UINT256 = (1n << 256n) - 1n

function fmt (weiStr, dp = 4) {
  if (!weiStr || weiStr === '0') return '0'
  const n = BigInt(weiStr)
  const whole = n / BigInt(10 ** DECIMALS)
  const frac = n % BigInt(10 ** DECIMALS)
  const fracStr = frac.toString().padStart(DECIMALS, '0').slice(0, dp)
  const trimmed = fracStr.replace(/0+$/, '')
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return trimmed ? `${wholeStr}.${trimmed}` : wholeStr
}

function parseUnits (amount, dp = DECIMALS) {
  if (!amount || amount === '0') return 0n
  const [w, f = ''] = amount.split('.')
  const fracPadded = (f + '0'.repeat(dp)).slice(0, dp)
  return BigInt(w || '0') * BigInt(10 ** dp) + BigInt(fracPadded || '0')
}

function shortAddr (addr) {
  if (!addr) return ''
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

// ── RPC helpers (read via server proxy, write via wallet) ──

async function rpcRead (to, data, from) {
  const callObj = { to, data }
  if (from) callObj.from = from
  const res = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [callObj, 'latest']
    })
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result
}

function encodeCall (sig, ...args) {
  const sel = sig.slice(0, 10)
  return sel + args.map(a => a.toString(16).padStart(64, '0')).join('')
}

function decodeUint (hex) {
  if (!hex || hex === '0x') return 0n
  return BigInt(hex)
}

function decodeBool (hex) {
  if (!hex || hex === '0x') return false
  return BigInt(hex) !== 0n
}

// ── iOS detection ──
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

async function getWallet () {
  if (!window.ethereum) {
    if (isIOS) throw new Error('IOS_NO_WALLET')
    throw new Error('No wallet found')
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  if (!accounts.length) throw new Error('No accounts')
  return accounts[0]
}

async function ensureChain () {
  if (!window.ethereum) return
  try {
    const chain = await window.ethereum.request({ method: 'eth_chainId' })
    if (chain !== CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CHAIN_ID }]
        })
      } catch { /* user rejected or no chain — continue anyway */ }
    }
  } catch { /* ignore */ }
}

// ── Contract reads ──

async function readWHLBalance (wallet) {
  const data = encodeCall('0x70a08231', BigInt(wallet))
  const res = await rpcRead(WHL_CONTRACT, data)
  return decodeUint(res)
}

async function readWHLCBalance (wallet) {
  const data = encodeCall('0x70a08231', BigInt(wallet))
  const res = await rpcRead(WHLC_CONTRACT, data)
  return decodeUint(res)
}

async function readDividendsOf (wallet) {
  const data = encodeCall('0x0065318b', BigInt(wallet))
  const res = await rpcRead(WHLC_CONTRACT, data)
  return decodeUint(res)
}

async function readTotalSupply () {
  const data = '0x18160ddd'
  const res = await rpcRead(WHLC_CONTRACT, data)
  return decodeUint(res)
}

async function readTotalPower () {
  const data = '0x6b409635'
  const res = await rpcRead(WHLC_CONTRACT, data)
  return decodeUint(res)
}

async function readCalcTokensReceived (whlAmount) {
  const data = encodeCall('0x10d0ffdd', whlAmount)
  const res = await rpcRead(WHLC_CONTRACT, data)
  return decodeUint(res)
}

async function readCalcPowerReceived (whlcAmount) {
  const data = encodeCall('0xd7d79289', whlcAmount)
  const res = await rpcRead(WHLC_CONTRACT, data)
  return decodeUint(res)
}

async function readAllowance (owner, spender) {
  const data = encodeCall('0xdd62ed3e', BigInt(owner), BigInt(spender))
  const res = await rpcRead(WHL_CONTRACT, data)
  return decodeUint(res)
}

async function readInvested (wallet) {
  const data = '0xbefc3e2b'
  const res = await rpcRead(WHLC_CONTRACT, data, wallet)
  return decodeUint(res)
}

// ── Contract writes (via wallet) ──

async function sendTx (to, data, value = '0x0') {
  if (!window.ethereum) throw new Error('No wallet found')
  const from = await getWallet()
  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{ from, to, data, value }]
  })
  return txHash
}

async function waitForReceipt (txHash) {
  for (let i = 0; i < 60; i++) {
    const res = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      })
    })
    const json = await res.json()
    if (json.result) return json.result
    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('Transaction timeout')
}

// ── EIP-5792 batch support (smart-account wallets) ──

let _batchCapable = null

async function detectBatchSupport () {
  if (_batchCapable !== null) return _batchCapable
  if (!window.ethereum) { _batchCapable = false; return false }
  try {
    const caps = await window.ethereum.request({ method: 'wallet_getCapabilities' })
    if (!caps) { _batchCapable = false; return false }
    const chainCaps = caps[CHAIN_ID] || caps[parseInt(CHAIN_ID, 16)] || caps['0x1'] || Object.values(caps)[0]
    _batchCapable = !!(chainCaps && (chainCaps.atomicBatch?.supported || chainCaps.batch?.supported))
  } catch { _batchCapable = false }
  return _batchCapable
}

async function sendBatch (calls) {
  if (!window.ethereum) throw new Error('No wallet found')
  const from = await getWallet()
  const batchId = await window.ethereum.request({
    method: 'wallet_sendCalls',
    params: [{
      from,
      version: '1.0',
      calls: calls.map(c => ({ to: c.to, data: c.data, value: c.value || '0x0' }))
    }]
  })
  return batchId
}

async function waitForBatch (batchId) {
  for (let i = 0; i < 60; i++) {
    try {
      const status = await window.ethereum.request({
        method: 'wallet_getCallsStatus',
        params: [batchId]
      })
      if (status) {
        if (status.status === 'CONFIRMED') return status
        if (status.status === 'FAILED') throw new Error('Batch failed')
      }
    } catch { /* wallet may not support status query yet */ }
    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('Batch timeout')
}

async function approveWHL (amount) {
  const spender = WHLC_CONTRACT
  // approve(address,uint256) selector = 0x095ea7b3
  const data = '0x095ea7b3' +
    BigInt(spender).toString(16).padStart(64, '0') +
    amount.toString(16).padStart(64, '0')
  return sendTx(WHL_CONTRACT, data)
}

async function stakeWHL (amount, referrer) {
  // buy(uint256,address) selector = 0x7deb6025
  const ref = referrer ? BigInt(referrer) : 0n
  const data = '0x7deb6025' +
    amount.toString(16).padStart(64, '0') +
    ref.toString(16).padStart(64, '0')
  return sendTx(WHLC_CONTRACT, data)
}

async function unstakeWHLC (amount) {
  // sell(uint256) selector = 0xe4849b32
  const data = '0xe4849b32' + amount.toString(16).padStart(64, '0')
  return sendTx(WHLC_CONTRACT, data)
}

async function claimRewards () {
  // withdraw() selector = 0x3ccfd60b
  return sendTx(WHLC_CONTRACT, '0x3ccfd60b')
}

async function compoundRewards () {
  // reinvest() selector = 0xfdb5a03e — contract function name is legacy, not user-facing
  return sendTx(WHLC_CONTRACT, '0xfdb5a03e')
}

async function contributeWHL (amount) {
  // distribute(uint256) selector = 0x91c05b0b
  const data = '0x91c05b0b' + amount.toString(16).padStart(64, '0')
  return sendTx(WHLC_CONTRACT, data)
}

async function fullExit () {
  // exit() selector = 0xe9fad8ee
  return sendTx(WHLC_CONTRACT, '0xe9fad8ee')
}

// ── Theme ──

function initTheme () {
  const stored = localStorage.getItem('whaleroom_theme') || 'dark'
  document.documentElement.dataset.theme = stored
}

function toggleTheme () {
  const current = document.documentElement.dataset.theme || 'dark'
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  localStorage.setItem('whaleroom_theme', next)
}

// ── Toast ──

function useToast () {
  const [toast, setToast] = useState({ msg: '', type: '', id: 0 })
  const showToast = useCallback((msg, type = '') => {
    setToast({ msg, type, id: Date.now() })
  }, [])
  useEffect(() => {
    if (!toast.id) return
    const t = setTimeout(() => setToast({ msg: '', type: '', id: 0 }), 4000)
    return () => clearTimeout(t)
  }, [toast.id])
  return [toast, showToast]
}

// ── Components ──

function StatCard ({ label, value, sub }) {
  return html`
    <div class="club-stat">
      <div class="club-stat-label">${label}</div>
      <div class="club-stat-value">${value}</div>
      ${sub && html`<div class="club-stat-sub">${sub}</div>`}
    </div>
  `
}

function StakeCard ({ wallet, balances, onToast, onRefresh }) {
  const [amount, setAmount] = useState('')
  const [referrer, setReferrer] = useState(() => sessionStorage.getItem('whaleroom_ref') || '')
  const [pending, setPending] = useState(false)
  const [calc, setCalc] = useState(null)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [canBatch, setCanBatch] = useState(false)

  useEffect(() => {
    detectBatchSupport().then(setCanBatch).catch(() => setCanBatch(false))
  }, [])

  useEffect(() => {
    if (!amount || !wallet) { setCalc(null); setNeedsApproval(false); return }
    let cancelled = false
    const wei = parseUnits(amount)
    if (wei <= 0n) { setCalc(null); return }
    const timer = setTimeout(() => {
      readCalcTokensReceived(wei).then(tokens => {
        if (cancelled) return
        const fee = wei - tokens
        setCalc({ tokens, fee })
      }).catch(() => setCalc(null))

      readAllowance(wallet, WHLC_CONTRACT).then(allow => {
        if (cancelled) return
        setNeedsApproval(allow < wei)
      }).catch(() => setNeedsApproval(true))
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [amount, wallet])

  const maxStake = balances?.whl ? fmt(balances.whl, 4) : '0'

  function setPct (pct) {
    if (!balances?.whl) return
    const wei = BigInt(balances.whl)
    const result = (wei * BigInt(pct)) / 100n
    const whole = result / BigInt(10 ** DECIMALS)
    const frac = result % BigInt(10 ** DECIMALS)
    const fracStr = frac.toString().padStart(DECIMALS, '0').replace(/0+$/, '')
    setAmount(fracStr ? `${whole}.${fracStr}` : whole.toString())
  }

  async function doApprove () {
    setPending(true)
    setTxHash('')
    try {
      const hash = await approveWHL(MAX_UINT256)
      setTxHash(hash)
      await waitForReceipt(hash)
      setNeedsApproval(false)
      onToast('WHL approved for staking — no future approvals needed', 'success')
    } catch (err) {
      onToast(err.message || 'Approval failed', 'error')
    } finally {
      setPending(false)
    }
  }

  async function doStake () {
    setPending(true)
    setTxHash('')
    try {
      const wei = parseUnits(amount)
      const ref = referrer || '0x0000000000000000000000000000000000000000'

      if (needsApproval && canBatch) {
        const approveData = '0x095ea7b3' +
          BigInt(WHLC_CONTRACT).toString(16).padStart(64, '0') +
          MAX_UINT256.toString(16).padStart(64, '0')
        const buyData = '0x7deb6025' +
          wei.toString(16).padStart(64, '0') +
          (BigInt(ref)).toString(16).padStart(64, '0')
        const batchId = await sendBatch([
          { to: WHL_CONTRACT, data: approveData },
          { to: WHLC_CONTRACT, data: buyData }
        ])
        setTxHash(batchId)
        await waitForBatch(batchId)
        setNeedsApproval(false)
        onToast(`Committed ${amount} WHL (1-tx batch)`, 'success')
      } else {
        const hash = await stakeWHL(wei, ref)
        setTxHash(hash)
        await waitForReceipt(hash)
        onToast(`Committed ${amount} WHL`, 'success')
      }
      setAmount('')
      setCalc(null)
      onRefresh()
    } catch (err) {
      onToast(err.message || 'Commit failed', 'error')
    } finally {
      setPending(false)
    }
  }

  return html`
    <div class="club-card">
      <div class="club-card-title">Stake WHL</div>
      <div class="club-card-desc">
        Commit WHL to the club to receive WHLC membership tokens at 1:1 minus a 10% entry contribution. The contribution is shared with all existing WHLC members.
      </div>
      <div class="club-input-label">Amount (WHL) <span class="club-balance-display">Balance: ${maxStake}</span></div>
      <div class="club-input-group">
        <input class="club-input" type="number" placeholder="0.0" value=${amount}
          onInput=${e => setAmount(e.target.value)} step="any" min="0" />
        <button class="club-btn club-btn-secondary" onClick=${() => setAmount(maxStake)} disabled=${!maxStake || maxStake === '0'}>
          Max
        </button>
      </div>
      <div class="club-pct-row">
        <button class="club-pct-btn" onClick=${() => setPct(25)} disabled=${!maxStake || maxStake === '0'}>25%</button>
        <button class="club-pct-btn" onClick=${() => setPct(50)} disabled=${!maxStake || maxStake === '0'}>50%</button>
        <button class="club-pct-btn" onClick=${() => setPct(75)} disabled=${!maxStake || maxStake === '0'}>75%</button>
        <button class="club-pct-btn" onClick=${() => setPct(100)} disabled=${!maxStake || maxStake === '0'}>100%</button>
      </div>

      <div class="club-input-label" style="margin-top:12px">Referrer (optional)</div>
      <div class="club-input-group">
        <input class="club-input" type="text" placeholder="0x..." value=${referrer}
          onInput=${e => setReferrer(e.target.value)} />
      </div>

      ${calc && html`
        <div style="margin-top:12px">
          <div class="club-info-row highlight">
            <span class="club-info-label">You receive</span>
            <span class="club-info-value">${fmt(calc.tokens.toString())} WHLC</span>
          </div>
          <div class="club-info-row fee">
            <span class="club-info-label">Entry contribution (10%)</span>
            <span class="club-info-value">${fmt(calc.fee.toString())} WHL</span>
          </div>
        </div>
      `}

      ${pending && txHash && html`
        <div class="club-tx-pending">
          <div class="spinner"></div>
          <span>Waiting for confirmation... <a href="https://etherscan.io/tx/${txHash}" target="_blank" style="color:var(--accent)">View</a></span>
        </div>
      `}

      ${pending && !txHash && html`
        <div class="club-tx-pending">
          <div class="spinner"></div>
          <span>Confirm in wallet...</span>
        </div>
      `}

      <div class="club-btn-row">
        ${needsApproval && !canBatch
          ? html`<button class="club-btn club-btn-primary club-btn-full" onClick=${doApprove} disabled=${pending || !amount || parseUnits(amount) > BigInt(balances?.whl || 0n)}>Approve WHL (one-time)</button>`
          : html`<button class="club-btn club-btn-primary club-btn-full" onClick=${doStake} disabled=${pending || !amount || parseUnits(amount) > BigInt(balances?.whl || 0n)}>${parseUnits(amount) > BigInt(balances?.whl || 0n) ? 'Insufficient WHL' : (needsApproval && canBatch ? 'Stake (approve + commit)' : 'Stake')}</button>`
        }
      </div>
    </div>
  `
}

function UnstakeCard ({ wallet, balances, onToast, onRefresh }) {
  const [amount, setAmount] = useState('')
  const [pending, setPending] = useState(false)
  const [calc, setCalc] = useState(null)
  const [txHash, setTxHash] = useState('')
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (!amount) { setCalc(null); setShowWarning(false); return }
    let cancelled = false
    const wei = parseUnits(amount)
    if (wei <= 0n) { setCalc(null); return }
    const timer = setTimeout(() => {
      readCalcPowerReceived(wei).then(power => {
        if (cancelled) return
        const fee = wei - power
        setCalc({ power, fee })
        if (balances?.whlc) {
          const currentWhlc = BigInt(balances.whlc)
          const afterUnstake = currentWhlc - wei
          if (afterUnstake < parseUnits('170') && currentWhlc >= parseUnits('170')) {
            setShowWarning(true)
          } else {
            setShowWarning(false)
          }
        }
      }).catch(() => setCalc(null))
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [amount, balances])

  const maxUnstake = balances?.whlc ? fmt(balances.whlc, 4) : '0'

  function setPct (pct) {
    if (!balances?.whlc) return
    const wei = BigInt(balances.whlc)
    const result = (wei * BigInt(pct)) / 100n
    const whole = result / BigInt(10 ** DECIMALS)
    const frac = result % BigInt(10 ** DECIMALS)
    const fracStr = frac.toString().padStart(DECIMALS, '0').replace(/0+$/, '')
    setAmount(fracStr ? `${whole}.${fracStr}` : whole.toString())
  }

  async function doUnstake () {
    setPending(true)
    setTxHash('')
    try {
      const wei = parseUnits(amount)
      const hash = await unstakeWHLC(wei)
      setTxHash(hash)
      await waitForReceipt(hash)
      onToast(`Returned ${amount} WHLC`, 'success')
      setAmount('')
      setCalc(null)
      setShowWarning(false)
      onRefresh()
    } catch (err) {
      onToast(err.message || 'Withdraw failed', 'error')
    } finally {
      setPending(false)
    }
  }

  return html`
    <div class="club-card">
      <div class="club-card-title">Unstake WHLC</div>
      <div class="club-card-desc">
        Return WHLC to reclaim your WHL. A 10% exit contribution is shared with remaining members.
      </div>
      <div class="club-input-label">Amount (WHLC) <span class="club-balance-display">Balance: ${maxUnstake}</span></div>
      <div class="club-input-group">
        <input class="club-input" type="number" placeholder="0.0" value=${amount}
          onInput=${e => setAmount(e.target.value)} step="any" min="0" />
        <button class="club-btn club-btn-secondary" onClick=${() => setAmount(maxUnstake)} disabled=${!maxUnstake || maxUnstake === '0'}>
          Max
        </button>
      </div>
      <div class="club-pct-row">
        <button class="club-pct-btn" onClick=${() => setPct(25)} disabled=${!maxUnstake || maxUnstake === '0'}>25%</button>
        <button class="club-pct-btn" onClick=${() => setPct(50)} disabled=${!maxUnstake || maxUnstake === '0'}>50%</button>
        <button class="club-pct-btn" onClick=${() => setPct(75)} disabled=${!maxUnstake || maxUnstake === '0'}>75%</button>
        <button class="club-pct-btn" onClick=${() => setPct(100)} disabled=${!maxUnstake || maxUnstake === '0'}>100%</button>
      </div>

      ${calc && html`
        <div style="margin-top:12px">
          <div class="club-info-row highlight">
            <span class="club-info-label">You receive</span>
            <span class="club-info-value">${fmt(calc.power.toString())} WHL</span>
          </div>
          <div class="club-info-row fee">
            <span class="club-info-label">Exit contribution (10%)</span>
            <span class="club-info-value">${fmt(calc.fee.toString())} WHLC</span>
          </div>
        </div>
      `}

      ${showWarning && html`
        <div class="club-warning">
          <svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
          <span>This will drop your WHLC below 170 — you may lose member access on Whaleroom.</span>
        </div>
      `}

      ${pending && txHash && html`
        <div class="club-tx-pending">
          <div class="spinner"></div>
          <span>Waiting for confirmation... <a href="https://etherscan.io/tx/${txHash}" target="_blank" style="color:var(--accent)">View</a></span>
        </div>
      `}

      ${pending && !txHash && html`
        <div class="club-tx-pending">
          <div class="spinner"></div>
          <span>Confirm in wallet...</span>
        </div>
      `}

      <div class="club-btn-row">
        <button class="club-btn club-btn-full" onClick=${doUnstake} disabled=${pending || !amount || parseUnits(amount) > BigInt(balances?.whlc || 0n)}>${parseUnits(amount) > BigInt(balances?.whlc || 0n) ? 'Insufficient WHLC' : 'Unstake'}</button>
      </div>
    </div>
  `
}

function RewardsPanel ({ balances, onToast, onRefresh }) {
  const [pending, setPending] = useState('')

  async function doClaim () {
    setPending('claim')
    try {
      const hash = await claimRewards()
      await waitForReceipt(hash)
      onToast('Distributions claimed', 'success')
      onRefresh()
    } catch (err) {
      onToast(err.message || 'Claim failed', 'error')
    } finally {
      setPending('')
    }
  }

  async function doCompound () {
    setPending('compound')
    try {
      const hash = await compoundRewards()
      await waitForReceipt(hash)
      onToast('Distributions restaked', 'success')
      onRefresh()
    } catch (err) {
      onToast(err.message || 'Restake failed', 'error')
    } finally {
      setPending('')
    }
  }

  const pendingRewards = balances?.dividends ? fmt(balances.dividends.toString()) : '0'

  return html`
    <div class="club-rewards-panel">
      <div class="club-rewards-left">
        <div class="club-rewards-label">Pending Distributions</div>
        <div class="club-rewards-amount">
          ${pendingRewards}<span class="unit">WHL</span>
        </div>
      </div>
      <div class="club-btn-row" style="margin-top:0">
        <button class="club-btn club-btn-primary" onClick=${doClaim} disabled=${!!pending || pendingRewards === '0'}>
          ${pending === 'claim' ? 'Claiming...' : 'Claim'}
        </button>
        <button class="club-btn club-btn-secondary" onClick=${doCompound} disabled=${!!pending || pendingRewards === '0'}>
          ${pending === 'compound' ? 'Restaking...' : 'Restake'}
        </button>
      </div>
    </div>
  `
}

function ContributeCard ({ onToast, onRefresh }) {
  const [amount, setAmount] = useState('')
  const [pending, setPending] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [canBatch, setCanBatch] = useState(false)

  useEffect(() => {
    detectBatchSupport().then(setCanBatch).catch(() => setCanBatch(false))
  }, [])

  useEffect(() => {
    if (!amount) { setNeedsApproval(false); return }
    let cancelled = false
    const wei = parseUnits(amount)
    if (wei <= 0n) return
    const timer = setTimeout(() => {
      getWallet().then(w => {
        readAllowance(w, WHLC_CONTRACT).then(allow => {
          if (cancelled) return
          setNeedsApproval(allow < wei)
        }).catch(() => setNeedsApproval(true))
      }).catch(() => {})
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [amount])

  async function doApprove () {
    setPending(true)
    setTxHash('')
    try {
      const hash = await approveWHL(MAX_UINT256)
      setTxHash(hash)
      await waitForReceipt(hash)
      setNeedsApproval(false)
      onToast('WHL approved — no future approvals needed', 'success')
    } catch (err) {
      onToast(err.message || 'Approval failed', 'error')
    } finally {
      setPending(false)
    }
  }

  async function doContribute () {
    setPending(true)
    setTxHash('')
    try {
      const wei = parseUnits(amount)

      if (needsApproval && canBatch) {
        const approveData = '0x095ea7b3' +
          BigInt(WHLC_CONTRACT).toString(16).padStart(64, '0') +
          MAX_UINT256.toString(16).padStart(64, '0')
        const distributeData = '0x91c05b0b' +
          wei.toString(16).padStart(64, '0')
        const batchId = await sendBatch([
          { to: WHL_CONTRACT, data: approveData },
          { to: WHLC_CONTRACT, data: distributeData }
        ])
        setTxHash(batchId)
        await waitForBatch(batchId)
        setNeedsApproval(false)
        onToast(`Contributed ${amount} WHL (1-tx batch)`, 'success')
      } else {
        const hash = await contributeWHL(wei)
        setTxHash(hash)
        await waitForReceipt(hash)
        onToast(`Contributed ${amount} WHL to all members`, 'success')
      }
      setAmount('')
      onRefresh()
    } catch (err) {
      onToast(err.message || 'Contribute failed', 'error')
    } finally {
      setPending(false)
    }
  }

  return html`
    <div class="club-card">
      <div class="club-card-title">Contribute to Members</div>
      <div class="club-card-desc">
        Send WHL to all WHLC members. Your contribution is shared
        proportionally with everyone in the club.
      </div>
      <div class="club-input-label">Amount (WHL)</div>
      <div class="club-input-group">
        <input class="club-input" type="number" placeholder="0.0" value=${amount}
          onInput=${e => setAmount(e.target.value)} step="any" min="0" />
      </div>

      ${pending && txHash && html`
        <div class="club-tx-pending">
          <div class="spinner"></div>
          <span>Waiting for confirmation... <a href="https://etherscan.io/tx/${txHash}" target="_blank" style="color:var(--accent)">View</a></span>
        </div>
      `}

      ${pending && !txHash && html`
        <div class="club-tx-pending">
          <div class="spinner"></div>
          <span>Confirm in wallet...</span>
        </div>
      `}

      <div class="club-btn-row">
        ${needsApproval && !canBatch
          ? html`<button class="club-btn club-btn-primary club-btn-full" onClick=${doApprove} disabled=${pending || !amount}>Approve WHL (one-time)</button>`
          : html`<button class="club-btn club-btn-primary club-btn-full" onClick=${doContribute} disabled=${pending || !amount}>${needsApproval && canBatch ? 'Contribute (approve + send)' : 'Contribute'}</button>`
        }
      </div>
    </div>
  `
}

function FullExitCard ({ onToast, onRefresh }) {
  const [pending, setPending] = useState(false)

  async function doExit () {
    setPending(true)
    try {
      const hash = await fullExit()
      await waitForReceipt(hash)
      onToast('Full exit complete', 'success')
      onRefresh()
    } catch (err) {
      onToast(err.message || 'Exit failed', 'error')
    } finally {
      setPending(false)
    }
  }

  return html`
    <div class="club-card">
      <div class="club-card-title">Full Exit</div>
      <div class="club-card-desc">
        Return all WHLC and collect all pending distributions in one transaction.
        You will pay the 10% exit contribution on your entire position.
      </div>
      <div class="club-btn-row">
        <button class="club-btn club-btn-full" onClick=${doExit} disabled=${pending}
          style="color:var(--danger);border-color:rgba(239,68,68,0.3)">
          ${pending ? 'Exiting...' : 'Full Exit'}
        </button>
      </div>
    </div>
  `
}

function ReferralCard ({ wallet }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/club?ref=${wallet || ''}`

  function copy () {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return html`
    <div class="club-referral">
      <div class="club-card-title">Referral Link</div>
      <div class="club-card-desc">
        Share this link. When someone joins the club using your referral, you receive 2% of their commitment as a distribution.
      </div>
      <div class="club-referral-link">
        <input readonly value=${link} onClick=${e => e.target.select()} />
        <button class="club-btn club-btn-secondary" onClick=${copy}>
          ${copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  `
}

// ── V2 manual quoting (WHL is fee-on-transfer, router getAmountsOut/In revert) ──

async function getV2Pair (tokenA, tokenB) {
  const data = '0xe6a43905' + BigInt(tokenA).toString(16).padStart(64, '0') + BigInt(tokenB).toString(16).padStart(64, '0')
  const hex = await rpcRead(V2_FACTORY, data)
  const addr = '0x' + hex.slice(26)
  return addr === '0x0000000000000000000000000000000000000000' ? null : addr
}

async function getV2Reserves (pair) {
  const hex = await rpcRead(pair, '0x0902f1ac')
  const raw = hex.slice(2)
  return { r0: BigInt('0x' + raw.slice(0, 64)), r1: BigInt('0x' + raw.slice(64, 128)) }
}

async function getV2Token0 (pair) {
  const hex = await rpcRead(pair, '0x0dfe1681')
  return '0x' + hex.slice(26).toLowerCase()
}

// getAmountIn for a single hop: how much tokenIn for amountOut of tokenOut
function calcAmountIn (reserveIn, reserveOut, amountOut) {
  const numerator = reserveIn * amountOut * 1000n
  const denominator = (reserveOut - amountOut) * 997n
  return numerator / denominator + 1n
}

// Get ETH USD price from USDC/WETH V2 pair
let _ethPriceCache = null
let _ethPriceTime = 0
async function getEthUsdPrice () {
  if (_ethPriceCache && Date.now() - _ethPriceTime < 30000) return _ethPriceCache
  const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  const pair = await getV2Pair(USDC, WETH)
  if (!pair) return null
  const t0 = await getV2Token0(pair)
  const { r0, r1 } = await getV2Reserves(pair)
  const usdcReserve = t0 === USDC.toLowerCase() ? r0 : r1
  const wethReserve = t0 === WETH.toLowerCase() ? r0 : r1
  if (wethReserve === 0n) return null
  const price = Number(usdcReserve * BigInt(10 ** 12)) / Number(wethReserve)
  _ethPriceCache = price
  _ethPriceTime = Date.now()
  return price
}

// Quote total input needed for exactWHL output, routing through WETH if needed
async function quoteExactOutput (fromToken, whlAmount) {
  if (fromToken.address === 'NATIVE' || fromToken.symbol === 'WETH') {
    // Direct: WETH -> WHL
    const pair = await getV2Pair(WETH, WHL_CONTRACT)
    if (!pair) return null
    const t0 = await getV2Token0(pair)
    const { r0, r1 } = await getV2Reserves(pair)
    const wethReserve = t0 === WETH.toLowerCase() ? r0 : r1
    const whlReserve = t0 === WHL_CONTRACT.toLowerCase() ? r0 : r1
    if (whlReserve < whlAmount) return null
    const wethNeeded = calcAmountIn(wethReserve, whlReserve, whlAmount)
    return { inAmount: wethNeeded, path: [WETH, WHL_CONTRACT] }
  } else {
    // Multi-hop: token -> WETH -> WHL
    const [pair1, pair2] = await Promise.all([
      getV2Pair(fromToken.address, WETH),
      getV2Pair(WETH, WHL_CONTRACT)
    ])
    if (!pair1 || !pair2) return null
    const [t0_1, t0_2, res1, res2] = await Promise.all([
      getV2Token0(pair1), getV2Token0(pair2),
      getV2Reserves(pair1), getV2Reserves(pair2)
    ])
    // Pair2: WETH -> WHL
    const wethReserve2 = t0_2 === WETH.toLowerCase() ? res2.r0 : res2.r1
    const whlReserve2 = t0_2 === WHL_CONTRACT.toLowerCase() ? res2.r0 : res2.r1
    if (whlReserve2 < whlAmount) return null
    const wethNeeded = calcAmountIn(wethReserve2, whlReserve2, whlAmount)
    // Pair1: token -> WETH
    const tokenReserve1 = t0_1 === fromToken.address.toLowerCase() ? res1.r0 : res1.r1
    const wethReserve1 = t0_1 === WETH.toLowerCase() ? res1.r0 : res1.r1
    if (wethReserve1 < wethNeeded) return null
    const tokenNeeded = calcAmountIn(tokenReserve1, wethReserve1, wethNeeded)
    return { inAmount: tokenNeeded, wethNeeded, path: [fromToken.address, WETH, WHL_CONTRACT] }
  }
}

// ── Swap Card (Uniswap V2 direct) ──

function SwapCard ({ wallet, onToast, onRefresh }) {
  const [fromToken, setFromToken] = useState(SWAP_TOKENS[0])
  const [plan, setPlan] = useState('staked')
  const [stakedQty, setStakedQty] = useState('1')
  const [holderQty, setHolderQty] = useState('0')
  const [slippage, setSlippage] = useState('0.5')
  const [showSettings, setShowSettings] = useState(false)
  const [preview, setPreview] = useState(null)
  const [balance, setBalance] = useState(null)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [insufficient, setInsufficient] = useState(false)
  const [pending, setPending] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [gasEstimate, setGasEstimate] = useState(null)
  const [usdPrice, setUsdPrice] = useState(null)

  const STAKED_BASE = 170
  const HOLDER_BASE = 280

  const totalWHL = (() => {
    const s = parseInt(stakedQty) || 0
    const h = parseInt(holderQty) || 0
    return s * STAKED_BASE + h * HOLDER_BASE
  })()

  // Read input token balance
  useEffect(() => {
    if (!wallet || !fromToken) { setBalance(null); return }
    let cancelled = false
    if (fromToken.address === 'NATIVE') {
      fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [wallet, 'latest'] })
      }).then(r => r.json()).then(json => {
        if (cancelled) return
        setBalance(BigInt(json.result || '0x0'))
      }).catch(() => setBalance(null))
    } else {
      const data = encodeCall('0x70a08231', BigInt(wallet))
      rpcRead(fromToken.address, data).then(hex => {
        if (cancelled) return
        setBalance(BigInt(hex || '0x0'))
      }).catch(() => setBalance(null))
    }
    return () => { cancelled = true }
  }, [wallet, fromToken])

  function getSwapPath () {
    return fromToken.address === 'NATIVE'
      ? [WETH, WHL_CONTRACT]
      : fromToken.symbol === 'WETH'
        ? [WETH, WHL_CONTRACT]
        : [fromToken.address, WETH, WHL_CONTRACT]
  }

  function fmtToken (weiStr, dp) {
    if (!weiStr || weiStr === '0') return '0'
    const n = BigInt(weiStr)
    const whole = n / BigInt(10 ** dp)
    const frac = n % BigInt(10 ** dp)
    const fracStr = frac.toString().padStart(dp, '0').slice(0, Math.min(dp, 6)).replace(/0+$/, '')
    return fracStr ? `${whole}.${fracStr}` : whole.toString()
  }

  // Preview: manual quote from V2 pair reserves (WHL is fee-on-transfer)
  useEffect(() => {
    if (totalWHL < 1 || !fromToken) { setPreview(null); setNeedsApproval(false); setInsufficient(false); setQuoteLoading(false); setGasEstimate(null); return }
    let cancelled = false
    setQuoteLoading(true)
    const whlWei = BigInt(totalWHL) * BigInt(10 ** 18)
    const timer = setTimeout(() => {
      quoteExactOutput(fromToken, whlWei).then(result => {
        if (cancelled) return
        setQuoteLoading(false)
        if (!result || result.inAmount <= 0n) { setPreview(null); setGasEstimate(null); return }
        const price = whlWei * BigInt(10 ** fromToken.decimals) / result.inAmount
        setPreview({ inAmount: result.inAmount, price })
        // Fetch USD price
        getEthUsdPrice().then(ethUsd => {
          if (cancelled || !ethUsd) return
          if (fromToken.address === 'NATIVE' || fromToken.symbol === 'WETH') {
            setUsdPrice((Number(result.inAmount) / 1e18) * ethUsd)
          } else {
            // For ERC20 tokens, convert through WETH equivalent
            const wethEquiv = result.wethNeeded || (result.inAmount * BigInt(10 ** 18) / price)
            setUsdPrice((Number(wethEquiv) / 1e18) * ethUsd)
          }
        }).catch(() => setUsdPrice(null))
        if (balance !== null && result.inAmount > balance) {
          setInsufficient(true)
        } else {
          setInsufficient(false)
        }
        if (fromToken.address !== 'NATIVE' && wallet) {
          const allowData = encodeCall('0xdd62ed3e', BigInt(wallet), BigInt(V2_ROUTER))
          rpcRead(fromToken.address, allowData).then(allowHex => {
            if (cancelled) return
            setNeedsApproval(BigInt(allowHex || '0x0') < result.inAmount)
          }).catch(() => setNeedsApproval(true))
        } else {
          setNeedsApproval(false)
        }
        // Estimate gas for the swap tx
        if (wallet) {
          const path = getSwapPath()
          const pathHex = path.map(a => BigInt(a).toString(16).padStart(64, '0')).join('')
          const toHex = BigInt(wallet).toString(16).padStart(64, '0')
          const deadlineHex = BigInt(Math.floor(Date.now() / 1000) + 1200).toString(16).padStart(64, '0')
          let callData, callValue
          if (fromToken.address === 'NATIVE') {
            callData = '0x2de980f3' + path.length.toString(16).padStart(64, '0') + pathHex + toHex + deadlineHex
            callValue = '0x' + result.inAmount.toString(16)
          } else {
            callData = '0x84deebca' + result.inAmount.toString(16).padStart(64, '0') + '0'.padStart(64, '0') + path.length.toString(16).padStart(64, '0') + pathHex + toHex + deadlineHex
            callValue = '0x0'
          }
          fetch('/api/rpc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_estimateGas', params: [{ from: wallet, to: V2_ROUTER, data: callData, value: callValue }] })
          }).then(r => r.json()).then(json => {
            if (cancelled || !json.result) return
            setGasEstimate(BigInt(json.result))
          }).catch(() => {})
        }
      }).catch(() => { if (!cancelled) { setPreview(null); setQuoteLoading(false); setNeedsApproval(false); setInsufficient(false); setGasEstimate(null) } })
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [totalWHL, fromToken, wallet, balance])

  function fmtToken (weiStr, dp) {
    if (!weiStr || weiStr === '0') return '0'
    const n = BigInt(weiStr)
    const whole = n / BigInt(10 ** dp)
    const frac = n % BigInt(10 ** dp)
    const fracStr = frac.toString().padStart(dp, '0').slice(0, Math.min(dp, 6)).replace(/0+$/, '')
    return fracStr ? `${whole}.${fracStr}` : whole.toString()
  }

  const maxAmount = balance ? fmtToken(balance.toString(), fromToken.decimals) : '0'

  async function doApprove () {
    setPending(true); setTxHash('')
    try {
      const data = '0x095ea7b3' + BigInt(V2_ROUTER).toString(16).padStart(64, '0') + preview.inAmount.toString(16).padStart(64, '0')
      const hash = await sendTx(fromToken.address, data)
      setTxHash(hash)
      await waitForReceipt(hash)
      setNeedsApproval(false)
      onToast('Approval confirmed', 'success')
    } catch (err) {
      onToast(err.message || 'Approval failed', 'error')
    } finally { setPending(false) }
  }

  async function doSwap () {
    setPending(true); setTxHash('')
    try {
      if (!preview || preview.inAmount <= 0n) throw new Error('No liquidity for this route')
      const whlWei = BigInt(totalWHL) * BigInt(10 ** 18)
      const slippageBps = Math.floor(parseFloat(slippage) * 100)
      // WHL is fee-on-transfer: use SupportingFeeOnTransfer variants with amountOutMin=0
      // Add slippage buffer to the input amount so the swap goes through despite the fee
      const amountIn = preview.inAmount + (preview.inAmount * BigInt(slippageBps)) / 10000n
      const deadline = Math.floor(Date.now() / 1000) + 1200
      const path = getSwapPath()
      const pathHex = path.map(a => BigInt(a).toString(16).padStart(64, '0')).join('')
      const toHex = BigInt(wallet).toString(16).padStart(64, '0')
      const deadlineHex = BigInt(deadline).toString(16).padStart(64, '0')

      let data, value
      if (fromToken.address === 'NATIVE') {
        // swapExactETHForTokensSupportingFeeOnTransfer(address[],address,uint256) = 0x2de980f3
        data = '0x2de980f3' + path.length.toString(16).padStart(64, '0') + pathHex + toHex + deadlineHex
        value = '0x' + amountIn.toString(16)
      } else {
        // swapExactTokensForTokensSupportingFeeOnTransfer(uint256,uint256,address[],address,uint256) = 0x84deebca
        data = '0x84deebca' + amountIn.toString(16).padStart(64, '0') + '0'.padStart(64, '0') + path.length.toString(16).padStart(64, '0') + pathHex + toHex + deadlineHex
        value = '0x0'
      }
      const hash = await sendTx(V2_ROUTER, data, value)
      setTxHash(hash)
      await waitForReceipt(hash)
      onToast(`Swapped for ${totalWHL} WHL`, 'success')
      onRefresh()
    } catch (err) {
      onToast(err.message || 'Swap failed', 'error')
    } finally { setPending(false) }
  }

  function QtyStepper ({ label, qty, setQty, base, min, max }) {
    const n = parseInt(qty) || 0
    return html`
      <div class="club-swap-qty-block">
        <div class="club-swap-qty-label">${label} <span class="club-swap-qty-base">${base} WHL each</span></div>
        <div class="club-swap-qty-row">
          <button class="club-swap-stepper" onClick=${() => setQty(String(Math.max(min, n - 1)))} disabled=${pending || n <= min}>-</button>
          <input class="club-swap-qty-input" type="number" value=${qty} min=${min} max=${max} step="1"
            onInput=${e => setQty(e.target.value)} />
          <button class="club-swap-stepper" onClick=${() => setQty(String(n + 1))} disabled=${pending}>+</button>
        </div>
      </div>
    `
  }

  return html`
    <div class="club-card club-swap-card">
      <div class="club-swap-header">
        <div class="club-card-title">Get WHL Membership</div>
        <button class="club-swap-settings-btn" onClick=${() => setShowSettings(!showSettings)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      ${showSettings && html`
        <div class="club-swap-settings">
          <div class="club-input-label">Slippage Tolerance (%)</div>
          <div class="club-pct-row">
            <button class="club-pct-btn${slippage === '0.1' ? ' active' : ''}" onClick=${() => setSlippage('0.1')}>0.1%</button>
            <button class="club-pct-btn${slippage === '0.5' ? ' active' : ''}" onClick=${() => setSlippage('0.5')}>0.5%</button>
            <button class="club-pct-btn${slippage === '1' ? ' active' : ''}" onClick=${() => setSlippage('1')}>1%</button>
            <button class="club-pct-btn${slippage === '3' ? ' active' : ''}" onClick=${() => setSlippage('3')}>3%</button>
            <button class="club-pct-btn${slippage === '49' ? ' active' : ''}" onClick=${() => setSlippage('49')}>Max</button>
          </div>
        </div>
      `}

      <div class="club-input-label">Membership Plan</div>
      <div class="club-swap-plan-row">
        <button class="club-swap-plan-btn${plan === 'staked' ? ' active' : ''}" onClick=${() => { setPlan('staked'); setStakedQty('1'); setHolderQty('0') }}>
          <div class="club-swap-plan-name">Staker</div>
          <div class="club-swap-plan-desc">170 WHL — member channels + boost</div>
        </button>
        <button class="club-swap-plan-btn${plan === 'holder' ? ' active' : ''}" onClick=${() => { setPlan('holder'); setStakedQty('0'); setHolderQty('1') }}>
          <div class="club-swap-plan-name">Holder</div>
          <div class="club-swap-plan-desc">280 WHL — post + reply access</div>
        </button>
        <button class="club-swap-plan-btn${plan === 'both' ? ' active' : ''}" onClick=${() => { setPlan('both'); setStakedQty('1'); setHolderQty('1') }}>
          <div class="club-swap-plan-name">Both</div>
          <div class="club-swap-plan-desc">Full access — staker + holder</div>
        </button>
      </div>

      ${plan !== 'holder' && html`
        <${QtyStepper} label="Staker memberships" qty=${stakedQty} setQty=${setStakedQty} base=${STAKED_BASE} min="1" max="100" />
      `}

      ${plan !== 'staked' && html`
        <${QtyStepper} label="Holder memberships" qty=${holderQty} setQty=${setHolderQty} base=${HOLDER_BASE} min="1" max="100" />
      `}

      <div class="club-swap-total-row">
        <span class="club-swap-total-label">Total WHL needed</span>
        <span class="club-swap-total-value">${totalWHL.toLocaleString()} WHL</span>
      </div>

      <div class="club-swap-divider"></div>

      <div class="club-swap-pay-row">
        <span class="club-swap-pay-label">Pay with</span>
        <select class="club-swap-select" value=${fromToken.symbol} onChange=${e => {
          const t = SWAP_TOKENS.find(s => s.symbol === e.target.value)
          setFromToken(t); setPreview(null)
        }}>
          ${SWAP_TOKENS.map(t => html`<option value=${t.symbol}>${t.symbol}</option>`)}
        </select>
      </div>

      ${totalWHL >= 1 && html`
        <div class="club-swap-preview">
          ${quoteLoading && !preview && html`
            <div class="club-swap-quote-loading">
              <div class="spinner" style="width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:club-spin 0.8s linear infinite"></div>
              <span>Fetching quote...</span>
            </div>
          `}
          ${!quoteLoading && !preview && html`
            <div class="club-swap-quote-failed">No quote available for this route.</div>
          `}
          ${preview && html`
            <div>
              <div class="club-info-row highlight">
                <span class="club-info-label">Cost</span>
                <span class="club-info-value">${fmtToken(preview.inAmount.toString(), fromToken.decimals)} ${fromToken.symbol}${usdPrice ? html`<span class="club-swap-usd"> ≈ $${usdPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>` : ''}</span>
              </div>
              <div class="club-swap-rate">
                1 WHL = ${fmtToken((preview.price).toString(), fromToken.decimals)} ${fromToken.symbol}
              </div>
              <div class="club-swap-min-received">
                Max cost: ${fmtToken((preview.inAmount + (preview.inAmount * BigInt(Math.floor(parseFloat(slippage) * 100)) / 10000n)).toString(), fromToken.decimals)} ${fromToken.symbol}
                <span class="club-swap-slippage-tag">${slippage === '49' ? 'Max' : slippage + '%'} slippage</span>
              </div>
              ${gasEstimate && html`
                <div class="club-swap-gas">Est. gas: ${Number(gasEstimate).toLocaleString()} units</div>
              `}
              ${insufficient && html`
                <div class="club-warning" style="margin-top:8px">
                  <svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                  <span>Insufficient ${fromToken.symbol} balance.</span>
                </div>
              `}
            </div>
          `}
        </div>
      `}

      <div class="club-swap-balance-line">Balance: ${maxAmount} ${fromToken.symbol}</div>

      <div class="club-swap-disclaimer">
        Swaps execute directly against the Uniswap V2 WHL pool via the on-chain router. No intermediary, no custodian — your wallet interacts with the smart contract. Whaleroom does not facilitate the sale of WHL. To swap WHL back for any token, use <a href="https://app.uniswap.org/swap?inputCurrency=0x2af72850c504dDD3c1876C66a914cAee7Ff8a46A&chain=mainnet" target="_blank" rel="noopener" class="club-swap-disclaimer-link">Uniswap</a> or any popular DEX.
      </div>

      ${pending && txHash && html`
        <div class="club-tx-pending">
          <div class="spinner"></div>
          <span>Swapping... <a href="https://etherscan.io/tx/${txHash}" target="_blank" style="color:var(--accent)">View</a></span>
        </div>
      `}

      ${pending && !txHash && html`
        <div class="club-tx-pending">
          <div class="spinner"></div>
          <span>Confirm in wallet...</span>
        </div>
      `}

      <div class="club-btn-row">
        ${needsApproval
          ? html`<button class="club-btn club-btn-primary club-btn-full" onClick=${doApprove} disabled=${pending || !preview}>Approve ${fromToken.symbol}</button>`
          : html`<button class="club-btn club-btn-primary club-btn-full" onClick=${doSwap} disabled=${pending || !preview || insufficient}>${insufficient ? 'Insufficient ' + fromToken.symbol : 'Swap for ' + totalWHL.toLocaleString() + ' WHL'}</button>`
        }
      </div>
    </div>
  `
}

// ── FAQ ──

function FaqItem ({ question, children }) {
  const [open, setOpen] = useState(false)
  return html`
    <div class="club-faq-item${open ? ' open' : ''}">
      <button class="club-faq-q" onClick=${() => setOpen(!open)}>
        <span>${question}</span>
        <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      ${open && html`<div class="club-faq-a">${children}</div>`}
    </div>
  `
}

function FaqSection () {
  return html`
    <div class="club-faq">
      <${FaqItem} question="Is the contract safe and immutable?">
        <p>The WHLC membership contract is <strong>fully immutable</strong> — there is no upgrade path, no admin key, and no pause function. Once deployed, the code cannot be changed by anyone, including the Whaleroom team.</p>
        <p>The contract was forked from a battle-tested POWH/P3D-style template and then <strong>independently audited</strong>. The audit found no critical vulnerabilities. It has no admin functions, no backdoors, and no special privileges for any address.</p>
        <p>Your WHL is always backed 1:1 by the contract's WHL balance. Distributions come from contributions paid by other members — it is real WHL, not minted tokens.</p>
      <//>
      <${FaqItem} question="What does decentralized and permissionless mean here?">
        <p>The contract operates entirely on-chain with no off-chain dependencies. There are no servers controlling access, no admin functions that can freeze tokens, and no mechanism to change the rules after deployment.</p>
        <p>Anyone can interact with the contract directly — you don't need Whaleroom's website. The commitment, withdrawal, distribution, and referral mechanics are all enforced by Ethereum consensus. The contract will continue to function as long as Ethereum exists.</p>
      <//>
      <${FaqItem} question="What is a social utility token?">
        <p>WHLC is a <strong>social utility token</strong> — it represents membership commitment in a community, not a financial product. Its purpose is to align participation: members who contribute to the ecosystem are rewarded with distributions, and those distributions can be restaked to deepen membership or collected as WHL to contribute however the member sees fit.</p>
        <p>The 10% entry and exit contributions exist precisely to filter out short-term speculators who try to game token-based systems. The contract rewards community members who contribute and penalizes those who are there for the wrong reasons. Every join and every leave funds the distribution pool for everyone who stays.</p>
        <p>There is no expectation of profit from the efforts of others. Distributions come entirely from voluntary contributions by members who choose to join or leave. No promoter, manager, or team generates returns — the contract is autonomous and simply redistributes contributions according to fixed, public rules that cannot be changed.</p>
      <//>
      <${FaqItem} question="How does joining the club work?">
        <p>Commit WHL to receive WHLC membership tokens at a 1:1 ratio minus a 10% entry contribution. The contribution is shared proportionally with all existing members. WHLC represents your membership commitment and participates in community distributions from future joiners and leavers.</p>
      <//>
      <${FaqItem} question="Where do distributions come from?">
        <p>Distributions come from three sources, all voluntary member actions:</p>
        <ul>
          <li>Entry contributions (10%) paid by new members joining</li>
          <li>Exit contributions (10%) paid by members who leave</li>
          <li>Direct contributions from members who choose to support the community</li>
        </ul>
        <p>Distributions accrue automatically — no action needed. Collect them as WHL or restake them into more WHLC to increase your membership position.</p>
      <//>
      <${FaqItem} question="What is the referral program?">
        <p>Share your referral link with others. When someone joins the club using your link, you receive 2% of their commitment as a distribution. Referral distributions are added to your pending balance and can be collected or restaked.</p>
      <//>
      <${FaqItem} question="How do I leave the club?">
        <p>Return WHLC to reclaim your WHL. A 10% exit contribution applies and is shared with remaining members. Use the percentage buttons or Max button to choose your amount, or use Full Exit to leave and collect all pending distributions in one transaction.</p>
      <//>
      <${FaqItem} question="What is the 170 WHLC threshold?">
        <p>Holding at least 170 WHLC grants you member access on Whaleroom, including member-only channels, boosted posts, and the ability to decrypt encrypted posts. If a withdrawal would drop you below this threshold, a warning will appear.</p>
      <//>
      <${FaqItem} question="Why do I need to approve first?">
        <p>Joining and contributing require the WHLC contract to pull WHL from your wallet. Approving grants the contract permission to spend your WHL up to the specified amount. This is a standard ERC-20 security mechanism — you only need to approve once per amount.</p>
      <//>
      <${FaqItem} question="Where can I view my transactions?">
        <p>All club activity is on-chain. View your history on <a href="https://etherscan.io/token/0x15e5d409001eaff5076af14cd7a4f3268f266445" target="_blank" rel="noopener">Etherscan</a> by filtering for the WHLC contract address.</p>
      <//>
    </div>
  `
}

// ── Main App ──

function ClubApp () {
  const [wallet, setWallet] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(false)
  const [globalStats, setGlobalStats] = useState(null)
  const [totalStaked, setTotalStaked] = useState(0n)
  const [toast, showToast] = useToast()
  const [tab, setTab] = useState('overview')
  const [wcData, setWcData] = useState(null)

  // Check for #get-whl hash to auto-open tab
  useEffect(() => {
    if (window.location.hash === '#get-whl') setTab('getwhl')
  }, [])

  async function connect () {
    setConnecting(true)
    try {
      await ensureChain()
      const addr = await getWallet()
      setWallet(addr)
    } catch (err) {
      if (err.message === 'IOS_NO_WALLET') {
        return startWalletConnect()
      }
      showToast(err.message || 'Failed to connect', 'error')
    } finally {
      setConnecting(false)
    }
  }

  async function startWalletConnect () {
    setConnecting(true)
    try {
      const wc = await import('/js/wallet-connector.js')
      const { uri, approval } = await wc.connectWallet()
      const wcUrl = uri ? `wc:${uri}@2?relay-protocol=irn&relay-data=%7B%22protocol%22%3A%22irn%22%7D` : ''
      const deepLink = `https://wallet.metamask.io/wc?uri=${encodeURIComponent(wcUrl)}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wcUrl)}`
      setWcData({ qrUrl, deepLink })
      const addr = await wc.awaitApproval(approval)
      if (addr) {
        setWallet(addr)
        setWcData(null)
      }
    } catch (err) {
      showToast(err.message || 'WalletConnect failed', 'error')
      setWcData(null)
    } finally {
      setConnecting(false)
    }
  }

  // Check for referral in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      sessionStorage.setItem('whaleroom_ref', ref)
    }
  }, [])

  // Auto-connect if previously connected
  useEffect(() => {
    initTheme()
    const provider = window.ethereum || mmSdkProvider
    if (provider) {
      provider.request({ method: 'eth_accounts' }).then(accounts => {
        if (accounts.length) setWallet(accounts[0])
      }).catch(() => {})
      if (window.ethereum) {
        window.ethereum.on?.('accountsChanged', (accounts) => {
          setWallet(accounts.length ? accounts[0] : '')
          setBalances(null)
        })
      }
    }
  }, [])

  // Load data when wallet connects
  async function refresh () {
    if (!wallet) return
    setLoading(true)
    try {
      const [whl, whlc, divs, supply, power, inv] = await Promise.all([
        readWHLBalance(wallet),
        readWHLCBalance(wallet),
        readDividendsOf(wallet),
        readTotalSupply(),
        readTotalPower(),
        readInvested(wallet)
      ])
      setBalances({ whl, whlc, dividends: divs })
      setGlobalStats({ supply, power })
      setTotalStaked(inv)
    } catch (err) {
      showToast('Failed to load data: ' + (err.message || ''), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!wallet) return
    refresh()
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [wallet])

  if (!wallet) {
    return html`
      <div class="club-app">
        <div class="club-header">
          <div class="club-header-brand">
            <img src="/icons/favicon.png" width="28" height="28" alt="Whaleroom" />
            <h1>WHL Club</h1>
          </div>
          <div class="club-header-actions">
            <button class="club-theme-toggle" onClick=${toggleTheme} title="Toggle theme">
              <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <a class="club-back" href="/">
              <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Feed
            </a>
          </div>
        </div>
        <div class="club-not-connected">
          ${wcData ? html`
            <h2>Connect via WalletConnect</h2>
            <p>Scan with MetaMask or tap to connect.</p>
            ${wcData.qrUrl && html`
              <div style="display:flex;justify-content:center;margin:12px 0">
                <img src=${wcData.qrUrl} alt="QR" style="width:160px;height:160px;border-radius:8px;border:1px solid var(--border)" />
              </div>
            `}
            ${wcData.deepLink && html`
              <a href=${wcData.deepLink} style="display:block;padding:10px;text-align:center;background:var(--accent);color:#fff;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:8px">
                Open in MetaMask
              </a>
            `}
            <p style="font-size:11px;color:var(--text-secondary);text-align:center">Waiting for approval...</p>
          ` : html`
            <h2>Connect Your Wallet</h2>
            <p>Connect to join the WHL Club, participate in fee sharing, and access member features.</p>
            <button class="club-connect-btn" onClick=${connect} disabled=${connecting}>
              ${connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          `}
        </div>
        ${toast.msg && html`<div class="club-toast ${toast.type}">${toast.msg}</div>`}
      </div>
    `
  }

  const whlBalance = balances?.whl ? fmt(balances.whl.toString()) : '0'
  const whlcBalance = balances?.whlc ? fmt(balances.whlc.toString()) : '0'
  const pendingRewardsBalance = balances?.dividends ? fmt(balances.dividends.toString()) : '0'
  const totalLocked = globalStats?.power ? fmt(globalStats.power.toString(), 2) : '0'
  const totalWhlcSupply = globalStats?.supply ? fmt(globalStats.supply.toString(), 2) : '0'

  return html`
    <div class="club-app">
      <div class="club-header">
        <div class="club-header-brand">
          <img src="/icons/favicon.png" width="28" height="28" alt="Whaleroom" />
          <h1>WHL Club</h1>
        </div>
        <div class="club-header-actions">
          <button class="club-theme-toggle" onClick=${toggleTheme} title="Toggle theme">
            <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <a class="club-back" href="/">
            <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Feed
          </a>
        </div>
      </div>

      <div class="club-wallet">
        <span class="club-wallet-address connected">${shortAddr(wallet)}</span>
        <button class="club-connect-btn" onClick=${() => { setWallet(''); setBalances(null) }}>
          Disconnect
        </button>
      </div>

      ${loading && !balances && html`
        <div class="club-loading"><div class="spinner"></div> Loading...</div>
      `}

      ${balances && html`
        <div>
          <div class="club-tabs">
            <button class="club-tab${tab === 'overview' ? ' active' : ''}" onClick=${() => setTab('overview')}>Overview</button>
            <button class="club-tab${tab === 'faq' ? ' active' : ''}" onClick=${() => setTab('faq')}>FAQ</button>
            <button class="club-tab${tab === 'getwhl' ? ' active' : ''}" onClick=${() => setTab('getwhl')}>Get WHL</button>
            <button class="club-tab${tab === 'stake' ? ' active' : ''}" onClick=${() => setTab('stake')}>Stake</button>
            <button class="club-tab${tab === 'unstake' ? ' active' : ''}" onClick=${() => setTab('unstake')}>Unstake</button>
          </div>

          ${tab === 'overview' && html`
            <div class="club-tab-content">
              <div class="club-section-title">Your Position</div>
              <div class="club-stats">
                <${StatCard} label="WHL Balance" value=${whlBalance} sub="Available to commit" />
                <${StatCard} label="WHLC Membership" value=${whlcBalance} sub="Your membership stake" />
                <${StatCard} label="Total Committed" value=${fmt(totalStaked.toString(), 2)} sub="Lifetime WHL committed" />
                <${StatCard} label="Pending Distributions" value=${pendingRewardsBalance} sub="Collectible WHL" />
              </div>

              <div class="club-section-title">Pool Stats</div>
              <div class="club-stats">
                <${StatCard} label="Total WHL Locked" value=${totalLocked} sub="Held by contract" />
                <${StatCard} label="Total WHLC Supply" value=${totalWhlcSupply} sub="Members outstanding" />
              </div>

              <div class="club-section-title">Distributions</div>
              <${RewardsPanel} balances=${balances} onToast=${showToast} onRefresh=${refresh} />

              <div class="club-section-title">Why Join</div>
              <div class="club-why-join">
                <div class="club-why-item">
                  <div class="club-why-icon">
                    <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="club-why-body">
                    <div class="club-why-title">Join the Club</div>
                    <div class="club-why-desc">Commit WHL to receive WHLC membership tokens. Every join, leave, and transfer in the community generates distributions shared proportionally with all members — no inflation, no team allocation.</div>
                  </div>
                </div>
                <div class="club-why-item">
                  <div class="club-why-icon">
                    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="club-why-body">
                    <div class="club-why-title">Membership Has Weight</div>
                    <div class="club-why-desc">Holding 170+ WHLC unlocks member-only channels, boosted posts, and enhanced feed features. The 10% exit contribution makes spam economically irrational — each abuse cycle costs 20% round-trip.</div>
                  </div>
                </div>
                <div class="club-why-item">
                  <div class="club-why-icon">
                    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="club-why-body">
                    <div class="club-why-title">Boost What Matters</div>
                    <div class="club-why-desc">Contribute WHL to the community pool to boost posts you believe in. Contributors pay, all members receive distributions, authors get reputation. Three-way alignment without pay-for-content.</div>
                  </div>
                </div>
                <div class="club-why-item">
                  <div class="club-why-icon">
                    <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="club-why-body">
                    <div class="club-why-title">Grow Your Membership</div>
                    <div class="club-why-desc">Restake distributions to grow your membership position automatically. The longer you participate, the more you accumulate, the more you contribute by leaving. Loyalty is economically reinforced, not just social.</div>
                  </div>
                </div>
                <div class="club-why-item">
                  <div class="club-why-icon">
                    <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </div>
                  <div class="club-why-body">
                    <div class="club-why-title">Referral Growth Loop</div>
                    <div class="club-why-desc">Share your referral link and receive 2% of every commitment that comes through it. Growth funded by the membership fee structure, not team allocation or inflation.</div>
                  </div>
                </div>
              </div>
            </div>
          `}

          ${tab === 'stake' && html`
            <div class="club-tab-content">
              <${StakeCard} wallet=${wallet} balances=${balances} onToast=${showToast} onRefresh=${refresh} />
              <${ContributeCard} onToast=${showToast} onRefresh=${refresh} />
              <${ReferralCard} wallet=${wallet} />
            </div>
          `}

          ${tab === 'getwhl' && html`
            <div class="club-tab-content">
              <${SwapCard} wallet=${wallet} onToast=${showToast} onRefresh=${refresh} />
              <div class="club-card">
                <div class="club-card-title">Cross-chain via NEAR</div>
                <div class="club-card-desc">
                  Swap from any token across 30+ chains to ETH or USDC. No bridge needed — best rate routing automatically.
                </div>
                <a href="https://near.com/login" target="_blank" rel="noopener" class="club-dex-btn">
                  Open NEAR
                </a>
              </div>
            </div>
          `}

          ${tab === 'unstake' && html`
            <div class="club-tab-content">
              <${UnstakeCard} wallet=${wallet} balances=${balances} onToast=${showToast} onRefresh=${refresh} />
              <div class="club-section-title">Danger Zone</div>
              <${FullExitCard} onToast=${showToast} onRefresh=${refresh} />
            </div>
          `}

          ${tab === 'faq' && html`
            <div class="club-tab-content">
              <${FaqSection} />
            </div>
          `}
        </div>
      `}

      ${toast.msg && html`<div class="club-toast ${toast.type}">${toast.msg}</div>`}
    </div>
  `
}

render(html`<${ClubApp} />`, document.getElementById('app'))
