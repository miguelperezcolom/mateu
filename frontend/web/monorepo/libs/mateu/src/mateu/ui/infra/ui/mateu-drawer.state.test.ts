// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-drawer'
import type { MateuDrawer } from './mateu-drawer'

/**
 * The drawer's own values (the crud create/edit drawer has no mateu-component of its own): seeded
 * from initialData, kept across the owner's re-renders, and handed to the host with each action as
 * its initiatorState — without them a save from the drawer carried only the touched fields.
 */
describe('the drawer state', () => {
    const drawerOf = async (initialData: Record<string, unknown>) => {
        const drawer = document.createElement('mateu-drawer') as MateuDrawer
        drawer.component = { type: 'ClientSide', id: 'd', children: [],
            metadata: { type: 'Drawer', id: 'crud-edit-drawer', initialData } } as never
        document.body.appendChild(drawer)
        await drawer.updateComplete
        return drawer
    }

    afterEach(() => { document.body.innerHTML = '' })

    it('keeps what was typed and hands it to the host as initiatorState', async () => {
        const drawer = await drawerOf({ id: '101', name: 'Ocean view' })
        drawer.dispatchEvent(new CustomEvent('value-changed', { detail: { fieldId: 'name', value: 'Sea' } }))
        const detail: { actionId: string, parameters?: Record<string, unknown> } = { actionId: 'save' }
        drawer.dispatchEvent(new CustomEvent('action-requested', { detail }))
        expect(detail.parameters?.initiatorState).toEqual({ id: '101', name: 'Sea' })
    })

    it('does not overwrite an initiatorState a nested component already set', async () => {
        const drawer = await drawerOf({ id: '101' })
        const detail = { actionId: 'save', parameters: { initiatorState: { mine: true } } }
        drawer.dispatchEvent(new CustomEvent('action-requested', { detail }))
        expect(detail.parameters.initiatorState).toEqual({ mine: true })
    })

    it('survives the owner re-binding the same drawer, but re-seeds when the server re-sends it', async () => {
        const drawer = await drawerOf({ id: '101', name: 'Ocean view' })
        drawer.dispatchEvent(new CustomEvent('value-changed', { detail: { fieldId: 'name', value: 'Sea' } }))
        const metadata = (drawer.component as unknown as { metadata: unknown }).metadata
        drawer.component = { ...(drawer.component as object), metadata } as never
        await drawer.updateComplete
        expect(drawer.state).toEqual({ id: '101', name: 'Sea' })

        drawer.component = { type: 'ClientSide', id: 'd', children: [],
            metadata: { type: 'Drawer', id: 'crud-edit-drawer', initialData: { id: '102', name: 'Garden' } } } as never
        await drawer.updateComplete
        expect(drawer.state).toEqual({ id: '102', name: 'Garden' })
    })
})
