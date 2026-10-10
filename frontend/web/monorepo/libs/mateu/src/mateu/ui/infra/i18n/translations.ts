// The translation catalogue for pages with NO server — a static bundle, specs mode, the visual
// editor's Play. With a server, `${i18n.key}` is resolved there (TranslationRegistry) and the wire
// carries finished text; here the catalogue travels in the manifest (`translations`, locale → key →
// text) and the browser resolves the same expressions for the visitor's locale.
//
// Same semantics as the server: lookup exact locale → its language → the fallback locale → the key
// itself (one console.warn per missing key).

/** locale (BCP 47, any case) → flattened key → text. */
export type TranslationCatalogue = Record<string, Record<string, string>>

/** Mirrors TranslationRegistry.EXPRESSION on the server. */
export const I18N_EXPRESSION = /\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*\}/g

let fallbackLocale = 'en'

/** The locale tried after the preferred ones (default `en`, like the server's mateu.i18n.fallback). */
export const setFallbackLocale = (locale: string): void => {
    fallbackLocale = locale || 'en'
}

const norm = (locale: string | undefined | null): string =>
    (locale ?? '').trim().replace(/_/g, '-').toLowerCase()

const findKey = (catalogue: TranslationCatalogue, locale: string): string | undefined =>
    Object.keys(catalogue).find(k => norm(k) === locale)

/**
 * The catalogue locale to use for the preferred ones (most preferred first): exact → language →
 * fallback → the first locale the catalogue has. undefined for an empty catalogue.
 */
export function pickLocale(catalogue: TranslationCatalogue | undefined,
                           preferred: ReadonlyArray<string | undefined | null>): string | undefined {
    if (!catalogue) return undefined
    const keys = Object.keys(catalogue)
    if (!keys.length) return undefined
    for (const p of preferred) {
        const n = norm(p)
        if (!n) continue
        const exact = findKey(catalogue, n)
        if (exact) return exact
        const language = findKey(catalogue, n.split('-')[0])
        if (language) return language
    }
    return findKey(catalogue, norm(fallbackLocale))
        ?? findKey(catalogue, norm(fallbackLocale).split('-')[0])
        ?? keys[0]
}

const warned = new Set<string>()

/** `${i18n.key}` expressions in `text` resolved; a missing key shows as the key (warned once). */
export function interpolateI18n(text: string, messages: Record<string, string> | undefined,
                                fallbackMessages?: Record<string, string>): string {
    if (typeof text !== 'string' || !text.includes('i18n.')) return text
    return text.replace(I18N_EXPRESSION, (_m, key: string) => {
        const found = messages?.[key] ?? fallbackMessages?.[key]
        if (found !== undefined) return found
        if (!warned.has(key)) {
            warned.add(key)
            console.warn(`mateu: missing translation '${key}' — showing the key`)
        }
        return key
    })
}

/** Every string inside `value` (deeply, a COPY) with its `${i18n.…}` resolved. */
export function translateDeep<T>(value: T, messages: Record<string, string> | undefined,
                                 fallbackMessages?: Record<string, string>): T {
    const walk = (v: unknown): unknown => {
        if (typeof v === 'string') return interpolateI18n(v, messages, fallbackMessages)
        if (Array.isArray(v)) return v.map(walk)
        if (v && typeof v === 'object') {
            const out: Record<string, unknown> = {}
            for (const [k, child] of Object.entries(v as Record<string, unknown>)) out[k] = walk(child)
            return out
        }
        return v
    }
    return walk(value) as T
}

/** Whether `value` mentions a `${i18n.…}` anywhere (cheap check before a deep copy). */
export const mentionsI18n = (value: unknown): boolean => {
    if (value === undefined || value === null) return false
    const s = typeof value === 'string' ? value : JSON.stringify(value)
    I18N_EXPRESSION.lastIndex = 0
    return I18N_EXPRESSION.test(s)
}

/** `${i18n.x}` rendered as just `x` — for a renderer that has NO catalogue (the server resolves). */
export const i18nKeysAsText = (text: string): string =>
    typeof text === 'string' && text.includes('i18n.') ? text.replace(I18N_EXPRESSION, (_m, k: string) => k) : text

const flattenInto = (prefix: string, node: unknown, out: Record<string, string>) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        const key = prefix ? `${prefix}.${k}` : k
        if (v && typeof v === 'object' && !Array.isArray(v)) flattenInto(key, v, out)
        else if (v !== null && v !== undefined) out[key] = String(v)
    }
}

/**
 * A parsed `type: Translations` file (or a `specs/ui/translations/<locale>.yaml`, where `type` and
 * `locale` may be omitted — pass its path) as `{ locale, messages }` with nested keys flattened, or
 * undefined when it is not a translations file. The same rules as the server's
 * TranslationRegistry.parse — for hosts (the visual editor's Play) that build a catalogue from files.
 */
export function translationsOf(doc: unknown, path?: string):
    { locale: string, messages: Record<string, string> } | undefined {
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return undefined
    const o = doc as Record<string, unknown>
    const type = typeof o.type === 'string' ? o.type : ''
    const p = (path ?? '').replace(/\\/g, '/')
    const conventional = /(^|\/)specs\/ui\/translations\/[^/]+\.ya?ml$/.test(p) || /(^|\/)translations\/[^/]+\.ya?ml$/.test(p)
    if (type !== 'Translations' && !(conventional && !type)) return undefined
    let locale = typeof o.locale === 'string' ? o.locale.trim() : ''
    if (!locale && p) locale = p.substring(p.lastIndexOf('/') + 1).replace(/\.ya?ml$/, '')
    if (!locale) return undefined
    const messages: Record<string, string> = {}
    flattenInto('', o.messages, messages)
    return { locale, messages }
}

/** Merge translations files into a catalogue (later files win per key). */
export function catalogueOf(files: ReadonlyArray<{ locale: string, messages: Record<string, string> }>): TranslationCatalogue {
    const out: TranslationCatalogue = {}
    for (const f of files) out[f.locale] = { ...(out[f.locale] ?? {}), ...f.messages }
    return out
}

/** The browser's preferred locales, most preferred first (empty outside a browser). */
export const browserLocales = (): string[] => {
    const nav = (globalThis as { navigator?: { languages?: readonly string[], language?: string } }).navigator
    if (!nav) return []
    return [...(nav.languages ?? []), ...(nav.language ? [nav.language] : [])]
}

/** Test hook: forget the missing-key warnings. */
export const __resetI18nWarningsForTests = (): void => warned.clear()
