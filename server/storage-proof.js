import { ethers } from 'ethers'
import { verifyStorageProof, computeBalanceSlot, fetchBlockHeaderQuorum } from './trie-verify.js'
import { RPC_URLS } from './token-gate.js'

// ── Storage proof verification ──
//
// Instead of the server calling balanceOf(address) via RPC (trusting the
// RPC provider for the balance data), the CLIENT generates a storage proof
// and submits it. The server verifies the proof cryptographically.
//
// The server only queries RPCs for block headers (publicly verifiable),
// not for balance data. The balance is proven by the Merkle-Patricia trie
// proof tied to the block header's stateRoot.

const TOKEN_CONTRACTS = [
  { symbol: 'WHL', address: (process.env.TOKEN_CONTRACT || '0x2af72850c504ddd3c1876c66a914caee7ff8a46a').toLowerCase(), minBalance: process.env.TOKEN_MIN_BALANCE || '280', decimals: 18, balanceSlot: 0 },
  { symbol: 'WHLC', address: (process.env.TOKEN_CONTRACT_2 || '0x15E5d409001EAfF5076Af14cd7a4f3268f266445').toLowerCase(), minBalance: process.env.TOKEN_MIN_BALANCE_2 || '170', decimals: 18, balanceSlot: 11 }
]

const MAX_BLOCK_AGE = 100 // accept proofs up to 100 blocks behind current head

// Verify a storage proof submission
// submission: { address, contractAddress, accountProof, storageProof, blockNumber }
export async function verifyBalanceProof (submission) {
  const { address, contractAddress, accountProof, storageProof, blockNumber } = submission

  if (!address || !contractAddress || !accountProof || !storageProof || blockNumber == null) {
    return { valid: false, reason: 'missing required fields' }
  }

  // Verify the contract address is one of our known token contracts (C5 fix)
  const tokenConfig = TOKEN_CONTRACTS.find(t => t.address === contractAddress.toLowerCase())
  if (!tokenConfig) {
    return { valid: false, reason: 'unknown token contract' }
  }

  // H5: Check block number recency
  const latestHeader = await fetchBlockHeaderQuorum(RPC_URLS, 'latest')
  if (!latestHeader) {
    return { valid: false, reason: 'could not fetch latest block header for recency check' }
  }
  const blockNum = parseInt(blockNumber, 10)
  const latestNum = parseInt(latestHeader.number, 10)
  if (blockNum > latestNum || (latestNum - blockNum) > MAX_BLOCK_AGE) {
    return { valid: false, reason: `block ${blockNum} is too old or in the future (latest: ${latestNum}, max age: ${MAX_BLOCK_AGE})` }
  }

  // Step 1: Fetch block header with quorum for the proof's block
  const header = await fetchBlockHeaderQuorum(RPC_URLS, blockNumber)
  if (!header || !header.stateRoot) {
    return { valid: false, reason: 'could not obtain block header quorum for proof block' }
  }

  // Step 2: Compute the storage slot for balanceOf(address) using the token's mapping slot
  const balanceSlot = tokenConfig.balanceSlot || 0
  const slot = computeBalanceSlot(address, balanceSlot)

  // Step 3: Verify the storage proof against the block's stateRoot
  // C1+C2 fix: pass contractAddress for account proof, walletAddress for storage slot, and the slot key
  const result = await verifyStorageProof(
    accountProof,
    storageProof,
    contractAddress,
    address,
    header.stateRoot,
    slot
  )

  if (!result.valid) {
    return { valid: false, reason: result.reason }
  }

  // Step 4: Check if the proven balance meets the threshold
  // C4 fix: use server-side decimals, never trust client-supplied decimals
  const balance = ethers.toBigInt(result.balance)
  const dec = tokenConfig.decimals
  const min = ethers.parseUnits(tokenConfig.minBalance, dec)
  if (balance < min) {
    return { valid: false, reason: `insufficient balance (proven: ${ethers.formatUnits(balance, dec)}, required: ${tokenConfig.minBalance})`, balance: balance.toString() }
  }

  return {
    valid: true,
    address: address.toLowerCase(),
    balance: balance.toString(),
    symbol: tokenConfig.symbol,
    blockNumber: blockNum,
    stateRoot: header.stateRoot
  }
}

// Client-side helper: generate a storage proof via eth_getProof
// This runs in the browser — the client calls their own RPC to get the proof
// then submits it to the server for verification
export async function generateStorageProof (rpcUrl, walletAddress, contractAddress, blockTag = 'latest') {
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const block = await provider.getBlock(blockTag)
  if (!block) throw new Error('Could not fetch block')

  const slot = computeBalanceSlot(walletAddress)

  // eth_getProof is a standard JSON-RPC method
  const proof = await provider.send('eth_getProof', [contractAddress, [slot], block.number])

  return {
    address: walletAddress,
    contractAddress,
    accountProof: proof.accountProof,
    storageProof: proof.storageProof,
    blockNumber: block.number,
    blockHash: block.hash
  }
}
