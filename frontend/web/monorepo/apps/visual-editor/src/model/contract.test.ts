// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The `__contract__` round trip (what lets the editor save a delta, and what the binding pickers
// offer) and the editor's small persisted/derived bits, against a mocked API client.

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({ mateuApiClient: { runAction: (...a: unknown[]) => runAction(...a) } }))

const { fetchInferredFields, fetchContractMembers } = await import('./contract')
const { loadPreviewSource, savePreviewSource } = await import('./previewSourceStore')
const { SCHEMA, specFor, enumValues } = await import('./schemaCatalog')

const el = document.createElement('div')
beforeEach(() => { runAction.mockReset(); localStorage.clear() })

describe('the __contract__ action', () => {
    it('asks for the model view and keeps only well-formed fields', async () => {
        runAction.mockResolvedValue({ appData: { _contract: {
            fields: [{ id: 'name', label: 'Name', dataType: 'string', required: true }, { id: '' }, null, { label: 'no id' }],
            actions: [{ id: 'save' }, { nope: 1 }],
        } } })
        expect(await fetchInferredFields('http://b', 'com.acme.View', el)).toEqual([
            { id: 'name', label: 'Name', dataType: 'string', stereotype: undefined, required: true, readOnly: undefined },
        ])
        expect(runAction).toHaveBeenCalledWith('http://b', '', '', '__contract__', 've-contract', undefined, 'com.acme.View', {}, {}, el, true)
        expect(await fetchContractMembers('http://b', 'com.acme.View', el)).toEqual({ fields: ['name'], actions: ['save'] })
    })

    it('degrades to null (snapshot save, typed bindings) with no model view, no backend or no contract', async () => {
        expect(await fetchInferredFields('', undefined, el)).toBeNull()
        expect(await fetchContractMembers('', undefined, el)).toBeNull()
        expect(runAction).not.toHaveBeenCalled()
        runAction.mockRejectedValue(new Error('down'))
        expect(await fetchInferredFields('http://b', 'X', el)).toBeNull()
        expect(await fetchContractMembers('http://b', 'X', el)).toBeNull()
        runAction.mockResolvedValue({ appData: {} })
        expect(await fetchInferredFields('http://b', 'X', el)).toBeNull()
        expect(await fetchContractMembers('http://b', 'X', el)).toBeNull()
        runAction.mockResolvedValue({ appData: { _contract: { fields: 'x', actions: null } } })
        expect(await fetchContractMembers('http://b', 'X', el)).toEqual({ fields: [], actions: [] })
    })
})

describe('the preview source choice', () => {
    it('survives a reload, and falls back to the backend when unset or unreadable', () => {
        const fallback = loadPreviewSource('http://backend')
        savePreviewSource(fallback)
        expect(loadPreviewSource('http://other')).toEqual(fallback)
        localStorage.setItem('mateu-visual-editor-preview-source', '{broken')
        expect(loadPreviewSource('http://backend')).toEqual(fallback)
        const throwing = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
        expect(() => savePreviewSource(fallback)).not.toThrow()
        throwing.mockRestore()
    })
})

describe('the bundled component catalog', () => {
    it('is the generated schema: every authorable component, with enums', () => {
        expect(SCHEMA.components.size).toBeGreaterThan(50)
        expect(specFor('Button')?.props.map((p) => p.name)).toContain('label')
        expect(specFor(undefined)).toBeUndefined()
        expect(specFor('NoSuchComponent')).toBeUndefined()
        expect(specFor('ServerSideComponent')).toBeUndefined() // wire plumbing is never offered
        expect(enumValues('AppVariant')).toContain('MENU_ON_TOP')
        expect(enumValues('Nope')).toEqual([])
    })
})
