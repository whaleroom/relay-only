import { RLP } from '@ethereumjs/rlp'
import { Trie } from '@ethereumjs/trie'
import { ethers } from 'ethers'

// ── Merkle-Patricia Trie verification for Ethereum storage proofs ──
//
// Verifies an eth_getProof response against a known block header's
// stateRoot and storageRoot. This allows a server to verify a user's
// token balance WITHOUT trusting an RPC provider for the balance data —
// only block headers need to be trusted (and those are verifiable via
// light client / consensus).

// Full verification: account proof + storage proof against a block header
// accountProof: array of RLP-encoded trie nodes (from eth_getProof)
// storageProof: { key, value, proof }[] (from eth_getProof)
// contractAddress: the token contract address (account proof is for THIS, not the wallet)
// walletAddress: the user's wallet address (used to compute the storage slot)
// blockStateRoot: the state root from the block header
// storageSlotKey: the keccak256 slot key we care about (hex string)
export async function verifyStorageProof (accountProof, storageProof, contractAddress, walletAddress, blockStateRoot, storageSlotKey) {
  try {
    // Step 1: Verify the account proof — proves the TOKEN CONTRACT account exists in the state trie
    const stateTrie = new Trie({ root: toBuffer(blockStateRoot) })
    const contractBuf = toBuffer(contractAddress)
    const accountKey = ethers.keccak256(contractBuf) // trie keys are keccak256 of the key

    // Verify the account proof using EthereumJS
    const proofBufs = accountProof.map(p => toBuffer(p))
    const accountValue = await stateTrie.verifyProof(toBuffer(blockStateRoot), accountKey, proofBufs)

    if (!accountValue) {
      return { valid: false, reason: 'account not found in state trie' }
    }

    // Decode the account RLP: [nonce, balance, storageHash, codeHash]
    const decoded = RLP.decode(accountValue)
    const accountNonce = decoded[0]
    const accountBalance = decoded[1]
    const storageHash = decoded[2]
    const codeHash = decoded[3]

    // Step 2: Find the storage proof for our slot
    // storageSlotKey is already the keccak256 hash of the packed (address, slot) —
    // eth_getProof returns storageProof[].key as the same hashed key
    const slotProof = storageProof.find(sp => sp.key.toLowerCase() === storageSlotKey.toLowerCase())
    if (!slotProof) {
      return { valid: false, reason: 'no storage proof for the requested slot' }
    }

    // Step 3: Verify the storage proof against the account's storageHash
    const storageTrie = new Trie({ root: toBuffer(storageHash) })
    const storageKey = storageSlotKey // already hashed — trie keys are keccak256 of the slot
    const storageProofBufs = slotProof.proof.map(p => toBuffer(p))
    const storageValue = await storageTrie.verifyProof(toBuffer(storageHash), storageKey, storageProofBufs)

    if (storageValue === null) {
      return { valid: false, reason: 'storage slot not found in storage trie' }
    }

    // Step 4: Decode the storage value (RLP-encoded)
    const valueDecoded = RLP.decode(storageValue)
    const balance = ethers.toBigInt(valueDecoded)

    return {
      valid: true,
      balance: balance.toString(),
      storageHash: toHexString(storageHash),
      accountBalance: toHexString(accountBalance)
    }
  } catch (err) {
    return { valid: false, reason: 'verification error: ' + err.message }
  }
}

// Compute the storage slot for balanceOf(address) on an ERC20 contract
// mapping(address => uint256) balanceOf is at slot 0
// Storage slot = keccak256(abi.encode(address, 0))
export function computeBalanceSlot (walletAddress, mappingSlot = 0) {
  const padded = ethers.zeroPadValue(walletAddress, 32)
  const slot = ethers.zeroPadValue('0x' + mappingSlot.toString(16).padStart(2, '0'), 32)
  const encoded = ethers.solidityPacked(['bytes32', 'bytes32'], [padded, slot])
  return ethers.keccak256(encoded)
}

// Fetch and verify block headers from multiple RPC providers (quorum)
// Returns the block header if a quorum of providers agree
export async function fetchBlockHeaderQuorum (rpcUrls, blockTag = 'latest') {
  const headers = []
  for (const url of rpcUrls) {
    try {
      const provider = new ethers.JsonRpcProvider(url)
      const block = await provider.getBlock(blockTag)
      if (block) {
        headers.push({
          number: block.number,
          hash: block.hash,
          stateRoot: block.stateRoot,
          timestamp: block.timestamp,
          source: url
        })
      }
    } catch { /* skip failed providers */ }
  }

  if (headers.length === 0) return null

  // Require at least 2 providers to agree (quorum)
  // Group by stateRoot
  const groups = {}
  for (const h of headers) {
    const key = h.stateRoot.toLowerCase()
    if (!groups[key]) groups[key] = []
    groups[key].push(h)
  }

  // Find the stateRoot with the most agreement
  let best = null
  let bestCount = 0
  for (const [root, group] of Object.entries(groups)) {
    if (group.length > bestCount) {
      best = group[0]
      bestCount = group.length
    }
  }

  if (bestCount < 2) {
    // Only 1 RPC provider — accept it (single-provider mode)
    // In production with multiple RPCs, require 2+ for quorum
    if (headers.length === 1) return headers[0]
    return null // multiple providers disagree — refuse to verify
  }

  return best
}

// Helper: convert hex string or Buffer to Buffer
function toBuffer (val) {
  if (Buffer.isBuffer(val)) return val
  if (typeof val === 'string') {
    const hex = val.startsWith('0x') ? val.slice(2) : val
    return Buffer.from(hex, 'hex')
  }
  throw new Error('Cannot convert to buffer: ' + typeof val)
}

// Helper: convert Buffer to hex string
function toHexString (buf) {
  return '0x' + Buffer.from(buf).toString('hex')
}
