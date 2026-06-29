import {
  getGovernanceConfig, createProposal, listProposals, getProposal,
  castVote, getProposalVotes, getProposalState, checkQuorum,
  checkVoteSucceeded, executeProposal, cancelProposal
} from '../governance.js'
import { verifyProof } from '../token-gate.js'
import { readBody } from '../http.js'

async function requireProof (req, res) {
  const body = await readBody(req)
  let parsed
  try { parsed = JSON.parse(body) } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'invalid json' }))
    return null
  }
  if (!parsed.proof) {
    res.writeHead(401, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Proof required' }))
    return null
  }
  const result = await verifyProof(parsed.proof.address, parsed.proof.signature, parsed.proof.nonce, parsed.proof.timestamp)
  if (!result.valid) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: result.reason || 'Invalid proof' }))
    return null
  }
  return { proof: parsed.proof, body: parsed }
}

function json (res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data, (k, v) => typeof v === 'bigint' ? v.toString() : v))
}

// GET /api/governance/config
async function handleGovConfig (req, res, url, ctx) {
  json(res, 200, getGovernanceConfig())
}

// GET /api/governance/proposals
async function handleListProposals (req, res, url, ctx) {
  const proposals = listProposals().map(p => ({
    ...p,
    state: getProposalState(p),
    quorumReached: checkQuorum(p),
    voteSucceeded: checkVoteSucceeded(p)
  }))
  json(res, 200, { proposals })
}

// GET /api/governance/proposals/:id — needs query param since no path params
async function handleGetProposal (req, res, url, ctx) {
  const id = url.searchParams.get('id')
  if (!id) { json(res, 400, { error: 'id required' }); return }
  const proposal = getProposal(id)
  if (!proposal) { json(res, 404, { error: 'Not found' }); return }
  const votes = getProposalVotes(id)
  json(res, 200, {
    proposal: {
      ...proposal,
      state: getProposalState(proposal),
      quorumReached: checkQuorum(proposal),
      voteSucceeded: checkVoteSucceeded(proposal)
    },
    votes
  })
}

// POST /api/governance/proposals — create proposal (requires proof)
async function handleCreateProposal (req, res, url, ctx) {
  const auth = await requireProof(req, res)
  if (!auth) return
  const { body } = auth
  if (!body.type || !body.slug) {
    json(res, 400, { error: 'type and slug required' })
    return
  }
  if (body.type !== 'create-feed' && body.type !== 'delete-feed') {
    json(res, 400, { error: 'type must be create-feed or delete-feed' })
    return
  }
  const result = await createProposal(
    body.type, body.slug, body.name || body.slug, body.description || '',
    body.color || 'var(--accent)', auth.proof.address
  )
  if (result.error) { json(res, 400, result); return }
  json(res, 201, result)
}

// POST /api/governance/vote — cast vote (requires proof)
async function handleVote (req, res, url, ctx) {
  const auth = await requireProof(req, res)
  if (!auth) return
  const { body } = auth
  if (!body.proposalId || body.support === undefined) {
    json(res, 400, { error: 'proposalId and support required' })
    return
  }
  const result = await castVote(
    body.proposalId, body.support, auth.proof.address,
    body.signature, body.nonce
  )
  if (result.error) { json(res, 400, result); return }
  json(res, 200, {
    vote: result.vote,
    proposal: {
      ...result.proposal,
      state: getProposalState(result.proposal),
      quorumReached: checkQuorum(result.proposal),
      voteSucceeded: checkVoteSucceeded(result.proposal)
    }
  })
}

// POST /api/governance/execute — execute passed proposal (requires proof)
async function handleExecute (req, res, url, ctx) {
  const auth = await requireProof(req, res)
  if (!auth) return
  const { body } = auth
  if (!body.proposalId) {
    json(res, 400, { error: 'proposalId required' })
    return
  }
  const result = await executeProposal(body.proposalId, ctx)
  if (result.error) { json(res, 400, result); return }
  json(res, 200, {
    proposal: {
      ...result.proposal,
      state: getProposalState(result.proposal),
      quorumReached: checkQuorum(result.proposal),
      voteSucceeded: checkVoteSucceeded(result.proposal)
    }
  })
}

export const governanceRoutes = [
  { method: 'GET', path: '/api/governance/config', handler: handleGovConfig },
  { method: 'GET', path: '/api/governance/proposals', handler: handleListProposals },
  { method: 'GET', path: '/api/governance/proposal', handler: handleGetProposal },
  { method: 'POST', path: '/api/governance/proposals', handler: handleCreateProposal },
  { method: 'POST', path: '/api/governance/vote', handler: handleVote },
  { method: 'POST', path: '/api/governance/execute', handler: handleExecute }
]
