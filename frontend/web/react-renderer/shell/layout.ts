import { useEffect, useState } from 'react'

type Dict = Record<string, unknown>

/** Below this width an app shell folds its menu behind ☰ and its header actions into "More". */
export const NARROW_SHELL = '(max-width: 767px)'

/** Whether a media query matches, kept current. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => typeof window.matchMedia === 'function' && window.matchMedia(query).matches)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return matches
}

/** How an app shell lays its menu out (AppDto.variant; a chromeless app and a MEDIATOR shell draw no chrome). */
export type MenuLayout = 'side' | 'top' | 'tiles' | 'tabs' | 'sections' | 'bare'

export function menuLayoutOf(app: Dict): MenuLayout {
  if (app['chromeless'] === true) return 'bare'
  switch (app['variant']) {
    case 'MEDIATOR': return 'bare'
    case 'MENU_ON_TOP': return 'top'
    case 'TILES': return 'tiles'
    case 'TABS': return 'tabs'
    case 'HAMBURGER_SECTIONS': return 'sections'
    default: return 'side' // HAMBURGER_MENU, MENU_ON_LEFT, RAIL, AUTO
  }
}
