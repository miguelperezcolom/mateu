import { chromeLanguage, chromeText, type ChromeTextKey } from '@infra/ui/chromeTexts.ts'
import { RENDERER_TEXTS, isRendererTextKey, type RendererLanguage, type RendererTextKey } from './rendererTexts'

/**
 * Every word a React renderer draws by itself, in the page's language (`<html lang>`, which the
 * shell sets from AppDto.locale, else the browser's): en, es, fr, de, pt or it by the tag's primary
 * subtag (pt-BR / pt-PT → pt), English otherwise — the same rule and the same words as every Mateu
 * web renderer. A key is looked up in the renderer app's own table (registerTexts), then in the
 * shared one (rendererTexts.ts), then in the web catalogue (libs/mateu chromeTexts.ts).
 */
export type TextKey = RendererTextKey | ChromeTextKey

/** A renderer's own words, in the six languages (its completeness test checks it like rendererTexts.ts). */
export type AppTexts = Record<RendererLanguage, Record<string, string>>

let appTexts: AppTexts | null = null

/** Registers the words only this renderer's design system needs (call once, before the first render). */
export function registerTexts(texts: AppTexts): void {
  appTexts = texts
}

const fill = (text: string, vars?: Record<string, unknown>) =>
  vars ? text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name] ?? '') : m)) : text

/** A shared word (rendererTexts.ts, else the web catalogue) — typed, so a misspelt key fails the typecheck. */
export function tx(key: TextKey, vars?: Record<string, unknown>): string {
  const lang = chromeLanguage() as RendererLanguage
  return fill(isRendererTextKey(key) ? RENDERER_TEXTS[lang][key] : chromeText(key as ChromeTextKey), vars)
}

/**
 * One of the app's OWN words (registerTexts). A renderer wraps it with its own key type, e.g.
 * `export const t = (k: keyof typeof SAP_TEXTS.en, v?) => appText(k, v)`.
 */
export function appText(key: string, vars?: Record<string, unknown>): string {
  const lang = chromeLanguage() as RendererLanguage
  return fill(appTexts?.[lang]?.[key] ?? appTexts?.en?.[key] ?? key, vars)
}
