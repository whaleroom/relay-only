// Lazy-loaded animation module — only fetched on avatar tap
// Uses Motion vanilla JS animate() with pathLength for SVG path drawing

import { animate } from 'motion'

/**
 * Animate the avatar SVG path-drawing sequence.
 * @param {SVGSVGElement} svgEl — the <svg> already in the modal DOM
 * @param {object} config — { grid: string[][], colors: string[][] }
 * @returns {Animation} — call .cancel() on modal close if still running
 */
export function playAvatarDraw (svgEl, config) {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    svgEl.querySelectorAll('[class^="shape-"]').forEach(el => {
      el.style.opacity = '1'
    })
    return null
  }

  const sequence = []
  let index = 0

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const shape = config.grid[row][col]
      const at = index * 0.15

      if (shape === 'cross') {
        const lineA = svgEl.querySelector(`.shape-${row}-${col}-a`)
        const lineB = svgEl.querySelector(`.shape-${row}-${col}-b`)
        if (lineA) {
          sequence.push(
            [lineA, { pathLength: [0, 1], opacity: [0, 1] },
              { duration: 0.8, at, opacity: { duration: 0.01 } }]
          )
        }
        if (lineB) {
          sequence.push(
            [lineB, { pathLength: [0, 1], opacity: [0, 1] },
              { duration: 0.8, at: at + 0.075, opacity: { duration: 0.01 } }]
          )
        }
      } else {
        const el = svgEl.querySelector(`.shape-${row}-${col}`)
        if (el) {
          sequence.push(
            [el, { pathLength: [0, 1], opacity: [0, 1] },
              { duration: 0.8, at, opacity: { duration: 0.01 } }]
          )
        }
      }

      index++
    }
  }

  return animate(sequence)
}
