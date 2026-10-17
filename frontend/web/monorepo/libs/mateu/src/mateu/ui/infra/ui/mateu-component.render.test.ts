// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import './mateu-component'
import type { MateuComponent } from './mateu-component'
import { ComponentRenderer, componentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

/** What a mateu-component draws for the component it holds: a page, a listing, or anything else. */
class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

const mount = async (component: Record<string, unknown>) => {
    const el = document.createElement('mateu-component') as MateuComponent & Record<string, any>
    el.component = component as any
    el.state = { name: 'Ana' }
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const page = { id: 'p', type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Page, title: 'Orders' }, children: [] }
const crud = { id: 'l', type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Crud, columns: [] }, children: [] }
const text = { id: 't', type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Text, text: 'Hello ${state.name}' } }

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-component rendering', () => {
    it('a client-side page or listing it holds is drawn as a page or a listing', async () => {
        const asPage = await mount(page)
        expect((asPage.renderRoot.querySelector('mateu-page') as any)?.component.metadata.title).toBe('Orders')
        const asCrud = await mount(crud)
        expect(asCrud.renderRoot.querySelector('mateu-table-crud')?.id).toBe('l')
        const asText = await mount(text)
        expect(asText.renderRoot.textContent).toContain('Hello')
    })

    it('a server-side component draws its children, pages and listings included, inside the action boundary', async () => {
        const el = await mount({ id: 's', type: ComponentType.ServerSide, serverSideType: 'x.Home', children: [page, crud, text] })
        const caller = el.renderRoot.querySelector('mateu-api-caller')!
        expect(caller.querySelector('mateu-page')).not.toBeNull()
        expect(caller.querySelector('mateu-table-crud')).not.toBeNull()
        expect(caller.textContent).toContain('Hello')
    })
})
