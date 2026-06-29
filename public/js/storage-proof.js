import { ethers } from 'https://esm.sh/ethers@6.17.0'

// ── Client-side storage proof generation ──
//
// Uses the server's /api/rpc proxy to avoid CORS issues with direct
// browser-to-RPC calls. The server proxies to its configured RPC providers.

function computeBalanceSlot (walletAddress, mappingSlot = 0) {
  const padded = ethers.zeroPadValue(walletAddress, 32)
  const slot = ethers.zeroPadValue('0x' + mappingSlot.toString(16).padStart(2, '0'), 32)
  const encoded = ethers.solidityPacked(['bytes32', 'bytes32'], [padded, slot])
  return ethers.keccak256(encoded)
}

// Send an RPC request through the server proxy
async function rpcProxy (method, params) {
  const res = await fetch('/api/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  if (!res.ok) throw new Error('RPC proxy failed: ' + res.status)
  const data = await res.json()
  if (data.error) throw new Error('RPC error: ' + data.error.message)
  return data.result
}

// Generate a storage proof for the user's token balance
export async function generateStorageProof (walletAddress, contractAddress, mappingSlot = 0) {
  // Get latest block via proxy
  const blockHex = await rpcProxy('eth_blockNumber', [])
  const blockNumber = parseInt(blockHex, 16)

  // Get full block for blockHash
  const block = await rpcProxy('eth_getBlockByNumber', [blockHex, false])

  // Compute the storage slot for balanceOf(address)
  const slot = computeBalanceSlot(walletAddress, mappingSlot)
  console.log(`storage-proof: wallet=${walletAddress} slot=${mappingSlot} key=${slot} block=${blockNumber}`)

  // Get the proof via proxy
  const proof = await rpcProxy('eth_getProof', [
    contractAddress,
    [slot],
    blockHex
  ])

  return {
    address: walletAddress,
    contractAddress,
    accountProof: proof.accountProof,
    storageProof: proof.storageProof,
    blockNumber,
    blockHash: block.hash
  }
}

// Try multiple token contracts — return the first proof with non-zero balance
export async function generateBalanceProof (walletAddress, tokenConfigs) {
  for (const token of tokenConfigs) {
    try {
      console.log(`storage-proof: generating for ${token.symbol} (slot ${token.balanceSlot || 0})...`)
      const proof = await generateStorageProof(walletAddress, token.address, token.balanceSlot || 0)
      const sp = proof.storageProof[0]
      console.log(`storage-proof: ${token.symbol} storageProof:`, sp ? `value=${sp.value}` : 'empty')
      if (sp && BigInt(sp.value) > 0n) {
        return { proof, token }
      }
    } catch (err) {
      console.log(`storage-proof: ${token.symbol} failed:`, err.message, err.stack)
    }
  }
  throw new Error('Could not generate a valid balance proof — do you hold sufficient tokens?')
}
