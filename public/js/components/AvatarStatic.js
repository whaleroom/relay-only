import { html } from '../deps.js'
import { generateAvatar } from '../avatar-generator.js'

const SW = 30 // stroke-width (~15% of 200px cell)

function renderShapes (grid, colors) {
  const shapes = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const color = colors[row][col]
      const cx = col * 200 + 100
      const cy = row * 200 + 100
      const cls = `shape-${row}-${col}`
      const base = { stroke: color, 'stroke-width': SW, 'stroke-linecap': 'round', fill: 'transparent' }

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

export function StaticAvatar ({ author, size = 40, onClick }) {
  const { grid, colors } = generateAvatar(author)
  return html`
    <div class="avatar avatar-gen" style="width:${size}px;height:${size}px;cursor:pointer"
      onClick=${onClick}>
      <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg"
        style="width:100%;height:100%;border-radius:50%">
        <rect width="600" height="600" fill="#0D1117" />
        ${renderShapes(grid, colors)}
      </svg>
    </div>
  `
}
