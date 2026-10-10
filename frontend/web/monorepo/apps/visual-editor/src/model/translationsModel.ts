import { parse } from 'yaml'

/**
 * The two non-screen file kinds of a YAML app the editor has to recognise (and keep out of the page
 * list): the message catalogues (`type: Translations`, or by convention `translations/<locale>.yaml`)
 * and the deployment environments (`type: Environment`, or `environments/<name>.yaml`). Mirrors the
 * server's TranslationRegistry / Environments parsing: nested messages are flattened with dots
 * (`orders: {title: …}` is `${i18n.orders.title}`), a conventional file's name is its locale/name.
 */

/** One locale's catalogue: key → text, flattened. */
export interface TranslationsFile {
    path: string
    locale: string
    messages: Record<string, string>
}

const TRANSLATIONS_DIR = 'translations/'
const ENVIRONMENTS_DIR = 'environments/'

/** The `${i18n.key}` expression (the same pattern the server resolves). */
export const I18N_EXPRESSION = /\$\{\s*i18n\.([A-Za-z0-9_][A-Za-z0-9_.-]*)\s*\}/g

/** The catalogue a file declares, or undefined when it is not a translations file. */
export function parseTranslationsFile(path: string, content: string): TranslationsFile | undefined {
    const root = object(content)
    if (!root) return undefined
    const p = normalize(path)
    const type = typeof root.type === 'string' ? root.type : ''
    const conventional = inDir(p, TRANSLATIONS_DIR)
    if (type !== 'Translations' && !(conventional && !type)) return undefined
    const locale = (typeof root.locale === 'string' && root.locale.trim()) || stem(p)
    if (!locale) return undefined
    const messages: Record<string, string> = {}
    flatten('', root.messages, messages)
    return { path: p, locale, messages }
}

/** The environment's name, or undefined when the file is not an environment. */
export function environmentName(path: string, content: string): string | undefined {
    const root = object(content)
    if (!root) return undefined
    const p = normalize(path)
    const type = typeof root.type === 'string' ? root.type : ''
    if (type !== 'Environment' && !(inDir(p, ENVIRONMENTS_DIR) && !type)) return undefined
    return (typeof root.name === 'string' && root.name.trim()) || stem(p)
}

/** locale → key → text, merged over every translations file (a later file wins per key). */
export function catalogueOf(files: TranslationsFile[]): Record<string, Record<string, string>> {
    const out: Record<string, Record<string, string>> = {}
    for (const f of files) out[f.locale.toLowerCase()] = { ...(out[f.locale.toLowerCase()] ?? {}), ...f.messages }
    return out
}

/** Every key any locale declares, sorted. */
export function translationKeys(files: TranslationsFile[]): string[] {
    return [...new Set(files.flatMap((f) => Object.keys(f.messages)))].sort((a, b) => a.localeCompare(b))
}

/**
 * The locale to show: the first preferred one the catalogue has (exact, then its language), else
 * `en`, else the first locale declared. Undefined when there is no catalogue.
 */
export function pickLocale(locales: string[], preferred: readonly string[]): string | undefined {
    const have = locales.map((l) => l.toLowerCase())
    for (const p of preferred) {
        const tag = (p ?? '').toLowerCase()
        if (have.includes(tag)) return tag
        const lang = tag.split('-')[0]
        if (lang && have.includes(lang)) return lang
    }
    if (have.includes('en')) return 'en'
    return have[0]
}

/**
 * `text` with its `${i18n.…}` resolved for `locale`: that locale, its language, `en`, else the key
 * itself (what the server shows for a missing key). The local adapter Play uses when the shared
 * runtime offers no resolver of its own.
 */
export function resolveI18n(text: string, catalogue: Record<string, Record<string, string>>, locale: string): string {
    const chain = [locale.toLowerCase(), locale.toLowerCase().split('-')[0], 'en'].filter((l, i, a) => l && a.indexOf(l) === i)
    return text.replace(I18N_EXPRESSION, (_m, key: string) => {
        for (const l of chain) {
            const v = catalogue[l]?.[key]
            if (v !== undefined) return v
        }
        return key
    })
}

/** Every string inside `value` resolved with {@link resolveI18n} (a copy). */
export function resolveI18nDeep<T>(value: T, catalogue: Record<string, Record<string, string>>, locale: string): T {
    if (typeof value === 'string') return resolveI18n(value, catalogue, locale) as unknown as T
    if (Array.isArray(value)) return value.map((v) => resolveI18nDeep(v, catalogue, locale)) as unknown as T
    if (value && typeof value === 'object') {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(value)) out[k] = resolveI18nDeep(v, catalogue, locale)
        return out as T
    }
    return value
}

function flatten(prefix: string, node: unknown, out: Record<string, string>) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        const key = prefix ? `${prefix}.${k}` : k
        if (v && typeof v === 'object' && !Array.isArray(v)) flatten(key, v, out)
        else if (v != null) out[key] = String(v)
    }
}

function object(content: string): Record<string, unknown> | undefined {
    try {
        const root = parse(content ?? '')
        return root && typeof root === 'object' && !Array.isArray(root) ? (root as Record<string, unknown>) : undefined
    } catch {
        return undefined
    }
}

function inDir(path: string, dir: string): boolean {
    return path.startsWith(dir) || path.includes('/' + dir)
}

function normalize(p: string): string {
    return (p ?? '').replace(/^\/+/, '').replace(/^specs\/ui\//, '')
}

function stem(p: string): string {
    return (p.split('/').pop() ?? p).replace(/\.(ya?ml)$/i, '')
}
