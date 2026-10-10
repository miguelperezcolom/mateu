// Bundle mode with translations: pre-rendered entries keep their ${i18n.…} (the exporter renders RAW)
// and the store resolves them for the locale in effect — the host's choice, the app's, the browser's.
import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
    __setBundleForTests, getBundleLocale, getBundleLocales, resolveBundledLoad, setBundleLocale,
    loadBundleManifest, getBundleEnvironment,
} from '@infra/http/bundleStore.ts'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'

const page = (text: string): UIIncrement => ({
    fragments: [{ component: { type: 'ClientSide', metadata: { type: 'Text', text } } }],
} as unknown as UIIncrement)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const textOf = (inc: UIIncrement | undefined) => (inc!.fragments![0].component as any).metadata.text

const catalogue = { en: { hello: 'Hello' }, es: { hello: 'Hola' } }

beforeEach(() => __setBundleForTests(undefined))

describe('bundle translations', () => {
    it('resolves pre-rendered entries for the chosen locale', () => {
        __setBundleForTests(new Map([['home', page('${i18n.hello}!')]]), [], [], {}, new Map(), catalogue)
        setBundleLocale('es')
        expect(getBundleLocale()).toBe('es')
        expect(textOf(resolveBundledLoad('home', 'x'))).toBe('Hola!')
        setBundleLocale('en-GB')
        expect(textOf(resolveBundledLoad('home', 'x'))).toBe('Hello!')
        expect(getBundleLocales().sort()).toEqual(['en', 'es'])
    })

    it('resolves raw definitions before expanding them', () => {
        __setBundleForTests(undefined, [], [{ route: 'about', definition: 'about.yaml' }],
            { 'about.yaml': { layout: { type: 'VerticalLayout', content: [{ type: 'Text', text: '${i18n.hello}' }] } } },
            new Map(), catalogue)
        setBundleLocale('es')
        const inc = resolveBundledLoad('about', 'x')
        expect(JSON.stringify(inc)).toContain('Hola')
        expect(JSON.stringify(inc)).not.toContain('i18n.')
    })

    it('without translations nothing changes', () => {
        __setBundleForTests(new Map([['home', page('${i18n.hello}')]]))
        expect(textOf(resolveBundledLoad('home', 'x'))).toBe('${i18n.hello}')
    })

    it('reads translations and environment from the manifest', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const manifest = {
            entries: [{ route: '/home', syncPath: 'home', ok: true, json: JSON.stringify(page('${i18n.hello}')) }],
            translations: catalogue,
            environment: 'pre',
        }
        const fetchImpl = (async () => ({ ok: true, json: async () => manifest })) as unknown as typeof fetch
        await loadBundleManifest('m.json', fetchImpl)
        setBundleLocale('es')
        expect(textOf(resolveBundledLoad('home', 'x'))).toBe('Hola')
        expect(getBundleEnvironment()).toBe('pre')
        vi.restoreAllMocks()
    })
})
