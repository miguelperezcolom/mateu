// The YAML access keys (`eyesOnly`/`readOnlyUnless`/`disabledUnless` on components, `access` on
// actions and menu items) are decided by the SERVER from the caller's identity (YamlAccess). An
// expanded definition has no server and no identity, so here they are cosmetic: the page renders
// as authored — unrestricted — and the author is told once. A static bundle that declares them
// fails `staticOnly` on the server side for the same reason.

export const ACCESS_KEYS = ['eyesOnly', 'readOnlyUnless', 'disabledUnless', 'access'] as const

let warned = false

const strip = (v: unknown, found: { any: boolean }): unknown => {
    if (Array.isArray(v)) return v.map(x => strip(x, found))
    if (v && typeof v === 'object') {
        const out: Record<string, unknown> = {}
        for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
            if ((ACCESS_KEYS as readonly string[]).includes(k)) {
                found.any = true
                continue
            }
            out[k] = strip(child, found)
        }
        return out
    }
    return v
}

/** `spec` without its access keys (a copy; the same object when it declares none). */
export function withoutAccessKeys<T>(spec: T): T {
    const found = { any: false }
    const stripped = strip(spec, found) as T
    if (!found.any) return spec
    if (!warned) {
        warned = true
        console.warn('mateu: access rules (eyesOnly/readOnlyUnless/disabledUnless/access) need a server '
            + 'to check who is asking — with none, the page renders unrestricted')
    }
    return stripped
}

/** Test hook. */
export const __resetAccessWarningForTests = (): void => { warned = false }
