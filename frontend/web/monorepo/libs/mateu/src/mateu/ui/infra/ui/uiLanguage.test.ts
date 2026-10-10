// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { applyUiLanguage, chromeText } from './chromeTexts'

afterEach(() => { document.documentElement.removeAttribute('lang') })

describe('the page language', () => {
    it("is the browser's on boot when the page declares none", () => {
        document.documentElement.removeAttribute('lang')
        expect(applyUiLanguage()).toBe(navigator.language || 'en')
        expect(document.documentElement.lang).toBeTruthy()
    })

    it("follows the server's locale (AppDto.locale) and the chrome follows it", () => {
        applyUiLanguage('es-ES')
        expect(document.documentElement.lang).toBe('es-ES')
        expect(chromeText('clearFilters')).toBe('Quitar filtros')
        applyUiLanguage('en')
        expect(chromeText('clearFilters')).toBe('Clear filters')
    })

    it('a shell without a locale does not override what the page already says', () => {
        document.documentElement.lang = 'es'
        applyUiLanguage(undefined)
        expect(document.documentElement.lang).toBe('es')
        applyUiLanguage('  ')
        expect(document.documentElement.lang).toBe('es')
    })
})
