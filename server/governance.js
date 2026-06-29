import { ethers } from 'ethers'
import crypto from 'node:crypto'
import { RPC_URLS } from './token-gate.js'
import { initFeedKeys, setFeedKey } from './feed-keys.js'

// ── Off-chain snapshot governance ──
//
// WHLC holders vote on feed creation/deletion using EIP-712 signed ballots.
// No governance token, no wrapping, no gas. The 10% entry + 10% exit fees
// on WHLC provide natural Sybil resistance.
//
// Flow:
// 1. Proposal created → server pins a block number and snapshots total WHLC supply
// 2. Voting → users sign EIP-712 ballot with their wallet
// 3. Tally → server verifies signature + checks WHLC balance at snapshot block
// 4. Execution → if quorum passes, server creates/deletes feed + provisions keys

const WHLC_CONTRACT = process.env.TOKEN_CONTRACT_2 || '0x15E5d409001EAfF5076Af14cd7a4f3268f266445'
const CHAIN_ID = parseInt(process.env.TOKEN_CHAIN_ID || '1', 10)

const VOTING_PERIOD_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const EXECUTION_DELAY_MS = 24 * 60 * 60 * 1000   // 1 day after voting ends
const QUORUM_PERCENT = 4                          // 4% of total WHLC supply
const PROPOSAL_THRESHOLD = '170'                  // min WHLC to create proposal

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function decimals() view returns (uint8)'
]

const VOTE_DOMAIN = {
  name: 'Whaleroom Governance',
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: WHLC_CONTRACT
}

const VOTE_TYPES = {
  Ballot: [
    { name: 'proposalId', type: 'string' },
    { name: 'support', type: 'uint8' },   // 0 = against, 1 = for, 2 = abstain
    { name: 'voter', type: 'address' },
    { name: 'nonce', type: 'uint256' }
  ]
}

// In-memory proposal store (persists for server lifetime)
const proposals = new Map()
// voteStore: proposalId → Map(voterAddress → { support, signature, nonce, weight })
const voteStore = new Map()

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

export function getGovernanceConfig () {
  return {
    votingPeriodMs: VOTING_PERIOD_MS,
    executionDelayMs: EXECUTION_DELAY_MS,
    quorumPercent: QUORUM_PERCENT,
    proposalThreshold: PROPOSAL_THRESHOLD,
    whlcContract: WHLC_CONTRACT,
    domain: VOTE_DOMAIN,
    types: VOTE_TYPES
  }
}

async function getWhlcBalanceAtBlock (address, blockTag) {
  return callWithFallback(provider =>
    new ethers.Contract(WHLC_CONTRACT, ERC20_ABI, provider).balanceOf(address, { blockTag }))
}

async function getWhlcTotalSupplyAtBlock (blockTag) {
  return callWithFallback(provider =>
    new ethers.Contract(WHLC_CONTRACT, ERC20_ABI, provider).totalSupply({ blockTag }))
}

async function getCurrentBlockNumber () {
  return callWithFallback(provider => provider.getBlockNumber())
}

export async function createProposal (type, slug, name, description, color, proposerAddress) {
  // Verify proposer meets threshold
  const balance = await callWithFallback(provider =>
    new ethers.Contract(WHLC_CONTRACT, ERC20_ABI, provider).balanceOf(proposerAddress))
  const threshold = ethers.parseUnits(PROPOSAL_THRESHOLD, 18)
  if (balance < threshold) {
    return { error: `Insufficient WHLC to create proposal (need ${PROPOSAL_THRESHOLD})` }
  }

  const blockNumber = await getCurrentBlockNumber()
  const totalSupply = await getWhlcTotalSupplyAtBlock(blockNumber)
  const proposalId = crypto.randomUUID().slice(0, 8)
  const now = Date.now()

  const proposal = {
    id: proposalId,
    type,              // 'create-feed' | 'delete-feed'
    slug,
    name,
    description: description || '',
    color: color || 'var(--accent)',
    proposer: proposerAddress.toLowerCase(),
    snapshotBlock: blockNumber,
    totalSupplyAtSnapshot: totalSupply.toString(),
    createdAt: now,
    votingStarts: now,
    votingEnds: now + VOTING_PERIOD_MS,
    executionReady: now + VOTING_PERIOD_MS + EXECUTION_DELAY_MS,
    executed: false,
    cancelled: false,
    forVotes: '0',
    againstVotes: '0',
    abstainVotes: '0'
  }

  proposals.set(proposalId, proposal)
  voteStore.set(proposalId, new Map())
  console.log(`governance: proposal ${proposalId} created (${type} ${slug}) at block ${blockNumber}`)
  return { proposal }
}

export function listProposals () {
  return Array.from(proposals.values()).sort((a, b) => b.createdAt - a.createdAt)
}

export function getProposal (id) {
  return proposals.get(id) || null
}

export async function castVote (proposalId, support, voter, signature, nonce) {
  const proposal = proposals.get(proposalId)
  if (!proposal) return { error: 'Proposal not found' }
  if (proposal.executed || proposal.cancelled) return { error: 'Proposal is closed' }
  if (Date.now() > proposal.votingEnds) return { error: 'Voting period has ended' }

  // Verify EIP-712 signature
  let recovered
  try {
    recovered = ethers.verifyTypedData(VOTE_DOMAIN, VOTE_TYPES, {
      proposalId,
      support: BigInt(support),
      voter,
      nonce: BigInt(nonce)
    }, signature)
  } catch {
    return { error: 'Invalid signature' }
  }
  if (recovered.toLowerCase() !== voter.toLowerCase()) {
    return { error: 'Signature does not match voter address' }
  }

  const votes = voteStore.get(proposalId)
  const voterKey = voter.toLowerCase()

  // Check if already voted
  if (votes.has(voterKey)) {
    return { error: 'Already voted on this proposal' }
  }

  // Get voter's WHLC balance at snapshot block
  let weight
  try {
    const balance = await getWhlcBalanceAtBlock(voterKey, proposal.snapshotBlock)
    weight = balance
  } catch {
    return { error: 'Failed to verify voting weight (RPC error)' }
  }

  if (weight === 0n) {
    return { error: 'No WHLC balance at snapshot block — cannot vote' }
  }

  const vote = {
    voter: voterKey,
    support: parseInt(support, 10),
    signature,
    nonce,
    weight: weight.toString(),
    ts: Date.now()
  }
  votes.set(voterKey, vote)

  // Update tally
  if (vote.support === 1) {
    proposal.forVotes = (BigInt(proposal.forVotes) + weight).toString()
  } else if (vote.support === 0) {
    proposal.againstVotes = (BigInt(proposal.againstVotes) + weight).toString()
  } else {
    proposal.abstainVotes = (BigInt(proposal.abstainVotes) + weight).toString()
  }

  console.log(`governance: vote on ${proposalId} by ${voterKey.slice(0, 8)} — support=${support} weight=${weight.toString()}`)
  return { vote, proposal }
}

export function getProposalVotes (id) {
  const votes = voteStore.get(id)
  if (!votes) return []
  return Array.from(votes.values())
}

export function getProposalState (proposal) {
  if (proposal.cancelled) return 'cancelled'
  if (proposal.executed) return 'executed'
  const now = Date.now()
  if (now < proposal.votingEnds) return 'active'
  if (now < proposal.executionReady) return 'queued'
  return 'execution-ready'
}

export function checkQuorum (proposal) {
  const totalSupply = BigInt(proposal.totalSupplyAtSnapshot)
  if (totalSupply === 0n) return false
  const forVotes = BigInt(proposal.forVotes)
  const quorumNeeded = (totalSupply * BigInt(QUORUM_PERCENT)) / 100n
  return forVotes >= quorumNeeded
}

export function checkVoteSucceeded (proposal) {
  return BigInt(proposal.forVotes) > BigInt(proposal.againstVotes)
}

export async function executeProposal (id, ctx) {
  const proposal = proposals.get(id)
  if (!proposal) return { error: 'Proposal not found' }
  if (proposal.executed) return { error: 'Already executed' }
  if (proposal.cancelled) return { error: 'Proposal was cancelled' }

  const state = getProposalState(proposal)
  if (state !== 'execution-ready') return { error: `Proposal is ${state}, not ready for execution` }

  if (!checkQuorum(proposal)) return { error: 'Quorum not reached' }
  if (!checkVoteSucceeded(proposal)) return { error: 'Vote did not pass (more against than for)' }

  // Execute
  if (proposal.type === 'create-feed') {
    // Create new feed
    const feedId = crypto.randomBytes(32).toString('hex')
    ctx.FEEDS[proposal.slug] = { id: feedId, slug: proposal.slug, name: proposal.name }
    ctx.FEED_BY_SLUG[proposal.slug] = ctx.FEEDS[proposal.slug]
    ctx.FEED_BY_ID[feedId] = ctx.FEEDS[proposal.slug]
    // Provision encryption key for new feed
    const keyBytes = crypto.randomBytes(32)
    setFeedKey(proposal.slug, keyBytes.toString('hex'))
    console.log(`governance: created feed "${proposal.slug}" via proposal ${id}`)
  } else if (proposal.type === 'delete-feed') {
    const feed = ctx.FEEDS[proposal.slug]
    if (feed) {
      delete ctx.FEEDS[proposal.slug]
      delete ctx.FEED_BY_SLUG[proposal.slug]
      delete ctx.FEED_BY_ID[feed.id]
    }
    console.log(`governance: deleted feed "${proposal.slug}" via proposal ${id}`)
  }

  proposal.executed = true
  proposal.executedAt = Date.now()
  return { proposal }
}

export function cancelProposal (id) {
  const proposal = proposals.get(id)
  if (!proposal) return { error: 'Proposal not found' }
  if (proposal.executed) return { error: 'Already executed' }
  proposal.cancelled = true
  return { proposal }
}
