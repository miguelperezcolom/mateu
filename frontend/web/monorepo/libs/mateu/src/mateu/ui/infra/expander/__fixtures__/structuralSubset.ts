import { expect } from 'vitest'

/**
 * Assert `actual` is a structural SUBSET of `expected`: every key/element the client-side expander
 * emits must be present and equal in the server golden. The golden may carry extra keys — the
 * server's per-type default fields (spacing/container/media/…) that the expander omits and the
 * renderer defaults (render-parity, see design/phase6-client-side-expander.md). Arrays must match in
 * length; `undefined` values on the actual side are skipped.
 */
export function expectSubset(actual: unknown, expected: unknown, path = ''): void {
    if (Array.isArray(actual)) {
        expect(Array.isArray(expected), `${path} should be an array in the golden`).toBe(true)
        expect((actual as unknown[]).length, `${path} length`).toBe((expected as unknown[]).length)
        actual.forEach((v, i) => expectSubset(v, (expected as unknown[])[i], `${path}[${i}]`))
    } else if (actual && typeof actual === 'object') {
        expect(expected && typeof expected === 'object', `${path} should be an object in the golden`).toBeTruthy()
        for (const [k, v] of Object.entries(actual)) {
            if (v === undefined) continue
            expectSubset(v, (expected as Record<string, unknown>)[k], path ? `${path}.${k}` : k)
        }
    } else {
        expect(actual, `${path}`).toEqual(expected)
    }
}
