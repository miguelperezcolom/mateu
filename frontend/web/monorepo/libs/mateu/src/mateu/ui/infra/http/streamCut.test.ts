import { describe, expect, it } from 'vitest'
import { isStreamCutByProxy } from './streamCut'

describe('isStreamCutByProxy', () => {
    it('a gateway error with an HTML page or no body is a proxy cutting the stream', () => {
        expect(isStreamCutByProxy(504, '<html><body>Inactivity Timeout</body></html>')).toBe(true)
        expect(isStreamCutByProxy(502, '')).toBe(true)
        expect(isStreamCutByProxy(503, null)).toBe(true)
    })
    it("Mateu's own answers (JSON) and other statuses are not", () => {
        expect(isStreamCutByProxy(503, '{"message":"Too many pending requests"}')).toBe(false)
        expect(isStreamCutByProxy(500, '<html></html>')).toBe(false)
        expect(isStreamCutByProxy(404, '')).toBe(false)
    })
})
