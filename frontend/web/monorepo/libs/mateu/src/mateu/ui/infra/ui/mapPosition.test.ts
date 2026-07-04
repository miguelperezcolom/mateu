import { describe, expect, it } from 'vitest'
import { DEFAULT_ZOOM, parsePosition, parseZoom } from './mapPosition'

describe('parsePosition', () => {
    it('parses "lat, lon"', () => {
        expect(parsePosition('39.57, 2.65')).toEqual({ lat: 39.57, lon: 2.65 })
    })

    it('parses negative coordinates without spaces', () => {
        expect(parsePosition('-33.45,-70.66')).toEqual({ lat: -33.45, lon: -70.66 })
    })

    it('returns undefined for garbage, empty and partial values', () => {
        expect(parsePosition('eidjeidjeijd')).toBeUndefined()
        expect(parsePosition('')).toBeUndefined()
        expect(parsePosition(undefined)).toBeUndefined()
        expect(parsePosition(null)).toBeUndefined()
        expect(parsePosition('39.57')).toBeUndefined()
        expect(parsePosition('39.57,')).toBeUndefined()
        expect(parsePosition('a,b')).toBeUndefined()
        expect(parsePosition('1,2,3')).toBeUndefined()
    })
})

describe('parseZoom', () => {
    it('parses a numeric zoom', () => {
        expect(parseZoom('14')).toBe(14)
        expect(parseZoom('4.5')).toBe(4.5)
    })

    it('falls back to the default zoom otherwise', () => {
        expect(parseZoom(undefined)).toBe(DEFAULT_ZOOM)
        expect(parseZoom(null)).toBe(DEFAULT_ZOOM)
        expect(parseZoom('')).toBe(DEFAULT_ZOOM)
        expect(parseZoom('x')).toBe(DEFAULT_ZOOM)
    })
})
