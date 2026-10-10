import { describe, expect, it } from 'vitest'
import { catalogueOf, environmentName, parseTranslationsFile, pickLocale, resolveI18n, resolveI18nDeep, translationKeys } from './translationsModel'

describe('translationsModel', () => {
    const es = parseTranslationsFile('specs/ui/translations/es.yaml', 'messages:\n  orders: {title: Pedidos}\n')!
    const en = parseTranslationsFile('i18n.yaml', 'type: Translations\nlocale: en\nmessages:\n  orders: {title: Orders, new: New order}\n')!
    const catalogue = catalogueOf([es, en])

    it('reads the locale from the file, or from a conventional file name', () => {
        expect(es.locale).toBe('es')
        expect(en.locale).toBe('en')
        expect(parseTranslationsFile('pages/orders.yaml', 'type: VerticalLayout')).toBeUndefined()
        expect(translationKeys([es, en])).toEqual(['orders.new', 'orders.title'])
    })

    it('resolves ${i18n.key} for the locale, then its language, then en, then the key', () => {
        expect(resolveI18n('${i18n.orders.title}', catalogue, 'es-ES')).toBe('Pedidos')
        expect(resolveI18n('+ ${i18n.orders.new}', catalogue, 'es')).toBe('+ New order')
        expect(resolveI18n('${ i18n.missing.key }', catalogue, 'es')).toBe('missing.key')
        expect(resolveI18nDeep({ a: ['${i18n.orders.title}'], n: 1 }, catalogue, 'en')).toEqual({ a: ['Orders'], n: 1 })
    })

    it('picks the visitor locale the catalogue has, else en, else the first', () => {
        expect(pickLocale(['es', 'en'], ['es-ES', 'en'])).toBe('es')
        expect(pickLocale(['es', 'en'], ['fr'])).toBe('en')
        expect(pickLocale(['es'], ['fr'])).toBe('es')
        expect(pickLocale([], ['fr'])).toBeUndefined()
    })

    it('recognises environment files by type or by convention', () => {
        expect(environmentName('environments/pre.yaml', 'sources: {}')).toBe('pre')
        expect(environmentName('x.yaml', 'type: Environment\nname: pro\nsources: {}')).toBe('pro')
        expect(environmentName('x.yaml', 'type: Sources\nsources: []')).toBeUndefined()
    })
})
