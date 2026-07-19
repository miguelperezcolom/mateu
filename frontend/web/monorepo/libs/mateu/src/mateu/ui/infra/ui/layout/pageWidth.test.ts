import { describe, expect, it } from 'vitest'
import { resolvePageWidth } from './pageWidth'
import Component from '@mateu/shared/apiClients/dtos/Component'
import ServerSideComponent from '@mateu/shared/apiClients/dtos/ServerSideComponent'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

const serverSide = (overrides: Partial<ServerSideComponent> = {}, children: Component[] = []): ServerSideComponent =>
    ({ type: ComponentType.ServerSide, children, ...overrides }) as ServerSideComponent

const clientSide = (metadataType: ComponentMetadataType, metadata: object = {}, children: Component[] = []): ClientSideComponent =>
    ({
        type: ComponentType.ClientSide,
        metadata: { type: metadataType, ...metadata },
        children,
    }) as unknown as ClientSideComponent

const page = (pageWidth?: string, children: Component[] = []): ClientSideComponent =>
    clientSide(ComponentMetadataType.Page, pageWidth ? { pageWidth } : {}, children)

const crud = (metadata: object = {}): ClientSideComponent =>
    clientSide(ComponentMetadataType.Crud, metadata)

const editableColumn = () =>
    clientSide(ComponentMetadataType.GridColumn as ComponentMetadataType, { editable: true })

const plainColumn = () =>
    clientSide(ComponentMetadataType.GridColumn as ComponentMetadataType, {})

describe('resolvePageWidth', () => {
    it('defaults to fixed when there is no component', () => {
        expect(resolvePageWidth(undefined)).toBe('fixed')
    })

    it('uses the pageWidth declared on the server-side component', () => {
        expect(resolvePageWidth(serverSide({ pageWidth: 'fixed' }))).toBe('fixed')
        expect(resolvePageWidth(serverSide({ pageWidth: 'fullWidth' }))).toBe('full')
        expect(resolvePageWidth(serverSide({ pageWidth: 'edgeToEdge' }))).toBe('edge')
    })

    it('uses the pageWidth declared on the Page metadata when the wrapper says nothing', () => {
        expect(resolvePageWidth(serverSide({}, [page('edgeToEdge')]))).toBe('edge')
        expect(resolvePageWidth(serverSide({}, [page('fullWidth')]))).toBe('full')
    })

    it('gives the wrapper declaration precedence over the Page metadata', () => {
        expect(resolvePageWidth(serverSide({ pageWidth: 'fixed' }, [page('edgeToEdge')]))).toBe('fixed')
    })

    it('finds the Page metadata declaration deep in the tree', () => {
        const layout = clientSide(ComponentMetadataType.VerticalLayout, {}, [page('fullWidth')])
        expect(resolvePageWidth(serverSide({}, [layout]))).toBe('full')
    })

    it('infers edge from full-bleed content, wherever it sits in the tree', () => {
        for (const type of [
            ComponentMetadataType.Gantt,
            ComponentMetadataType.PlanningBoard,
            ComponentMetadataType.Kanban,
            ComponentMetadataType.Bpmn,
            ComponentMetadataType.Workflow,
            ComponentMetadataType.WorkflowElk,
            ComponentMetadataType.Map,
        ]) {
            const layout = clientSide(ComponentMetadataType.VerticalLayout, {}, [clientSide(type)])
            expect(resolvePageWidth(serverSide({}, [page(undefined, [layout])])), type).toBe('edge')
        }
    })

    it('infers full from a crud with inline editing', () => {
        expect(resolvePageWidth(serverSide({}, [page(undefined, [crud({ columns: [editableColumn(), plainColumn()] })])]))).toBe('full')
    })

    it('infers full from a compact crud', () => {
        expect(resolvePageWidth(serverSide({}, [page(undefined, [crud({ compact: true })])]))).toBe('full')
    })

    it('keeps a plain crud at fixed', () => {
        expect(resolvePageWidth(serverSide({}, [page(undefined, [crud({ columns: [plainColumn()] })])]))).toBe('fixed')
    })

    it('prefers edge over full when both kinds of content are present', () => {
        const content = page(undefined, [crud({ compact: true }), clientSide(ComponentMetadataType.Kanban)])
        expect(resolvePageWidth(serverSide({}, [content]))).toBe('edge')
    })

    it('lets a declaration win over the inference', () => {
        expect(resolvePageWidth(serverSide({ pageWidth: 'fixed' }, [clientSide(ComponentMetadataType.Gantt)]))).toBe('fixed')
    })

    it('falls through to inference when the wire value is unknown', () => {
        expect(resolvePageWidth(serverSide({ pageWidth: 'huge' }, [clientSide(ComponentMetadataType.Map)]))).toBe('edge')
        expect(resolvePageWidth(serverSide({ pageWidth: 'huge' }))).toBe('fixed')
    })

    it('defaults plain content to fixed', () => {
        const form = clientSide(ComponentMetadataType.Form)
        expect(resolvePageWidth(serverSide({}, [page(undefined, [form])]))).toBe('fixed')
    })
})
