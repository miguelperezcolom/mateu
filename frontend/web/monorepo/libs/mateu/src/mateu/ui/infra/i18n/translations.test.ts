import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
    __resetI18nWarningsForTests, catalogueOf, i18nKeysAsText, interpolateI18n, mentionsI18n,
    pickLocale, setFallbackLocale, translateDeep, translationsOf,
} from './translations.ts'

const catalogue = {
    en: { 'orders.title': 'Orders', 'orders.new': 'New order' },
    es: { 'orders.title': 'Pedidos' },
    'pt-BR': { 'orders.title': 'Pedidos (BR)' },
}

beforeEach(() => { __resetI18nWarningsForTests(); setFallbackLocale('en') })

describe('pickLocale', () => {
    it('exact → language → fallback → first', () => {
        expect(pickLocale(catalogue, ['pt-BR'])).toBe('pt-BR')
        expect(pickLocale(catalogue, ['es-ES'])).toBe('es')
        expect(pickLocale(catalogue, ['ES_es'])).toBe('es')
        expect(pickLocale(catalogue, ['fr', undefined, null])).toBe('en')
        expect(pickLocale({ de: {}, it: {} }, ['fr'])).toBe('de')
        setFallbackLocale('es')
        expect(pickLocale(catalogue, ['fr'])).toBe('es')
    })
    it('undefined for an empty or absent catalogue', () => {
        expect(pickLocale({}, ['es'])).toBeUndefined()
        expect(pickLocale(undefined, ['es'])).toBeUndefined()
    })
})

describe('interpolateI18n', () => {
    it('resolves expressions inside a text, with the fallback messages second', () => {
        expect(interpolateI18n('${i18n.orders.title} — ${ i18n.orders.new }', catalogue.es, catalogue.en))
            .toBe('Pedidos — New order')
    })
    it('leaves other expressions alone', () => {
        expect(interpolateI18n('${state.name}: ${i18n.orders.title}', catalogue.en)).toBe('${state.name}: Orders')
    })
    it('a missing key shows as the key, warned once', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(interpolateI18n('${i18n.nope}', catalogue.es)).toBe('nope')
        expect(interpolateI18n('${i18n.nope}', catalogue.es)).toBe('nope')
        expect(warn).toHaveBeenCalledTimes(1)
        warn.mockRestore()
    })
})

describe('translateDeep / mentionsI18n / i18nKeysAsText', () => {
    it('resolves every string of a tree, on a copy', () => {
        const tree = { title: '${i18n.orders.title}', items: [{ label: '${i18n.orders.new}' }, 3, null] }
        const out = translateDeep(tree, catalogue.en)
        expect(out).toEqual({ title: 'Orders', items: [{ label: 'New order' }, 3, null] })
        expect(tree.title).toBe('${i18n.orders.title}')
        expect(mentionsI18n(tree)).toBe(true)
        expect(mentionsI18n(out)).toBe(false)
    })
    it('keys as text when there is no catalogue', () => {
        expect(i18nKeysAsText('Go to ${i18n.orders.title}')).toBe('Go to orders.title')
    })
})

describe('translationsOf / catalogueOf', () => {
    it('reads a type: Translations file, flattening nested messages', () => {
        expect(translationsOf({ type: 'Translations', locale: 'es', messages: { orders: { title: 'Pedidos' }, n: 3 } }))
            .toEqual({ locale: 'es', messages: { 'orders.title': 'Pedidos', n: '3' } })
    })
    it('takes the locale from the file name under translations/', () => {
        expect(translationsOf({ messages: { a: 'b' } }, 'src/main/resources/specs/ui/translations/fr.yaml'))
            .toEqual({ locale: 'fr', messages: { a: 'b' } })
    })
    it('ignores other files', () => {
        expect(translationsOf({ type: 'VerticalLayout' }, 'specs/ui/home.yaml')).toBeUndefined()
        expect(translationsOf({ messages: {} }, 'specs/ui/home.yaml')).toBeUndefined()
    })
    it('merges files per locale', () => {
        expect(catalogueOf([{ locale: 'es', messages: { a: '1' } }, { locale: 'es', messages: { b: '2' } }]))
            .toEqual({ es: { a: '1', b: '2' } })
    })
})
