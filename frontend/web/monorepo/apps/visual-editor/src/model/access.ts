/**
 * The `Access` restriction as the editors author it — the YAML twin of @EyesOnly / @ReadOnlyUnless /
 * @DisabledUnless (`eyesOnly:` / `readOnlyUnless:` / `disabledUnless:` on a component, `access:` on a
 * route, a menu item or a declared action). Same four dimensions as the schema's `Access` record:
 * the caller needs one value of EVERY dimension that lists any (AND across, OR within). Evaluated on
 * the server from the request identity — in a static bundle or in Play there is no identity, so the
 * rules are cosmetic there.
 *
 * Pure (no lit): the serialisation is what the unit tests pin.
 */

export const ACCESS_DIMENSIONS = ['roles', 'groups', 'scopes', 'permissions'] as const
export type AccessDimension = (typeof ACCESS_DIMENSIONS)[number]
export type Access = Partial<Record<AccessDimension, string[]>>

/** The keys a component carries its restrictions under, with what an unsatisfied one does. */
export const COMPONENT_ACCESS_KEYS: { key: 'eyesOnly' | 'readOnlyUnless' | 'disabledUnless'; label: string; help: string }[] = [
    { key: 'eyesOnly', label: 'Visible only to', help: 'removed for anybody else' },
    { key: 'readOnlyUnless', label: 'Editable only by', help: 'read-only for anybody else (fields under it too)' },
    { key: 'disabledUnless', label: 'Enabled only for', help: 'disabled for anybody else' },
]

/** Whatever the YAML holds (an object, the roles shorthand string/list, nothing) as an Access. */
export function readAccess(value: unknown): Access {
    if (value == null || value === '') return {}
    if (typeof value === 'string' || Array.isArray(value)) return clean({ roles: toList(value) })
    if (typeof value !== 'object') return {}
    const v = value as Record<string, unknown>
    const out: Access = {}
    for (const d of ACCESS_DIMENSIONS) out[d] = toList(v[d])
    return clean(out)
}

/** The Access to write: only the dimensions that list something; `''` (key removed) when none does. */
export function writeAccess(access: Access): Access | '' {
    const out = clean(access)
    return Object.keys(out).length ? out : ''
}

/** Whether any dimension is declared. */
export function restricts(value: unknown): boolean {
    return Object.keys(readAccess(value)).length > 0
}

/** One dimension's values as the editor shows them: comma-separated. */
export function formatList(values: string[] | undefined): string {
    return (values ?? []).join(', ')
}

/** `admin, hr` → ['admin', 'hr'] (blank and duplicate entries dropped). */
export function parseList(text: string): string[] {
    return [...new Set(text.split(',').map((s) => s.trim()).filter(Boolean))]
}

/**
 * The one-line form the compact editors (a route row, a menu item) use: `admin, hr` is roles only
 * (the shorthand), anything else names its dimensions — `roles=admin; scopes=orders:write`.
 */
export function formatAccessInline(value: unknown): string {
    const a = readAccess(value)
    const dims = Object.keys(a) as AccessDimension[]
    if (dims.length === 1 && dims[0] === 'roles') return formatList(a.roles)
    return dims.map((d) => `${d}=${(a[d] ?? []).join(',')}`).join('; ')
}

/** The inverse of {@link formatAccessInline}; `''` when nothing is declared. */
export function parseAccessInline(text: string): Access | '' {
    const t = (text ?? '').trim()
    if (!t) return ''
    if (!t.includes('=')) return writeAccess({ roles: parseList(t) })
    const out: Access = {}
    for (const part of t.split(';')) {
        const eq = part.indexOf('=')
        if (eq < 0) continue
        const dim = part.slice(0, eq).trim() as AccessDimension
        if (!ACCESS_DIMENSIONS.includes(dim)) continue
        out[dim] = [...new Set([...(out[dim] ?? []), ...parseList(part.slice(eq + 1))])]
    }
    return writeAccess(out)
}

function toList(v: unknown): string[] {
    if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean)
    if (typeof v === 'string') return parseList(v)
    return []
}

function clean(a: Access): Access {
    const out: Access = {}
    for (const d of ACCESS_DIMENSIONS) {
        const list = [...new Set((a[d] ?? []).map((s) => s.trim()).filter(Boolean))]
        if (list.length) out[d] = list
    }
    return out
}
