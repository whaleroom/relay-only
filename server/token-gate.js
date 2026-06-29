import { ethers } from 'ethers'
import crypto from 'node:crypto'

export const RPC_URLS = (process.env.RPC_URL || 'https://cloudflare-eth.com,https://1rpc.io/eth')
  .split(',').map(s => s.trim()).filter(Boolean)
const TOKEN_CONTRACT = process.env.TOKEN_CONTRACT || '0x2af72850c504ddd3c1876c66a914caee7ff8a46a'
const TOKEN_CHAIN_ID = parseInt(process.env.TOKEN_CHAIN_ID || '1', 10)
const TOKEN_GATE_ENABLED = process.env.TOKEN_GATE_ENABLED !== 'false'
const MIN_BALANCE = process.env.TOKEN_MIN_BALANCE || '1'

const TOKEN_CONTRACTS = [
  { symbol: 'WHL', address: process.env.TOKEN_CONTRACT || '0x2af72850c504ddd3c1876c66a914caee7ff8a46a', minBalance: process.env.TOKEN_MIN_BALANCE || '280' },
  { symbol: 'WHLC', address: process.env.TOKEN_CONTRACT_2 || '0x15E5d409001EAfF5076Af14cd7a4f3268f266445', minBalance: process.env.TOKEN_MIN_BALANCE_2 || '170' }
]

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]

const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)'
]

const DOMAIN = {
  name: 'Whaleroom',
  version: '1',
  chainId: TOKEN_CHAIN_ID,
  verifyingContract: TOKEN_CONTRACT
}

const TYPES = {
  Proof: [
    { name: 'address', type: 'address' },
    { name: 'nonce', type: 'uint256' },
    { name: 'timestamp', type: 'uint256' }
  ]
}

async function callWithFallback (fn) {
  let lastErr
  for (const url of RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(url)
      return await fn(provider)
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

export function isTokenGateEnabled () {
  return TOKEN_GATE_ENABLED && !!TOKEN_CONTRACT && RPC_URLS.length > 0
}

export function getGateConfig () {
  return {
    enabled: isTokenGateEnabled(),
    tokenContract: TOKEN_CONTRACT,
    chainId: TOKEN_CHAIN_ID,
    domain: DOMAIN,
    types: TYPES,
    minBalance: MIN_BALANCE,
    requirements: TOKEN_CONTRACTS.map(({ symbol, address, minBalance }) => ({ symbol, address, minBalance }))
  }
}

export async function verifyProof (address, signature, nonce, timestamp) {
  if (!isTokenGateEnabled()) {
    return { valid: true, reason: 'token gate disabled' }
  }

  const now = Date.now()
  if (Math.abs(now - timestamp) > 1000 * 60 * 60 * 24) {
    return { valid: false, reason: 'proof expired (max 24h)' }
  }

  let recovered
  try {
    recovered = ethers.verifyTypedData(DOMAIN, TYPES, {
      address,
      nonce: BigInt(nonce),
      timestamp: BigInt(timestamp)
    }, signature)
  } catch {
    return { valid: false, reason: 'invalid signature' }
  }

  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return { valid: false, reason: 'signature does not match address' }
  }

  const { valid, balance, reason } = await checkHoldings(address)
  return { valid, balance: balance?.toString(), reason, address: address.toLowerCase() }
}

export async function checkHoldings (address) {
  for (const { symbol, address: addr, minBalance } of TOKEN_CONTRACTS) {
    if (!addr) continue
    try {
      let decimals = 18
      try {
        decimals = Number(await callWithFallback(provider =>
          new ethers.Contract(addr, ERC20_ABI, provider).decimals()))
      } catch { decimals = 18 }
      const balance = await callWithFallback(provider =>
        new ethers.Contract(addr, ERC20_ABI, provider).balanceOf(address))
      const min = ethers.parseUnits(minBalance, decimals)
      if (balance >= min) {
        return { valid: true, balance: balance.toString(), symbol }
      }
    } catch { /* try next contract */ }
  }
  return { valid: false, reason: 'insufficient holdings (need 280 WHL or 170 WHLC)' }
}

export async function verifyTokenOwnership (address, signature, nonce, timestamp) {
  return verifyProof(address, signature, nonce, timestamp)
}

const SYNC_CODE_TTL = 1000 * 60
const syncCodes = new Map()

function cleanExpiredSyncCodes () {
  const now = Date.now()
  for (const [code, entry] of syncCodes) {
    if (now - entry.ts > SYNC_CODE_TTL) syncCodes.delete(code)
  }
}

export function createSyncCode (proof) {
  cleanExpiredSyncCodes()
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0')
  syncCodes.set(code, { proof, ts: Date.now() })
  return code
}

export function redeemSyncCode (code) {
  cleanExpiredSyncCodes()
  const entry = syncCodes.get(code)
  if (!entry) return null
  syncCodes.delete(code)
  return { proof: entry.proof }
}

export async function getTokenBalances (walletAddress) {
  if (!walletAddress) return []
  const results = []
  for (const { symbol, address } of TOKEN_CONTRACTS) {
    if (!address) continue
    try {
      const { balance, decimals, isNft } = await fetchTokenInfo(address, walletAddress)
      const formatted = isNft
        ? balance.toString()
        : ethers.formatUnits(balance, decimals)
      results.push({ symbol, address, balance: formatted, raw: balance.toString(), decimals: isNft ? 0 : Number(decimals), isNft })
    } catch {
      results.push({ symbol, address, balance: '0', raw: '0', decimals: 18, isNft: false, error: true })
    }
  }
  return results
}

async function fetchTokenInfo (contractAddr, walletAddr) {
  let decimals = 18
  let isNft = false
  try {
    decimals = Number(await callWithFallback(provider =>
      new ethers.Contract(contractAddr, ERC20_ABI, provider).decimals()))
  } catch {
    decimals = 18
  }
  const balance = await callWithFallback(provider =>
    new ethers.Contract(contractAddr, ERC20_ABI, provider).balanceOf(walletAddr))
  return { balance, decimals, isNft }
}
