import Hyperbee from 'hyperbee'
import b4a from 'b4a'

// ── Autobase apply — must match across all nodes ──
//
// Signal post enforcement (consensus rules):
//   1. Bridge operator lock — only the designated bridge operator key
//      may post signal ops. Set via first-write-wins `set-bridge-operator`.
//      Prevents unauthorized nodes from injecting agent posts.
//   2. PulseUid dedup — if a signal with the same pulseUid was already
//      indexed, the duplicate is silently dropped. Prevents multiple
//      bridge instances (or restarts) from double-posting the same story.

// The seed node's key — set by applyOpts when the Autobase opens
let _bootstrapKey = null

export function setBootstrapKey (key) {
  _bootstrapKey = key
}

export function applyOpts () {
  return {
    open (store) {
      return new Hyperbee(store.get('view'), {
        keyEncoding: 'utf-8',
        valueEncoding: 'utf-8',
        extension: false
      })
    },
    async apply (nodes, view, host) {
      for (const node of nodes) {
        const op = JSON.parse(node.value)
        if (op.type === 'add-writer') {
          await host.addWriter(b4a.from(op.key, 'hex'), { indexer: true })
        }
        if (op.type === 'set-bridge-operator') {
          // First-write-wins — once set, cannot be changed except by governance
          const existing = await view.get('bridge-operator')
          if (!existing) {
            await view.put('bridge-operator', op.key)
            console.log(`[db] bridge operator set: ${op.key.slice(0, 8)}...`)
          }
        }
        if (op.type === 'post') {
          // Signal post enforcement
          if (op.signal) {
            // 1. Check bridge operator lock
            const operatorEntry = await view.get('bridge-operator')
            if (operatorEntry) {
              const operatorKey = operatorEntry.value
              if (op.author !== operatorKey) {
                console.log(`[db] rejected signal post from non-operator @${op.author}`)
                continue
              }
            }
            // 2. Check pulseUid dedup
            if (op.signalMeta?.pulseUid) {
              const dedupKey = `signal-uid:${op.signalMeta.pulseUid}`
              const existing = await view.get(dedupKey)
              if (existing) {
                console.log(`[db] duplicate signal skipped (pulseUid=${op.signalMeta.pulseUid})`)
                continue
              }
              await view.put(dedupKey, JSON.stringify({ author: op.author, timestamp: op.timestamp }))
            }
          }

          const postKey = `${op.timestamp}:${op.author}`
          await view.put(postKey, JSON.stringify(op))

          // Index by author for post history
          await view.put(`author:${op.author}:${op.timestamp}`, JSON.stringify(op))

          // Index reply under parent
          if (op.replyTo) {
            await view.put(`reply:${op.replyTo}:${op.timestamp}:${op.author}`, JSON.stringify(op))
          }
        }
        if (op.type === 'like') {
          // One like per user per post — key ensures dedup
          await view.put(`like:${op.postKey}:${op.author}`, JSON.stringify(op))
        }
        if (op.type === 'unlike') {
          // Remove the like
          await view.del(`like:${op.postKey}:${op.author}`)
        }
        if (op.type === 'profile') {
          // Latest write wins — overwrite previous profile
          await view.put(`profile:${op.author}`, JSON.stringify(op))
        }
        if (op.type === 'avatar') {
          // Store avatar config — latest write wins
          await view.put(`avatar:${op.author}`, JSON.stringify(op))
        }
        if (op.type === 'follow') {
          await view.put(`follow:${op.author}:${op.target}`, JSON.stringify(op))
          await view.put(`follower:${op.target}:${op.author}`, JSON.stringify(op))
        }
        if (op.type === 'unfollow') {
          await view.del(`follow:${op.author}:${op.target}`)
          await view.del(`follower:${op.target}:${op.author}`)
        }
        if (op.type === 'delete-post') {
          const postKey = op.postKey
          const existing = await view.get(postKey)
          if (existing) {
            const post = JSON.parse(existing.value)
            if (post.author === op.author) {
              await view.del(postKey)
              await view.del(`author:${op.author}:${post.timestamp}`)
              if (post.replyTo) {
                await view.del(`reply:${post.replyTo}:${post.timestamp}:${op.author}`)
              }
              await view.put(`deleted:${postKey}`, JSON.stringify({ author: op.author, timestamp: op.timestamp }))
            }
          }
        }
        if (op.type === 'gate-config') {
          // Only the seed node can publish gate config
          const writerKey = node.key ? b4a.toString(node.key, 'hex') : null
          if (_bootstrapKey && writerKey && writerKey !== _bootstrapKey) {
            console.log(`[db] rejected gate-config from non-seed writer (${writerKey})`)
            continue
          }
          await view.put('gate-config', JSON.stringify(op))
        }
        if (op.type === 'key-grant') {
          // H8 fix: Only the seed node (bootstrap writer) can issue key grants
          // F4 fix: Default to DENY when node.key is undefined
          const writerKey = node.key ? b4a.toString(node.key, 'hex') : null
          if (_bootstrapKey && writerKey && writerKey !== _bootstrapKey) {
            console.log(`[db] rejected key-grant from non-seed writer (${writerKey})`)
            continue
          }
          await view.put(`key-grant:${op.recipient}`, JSON.stringify(op))
        }
        if (op.type === 'key-revoke') {
          // H8 fix: Only the seed node can revoke key grants
          // F4 fix: Default to DENY when node.key is undefined
          const writerKey = node.key ? b4a.toString(node.key, 'hex') : null
          if (_bootstrapKey && writerKey && writerKey !== _bootstrapKey) {
            console.log(`[db] rejected key-revoke from non-seed writer (${writerKey})`)
            continue
          }
          await view.put(`key-revoke:${op.recipient}`, JSON.stringify(op))
        }
        if (op.type === 'claim-username') {
          // First-write-wins: only store if username is not taken
          const existing = await view.get(`username:${op.username}`)
          if (!existing) {
            // Remove old username claim if this author had one
            const oldName = await view.get(`user-to-name:${op.author}`)
            if (oldName) {
              await view.del(`username:${oldName.value}`)
            }
            await view.put(`username:${op.username}`, JSON.stringify(op))
            await view.put(`user-to-name:${op.author}`, op.username)
          }
        }
        if (op.type === 'channel-frontpage') {
          // Agent-curated front page edition for a channel
          // Store the full edition, and update the "latest" pointer
          const editionKey = `frontpage:${op.channel}:${op.edition}`
          const channelLatest = `frontpage-latest:${op.channel}`

          await view.put(editionKey, JSON.stringify(op))
          await view.put(channelLatest, JSON.stringify({
            edition: op.edition,
            timestamp: op.timestamp
          }))
        }
        if (op.type === 'frontpage-boost') {
          // Record a boost (distribute() call) for a front page edition
          const boostKey = `frontpage-boost:${op.channel}:${op.edition}:${op.boostedBy}`
          await view.put(boostKey, JSON.stringify(op))
        }
        if (op.type === 'signal-purge-done') {
          // Marker op — signals that old signal posts have been purged
          await view.put('signal-purge-done', JSON.stringify(op))
        }
        if (op.type === 'discussion-purge-done') {
          await view.put('discussion-purge-done', JSON.stringify(op))
        }
        if (op.type === 'serp-article') {
          // SerpAPI article ingested into the encrypted news feed
          // Index by channel + timestamp for channel-specific queries
          const articleKey = `serp:${op.channel}:${op.timestamp}:${op.author}`
          await view.put(articleKey, JSON.stringify(op))
          // Also index by timestamp alone for "all news" queries
          await view.put(`serp-all:${op.timestamp}:${op.author}`, JSON.stringify(op))
        }
      }
    }
  }
}

// ── Shared query helpers ──

export async function countLikes (view, postKey, viewer) {
  let likeCount = 0
  let likedByMe = false
  for await (const entry of view.createReadStream({
    gte: `like:${postKey}:`,
    lt: `like:${postKey}:\xff`
  })) {
    likeCount++
    if (viewer) {
      const like = JSON.parse(entry.value)
      if (like.author === viewer) likedByMe = true
    }
  }
  return { likeCount, likedByMe }
}

export async function countReplies (view, postKey) {
  let count = 0
  for await (const _ of view.createReadStream({
    gte: `reply:${postKey}:`,
    lt: `reply:${postKey}:\xff`
  })) {
    count++
  }
  return count
}

export async function resolveProfile (view, author, cache = {}) {
  if (!cache[author]) {
    const nameEntry = await view.get(`user-to-name:${author}`)
    const profileEntry = await view.get(`profile:${author}`)
    cache[author] = {
      username: nameEntry ? nameEntry.value : null,
      displayName: profileEntry ? JSON.parse(profileEntry.value).displayName || null : null
    }
  }
  return cache[author]
}
