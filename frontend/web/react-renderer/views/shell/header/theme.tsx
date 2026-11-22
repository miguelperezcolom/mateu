import React, { createContext, useContext, useEffect } from 'react'
import { ThemeProvider } from '@kit'
import { useColorScheme, type ColorControl } from '@mr/shell/colorScheme'

export { THEME_KEY, type ColorChoice } from '@mr/shell/colorScheme'

const ColorContext = createContext<ColorControl | null>(null)

export const useColorControl = () => useContext(ColorContext)

/**
 * Primer's ThemeProvider driven by the app's colour scheme (shared: useColorScheme). The colour mode
 * is mirrored on <html> so the page background and Primer's portals follow it too.
 */
export function ThemedRoot({ children }: { children: React.ReactNode }) {
  const control = useColorScheme()
  const { choice, resolved } = control

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-color-mode', choice)
    html.setAttribute('data-light-theme', 'light')
    html.setAttribute('data-dark-theme', 'dark')
    html.style.colorScheme = resolved
  }, [choice, resolved])

  return (
    <ColorContext.Provider value={control}>
      <ThemeProvider colorMode={choice}>
        {children}
      </ThemeProvider>
    </ColorContext.Provider>
  )
}
