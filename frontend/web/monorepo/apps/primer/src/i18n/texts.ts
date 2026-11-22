import { chromeLanguage, chromeText, type ChromeTextKey } from '@infra/ui/chromeTexts.ts'
import { PRIMER_TEXTS, isPrimerTextKey, type PrimerTextKey } from './primerTexts'

/**
 * Every word the Primer renderer draws by itself, in the page's language (`<html lang>`, which the
 * shell sets from AppDto.locale, else the browser's): en, es, fr, de, pt or it by the tag's primary
 * subtag (pt-BR / pt-PT → pt), English otherwise — the same rule and the same words as every Mateu
 * web renderer. A key is first the renderer's own (primerTexts.ts), else the web catalogue's
 * (libs/mateu chromeTexts.ts), so a word shared with the other renderers is translated once.
 */
export type TextKey = PrimerTextKey | ChromeTextKey

export function tx(key: TextKey, vars?: Record<string, unknown>): string {
  const text = isPrimerTextKey(key) ? PRIMER_TEXTS[chromeLanguage()][key] : chromeText(key as ChromeTextKey)
  return vars ? text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name] ?? '') : m)) : text
}
