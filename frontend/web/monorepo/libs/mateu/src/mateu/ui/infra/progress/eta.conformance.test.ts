import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { etaText } from './eta'
import { chromeCatalogue } from '@infra/ui/chromeTexts.ts'

/**
 * How a running task's ETA reads — the corpus conformance/client/eta-format.json (Redwood, React
 * Native and IntelliJ run the same file). libs/mateu is the reference.
 */
const corpus = JSON.parse(readFileSync(
    fileURLToPath(new URL('../../../../../../../../../../conformance/client/eta-format.json', import.meta.url)), 'utf8',
)) as {
    texts: Record<'en' | 'es', { underMinute: string, minutes: string, hours: string }>
    cases: { etaSeconds: number | null, en: string | null, es: string | null }[]
}

describe('eta-format corpus', () => {
    for (const lang of ['en', 'es'] as const) {
        it(`the ${lang} chrome texts are the corpus's`, () => {
            const catalogue = chromeCatalogue(lang)
            expect(catalogue.taskEtaUnderMinute).toBe(corpus.texts[lang].underMinute)
            expect(catalogue.taskEtaMinutes).toBe(corpus.texts[lang].minutes)
            expect(catalogue.taskEtaHours).toBe(corpus.texts[lang].hours)
        })
        for (const c of corpus.cases) {
            it(`${lang}: ${c.etaSeconds} s → ${c[lang]}`, () => {
                expect(etaText(c.etaSeconds, lang)).toBe(c[lang])
            })
        }
    }

    it('a value that is not a number shows nothing', () => {
        expect(etaText(undefined)).toBeNull()
        expect(etaText(Number.NaN)).toBeNull()
        expect(etaText(Number.POSITIVE_INFINITY)).toBeNull()
    })
})
