import type { MateuSession } from '@rn/core/MateuSession'
import { fetchExternalJson } from '@rn/core/restFetch'
import { interpolate, interpolateUrl } from '@rn/core/expressions'
import { announceCapabilityMismatch } from '@infra/capabilities/capabilities.ts'

type Dict = Record<string, unknown>

/** What MateuPrimerApp needs of a static bundle (core/staticBundle.ts) — kept structural here. */
export type StaticBundleLike = object

/**
 * The App shell's members that are not chrome, applied once per shell answer:
 *  - `accentColor` (@App(accentColor)): the brand accent on Primer's own accent hooks — the selected
 *    navigation item's marker and the underline of the current tab — in the LIGHT scheme only (an
 *    app's brand colour is chosen against white; dark keeps Primer's tuned accent), like the web.
 *  - `favicon`: the tab's icon.
 *  - `appDataSource`: the app-scope data (`${appData.x}` on any screen), fetched ONCE per source.
 *  - `locale` (the app's Translator): `<html lang>` — what screen readers, hyphenation, the number and
 *    date formats and the core's own texts (renderFailure, loading…) read; the browser's otherwise.
 *  - `requiredCapabilities`: the capability handshake — a missing one is said (console + a
 *    `mateu-capability-mismatch` event the host page can hear), never blocking.
 */
export function applyAppExtras(session: MateuSession, app: Dict, changed: () => void): void {
  applyLanguage(typeof app['locale'] === 'string' ? app['locale'] : undefined)
  applyAccent(typeof app['accentColor'] === 'string' ? app['accentColor'] : undefined)
  applyFavicon(typeof app['favicon'] === 'string' ? app['favicon'] : undefined)
  announceCapabilityMismatch(Array.isArray(app['requiredCapabilities']) ? (app['requiredCapabilities'] as string[]) : [], document)
  loadAppData(session, app['appDataSource'] as Dict | null | undefined, changed)
}

function applyLanguage(locale: string | undefined) {
  const root = document.documentElement
  if (locale && locale.trim()) root.lang = locale.trim()
  else if (!root.lang) root.lang = navigator.language || 'en'
}

const ACCENT_STYLE_ID = 'mateu-primer-accent'

/** A plain colour only (the web's rule): anything else is ignored. */
export const accentValue = (accent: string | undefined): string | undefined =>
  accent && /^[#\w\s(),.%-]+$/.test(accent.trim()) ? accent.trim() : undefined

function applyAccent(accent: string | undefined) {
  const value = accentValue(accent)
  let style = document.getElementById(ACCENT_STYLE_ID)
  if (!value) {
    style?.remove()
    return
  }
  if (!style) {
    style = document.head.appendChild(document.createElement('style'))
    style.id = ACCENT_STYLE_ID
  }
  const vars = `--mateu-accent: ${value}; --underlineNav-borderColor-active: ${value}; --borderColor-accent-emphasis: ${value};`
  // more specific than the primitives' theme blocks, which Primer's ThemeProvider repeats on its own root
  style.textContent = `:root[data-color-mode="light"], :root[data-color-mode="light"] [data-color-mode] { ${vars} }\n`
    + `@media (prefers-color-scheme: light) { :root[data-color-mode="auto"], :root[data-color-mode="auto"] [data-color-mode] { ${vars} } }`
}

function applyFavicon(href: string | undefined) {
  if (!href || !/^(https?:|\/|data:image\/)/i.test(href)) return
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
  if (!link) {
    link = document.head.appendChild(document.createElement('link'))
    link.rel = 'icon'
  }
  link.href = href
}

const fetchedAppData = new WeakMap<MateuSession, string>()

function loadAppData(session: MateuSession, source: Dict | null | undefined, changed: () => void) {
  if (!source) return
  const key = String(source['ref'] ?? source['url'] ?? '')
  if (!key || fetchedAppData.get(session) === key) return
  fetchedAppData.set(session, key)
  const ctx = { state: {}, appState: session.appState }
  fetchExternalJson(source, (t) => interpolate(String(t ?? ''), ctx), (t) => interpolateUrl(String(t ?? ''), ctx), session.sources)
    .then((json) => {
      if (!json || typeof json !== 'object') return
      Object.assign(session.appData, json as Dict)
      changed()
    })
    .catch((e) => console.error('mateu: the app-scope data source failed', e))
}
