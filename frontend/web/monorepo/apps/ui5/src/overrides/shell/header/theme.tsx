import React, { createContext, useContext, useEffect } from 'react'
import { ThemeProvider } from '@ui5/webcomponents-react'
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js'
import { setLanguage } from '@ui5/webcomponents-base/dist/config/Language.js'
import { chromeLanguage } from '@infra/ui/chromeTexts.ts'
import { useColorScheme, type ColorControl } from '@mr/shell/colorScheme'

export { THEME_KEY, type ColorChoice } from '@mr/shell/colorScheme'

const ColorContext = createContext<ColorControl | null>(null)

export const useColorControl = () => useContext(ColorContext)

const contrastMore = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-contrast: more)').matches

/**
 * SAP's Horizon theme driven by the app's colour scheme (shared: useColorScheme): sap_horizon,
 * sap_horizon_dark, and — when the OS asks for more contrast — Horizon's high-contrast black/white.
 * UI5's own texts follow the page language (`<html lang>`, which the app's locale sets).
 */
export function ThemedRoot({ children }: { children: React.ReactNode }) {
  const control = useColorScheme()
  const { resolved } = control

  useEffect(() => {
    const apply = () => {
      const hc = contrastMore()
      void setTheme(hc ? (resolved === 'dark' ? 'sap_horizon_hcb' : 'sap_horizon_hcw') : resolved === 'dark' ? 'sap_horizon_dark' : 'sap_horizon')
      document.documentElement.style.colorScheme = resolved
      document.documentElement.setAttribute('data-ui5-scheme', resolved)
    }
    apply()
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-contrast: more)') : null
    mq?.addEventListener('change', apply)
    return () => mq?.removeEventListener('change', apply)
  }, [resolved])

  useEffect(() => {
    const follow = () => void setLanguage(chromeLanguage())
    follow()
    const obs = new MutationObserver(follow)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
    return () => obs.disconnect()
  }, [])

  return (
    <ColorContext.Provider value={control}>
      <ThemeProvider>{children}</ThemeProvider>
    </ColorContext.Provider>
  )
}
