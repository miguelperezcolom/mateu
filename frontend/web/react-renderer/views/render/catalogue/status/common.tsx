import React from 'react'
import { interpolate } from '@rn/core/expressions'
import { useController } from '@mr/render/ViewHost'
import { childrenOf, glyph, list, metaOf, slotOf, str, type CatalogueProps, type Dict } from '@mr/render/wire'

export type { CatalogueProps, Dict }
export { childrenOf, glyph, list, metaOf, slotOf, str }


/** `${…}` over the view's state, data and the app's state. */
export function useText(state: Dict, data?: unknown) {
  const controller = useController()
  const ctx = { state, data, appState: controller.session.appState, appData: controller.session.appData }
  return (v: unknown) => (v == null ? '' : interpolate(String(v), ctx))
}

/** A wire palette name (success, warning, error/danger, contrast, primary, info…) → a Primer Label variant. */
export function labelVariant(color?: unknown): 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'attention' | 'severe' | 'danger' | 'done' {
  switch (str(color).toLowerCase()) {
    case 'success': case 'ok': case 'green': return 'success'
    case 'warning': case 'attention': case 'yellow': case 'orange': return 'attention'
    case 'error': case 'danger': case 'red': return 'danger'
    case 'contrast': case 'primary': return 'primary'
    case 'info': case 'accent': case 'blue': return 'accent'
    case 'done': case 'purple': return 'done'
    case 'severe': return 'severe'
    default: return 'secondary'
  }
}

/** A trend → the Primer foreground token and its mark. */
export function trendLook(trend?: unknown): { color: string; mark: string } {
  const t = str(trend).toLowerCase()
  if (t === 'up') return { color: 'var(--fgColor-success)', mark: '▲' }
  if (t === 'down') return { color: 'var(--fgColor-danger)', mark: '▼' }
  return { color: 'var(--fgColor-muted)', mark: t === 'flat' || t === 'neutral' ? '→' : '' }
}


/** An element that runs an action on click and on Enter/Space, like a button (null action: inert). */
export function pressable(onPress: (() => void) | null | undefined, label?: string, className = ''): React.HTMLAttributes<HTMLElement> {
  if (!onPress) return className ? { className } : {}
  return {
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
    onClick: onPress,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress() }
    },
    className: `${className} mateu-st-pressable`.trim(),
  }
}
