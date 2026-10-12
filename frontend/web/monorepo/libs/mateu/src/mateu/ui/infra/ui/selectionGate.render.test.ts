// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

// jsdom has no ResizeObserver; the page header observes itself to fit its toolbar
if (!(globalThis as any).ResizeObserver) {
    (globalThis as any).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
}

import './mateu-table-crud'
import './mateu-content-header'
import type { MateuTableCrud } from './mateu-table-crud'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { SELECTION_CHANGED_EVENT } from './selectionGate'

/**
 * A bulk toolbar button is DISABLED while the listing has no selected row — in the crud's own
 * toolbar and in the PAGE header that renders a routed plain listing's toolbar. The guard rides on
 * the button (`rowsSelectedRequired`), so it holds even when the action the component advertises
 * goes by another id.
 */
class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))
afterEach(() => { document.body.innerHTML = '' })

const cancel = { id: 'action-on-row-cancel', actionId: 'action-on-row-cancel', label: 'Cancel', rowsSelectedRequired: true }
const purge = { id: 'purgeAll', actionId: 'purgeAll', label: 'Purge all' }

const crud = (toolbar: unknown[]) => ({
    id: 'crud', type: 'ClientSide', children: [],
    metadata: {
        type: ComponentMetadataType.Crud, title: 'Processes', pageSize: 10, filters: [], toolbar,
        columns: [{ id: 'col-id', type: 'ClientSide', metadata: { type: 'GridColumn', id: 'id', label: 'ID', dataType: 'string' } }],
    },
})

const mountCrud = async (toolbar: unknown[], host?: HTMLElement) => {
    const el = document.createElement('mateu-table-crud') as MateuTableCrud & Record<string, any>
    el.id = 'crud'
    el.component = crud(toolbar) as never
    el.state = {}
    el.appState = {}
    el.appData = {}
    el.data = { crud: { page: { pageNumber: 0, pageSize: 10, totalElements: 1, content: [{ id: 'P-1' }] } } }
    el.baseUrl = ''
    ;(host ?? document.body).appendChild(el)
    await el.updateComplete
    return el
}

const buttonIn = (root: ParentNode, label: string) =>
    Array.from(root.querySelectorAll('button')).find(b => b.textContent?.trim() === label) as HTMLButtonElement

describe('the crud toolbar', () => {
    it('disables a selection-gated button while nothing is selected, and enables it with a selection', async () => {
        const el = await mountCrud([cancel, purge])
        const root = el.shadowRoot ?? el
        expect(buttonIn(root, 'Cancel').disabled).toBe(true)
        expect(buttonIn(root, 'Purge all').disabled).toBe(false)
        el.state['crud_selected_items'] = [{ id: 'P-1' }]
        el.dispatchEvent(new CustomEvent(SELECTION_CHANGED_EVENT, { bubbles: true, composed: true }))
        await el.updateComplete
        expect(buttonIn(root, 'Cancel').disabled).toBe(false)
    })

    it('holds even when the enclosing component advertises the action under another id', async () => {
        // the regression: the @Action method is ALSO advertised as nested-form-action-target-cancel
        // (and that is the entry the lookup used to hit) — the button's own flag decides
        const host = document.createElement('mateu-component') as HTMLElement & Record<string, any>
        host.component = { actions: [{ id: 'nested-form-action-target-cancel', rowsSelectedRequired: false }] }
        document.body.appendChild(host)
        const el = await mountCrud([cancel], host)
        expect(buttonIn(el.shadowRoot ?? el, 'Cancel').disabled).toBe(true)
    })
})

describe('the page header of a routed plain listing', () => {
    const mountHeader = async () => {
        const page = document.createElement('div')
        document.body.appendChild(page)
        const header = document.createElement('mateu-content-header') as HTMLElement & Record<string, any>
        header.metadata = { type: 'Page', title: 'Jobs', toolbar: [
            { ...cancel, id: 'archive', actionId: 'archive', label: 'Archive' }, purge] }
        header.state = {}
        header.data = {}
        page.appendChild(header)
        const listing = await mountCrud([], page)
        await header.updateComplete
        return { header, listing, root: header.shadowRoot ?? header }
    }

    it('disables the bulk button until the sibling listing has a selection', async () => {
        const { header, listing, root } = await mountHeader()
        expect(buttonIn(root, 'Archive').disabled).toBe(true)
        expect(buttonIn(root, 'Purge all').disabled).toBe(false)
        listing.state['crud_selected_items'] = [{ id: 'P-1' }]
        listing.dispatchEvent(new CustomEvent(SELECTION_CHANGED_EVENT, { bubbles: true, composed: true }))
        await header.updateComplete
        expect(buttonIn(root, 'Archive').disabled).toBe(false)
    })
})
