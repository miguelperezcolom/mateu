import { describe, it, expect } from 'vitest'
import { declaresJson, jsonEscape, jsonSafe } from './jsonTemplate.ts'
import { interpolate } from '../ui/interpolation.ts'

describe('values substituted into a JSON body', () => {

    it('escapes the characters that would close the string early', () => {
        expect(jsonEscape('a "quoted" word')).toBe('a \\"quoted\\" word')
        expect(jsonEscape('back\\slash')).toBe('back\\\\slash')
        expect(jsonEscape('two\nlines')).toBe('two\\nlines')
    })

    it('escapes the control characters JSON does not allow raw', () => {
        expect(jsonEscape('a\tb')).toBe('a\\tb')
        expect(jsonEscape('ab')).toBe('a\\u0001b')
    })

    it('leaves ordinary text — accents included — exactly as it was', () => {
        expect(jsonEscape('Millennium Falcón')).toBe('Millennium Falcón')
    })

    it('does NOT add the surrounding quotes: the template already wrote them', () => {
        expect(jsonEscape('Luke')).toBe('Luke')
    })

    it('escapes the strings of a state and leaves everything else alone', () => {
        const safe = jsonSafe({ name: 'a "b"', height: 172, tall: true, missing: null, tags: ['x"y'] })
        expect(safe).toEqual({ name: 'a \\"b\\"', height: 172, tall: true, missing: null, tags: ['x\\"y'] })
    })

    it('is what makes a body with a hostile value still parse', () => {
        // the whole point, end to end: the template, the value, and JSON.parse as the judge
        const state = { name: 'Obi-Wan "Ben" Kenobi', crawl: 'It is a period\nof civil war.' }
        const template = '{"name":"${state.name}","crawl":"${state.crawl}"}'

        const broken = interpolate(template, state, {})
        expect(() => JSON.parse(broken)).toThrow()

        const fixed = interpolate(template, jsonSafe(state), {})
        expect(JSON.parse(fixed)).toEqual(state)
    })

    it('knows a JSON request by what it declares, whatever the header casing', () => {
        expect(declaresJson({ 'Content-Type': 'application/json' })).toBe(true)
        expect(declaresJson({ 'content-type': 'application/json; charset=utf-8' })).toBe(true)
        expect(declaresJson({ 'Content-Type': 'text/plain' })).toBe(false)
        expect(declaresJson({})).toBe(false)
        expect(declaresJson(undefined)).toBe(false)
    })
})
