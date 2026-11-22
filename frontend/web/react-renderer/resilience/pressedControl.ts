import type { ServerActivity } from '@rn/core/serverActivity'

/** How long after a press a request still counts as the press's (an action goes out on the next tick). */
const PRESS_WINDOW_MS = 400

const BUTTONISH = 'button, [role="button"], [role="menuitem"], a[href]'

/**
 * The pressed control shows it was heard: a request that starts right after a press on a button
 * marks THAT button `data-mateu-pending` + `aria-busy` until the server is idle again (Redwood's
 * trackPressedControls: followed at the document level, so every button — toolbar, row, overlay,
 * island — is covered without threading the event through each one). The second press is stopped
 * by the view controller's in-flight guard, not here.
 */
export function trackPressedControls(activity: ServerActivity): () => void {
  let pressed: { el: HTMLElement; at: number } | null = null
  const marked = new Set<HTMLElement>()

  const onPress = (e: Event) => {
    const target = e.target instanceof Element ? e.target.closest(BUTTONISH) : null
    if (target instanceof HTMLElement && !target.hasAttribute('disabled')) pressed = { el: target, at: Date.now() }
  }
  const clear = () => {
    marked.forEach((el) => {
      el.removeAttribute('data-mateu-pending')
      el.removeAttribute('aria-busy')
    })
    marked.clear()
  }
  const off = activity.subscribe((busy: boolean) => {
    if (!busy) return clear()
    if (pressed && Date.now() - pressed.at <= PRESS_WINDOW_MS && pressed.el.isConnected) {
      pressed.el.setAttribute('data-mateu-pending', '')
      pressed.el.setAttribute('aria-busy', 'true')
      marked.add(pressed.el)
    }
    pressed = null
  })
  document.addEventListener('click', onPress, true)
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onPress(e) }
  document.addEventListener('keydown', onKey, true)
  return () => {
    off()
    clear()
    document.removeEventListener('click', onPress, true)
    document.removeEventListener('keydown', onKey, true)
  }
}
