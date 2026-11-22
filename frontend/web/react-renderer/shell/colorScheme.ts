import { useCallback, useEffect, useState } from 'react'

/** The web renderer's key: 'light' | 'dark' — the user's choice, else the OS decides. */
export const THEME_KEY = 'mateu-theme'

export type ColorChoice = 'light' | 'dark' | 'auto'

function storedChoice(): ColorChoice {
  try {
    const v = window.localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : 'auto'
  } catch {
    return 'auto'
  }
}

function osPrefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export interface ColorControl {
  /** What is on screen now (auto resolved against the OS). */
  resolved: 'light' | 'dark'
  choice: ColorChoice
  /** The app offers a toggle (@App(themeToggle)): only then does a stored choice apply. */
  setToggleOffered: (offered: boolean) => void
  toggle: () => void
}

/**
 * The colour scheme the app asks for: `auto` (the OS) by default; with `@App(themeToggle)` the
 * user's light/dark choice, kept in localStorage like the web renderer. Until the app says whether
 * it offers a toggle the stored choice paints (no flash on reload); an app without it follows the OS.
 * The renderer hands `choice` to its design system's theme and mirrors it on <html>.
 */
export function useColorScheme(): ColorControl {
  const [stored, setStored] = useState<ColorChoice>(storedChoice)
  const [offered, setOffered] = useState<boolean | null>(null)
  const [osDark, setOsDark] = useState(osPrefersDark)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => setOsDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const choice: ColorChoice = offered === false ? 'auto' : stored
  const resolved: 'light' | 'dark' = choice === 'auto' ? (osDark ? 'dark' : 'light') : choice

  const toggle = useCallback(() => {
    const next = resolved === 'dark' ? 'light' : 'dark'
    try { window.localStorage.setItem(THEME_KEY, next) } catch { /* this page only */ }
    setStored(next)
  }, [resolved])

  return { resolved, choice, setToggleOffered: setOffered, toggle }
}
