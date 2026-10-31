/**
 * A micro frontend the HOST resolved while building its response carries the remote's answer in
 * `metadata.resolved` (the island paints it instead of asking the remote). That answer is
 * per-request content of ANOTHER app — often per user — so it must never outlive the response:
 * the client structure caches (localStorage, the @StaticView session cache) keep the structure
 * WITHOUT it, and a seeded micro frontend loads from its remote as with `resolve = CLIENT`.
 */
export const withoutResolvedMicroFrontends = <T>(value: T): T => strip(value) as T

const strip = (value: unknown): unknown => {
    if (Array.isArray(value)) {
        let changed = false
        const out = value.map(item => {
            const next = strip(item)
            if (next !== item) changed = true
            return next
        })
        return changed ? out : value
    }
    if (!value || typeof value !== 'object') return value
    const record = value as Record<string, unknown>
    if (record.type === 'MicroFrontend' && 'resolved' in record) {
        const { resolved: _dropped, ...rest } = record
        return rest
    }
    let out: Record<string, unknown> | undefined
    for (const [key, child] of Object.entries(record)) {
        const next = strip(child)
        if (next !== child) {
            out = out ?? { ...record }
            out[key] = next
        }
    }
    return out ?? value
}
