import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from '@primer/react'

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

interface ColorControl {
  /** What is on screen now (auto resolved against the OS). */
  resolved: 'light' | 'dark'
  choice: ColorChoice
  /** The app offers a toggle (@App(themeToggle)): only then does a stored choice apply. */
  setToggleOffered: (offered: boolean) => void
  toggle: () => void
}

const ColorContext = createContext<ColorControl | null>(null)

export const useColorControl = () => useContext(ColorContext)

function osPrefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Primer's ThemeProvider driven by the app: `auto` (the OS) by default; with `@App(themeToggle)` the
 * user's light/dark choice, kept in localStorage like the web renderer. The colour mode is mirrored
 * on <html> so the page background and Primer's portals follow it too.
 */
export function ThemedRoot({ children }: { children: React.ReactNode }) {
  const [choice, setChoice] = useState<ColorChoice>(storedChoice)
  const [offered, setOffered] = useState<boolean | null>(null)
  const [osDark, setOsDark] = useState(osPrefersDark)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => setOsDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // until the app says whether it offers a toggle, the stored choice paints (no flash on reload);
  // an app without the toggle follows the OS
  const effective: ColorChoice = offered === false ? 'auto' : choice
  const resolved: 'light' | 'dark' = effective === 'auto' ? (osDark ? 'dark' : 'light') : effective

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-color-mode', effective)
    html.setAttribute('data-light-theme', 'light')
    html.setAttribute('data-dark-theme', 'dark')
    html.style.colorScheme = resolved
  }, [effective, resolved])

  const toggle = useCallback(() => {
    const next = resolved === 'dark' ? 'light' : 'dark'
    try { window.localStorage.setItem(THEME_KEY, next) } catch { /* this page only */ }
    setChoice(next)
  }, [resolved])

  const control = useMemo<ColorControl>(() => ({ resolved, choice: effective, setToggleOffered: setOffered, toggle }), [resolved, effective, toggle])

  return (
    <ColorContext.Provider value={control}>
      <ThemeProvider colorMode={effective}>
        {children}
      </ThemeProvider>
    </ColorContext.Provider>
  )
}
