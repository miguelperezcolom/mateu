import { describe, expect, it } from 'vitest'
import { isUnsupportedType, renderUnsupported } from './unsupportedRenderer'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'

describe('isUnsupportedType', () => {

    const declared: ReadonlySet<ComponentMetadataType> = new Set([
        ComponentMetadataType.Form,
        ComponentMetadataType.Button,
    ])

    it('is false when the renderer declares no set (reference renderer supports everything)', () => {
        expect(isUnsupportedType(undefined, ComponentMetadataType.Grid)).toBe(false)
    })

    it('is false when the type is in the declared set', () => {
        expect(isUnsupportedType(declared, ComponentMetadataType.Form)).toBe(false)
        expect(isUnsupportedType(declared, ComponentMetadataType.Button)).toBe(false)
    })

    it('is true when the type is outside the declared set', () => {
        expect(isUnsupportedType(declared, ComponentMetadataType.Grid)).toBe(true)
        expect(isUnsupportedType(declared, ComponentMetadataType.Chart)).toBe(true)
    })

    it('is false when there is no type to judge (let the shared switch handle it)', () => {
        expect(isUnsupportedType(declared, undefined)).toBe(false)
    })
})

describe('renderUnsupported', () => {

    it('produces a mateu-unsupported placeholder carrying the type and renderer name', () => {
        const component = { id: 'c1' } as unknown as ClientSideComponent
        const result = renderUnsupported(component, ComponentMetadataType.Grid, 'sapui5')
        expect(result.strings.join('')).toContain('<mateu-unsupported')
        expect(result.values).toContain(ComponentMetadataType.Grid)
        expect(result.values).toContain('sapui5')
        expect(result.values).toContain('c1')
    })
})
