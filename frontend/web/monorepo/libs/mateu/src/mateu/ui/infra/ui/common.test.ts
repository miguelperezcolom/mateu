import { describe, expect, it } from 'vitest'
import { parseOverrides } from './common'

describe('parseOverrides', () => {
    it('parses a JSON object', () => {
        expect(parseOverrides('{"a": 1, "b": "x"}')).toEqual({ a: 1, b: 'x' })
    })

    it('wraps non-JSON content as { value }', () => {
        expect(parseOverrides('plain text')).toEqual({ value: 'plain text' })
    })

    it('returns an empty object for undefined or empty input', () => {
        expect(parseOverrides(undefined)).toEqual({})
        expect(parseOverrides('')).toEqual({})
    })
})
