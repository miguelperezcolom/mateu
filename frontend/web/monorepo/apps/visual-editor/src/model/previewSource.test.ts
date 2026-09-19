import { describe, it, expect } from 'vitest'
import {
    defaultPreviewSource,
    renderBaseUrl,
    rendersClientSide,
    usesFixtures,
    contractFixtureFor,
    fixtureAsMembers,
    parsePreviewSource,
    serializePreviewSource,
    PreviewSource,
} from './previewSource'

describe('previewSource', () => {
    it('defaults to remote at the host baseUrl', () => {
        const s = defaultPreviewSource('http://localhost:8600')
        expect(s).toEqual({ mode: 'remote', baseUrl: 'http://localhost:8600' })
    })

    it('renders against the baseUrl for every mode except client', () => {
        expect(renderBaseUrl({ mode: 'remote', baseUrl: 'b' })).toBe('b')
        expect(renderBaseUrl({ mode: 'local', baseUrl: 'b' })).toBe('b')
        expect(renderBaseUrl({ mode: 'mock', baseUrl: 'b' })).toBe('b')
        // client has no renderer yet — empty so the canvas shows a placeholder, not a dead call.
        expect(renderBaseUrl({ mode: 'client', baseUrl: 'b' })).toBe('')
        expect(rendersClientSide({ mode: 'client', baseUrl: 'b' })).toBe(true)
        expect(rendersClientSide({ mode: 'remote', baseUrl: 'b' })).toBe(false)
    })

    it('serves contract from fixtures only in mock mode', () => {
        const fixtures = { 'com.acme.PersonView': { fields: [{ id: 'name' }], actions: ['save'] } }
        const mock: PreviewSource = { mode: 'mock', baseUrl: 'b', contractFixtures: fixtures }
        expect(usesFixtures(mock)).toBe(true)
        expect(contractFixtureFor(mock, 'com.acme.PersonView')).toEqual(fixtures['com.acme.PersonView'])
        // no fixture for this VM → null (fall through to the backend)
        expect(contractFixtureFor(mock, 'com.acme.Other')).toBeNull()
        // remote never uses fixtures even if present
        expect(contractFixtureFor({ ...mock, mode: 'remote' }, 'com.acme.PersonView')).toBeNull()
        // no model view → null
        expect(contractFixtureFor(mock, undefined)).toBeNull()
    })

    it('reshapes a fixture into binding members (ids only)', () => {
        const members = fixtureAsMembers({ fields: [{ id: 'name' }, { id: 'age' }], actions: ['save', 'delete'] })
        expect(members).toEqual({ fields: ['name', 'age'], actions: ['save', 'delete'] })
        expect(fixtureAsMembers({})).toEqual({ fields: [], actions: [] })
    })

    it('round-trips through serialise/parse', () => {
        const src: PreviewSource = { mode: 'mock', baseUrl: 'http://x', contractFixtures: { VM: { fields: [{ id: 'a' }] } } }
        expect(parsePreviewSource(serializePreviewSource(src), 'fallback')).toEqual(src)
    })

    it('parse tolerates garbage and missing values, falling back to remote at the host baseUrl', () => {
        expect(parsePreviewSource(null, 'fb')).toEqual({ mode: 'remote', baseUrl: 'fb' })
        expect(parsePreviewSource('not json', 'fb')).toEqual({ mode: 'remote', baseUrl: 'fb' })
        // unknown mode → remote; missing baseUrl → the live host baseUrl wins
        expect(parsePreviewSource(JSON.stringify({ mode: 'bogus' }), 'fb')).toEqual({ mode: 'remote', baseUrl: 'fb' })
        expect(parsePreviewSource(JSON.stringify({ mode: 'client' }), 'fb')).toEqual({ mode: 'client', baseUrl: 'fb' })
    })
})
