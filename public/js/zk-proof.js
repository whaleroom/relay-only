import { groth16 } from 'https://esm.sh/snarkjs@0.7.6'

// ── Client-side ZK proof generation ──
//
// Generates a Groth16 zero-knowledge proof in the browser that the user's
// token balance meets the threshold, without revealing the balance or address.
//
// The circuit (BalanceThresholdSimple) takes:
//   Private: balance, address, salt
//   Public:  threshold, blockNumber
//   Outputs: valid (1 if balance >= threshold), nullifier (Poseidon hash)
//
// The server verifies the proof and checks:
//   1. The proof is cryptographically valid
//   2. valid == 1
//   3. nullifier hasn't been seen before (replay protection)
//
// The circuit artifacts (wasm + zkey) are fetched from the server.

let _wasmBuffer = null
let _zkeyBuffer = null

async function loadCircuitArtifacts () {
  if (!_wasmBuffer) {
    const res = await fetch('/api/circuits/main.wasm')
    if (!res.ok) throw new Error('Circuit WASM not available on this node')
    _wasmBuffer = await res.arrayBuffer()
  }
  if (!_zkeyBuffer) {
    const res = await fetch('/api/circuits/circuit_final.zkey')
    if (!res.ok) throw new Error('Circuit zkey not available on this node')
    _zkeyBuffer = await res.arrayBuffer()
  }
  return { wasm: _wasmBuffer, zkey: _zkeyBuffer }
}

// Generate a ZK proof that balance >= threshold
// balance: the user's token balance as a string (in base units / wei)
// threshold: the minimum balance as a string (in base units / wei)
// address: the user's Ethereum address as a decimal string
// blockNumber: the current block number as a string
// recipientHash: Poseidon hash of the X25519 recipient public key (as decimal string)
export async function generateZKProof (balance, threshold, address, blockNumber, recipientHash) {
  const { wasm, zkey } = await loadCircuitArtifacts()

  const input = {
    balance: balance.toString(),
    threshold: threshold.toString(),
    address: address.toString(),
    blockNumber: blockNumber.toString(),
    recipientHash: recipientHash.toString()
  }

  const { proof, publicSignals } = await groth16.fullProve(
    input,
    new Uint8Array(wasm),
    new Uint8Array(zkey)
  )

  return { proof, publicSignals }
}

// Check if ZK circuit artifacts are available on the current node
export async function checkZKAvailable () {
  try {
    const res = await fetch('/api/circuits/available')
    if (!res.ok) return false
    const data = await res.json()
    return data.available === true
  } catch {
    return false
  }
}
