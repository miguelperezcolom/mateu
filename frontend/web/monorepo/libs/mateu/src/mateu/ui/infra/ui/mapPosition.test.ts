import { describe, expect, it } from 'vitest'
import { DEFAULT_CENTER, DEFAULT_ZOOM, parsePosition, parseZoom, planMapView, SINGLE_MARKER_ZOOM, tileSourceOf } from './mapPosition'

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

describe('planMapView', () => {
    const palma = { latitude: 39.5696, longitude: 2.6502 }
    const port = { latitude: 39.5546, longitude: 2.6236 }

    it('an explicit position wins over the markers', () => {
        expect(planMapView('40.4, -3.7', '9', [palma, port]))
            .toEqual({ kind: 'center', center: { lat: 40.4, lon: -3.7 }, zoom: 9 })
    })

    it('one marker is centred, closer than the world view when no zoom is given', () => {
        expect(planMapView(undefined, undefined, [palma]))
            .toEqual({ kind: 'center', center: { lat: 39.5696, lon: 2.6502 }, zoom: SINGLE_MARKER_ZOOM })
        expect(planMapView(undefined, '11', [palma]))
            .toEqual({ kind: 'center', center: { lat: 39.5696, lon: 2.6502 }, zoom: 11 })
    })

    it('several markers are fitted', () => {
        expect(planMapView(undefined, '12', [palma, port])).toEqual({
            kind: 'fit',
            min: { lat: 39.5546, lon: 2.6236 },
            max: { lat: 39.5696, lon: 2.6502 },
        })
    })

    it('no position and no markers is the world view', () => {
        expect(planMapView(undefined, undefined, [])).toEqual({ kind: 'center', center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
    })
})

describe('tileSourceOf', () => {
    it('falls back to OpenStreetMap when no tileUrl is declared', () => {
        expect(tileSourceOf(undefined, undefined)).toEqual({})
        expect(tileSourceOf('  ', 'ignored')).toEqual({})
    })

    it('carries the template and the attribution', () => {
        expect(tileSourceOf('https://tiles.example.com/{z}/{x}/{y}.png', '© Example'))
            .toEqual({ url: 'https://tiles.example.com/{z}/{x}/{y}.png', attributions: '© Example' })
    })

    it('translates the Leaflet subdomain placeholder to the OpenLayers one', () => {
        expect(tileSourceOf('https://{s}.tile.example.com/{z}/{x}/{y}.png', null).url)
            .toBe('https://{a-c}.tile.example.com/{z}/{x}/{y}.png')
    })
})
