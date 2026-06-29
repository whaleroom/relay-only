import { html, useState, useEffect, useRef } from '../deps.js'
import { generateAvatar } from '../avatar-generator.js'

const SW = 30

function renderAnimatedShapes (grid, colors) {
  const shapes = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const color = colors[row][col]
      const cx = col * 200 + 100
      const cy = row * 200 + 100
      const cls = `shape-${row}-${col}`
      // Start invisible — animation reveals them
      const base = { stroke: color, 'stroke-width': SW, 'stroke-linecap': 'round', fill: 'transparent', opacity: '0' }

      switch (grid[row][col]) {
        case 'circle':
          shapes.push(html`<circle class=${cls} cx=${cx} cy=${cy} r="70" ...${base} />`)
          break
        case 'cross': {
          const d = 55
          shapes.push(html`<line class="${cls}-a" x1=${cx - d} y1=${cy - d} x2=${cx + d} y2=${cy + d} ...${base} />`)
          shapes.push(html`<line class="${cls}-b" x1=${cx - d} y1=${cy + d} x2=${cx + d} y2=${cy - d} ...${base} />`)
          break
        }
        case 'square':
          shapes.push(html`<rect class=${cls} x=${cx - 65} y=${cy - 65} width="130" height="130" rx="18" ...${base} />`)
          break
      }
    }
  }
  return shapes
}

export function AvatarModal ({ author, onClose }) {
  const svgRef = useRef(null)
  const animRef = useRef(null)
  const config = generateAvatar(author)

  useEffect(() => {
    if (!svgRef.current) return
    // Lazy-load animation module (fetches motion from CDN on first use)
    import('../avatar-animate.js').then(({ playAvatarDraw }) => {
      animRef.current = playAvatarDraw(svgRef.current, config)
    })
    return () => { animRef.current?.cancel?.() }
  }, [author])

  function handleBackdropClick (e) {
    if (e.target.classList.contains('avatar-modal-backdrop')) {
      animRef.current?.cancel?.()
      onClose()
    }
  }

  return html`
    <div class="avatar-modal-backdrop" onClick=${handleBackdropClick}>
      <div class="avatar-modal-frame">
        <svg ref=${svgRef} viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg"
          class="avatar-modal-svg">
          <rect width="600" height="600" fill="#0D1117" />
          ${renderAnimatedShapes(config.grid, config.colors)}
        </svg>
        <div class="avatar-modal-id">@${author}</div>
      </div>
    </div>
  `
}
