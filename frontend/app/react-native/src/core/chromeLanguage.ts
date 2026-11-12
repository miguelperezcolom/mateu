/**
 * The language of the app's OWN words (the few texts the renderer draws by itself: task ETAs, the
 * version-skew notice, the hub's update/compatibility notices) — the same rule as the web's
 * chromeTexts.chromeLanguage: the locale's primary subtag when the app speaks it (`pt-BR` and
 * `pt-PT` → `pt`, `de-AT` → `de`, `es_419` → `es`), English for any other.
 */
export type ChromeLanguage = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it';

/** The languages the renderer's own texts are written in. */
export const CHROME_LANGUAGES: readonly ChromeLanguage[] = ['en', 'es', 'fr', 'de', 'pt', 'it'];

export function chromeLanguageOf(locale: string | null | undefined): ChromeLanguage {
  const primary = (locale ?? '').trim().toLowerCase().split(/[-_]/)[0];
  return (CHROME_LANGUAGES as readonly string[]).includes(primary) ? (primary as ChromeLanguage) : 'en';
}
