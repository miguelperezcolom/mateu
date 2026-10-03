import { describe, expect, it } from 'vitest'
import { chromeLanguage, chromeText } from './chromeTexts'
import { linkStyles } from './linkStyles'

describe("the shell chrome's own words", () => {
    it('follow the page language, Spanish or English', () => {
        expect(chromeLanguage('es-ES')).toBe('es')
        expect(chromeLanguage('en-GB')).toBe('en')
        expect(chromeLanguage('fr')).toBe('en')
        expect(chromeText('send', 'es')).toBe('Enviar')
        expect(chromeText('closeChat', 'es')).toBe('Cerrar el asistente')
    })
})

describe('the shared link rule', () => {
    it('puts bare links on the theme colour, overridable per zone, at zero specificity', () => {
        const text = linkStyles.cssText
        expect(text).toContain(':where(a:any-link)')
        expect(text).toContain('var(--mateu-link-color, var(--lumo-primary-text-color')
    })
})
