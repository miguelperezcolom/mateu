import { describe, it, expect } from 'vitest'
import {
    defaultPreviewSource,
    renderBaseUrl,
    rendersClientSide,
    usesFixtures,
    contractFixtureFor,
    fixtureAsMembers,
    fixturedViewModels,
    setContractFixture,
    removeContractFixture,
    parseContractFixtures,
    setRowFixture,
    removeRowFixture,
    fixturedRowSources,
    resolveRowFixture,
    parseRowFixtures,
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

    it('sets a fixture (switching to mock), lists it, and removes it', () => {
        const base: PreviewSource = { mode: 'remote', baseUrl: 'b' }
        const withFix = setContractFixture(base, 'VM1', { fields: [{ id: 'a' }], actions: ['save'] })
        expect(withFix.mode).toBe('mock')
        expect(fixturedViewModels(withFix)).toEqual(['VM1'])
        expect(contractFixtureFor(withFix, 'VM1')).toEqual({ fields: [{ id: 'a' }], actions: ['save'] })

        const withTwo = setContractFixture(withFix, 'VM2', { fields: [] })
        expect(fixturedViewModels(withTwo)).toEqual(['VM1', 'VM2'])

        const removed = removeContractFixture(withTwo, 'VM1')
        expect(fixturedViewModels(removed)).toEqual(['VM2'])
        // removing the last fixture clears the map entirely
        expect(removeContractFixture(removed, 'VM2').contractFixtures).toBeUndefined()
    })

    it('imports a fixtures document and rejects malformed input', () => {
        const doc = JSON.stringify({ VM: { fields: [{ id: 'x', label: 'X' }, { bad: 1 }], actions: ['go', 2] } })
        const parsed = parseContractFixtures(doc)
        // the field without an id and the non-string action are dropped
        expect(parsed).toEqual({ VM: { fields: [{ id: 'x', label: 'X' }], actions: ['go'] } })

        expect(parseContractFixtures('not json')).toBeNull()
        expect(parseContractFixtures('[1,2]')).toBeNull()
        expect(parseContractFixtures(JSON.stringify({ VM: 'nope' }))).toBeNull()
    })

    it('sets/lists/removes row fixtures and resolves them by ref then url (mock only)', () => {
        const base: PreviewSource = { mode: 'remote', baseUrl: 'b' }
        const withRows = setRowFixture(base, 'people', { results: [{ id: 1 }] })
        expect(withRows.mode).toBe('mock')
        expect(fixturedRowSources(withRows)).toEqual(['people'])
        // resolved by ref
        expect(resolveRowFixture(withRows, 'people', 'https://x')).toEqual({ results: [{ id: 1 }] })
        // resolved by url when there's no ref match
        const byUrl = setRowFixture(base, 'https://api/people', [{ id: 2 }])
        expect(resolveRowFixture(byUrl, undefined, 'https://api/people')).toEqual([{ id: 2 }])
        // never resolves outside mock mode
        expect(resolveRowFixture({ ...withRows, mode: 'remote' }, 'people', 'https://x')).toBeUndefined()
        // removal clears the map when empty
        expect(removeRowFixture(withRows, 'people').rowFixtures).toBeUndefined()
    })

    it('imports a row-fixtures document (any JSON value per key) and rejects non-objects', () => {
        expect(parseRowFixtures(JSON.stringify({ people: { results: [1, 2] }, flags: [true] }))).toEqual({
            people: { results: [1, 2] },
            flags: [true],
        })
        expect(parseRowFixtures('not json')).toBeNull()
        expect(parseRowFixtures('[1,2]')).toBeNull()
    })
})
