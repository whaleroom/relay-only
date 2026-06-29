import { html, useState, useEffect } from '../deps.js'
import { myWalletAddress, tokenGateVerified } from '../state.js'
import {
  fetchGovConfig, fetchProposals, createGovernanceProposal,
  castGovernanceVote, executeGovernanceProposal
} from '../api.js'
import { showToast } from '../state.js'

function timeLeft (ms) {
  if (ms <= 0) return 'ended'
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function fmtBalance (val) {
  const n = Number(val) / 1e18
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  if (n >= 1) return n.toFixed(1)
  return n.toFixed(2)
}

function ProposalCard ({ proposal, onVote, onExecute, myVote }) {
  const state = proposal.state
  const now = Date.now()
  const timeRemaining = proposal.votingEnds - now
  const quorumPct = proposal.quorumReached ? 100 : Math.min(100, (Number(proposal.forVotes) / (Number(proposal.totalSupplyAtSnapshot) * 0.04)) * 100)
  const forPct = Number(proposal.forVotes) + Number(proposal.againstVotes) > 0
    ? (Number(proposal.forVotes) / (Number(proposal.forVotes) + Number(proposal.againstVotes) + Number(proposal.abstainVotes))) * 100
    : 0
  const againstPct = Number(proposal.forVotes) + Number(proposal.againstVotes) > 0
    ? (Number(proposal.againstVotes) / (Number(proposal.forVotes) + Number(proposal.againstVotes) + Number(proposal.abstainVotes))) * 100
    : 0

  const stateColor = {
    active: 'var(--green)',
    queued: 'var(--accent)',
    'execution-ready': 'var(--accent)',
    executed: 'var(--text-secondary)',
    cancelled: 'var(--danger)'
  }[state] || 'var(--text-secondary)'

  return html`
    <div class="gov-proposal">
      <div class="gov-proposal-header">
        <div class="gov-proposal-type">${proposal.type === 'create-feed' ? '＋ Create Feed' : '✕ Delete Feed'}</div>
        <div class="gov-proposal-state" style=${{ color: stateColor }}>${state}</div>
      </div>
      <div class="gov-proposal-title">${proposal.name}</div>
      <div class="gov-proposal-slug">/${proposal.slug}</div>
      ${proposal.description && html`<div class="gov-proposal-desc">${proposal.description}</div>`}
      <div class="gov-proposal-meta">
        <span>Block #${proposal.snapshotBlock}</span>
        <span>By ${proposal.proposer.slice(0, 8)}</span>
        <span>${timeLeft(timeRemaining)} left</span>
      </div>
      <div class="gov-vote-bars">
        <div class="gov-vote-bar-for" style=${{ width: forPct + '%' }}></div>
        <div class="gov-vote-bar-against" style=${{ width: againstPct + '%' }}></div>
      </div>
      <div class="gov-vote-counts">
        <span class="gov-vote-for">For ${fmtBalance(proposal.forVotes)}</span>
        <span class="gov-vote-against">Against ${fmtBalance(proposal.againstVotes)}</span>
        <span class="gov-vote-abstain">Abstain ${fmtBalance(proposal.abstainVotes)}</span>
      </div>
      <div class="gov-quorum-bar">
        <div class="gov-quorum-fill" style=${{ width: quorumPct + '%' }}></div>
      </div>
      <div class="gov-quorum-label">
        Quorum ${quorumPct.toFixed(0)}% (need 4%)
      </div>
      <div class="gov-proposal-actions">
        ${state === 'active' && !myVote && html`
          <button class="gov-btn gov-btn-for" onClick=${() => onVote(proposal.id, 1)}>Vote For</button>
          <button class="gov-btn gov-btn-against" onClick=${() => onVote(proposal.id, 0)}>Vote Against</button>
          <button class="gov-btn gov-btn-abstain" onClick=${() => onVote(proposal.id, 2)}>Abstain</button>
        `}
        ${state === 'active' && myVote && html`
          <div class="gov-voted-badge">Voted: ${['Against', 'For', 'Abstain'][myVote.support]}</div>
        `}
        ${state === 'execution-ready' && proposal.voteSucceeded && proposal.quorumReached && html`
          <button class="gov-btn gov-btn-execute" onClick=${() => onExecute(proposal.id)}>Execute</button>
        `}
        ${state === 'execution-ready' && (!proposal.voteSucceeded || !proposal.quorumReached) && html`
          <div class="gov-failed-badge">Did not pass</div>
        `}
        ${state === 'executed' && html`<div class="gov-executed-badge">Executed</div>`}
      </div>
    </div>
  `
}

function CreateProposalForm ({ onCreate, onCancel }) {
  const [type, setType] = useState('create-feed')
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6c5ce7')
  const [busy, setBusy] = useState(false)

  async function submit () {
    if (!slug.trim()) { showToast('Feed slug required', 'error'); return }
    if (type === 'create-feed' && !name.trim()) { showToast('Feed name required', 'error'); return }
    setBusy(true)
    try {
      await onCreate(type, slug.trim().toLowerCase(), name.trim(), description.trim(), color)
    } finally {
      setBusy(false)
    }
  }

  return html`
    <div class="gov-create-form">
      <h3>New Proposal</h3>
      <div class="gov-form-row">
        <label>Type</label>
        <select value=${type} onChange=${(e) => setType(e.target.value)}>
          <option value="create-feed">Create Feed</option>
          <option value="delete-feed">Delete Feed</option>
        </select>
      </div>
      <div class="gov-form-row">
        <label>Slug</label>
        <input type="text" placeholder="e.g. defi" value=${slug}
          onInput=${(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/g, '').toLowerCase())} />
      </div>
      ${type === 'create-feed' && html`
        <div class="gov-form-row">
          <label>Name</label>
          <input type="text" placeholder="e.g. DeFi" value=${name} onInput=${(e) => setName(e.target.value)} />
        </div>
        <div class="gov-form-row">
          <label>Description</label>
          <textarea placeholder="What is this feed about?" value=${description}
            onInput=${(e) => setDescription(e.target.value)} rows="2"></textarea>
        </div>
        <div class="gov-form-row">
          <label>Color</label>
          <input type="color" value=${color} onInput=${(e) => setColor(e.target.value)} />
        </div>
      `}
      <div class="gov-form-actions">
        <button class="gov-btn gov-btn-primary" onClick=${submit} disabled=${busy}>
          ${busy ? 'Creating...' : 'Create Proposal'}
        </button>
        <button class="gov-btn" onClick=${onCancel}>Cancel</button>
      </div>
    </div>
  `
}

export function Governance ({ open, onClose }) {
  const [config, setConfig] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [voting, setVoting] = useState(null)
  const [myVotes, setMyVotes] = useState({})

  async function refresh () {
    setLoading(true)
    try {
      const [cfg, data] = await Promise.all([fetchGovConfig(), fetchProposals()])
      setConfig(cfg)
      setProposals(data.proposals || [])
    } catch (err) {
      showToast('Failed to load proposals', 'error')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (open) refresh()
  }, [open])

  async function handleVote (proposalId, support) {
    if (!myWalletAddress.value || !window.ethereum) {
      showToast('Connect wallet first', 'error')
      return
    }
    setVoting(proposalId)
    try {
      const nonce = BigInt(Math.floor(Math.random() * 1e15))
      const cfg = config
      const sig = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [myWalletAddress.value, JSON.stringify({
          domain: cfg.domain,
          types: { ...cfg.types, EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' }
          ] },
          primaryType: 'Ballot',
          message: { proposalId, support: BigInt(support), voter: myWalletAddress.value, nonce: nonce.toString() }
        })]
      })
      const result = await castGovernanceVote(proposalId, support, sig, nonce.toString())
      if (result.error) {
        showToast(result.error, 'error')
      } else {
        showToast('Vote cast', 'success')
        setMyVotes(prev => ({ ...prev, [proposalId]: result.vote }))
        refresh()
      }
    } catch (err) {
      showToast(err.message || 'Vote failed', 'error')
    }
    setVoting(null)
  }

  async function handleExecute (proposalId) {
    try {
      const result = await executeGovernanceProposal(proposalId)
      if (result.error) {
        showToast(result.error, 'error')
      } else {
        showToast('Proposal executed', 'success')
        refresh()
      }
    } catch (err) {
      showToast(err.message || 'Execution failed', 'error')
    }
  }

  async function handleCreate (type, slug, name, description, color) {
    const result = await createGovernanceProposal(type, slug, name, description, color)
    if (result.error) {
      showToast(result.error, 'error')
    } else {
      showToast('Proposal created', 'success')
      setShowCreate(false)
      refresh()
    }
  }

  if (!open) return null

  const verified = tokenGateVerified.value

  return html`
    <div class="modal-overlay open" onClick=${onClose}>
      <div class="gov-modal" onClick=${(e) => e.stopPropagation()}>
        <div class="gov-header">
          <h2>Governance</h2>
          <button class="modal-close" onClick=${onClose}>✕</button>
        </div>
        ${config && html`
          <div class="gov-info-bar">
            <span>Voting: ${config.whlcContract.slice(0, 8)}...</span>
            <span>Period: 3 days</span>
            <span>Quorum: 4%</span>
            <span>Zero gas (signed ballot)</span>
          </div>
        `}
        ${verified && html`
          <button class="gov-btn gov-btn-primary gov-new-btn" onClick=${() => setShowCreate(!showCreate)}>
            ${showCreate ? 'Cancel' : '+ New Proposal'}
          </button>
        `}
        ${showCreate && verified && html`
          <${CreateProposalForm} onCreate=${handleCreate} onCancel=${() => setShowCreate(false)} />
        `}
        ${loading ? html`<div class="gov-loading">Loading proposals...</div>` : html`
          <div class="gov-proposal-list">
            ${proposals.length === 0
              ? html`<div class="gov-empty">No proposals yet. Create one to propose a new feed.</div>`
              : proposals.map(p => html`<${ProposalCard} key=${p.id} proposal=${p}
                  myVote=${myVotes[p.id]}
                  onVote=${handleVote} onExecute=${handleExecute} />`)
            }
          </div>
        `}
        ${!verified && html`
          <div class="gov-not-verified">Verify your token holdings to participate in governance.</div>
        `}
      </div>
    </div>
  `
}
