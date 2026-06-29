import nacl from 'https://esm.sh/tweetnacl@1.0.3'

// ── Hex utils ──
function bytesToHex (bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}
function hexToBytes (hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  return bytes
}

// ── iOS detection ──
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

// ── EIP-6963 wallet discovery ──
function discoverWallets (timeout = 2000) {
  return new Promise(resolve => {
    const wallets = []
    function onAnnounce (e) {
      const { info, provider } = e.detail
      if (info && provider) wallets.push({ info, provider })
    }
    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    const pollInterval = setInterval(() => {
      if (wallets.length === 0 && window.ethereum) {
        wallets.push({
          info: { name: 'Browser Wallet', icon: null, uuid: 'fallback', rdns: 'unknown' },
          provider: window.ethereum
        })
      }
    }, 200)

    setTimeout(() => {
      clearInterval(pollInterval)
      window.removeEventListener('eip6963:announceProvider', onAnnounce)
      if (wallets.length === 0 && window.ethereum) {
        wallets.push({
          info: { name: 'Browser Wallet', icon: null, uuid: 'fallback', rdns: 'unknown' },
          provider: window.ethereum
        })
      }
      resolve(wallets)
    }, timeout)
  })
}

// ── Request accounts with fallbacks ──
async function requestAccounts (eth) {
  try {
    return await eth.request({ method: 'eth_requestAccounts' })
  } catch (err) {
    const msg = err?.message || ''
    if (err?.code !== 5000 && err?.code !== 4001 && err?.code !== -32603 && !/caip.?25/i.test(msg)) throw err
  }

  try {
    await eth.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
    return await eth.request({ method: 'eth_accounts' })
  } catch (err) {
    const msg = err?.message || ''
    if (!/authorizedScopes|bip122|caip.?25/i.test(msg) && err?.code !== 5000 && err?.code !== 4001 && err?.code !== -32603) throw err
  }

  const accounts = await eth.request({ method: 'eth_accounts' })
  if (accounts?.length) return accounts
  throw new Error('Wallet returned no accounts.')
}

// ── Derive Ed25519 seed from wallet signature ──
async function deriveFromWallet (provider) {
  const eth = provider || window.ethereum
  if (!eth) throw new Error('No wallet detected')
  const accounts = await requestAccounts(eth)
  const address = accounts[0]
  const message = `Whaleroom Identity\nAddress: ${address}`
  const signature = await eth.request({ method: 'personal_sign', params: [message, address] })
  const sigBytes = hexToBytes(signature.slice(2))
  const hashBuffer = await crypto.subtle.digest('SHA-256', sigBytes)
  const seed = new Uint8Array(hashBuffer)
  const kp = nacl.sign.keyPair.fromSeed(seed)
  return { seedHex: bytesToHex(seed), publicKeyHex: bytesToHex(kp.publicKey), walletAddress: address }
}

// ── UI state ──
let derivedSeed = null
let derivedWallet = null

async function discover () {
  const btn = document.getElementById('btn-discover')
  const status = document.getElementById('discover-status')
  btn.disabled = true
  btn.innerHTML = '<span class="spinner"></span>Discovering wallets...'
  status.textContent = ''

  try {
    const wallets = await discoverWallets()
    if (wallets.length === 0) {
      if (isIOS) {
        await startWalletConnect(status, btn)
      } else {
        status.className = 'status error'
        status.textContent = 'No wallets found. Make sure MetaMask is installed, unlocked, and enabled on this site.'
        btn.disabled = false
        btn.textContent = 'Try Again'
      }
      return
    }
    if (wallets.length === 1) {
      await signWith(wallets[0].provider)
      return
    }
    showPicker(wallets)
  } catch (err) {
    status.className = 'status error'
    status.textContent = err.message || 'Failed to discover wallets'
    btn.disabled = false
    btn.textContent = 'Try Again'
  }
}

async function startWalletConnect (status, btn) {
  status.className = 'status'
  status.innerHTML = '<span class="spinner"></span>Starting WalletConnect...'
  btn.disabled = true

  try {
    const wc = await import('/js/wallet-connector.js')
    const { uri, approval } = await wc.connectWallet()
    const wcUrl = uri ? `wc:${uri}@2?relay-protocol=irn&relay-data=%7B%22protocol%22%3A%22irn%22%7D` : ''
    const deepLink = `https://wallet.metamask.io/wc?uri=${encodeURIComponent(wcUrl)}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wcUrl)}`

    status.innerHTML = `<div style="margin:10px 0"><img src="${qrUrl}" alt="QR" style="width:160px;height:160px;border-radius:8px;border:1px solid var(--border)" /></div>
      <a href="${deepLink}" style="display:block;padding:10px;text-align:center;background:var(--accent);color:#fff;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:8px">Open in MetaMask</a>
      <p style="font-size:11px;color:var(--text-secondary)">Scan QR or tap button. Then approve in MetaMask.</p>`
    btn.innerHTML = '<span class="spinner"></span>Waiting for approval...'

    const addr = await wc.awaitApproval(approval)
    if (!addr) throw new Error('No account returned')
    const provider = wc.getProvider()
    await signWith(provider)
  } catch (err) {
    status.className = 'status error'
    status.textContent = err.message || 'WalletConnect failed'
    btn.disabled = false
    btn.textContent = 'Try Again'
  }
}

function showPicker (wallets) {
  document.getElementById('step-discover').classList.add('hidden')
  const step = document.getElementById('step-pick')
  step.classList.remove('hidden')
  const list = document.getElementById('wallet-list')
  list.innerHTML = ''
  for (const w of wallets) {
    const item = document.createElement('div')
    item.className = 'wallet-item'
    item.onclick = () => signWith(w.provider)
    if (w.info.icon) {
      const img = document.createElement('img')
      img.src = w.info.icon
      item.appendChild(img)
    }
    const name = document.createElement('span')
    name.textContent = w.info.name
    item.appendChild(name)
    list.appendChild(item)
  }
}

async function signWith (provider) {
  const status = document.getElementById('pick-status') ||
                 document.getElementById('discover-status')
  status.className = 'status'
  status.textContent = 'Waiting for wallet signature...'

  try {
    const result = await deriveFromWallet(provider)
    derivedSeed = result.seedHex
    derivedWallet = result.walletAddress
    onSuccess(result)
  } catch (err) {
    status.className = 'status error'
    status.textContent = err.message || 'Signing failed'
  }
}

function onSuccess ({ seedHex }) {
  document.getElementById('step-discover').classList.add('hidden')
  document.getElementById('step-pick').classList.add('hidden')
  document.getElementById('step-done').classList.remove('hidden')

  const seedInput = document.getElementById('seed-input')
  seedInput.value = seedHex
}

function toggleSeed () {
  const input = document.getElementById('seed-input')
  const btn = document.getElementById('btn-toggle-seed')
  if (input.type === 'password') {
    input.type = 'text'
    btn.textContent = 'Hide'
  } else {
    input.type = 'password'
    btn.textContent = 'Reveal'
  }
}

function copySeed () {
  if (!derivedSeed) return
  const payload = derivedWallet ? `${derivedSeed}:${derivedWallet}` : derivedSeed
  navigator.clipboard.writeText(payload).then(() => {
    const btn = document.getElementById('btn-copy-seed')
    btn.textContent = 'Copied!'
    setTimeout(() => { btn.textContent = 'Copy Seed' }, 2000)
  })
}

function openInDesktop () {
  window.location.replace('whaleroom://import')
}

document.getElementById('btn-discover').addEventListener('click', discover)
document.getElementById('btn-copy-seed').addEventListener('click', copySeed)
document.getElementById('btn-toggle-seed').addEventListener('click', toggleSeed)
document.getElementById('btn-open-desktop').addEventListener('click', openInDesktop)
