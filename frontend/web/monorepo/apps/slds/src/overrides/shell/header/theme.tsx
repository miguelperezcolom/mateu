import React, { createContext, useContext, useEffect } from 'react'
import type { ColorControl } from '@mr/shell/colorScheme'

export { THEME_KEY, type ColorChoice } from '@mr/shell/colorScheme'

const ColorContext = createContext<ColorControl | null>(null)

/**
 * The Salesforce renderer is LIGHT ONLY: SLDS 2 publishes one (light) theme of its styling hooks —
 * a dark Lightning is the platform's, not the open design system's — so `@App(themeToggle)` draws
 * no switch here and a stored dark choice or the OS preference is not applied (the same rule as the
 * Redwood renderer). There is no colour control to hand to the shell.
 */
export const useColorControl = (): ColorControl | null => useContext(ColorContext)

export function ThemedRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.style.colorScheme = 'light'
  }, [])
  return <ColorContext.Provider value={null}>{children}</ColorContext.Provider>
}
