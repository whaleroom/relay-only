import { html, useState, useEffect, useRef, useCallback } from '../deps.js'
import DOMPurify from 'dompurify'
import { isAllowedImageUrl } from '../utils.js'

// ── Providers that require SDK scripts — rendered in sandboxed iframes ──
const SDK_PROVIDERS = {
  twitter: 'https://platform.twitter.com/widgets.js',
  instagram: 'https://www.instagram.com/embed.js',
  tiktok: 'https://www.tiktok.com/embed.js',
  pinterest: 'https://assets.pinterest.com/js/pinit.js',
  reddit: 'https://embed.reddit.com/widgets.js',
  tumblr: 'https://assets.tumblr.com/post.js',
  github_gist: null // gists embed via data-gist-url attribute
}

// ── Client-side embed cache ──
const embedCache = new Map()

// ── Resolve embed via server ──
async function fetchEmbed (url) {
  if (embedCache.has(url)) return embedCache.get(url)
  try {
    const res = await fetch('/api/embeds/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    if (!res.ok) return null
    const data = await res.json()
    embedCache.set(url, data)
    return data
  } catch {
    return null
  }
}

// ── Extract first embeddable URL from text ──
const URL_REGEX = /https?:\/\/[^\s]+/g

export function extractEmbedUrl (text) {
  const matches = text.match(URL_REGEX)
  if (!matches) return null
  // Return first URL that's likely embeddable, skipping image URLs already rendered inline
  return matches.find(u => !isAllowedImageUrl(u)) || null
}

// ── Link preview card ──
function LinkCard ({ embed }) {
  const domain = (() => {
    try { return new URL(embed.url).hostname.replace('www.', '') } catch { return '' }
  })()

  return html`
    <a href=${embed.url} target="_blank" rel="noopener noreferrer" class="embed-link-card">
      ${embed.thumbnail_url && html`
        <div class="embed-link-thumb">
          <img src=${embed.thumbnail_url} alt="" loading="lazy"
            onError=${(e) => { e.target.parentElement.style.display = 'none' }} />
        </div>
      `}
      <div class="embed-link-body">
        <div class="embed-link-provider">
          ${embed.favicon && html`<img src=${embed.favicon} class="embed-favicon" alt=""
            onError=${(e) => { e.target.style.display = 'none' }} />`}
          <span>${embed.site_name || embed.provider || domain}</span>
        </div>
        ${embed.title && html`<div class="embed-link-title">${embed.title}</div>`}
        ${embed.description && html`<p class="embed-link-desc">${embed.description}</p>`}
      </div>
    </a>
  `
}

// ── Sandboxed embed for providers that need SDK scripts ──
function SandboxedEmbed ({ embed }) {
  const iframeRef = useRef(null)
  const [height, setHeight] = useState(400)

  useEffect(() => {
    if (!iframeRef.current || !embed.html) return

    const sdkUrl = SDK_PROVIDERS[embed.provider]

    // Handle gist embeds — extract gist URL from the embed HTML
    let gistScript = ''
    if (embed.provider === 'github_gist') {
      const gistMatch = embed.html.match(/data-gist-url=["']([^"']+)["']/)
      if (gistMatch) {
        const gistUrl = gistMatch[1].replace(/[^a-zA-Z0-9:/.%-]/g, '')
        gistScript = `<script src="${gistUrl}.js"><\/script>`
      }
    }

    // Sanitize the embed HTML before inserting into srcdoc
    const sanitizedHtml = DOMPurify.sanitize(embed.html, {
      ADD_TAGS: ['blockquote', 'iframe'],
      ADD_ATTR: ['class', 'data-instgrm-permalink', 'data-instgrm-version',
                 'cite', 'data-tweet-url', 'data-gist-url',
                 'allow', 'allowfullscreen', 'frameborder'],
      ALLOWED_URI_REGEXP: /^https:/i
    })

    const srcdoc = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
  iframe { max-width: 100% !important; }
</style>
</head><body>
${sanitizedHtml}
${sdkUrl ? `<script src="${sdkUrl}"><\/script>` : ''}
${gistScript}
<script>
  function postHeight() {
    var h = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: 'whaleroom-embed-height', height: h }, '*');
  }
  new MutationObserver(postHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  window.addEventListener('load', function() { setTimeout(postHeight, 500); });
  setTimeout(postHeight, 1000);
  setTimeout(postHeight, 3000);
<\/script>
</body></html>`

    iframeRef.current.srcdoc = srcdoc
  }, [embed.html, embed.provider])

  // Listen for height messages from the sandboxed iframe
  useEffect(() => {
    function onMessage (e) {
      if (e.data?.type === 'whaleroom-embed-height' && e.source === iframeRef.current?.contentWindow) {
        setHeight(Math.min(e.data.height, 800))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return html`
    <div class="embed-container">
      <iframe ref=${iframeRef}
        sandbox="allow-scripts allow-same-origin allow-popups"
        style="width:100%;height:${height}px;border:none;border-radius:12px;overflow:hidden;"
        loading="lazy"
      />
    </div>
  `
}

// ── Rich / iframe embed (non-SDK, sanitized with DOMPurify) ──
function RichEmbed ({ embed }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !embed.html) return
    const cleanHtml = DOMPurify.sanitize(embed.html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading'],
      ALLOWED_URI_REGEXP: /^https:/i
    })
    containerRef.current.innerHTML = cleanHtml
  }, [embed.html, embed.provider])

  const isVideo = embed.type === 'video'
  const isAudio = embed.type === 'audio'

  return html`
    <div class="embed-container${isVideo ? ' embed-video' : ''}${isAudio ? ' embed-audio' : ''}"
      ref=${containerRef}>
    </div>
  `
}

// ── Main EmbedCard component ──
export function EmbedCard ({ url }) {
  const [embed, setEmbed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const sentinelRef = useRef(null)

  // Lazy loading — only resolve when scrolled into view
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '200px' })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  // Fetch embed data when visible
  useEffect(() => {
    if (!visible || !url) return
    let cancelled = false
    setLoading(true)
    fetchEmbed(url).then(data => {
      if (!cancelled) {
        setEmbed(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [visible, url])

  // Sentinel for lazy loading
  if (!visible) {
    return html`<div ref=${sentinelRef} class="embed-sentinel" />`
  }

  if (loading) {
    return html`<div class="embed-loading"><div class="embed-loading-bar" /></div>`
  }

  if (!embed || (!embed.html && !embed.title && embed.type !== 'link')) return null

  // Link preview fallback
  if (embed.type === 'link' || !embed.html) {
    if (!embed.title && !embed.description) return null
    return html`<${LinkCard} embed=${embed} />`
  }

  // SDK-dependent embeds → sandboxed iframe
  if (SDK_PROVIDERS[embed.provider] !== undefined) {
    return html`<${SandboxedEmbed} embed=${embed} />`
  }

  // All other rich/video/audio embeds → DOMPurify-sanitized
  return html`<${RichEmbed} embed=${embed} />`
}
