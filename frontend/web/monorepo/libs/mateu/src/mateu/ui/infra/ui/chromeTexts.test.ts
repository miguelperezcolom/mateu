import { describe, expect, it } from 'vitest'
import { CHROME_LANGUAGES, chromeCatalogue, chromeLanguage, chromeText, chromeTextf } from './chromeTexts'
import { linkStyles } from './linkStyles'

describe("the shell chrome's own words", () => {
    it('follow the page language: its primary subtag when the catalogue has it, else English', () => {
        expect(chromeLanguage('es-ES')).toBe('es')
        expect(chromeLanguage('es_419')).toBe('es')
        expect(chromeLanguage('en-GB')).toBe('en')
        expect(chromeLanguage('fr')).toBe('fr')
        expect(chromeLanguage('fr-CA')).toBe('fr')
        expect(chromeLanguage('de-AT')).toBe('de')
        expect(chromeLanguage('pt-BR')).toBe('pt')
        expect(chromeLanguage('pt-PT')).toBe('pt')
        expect(chromeLanguage('IT-it')).toBe('it')
        expect(chromeLanguage('nl')).toBe('en')
        expect(chromeLanguage('ja-JP')).toBe('en')
        expect(chromeLanguage('esperanto-like')).toBe('en')
        expect(chromeText('send', 'es')).toBe('Enviar')
        expect(chromeText('closeChat', 'es')).toBe('Cerrar el asistente')
        expect(chromeText('cancel', 'fr-FR')).toBe('Annuler')
        expect(chromeText('save', 'de-CH')).toBe('Speichern')
        expect(chromeText('delete', 'pt-BR')).toBe('Excluir')
        expect(chromeText('retry', 'it')).toBe('Riprova')
    })

    it('speak six languages', () => {
        expect([...CHROME_LANGUAGES].sort()).toEqual(['de', 'en', 'es', 'fr', 'it', 'pt'])
    })
})

describe('the chrome catalogue', () => {
    it('has every key, non-empty, in every language', () => {
        const keys = Object.keys(chromeCatalogue('en')).sort()
        for (const lang of CHROME_LANGUAGES) {
            const catalogue = chromeCatalogue(lang)
            expect(Object.keys(catalogue).sort(), lang).toEqual(keys)
            for (const key of keys) expect(catalogue[key as keyof typeof catalogue].trim(), `${lang}.${key}`).not.toBe('')
        }
    })

    it('keeps the same {placeholders} in every translation', () => {
        const holes = (t: string) => (t.match(/\{\w+\}/g) ?? []).sort()
        const en = chromeCatalogue('en')
        for (const lang of CHROME_LANGUAGES) {
            for (const [key, text] of Object.entries(chromeCatalogue(lang))) {
                expect(holes(text), `${lang}.${key}`).toEqual(holes(en[key as keyof typeof en]))
            }
        }
    })

    it('fills placeholders and leaves unknown ones visible', () => {
        expect(chromeTextf('noResultsFor', { query: 'abc' }, 'en')).toBe('No results for "abc"')
        expect(chromeTextf('noResultsFor', { query: 'abc' }, 'es')).toBe('Sin resultados para "abc"')
        expect(chromeTextf('noResultsFor', {}, 'en')).toBe('No results for "{query}"')
        expect(chromeText('retry', 'es')).toBe('Reintentar')
        expect(chromeText('cancel', 'en')).toBe('Cancel')
    })
})

describe('the shared link rule', () => {
    it('puts bare links on the theme colour, overridable per zone, at zero specificity', () => {
        const text = linkStyles.cssText
        expect(text).toContain(':where(a:any-link)')
        expect(text).toContain('var(--mateu-link-color, var(--lumo-primary-text-color')
    })
})
