/**
 * The few `react-native` names the React Native renderer's CORE uses (a11y/a11y.ts and
 * core/documentEffects.ts), on the web. Only what the core reaches: the UI layer of the RN app is
 * never imported here — the Primer renderer draws with Primer React.
 *
 * The announcements go to ONE polite and ONE assertive live region created at boot (a region
 * filled in the same tick it is created is often not announced — the libs/mateu announcer's rule).
 */
type Politeness = 'polite' | 'assertive'

const regions: Partial<Record<Politeness, HTMLElement>> = {}

function region(politeness: Politeness): HTMLElement | null {
  if (typeof document === 'undefined') return null
  let el = regions[politeness]
  if (!el || !el.isConnected) {
    el = document.createElement('div')
    el.setAttribute('aria-live', politeness)
    el.setAttribute('aria-atomic', 'true')
    el.setAttribute('data-mateu-announcer', politeness)
    el.style.cssText = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0'
    document.body.appendChild(el)
    regions[politeness] = el
  }
  return el
}

/** Creates both regions up front (main.tsx calls it before the first render). */
export function installAnnouncer(): void {
  region('polite')
  region('assertive')
}

function speak(text: string, politeness: Politeness): void {
  const el = region(politeness)
  if (!el) return
  // the same text twice is announced twice: clear, then write it back on the next frame
  el.textContent = ''
  setTimeout(() => { el.textContent = text }, 60)
}

export const AccessibilityInfo = {
  announceForAccessibility(text: string): void {
    speak(text, 'polite')
  },
  announceForAccessibilityWithOptions(text: string, options: { queue?: boolean }): void {
    speak(text, options?.queue === false ? 'assertive' : 'polite')
  },
  isScreenReaderEnabled(): Promise<boolean> {
    return Promise.resolve(false)
  },
}

export const Platform = {
  OS: 'web' as 'web' | 'ios' | 'android',
  select<T>(choices: { web?: T; default?: T }): T | undefined {
    return choices.web ?? choices.default
  },
}

export const Linking = {
  openURL(url: string): Promise<void> {
    window.open(url, '_blank', 'noopener')
    return Promise.resolve()
  },
}

export const Share = {
  share(_content?: unknown, _options?: unknown): Promise<void> {
    return Promise.reject(new Error('Share is not available on the web'))
  },
}
