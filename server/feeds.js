const FEED_DEFAULTS = {
  bitcoin:      { id: 'db42b3d5d6c3c7d9f6bbb5a100f7b03badcb013ce11be690b303b877d563bbb6', name: 'Bitcoin' },
  crypto:       { id: '56cae120458d306f3277373617857a8a70e256b377a4c99cf67d44cad74e6bc9', name: 'Crypto' },
  ai:           { id: '03ea6e38b58892d52d05bd31b9ded48b43d6c6fc75ab4767e28d0b950ce13e2d', name: 'AI' },
  privacy:      { id: 'e55015928e23cef822dd8fa35293b91d49dcb51f7c1dd2336d2225edca2e8763', name: 'Privacy' },
  biotech:      { id: '64f9d3246f6d3978c8a9f5fd054a9cbf5d13aeb55ecd2260a5cdd0596d1b37bb', name: 'Biotech' },
  geopolitics:  { id: 'e6680e060136b62ca43f7f1aa120b61cd88b9b1f2ec575615cae1cfd9dc106d0', name: 'Geopolitics' },
  predictions:  { id: '0e58d228220eecb27e06fddbe152c7323bf0b63cb070a0b7c56e3490b7cb7da7', name: 'Prediction Markets' },
  news:         { id: 'a41b860299d1a1e58a96b3c70143c165b3a401a84b6fd9d5880999d73a1f573e', name: 'News' }
}

export function buildFeeds () {
  const FEEDS = Object.fromEntries(
    Object.entries(FEED_DEFAULTS).map(([slug, defaults]) => {
      const id = process.env[`FEED_ID_${slug.toUpperCase()}`] || defaults.id
      // Encryption key: must be a random 32-byte secret (64 hex chars).
      // Set via FEED_KEY_<SLUG> env var on the seed node.
      // NOT derived from feed.id — that would be spoofable from public source.
      const keyHex = process.env[`FEED_KEY_${slug.toUpperCase()}`] || null
      return [slug, { id, slug, name: defaults.name, keyHex }]
    })
  )
  const FEED_BY_SLUG = Object.fromEntries(Object.entries(FEEDS).map(([k, v]) => [k, v]))
  const FEED_BY_ID = Object.fromEntries(Object.values(FEEDS).map(v => [v.id, v]))
  return { FEEDS, FEED_BY_SLUG, FEED_BY_ID }
}
