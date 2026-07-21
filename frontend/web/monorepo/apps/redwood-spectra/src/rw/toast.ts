import type Message from '@mateu/shared/apiClients/dtos/Message'

/**
 * A minimal, DS-neutral toast (NO vaadin-notification). Renders the increment's messages as
 * transient chips bottom-right, styled with Redwood tokens (see .rw-toast in index.css).
 */
export function showToast(message: Message): void {
  if (!message?.text) return
  const el = document.createElement('div')
  el.className = `rw-toast rw-toast--${message.variant || 'contrast'}`
  el.textContent = message.text
  const host = toastHost()
  host.appendChild(el)
  requestAnimationFrame(() => el.classList.add('rw-toast--in'))
  const duration = message.duration && message.duration > 0 ? message.duration : 4000
  window.setTimeout(() => {
    el.classList.remove('rw-toast--in')
    window.setTimeout(() => el.remove(), 300)
  }, duration)
}

let host: HTMLElement | undefined
function toastHost(): HTMLElement {
  if (host && host.isConnected) return host
  host = document.createElement('div')
  host.className = 'rw-toast-host'
  document.body.appendChild(host)
  return host
}
