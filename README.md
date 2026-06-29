# WhaleRoom Relay Node

A standalone relay-only node for the WhaleRoom P2P network. Replicates the full Autobase log, serves the web UI and API, and relays encrypted key grants. No bridge, no AI curation, no Python dependencies.

## Quick start

```bash
cd circuits/relay-only
npm install
cp .env.example .env
# Edit .env with your FEED_KEY from the seed node operator
npm start
```

Open http://localhost:4488

## What it does

- **Replicates** the full append-only log (posts, likes, follows, key grants, front page editions)
- **Serves** the web UI and HTTP API to browsers
- **Relays** encrypted key grants without ever holding plaintext keys
- **Verifies** token gate proofs (ZK, storage proof, EIP-712) for key grant requests
- **Moderates** posts with static spam/clickbait/scam filters (no AI — static rules only)

## Requirements

- Node.js 20+
- ~500MB RAM
- ~1GB disk (grows with log)
- Public IP or port forward

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FEED_KEY` | Yes | — | 64-char hex key from seed node |
| `PORT` | No | 4444 | HTTP server port |
| `BIND_ADDR` | No | 0.0.0.0 | Bind address |
| `DATA_DIR` | No | ./data | Hypercore storage directory |
| `BRIDGE_ENABLED` | No | false | Keep false for relay-only |
| `TOKEN_GATE_ENABLED` | No | true | Enable/disable token gate |
| `RPC_URL` | No | cloudflare-eth,1rpc.io | Ethereum RPC endpoints |

## License

MIT
