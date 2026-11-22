import { useEffect, useRef } from 'react'
import type { MateuSession } from '@rn/core/MateuSession'
import { appShortcutFor, isHelpKey, isTypingTarget } from '@infra/ui/appShortcuts.ts'

/** An `@AppShortcut` as AppDto.shortcuts carries it. */
export interface AppShortcutLike {
  key?: string | null
  label: string
  route?: string | null
  actionId?: string | null
  code?: string | null
}

/** ⌘K / Ctrl+K — the palette, typing or not. */
const isPaletteKey = (e: KeyboardEvent) =>
  (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key.toLowerCase() === 'k' || e.code === 'KeyK')

/**
 * The page's keyboard, in the web renderers' precedence:
 *  1. the screen's own `@Action(shortcut)` / `@Tab(shortcut)` — the RN core registers them in the
 *     session's registry while a view shows them (scope `screen`, the newest screen first);
 *  2. ⌘K (palette), `?` / Ctrl+/ (the shortcuts list);
 *  3. the app's `@AppShortcut(key)` — one-key ones only while the user has not turned them off
 *     (`mateu-single-key-shortcuts=off`, WCAG 2.1.4).
 * Listens on `window` and stands down on an event something else already took (an open menu, a
 * component of its own).
 */
export function useGlobalKeys({ session, shortcuts, palette, onPalette, onHelp, onLaunch }: {
  session: MateuSession
  shortcuts: AppShortcutLike[]
  palette: boolean
  onPalette: () => void
  onHelp: () => void
  onLaunch: (s: AppShortcutLike) => void
}) {
  const latest = useRef({ shortcuts, palette, onPalette, onHelp, onLaunch })
  latest.current = { shortcuts, palette, onPalette, onHelp, onLaunch }
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return
      const { shortcuts, palette, onPalette, onHelp, onLaunch } = latest.current
      const typing = isTypingTarget(document.activeElement)
      // a modal on top (a dialog, the palette itself) owns the keyboard, except ⌘K which toggles
      const modal = !!document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"]')
      if (palette && isPaletteKey(e)) { e.preventDefault(); onPalette(); return }
      if (modal) return
      if (session.keyShortcuts.handle(e, typing)) { e.preventDefault(); return }
      if (isHelpKey(e, typing)) { e.preventDefault(); onHelp(); return }
      const hit = appShortcutFor(shortcuts as never, e, typing) as AppShortcutLike | undefined
      if (hit && (hit.route || hit.actionId)) { e.preventDefault(); onLaunch(hit) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [session])
}

/** The `@Action(shortcut)`s the screens on show registered, with what they do (the RN core's registry). */
export const registeredScreenShortcuts = (session: MateuSession): { key: string; label: string }[] =>
  session.keyShortcuts.list()
    .filter((e) => e.scope === 'screen' && e.shortcut?.trim())
    .map((e) => ({ key: e.shortcut.trim().toLowerCase(), label: e.label || 'An action of this screen' }))
