import { html, useEffect, useRef } from '../deps.js'

let _animate = null
const getAnimate = () => _animate
  ? Promise.resolve(_animate)
  : import('motion').then(m => { _animate = m.animate; return _animate })

/**
 * AnimatedCount — smoothly tweens between numeric values
 * Props:
 *   value  – the target number
 *   class  – optional CSS class
 */
export function AnimatedCount ({ value, class: cls }) {
  const ref = useRef(null)
  const prev = useRef(value)
  const anim = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const from = prev.current
    const to = value
    prev.current = to

    if (from === to) {
      el.textContent = to > 0 ? to : ''
      return
    }

    // Cancel any running animation
    if (anim.current) { try { anim.current.stop() } catch {} }

    getAnimate().then(animate => {
      anim.current = animate(from, to, {
        duration: 0.4,
        ease: 'circOut',
        onUpdate: (v) => {
          const rounded = Math.round(v)
          el.textContent = rounded > 0 ? rounded : ''
        }
      })
    })
  }, [value])

  return html`<span ref=${ref} class=${cls || ''}>${value > 0 ? value : ''}</span>`
}
