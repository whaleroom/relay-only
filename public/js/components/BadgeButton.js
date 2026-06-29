import { html, useState, useEffect, useRef, useCallback } from '../deps.js'

const ICON_SIZE = 16
const STROKE_WIDTH = 1.8

const svgAttrs = `width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round"`

const springConfig = { type: 'spring', stiffness: 600, damping: 30 }
const pathSpring = { type: 'spring', stiffness: 150, damping: 20 }

const iconHTML = {
  processing: `<div style="display:flex;align-items:center;justify-content:center;width:${ICON_SIZE}px;height:${ICON_SIZE}px"><svg ${svgAttrs}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></div>`,
  success: `<svg ${svgAttrs}><polyline points="4 12 9 17 20 6"/></svg>`,
  error: `<svg ${svgAttrs}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`
}

let _animate = null
const getAnimate = () => _animate
  ? Promise.resolve(_animate)
  : import('motion').then(m => { _animate = m.animate; return _animate })

// Pre-load motion so it's ready on first click
getAnimate()

/**
 * BadgeButton — multi-state animated button
 * Props:
 *   idleLabel    – text in idle state ("Post", "Reply")
 *   busyLabel    – text while processing ("Posting...", "Replying...")
 *   doneLabel    – text on success ("Posted!", "Sent!")
 *   errorLabel   – text on error ("Failed")
 *   state        – "idle" | "processing" | "success" | "error"
 *   disabled     – boolean
 *   onClick      – handler
 *   class        – extra class names
 */
export function BadgeButton ({ idleLabel, busyLabel, doneLabel, errorLabel, state, disabled, onClick, class: cls }) {
  const badgeRef = useRef(null)
  const iconRef = useRef(null)
  const labelBoxRef = useRef(null)
  const labelRef = useRef(null)
  const measureRef = useRef(null)
  const animsRef = useRef([])
  const prevState = useRef('idle')

  const labels = {
    idle: idleLabel || 'Post',
    processing: busyLabel || 'Posting...',
    success: doneLabel || 'Posted!',
    error: errorLabel || 'Failed'
  }

  const runAnimations = useCallback(async (st) => {
    const badge = badgeRef.current
    const icon = iconRef.current
    const labelBox = labelBoxRef.current
    const label = labelRef.current
    const measure = measureRef.current
    if (!badge || !icon || !labelBox || !label || !measure) return

    // Complete previous animations
    animsRef.current.forEach(a => { try { a.complete() } catch {} })
    animsRef.current = []

    // Compute target widths first
    const targetIconW = iconHTML[st] ? ICON_SIZE : 0
    const text = labels[st]
    measure.textContent = text
    const targetLabelW = measure.getBoundingClientRect().width

    // Set icon HTML + target width immediately (animation enhances, doesn't drive)
    if (iconHTML[st]) {
      icon.innerHTML = iconHTML[st]
    } else {
      icon.innerHTML = ''
    }
    icon.style.width = targetIconW + 'px'

    // Set label width immediately
    labelBox.style.width = Math.ceil(targetLabelW) + 'px'

    // Set gap immediately
    badge.style.gap = st === 'idle' ? '0px' : '6px'

    // Now layer on animations if motion is available
    const animate = await getAnimate().catch(() => null)
    if (!animate) {
      // Fallback: just swap text without animation
      label.innerHTML = ''
      const el = document.createElement('div')
      el.style.cssText = 'position:absolute;white-space:nowrap;top:0;left:0;'
      el.textContent = text
      label.appendChild(el)
      return
    }

    // Animate icon width
    if (iconHTML[st]) {
      animsRef.current.push(animate(icon, { width: [0, targetIconW + 'px'] }, springConfig))

      // Icon-specific animations
      if (st === 'processing') {
        const path = icon.querySelector('path')
        const spin = icon.querySelector('div')
        if (path) animsRef.current.push(animate(path, { pathLength: [0, 1] }, pathSpring))
        if (spin) animsRef.current.push(animate(spin, { rotate: 360 }, { duration: 1, repeat: Infinity, ease: 'linear' }))
      } else if (st === 'success') {
        const poly = icon.querySelector('polyline')
        if (poly) animsRef.current.push(animate(poly, { pathLength: [0, 1] }, pathSpring))
      } else if (st === 'error') {
        const lines = icon.querySelectorAll('line')
        if (lines[0]) animsRef.current.push(animate(lines[0], { pathLength: [0, 1] }, pathSpring))
        if (lines[1]) animsRef.current.push(animate(lines[1], { pathLength: [0, 1] }, { ...pathSpring, delay: 0.1 }))
      }
    }

    // New label slides in
    const newEl = document.createElement('div')
    newEl.style.cssText = 'position:absolute;white-space:nowrap;top:0;left:0;'
    newEl.textContent = text
    animsRef.current.push(animate(newEl, {
      y: [-14, 0], opacity: [0, 1], filter: ['blur(6px)', 'blur(0px)']
    }, { duration: 0.2, ease: 'easeInOut' }))

    // Old label slides out
    if (label.children.length) {
      const old = label.children[0]
      const anim = animate(old, {
        y: [0, 14], opacity: [1, 0], filter: ['blur(0px)', 'blur(6px)']
      }, { duration: 0.2, ease: 'easeInOut' })
      animsRef.current.push(anim)
      anim.then(() => { try { old.remove() } catch {} })
    }
    label.appendChild(newEl)

    // Badge-level effects
    if (st === 'error') {
      animsRef.current.push(animate(badge, { x: [0, -5, 5, -5, 0] }, {
        duration: 0.3, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1], delay: 0.1
      }))
    } else if (st === 'success') {
      animsRef.current.push(animate(badge, { scale: [1, 1.1, 1] }, {
        duration: 0.3, ease: 'easeInOut', times: [0, 0.5, 1]
      }))
    }
  }, [])

  useEffect(() => {
    if (state !== prevState.current) {
      prevState.current = state
      runAnimations(state)
    }
  }, [state])

  // Initialize label on mount
  useEffect(() => {
    const label = labelRef.current
    const measure = measureRef.current
    if (!label || !measure) return
    measure.textContent = labels.idle
    const w = measure.getBoundingClientRect().width
    if (labelBoxRef.current) labelBoxRef.current.style.width = Math.ceil(w) + 'px'
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;white-space:nowrap;top:0;left:0;'
    el.textContent = labels.idle
    label.appendChild(el)
  }, [])

  return html`
    <button class="badge-btn${cls ? ' ' + cls : ''}"
      disabled=${disabled} onClick=${onClick}>
      <div class="badge-inner" ref=${badgeRef}>
        <div class="badge-icon" ref=${iconRef}></div>
        <div class="badge-label-box" ref=${labelBoxRef}>
          <div class="badge-label-measure" ref=${measureRef}></div>
          <div class="badge-label" ref=${labelRef}></div>
        </div>
      </div>
    </button>
  `
}
