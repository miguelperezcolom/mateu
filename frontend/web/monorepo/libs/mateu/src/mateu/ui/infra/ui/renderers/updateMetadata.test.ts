// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { updateMedata } from './renderClientSideComponent'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

/**
 * updateMedata applies the client-side rules' `<id>.disabled` to a button/field. It must hand back
 * the SAME metadata object when nothing changes: renderers keep bookkeeping keyed by that identity
 * (a ConfirmDialog remembers it was answered in a WeakSet of its metadata) and a copy per render
 * made them forget it on the next re-render.
 */
const component = (metadata: Record<string, unknown>) => ({ id: 'b1', type: 'ClientSide', metadata } as any)

describe('updateMedata', () => {
    it('returns the original metadata when no rule changes it', () => {
        const confirm = { type: ComponentMetadataType.ConfirmDialog, header: 'Sure?' }
        expect(updateMedata(component(confirm), {})).toBe(confirm)
        const button = { type: ComponentMetadataType.Button, label: 'Save' }
        expect(updateMedata(component(button), {})).toBe(button)
        const field = { type: ComponentMetadataType.FormField, fieldId: 'x', disabled: true }
        expect(updateMedata(component(field), { 'b1.disabled': true })).toBe(field)
    })

    it('disables a copy (never the server-sent object) when a rule disables it', () => {
        const button = { type: ComponentMetadataType.Button, label: 'Save' }
        const out = updateMedata(component(button), { 'b1.disabled': true }) as any
        expect(out).not.toBe(button)
        expect(out.disabled).toBe(true)
        expect((button as any).disabled).toBeUndefined()
    })

    it('keeps one copy across renders while the rule holds', () => {
        const field = { type: ComponentMetadataType.FormField, fieldId: 'x' }
        const first = updateMedata(component(field), { 'b1.disabled': true })
        expect(updateMedata(component(field), { 'b1.disabled': true })).toBe(first)
        expect(updateMedata(component(field), {})).toBe(field)
    })
})

describe('a confirm dialog rendered through the dispatcher', () => {
    it('stays dismissed on the next re-render once answered', async () => {
        const { render } = await import('lit')
        const { renderClientSideComponent } = await import('./renderClientSideComponent')
        const host = document.createElement('div')
        document.body.appendChild(host)
        const container = { requestUpdate: () => {} } as any
        const dialog = component({ type: ComponentMetadataType.ConfirmDialog, header: 'Sure?', confirmActionId: 'go' })
        const paint = () => render(renderClientSideComponent(container, dialog, '', {}, {}, {}, {}, false), host)
        paint()
        const ok = host.querySelector('.mateu-confirm-dialog button:last-of-type') as HTMLButtonElement
        expect(ok).toBeTruthy()
        ok.click()
        paint()
        expect(host.querySelector('.mateu-confirm-dialog')).toBeNull()
    })
})
