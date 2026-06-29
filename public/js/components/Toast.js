import { html } from '../deps.js'
import { toasts } from '../state.js'

export function ToastContainer () {
  const items = toasts.value
  if (items.length === 0) return null
  return html`
    <div class="toast-container">
      ${items.map(t => html`
        <div key=${t.id} class="toast${t.type ? ' ' + t.type : ''}${t.exiting ? ' exiting' : ''}">
          ${t.msg}
        </div>
      `)}
    </div>
  `
}
