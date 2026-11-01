import { describe, expect, it } from 'vitest'
import { ExternalRestError, serviceMessageOf } from './serviceMessage'
import { fetchExternalJson } from './externalOptions'

// The same cases as the server's RestProxyServiceMessageTest and Redwood's test-sources: one rule.
describe('serviceMessageOf', () => {
    it('reads the usual error shapes, in order', () => {
        expect(serviceMessageOf('{"status":400,"error":"Bad Request","message":"Image larger than 2 MB"}')).toBe('Image larger than 2 MB')
        expect(serviceMessageOf('{"title":"Invalid","detail":"Name is required"}')).toBe('Name is required')
        expect(serviceMessageOf('{"error":"not allowed"}')).toBe('not allowed')
        expect(serviceMessageOf('{"error":{"message":"quota exceeded"}}')).toBe('quota exceeded')
        expect(serviceMessageOf('{"title":"Conflict"}')).toBe('Conflict')
        expect(serviceMessageOf('Astronaut still on a crew')).toBe('Astronaut still on a crew')
        expect(serviceMessageOf({ message: 'as an object' })).toBe('as an object')
    })

    it('gives nothing when there is nothing worth showing', () => {
        for (const body of [null, undefined, '  ', '<html><body>502</body></html>', '[1,2]', 'x'.repeat(301), '{"status":500}', '{not json']) {
            expect(serviceMessageOf(body), String(body)).toBeUndefined()
        }
    })

    it('drops control characters, folds whitespace and clips to 300', () => {
        expect(serviceMessageOf('{"message":"two\\u0007\\n  lines"}')).toBe('two lines')
        const clipped = serviceMessageOf(`{"message":"${'y'.repeat(400)}"}`)!
        expect(clipped).toHaveLength(300)
        expect(clipped.endsWith('…')).toBe(true)
    })
})

describe('a direct call answered with an error', () => {
    it('throws an ExternalRestError carrying the status and what the service said', async () => {
        const fetchImpl = (async () => ({ ok: false, status: 400, text: async () => '{"message":"Image larger than 2 MB"}' })) as unknown as typeof fetch
        const error = await fetchExternalJson({ url: 'https://api.example.com/x', method: 'PUT' }, (t) => t, fetchImpl)
            .catch((e: unknown) => e) as ExternalRestError
        expect(error).toBeInstanceOf(ExternalRestError)
        expect(error.status).toBe(400)
        expect(error.detail).toBe('Image larger than 2 MB')
        expect(error.message).toBe('External REST fetch failed: 400')
    })
})
