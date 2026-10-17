// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { LitElement, render } from 'lit'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RENDERERS, renderClientSideComponent, updateMedata, updateStyle } from './renderClientSideComponent'
import {
    ComponentMetadataType, DEPRECATED_WIRE_TYPES, DRAWN_BY_THEIR_PARENT,
} from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentRenderer, componentRenderer } from './ComponentRenderer'
import { BasicComponentRenderer } from './BasicComponentRenderer'

// children are drawn through the registered renderer, as in an app
class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

/**
 * The shared client-side switch: every wire type it lists must reach its own renderer (a type that
 * fell through would show the "Unknown metadata type" diagnostic to the user), and the data-driven
 * overrides a rule writes (`<id>.hidden`, `<id>.disabled`) must reach what is drawn.
 */

// Types the shared switch does not draw on its own (their parent does), and wire types no server
// produces (deprecated): both are declared next to the enum, so the RENDERERS type agrees.
const NOT_IN_THE_SWITCH = new Set<string>([...DRAWN_BY_THEIR_PARENT, ...DEPRECATED_WIRE_TYPES])

// NOT a wire type: a client-only alias kept for hand-built components (see the enum).
const CLIENT_ONLY = new Set<string>([ComponentMetadataType.Table])

/** The wire's component types, read from the generated wire-schema.json (backend/shared/uidl). */
const wire = (() => {
    let dir = dirname(fileURLToPath(import.meta.url))
    while (!existsSync(join(dir, 'backend/shared/uidl/wire-schema.json'))) {
        const up = dirname(dir)
        if (up === dir) throw new Error('wire-schema.json not found above ' + fileURLToPath(import.meta.url))
        dir = up
    }
    const defs = JSON.parse(readFileSync(join(dir, 'backend/shared/uidl/wire-schema.json'), 'utf8')).$defs
    const all = new Map<string, boolean>()
    for (const ref of defs.ComponentMetadataDto.oneOf as { $ref: string }[]) {
        const def = defs[ref.$ref.split('/').pop()!]
        all.set(def.properties.type.const, def.deprecated === true)
    }
    return all
})()

// The minimum some renderers need to have something to draw.
const MINIMAL: Record<string, Record<string, unknown>> = {
    Directory: { menu: [] },
    Breadcrumbs: { breadcrumbs: [] },
    VirtualList: { page: { content: [] } },
}
const CHILDREN: Record<string, unknown[]> = {
    SplitLayout: [{ id: 'a', type: ComponentType.ClientSide, metadata: { type: 'Text', text: 'master' } },
        { id: 'b', type: ComponentType.ClientSide, metadata: { type: 'Text', text: 'detail' } }],
    MasterDetailLayout: [{ id: 'a', type: ComponentType.ClientSide, metadata: { type: 'Text', text: 'master' } },
        { id: 'b', type: ComponentType.ClientSide, metadata: { type: 'Text', text: 'detail' } }],
}

const container = () => document.createElement('div') as unknown as LitElement

const draw = (component: unknown, data: Record<string, unknown> = {}, state: Record<string, unknown> = {}) => {
    const target = document.createElement('div')
    render(renderClientSideComponent(container(), component as never, '/base', state, data, {}, {}, false), target)
    return target
}

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('wire-type parity (wire-schema.json)', () => {
    it('the enum names exactly the wire component types (plus the client-only alias)', () => {
        const enumNames = new Set<string>(Object.values(ComponentMetadataType))
        expect([...wire.keys()].filter(t => !enumNames.has(t)).sort()).toEqual([])
        expect([...enumNames].filter(t => !wire.has(t) && !CLIENT_ONLY.has(t)).sort()).toEqual([])
    })

    it('every wire type a server produces has a renderer, or is drawn by its parent', () => {
        const rendered = new Set(Object.keys(RENDERERS))
        const missing = [...wire.entries()]
            .filter(([type, deprecated]) => !deprecated && !rendered.has(type)
                && !(DRAWN_BY_THEIR_PARENT as readonly string[]).includes(type))
            .map(([type]) => type)
        expect(missing).toEqual([])
    })

    it('the deprecated set is exactly what the schema marks deprecated', () => {
        const deprecated = [...wire.entries()].filter(([, d]) => d).map(([t]) => t).sort()
        expect(deprecated).toEqual([...DEPRECATED_WIRE_TYPES].sort())
    })

    it('RENDERERS has no key that is not a wire type', () => {
        const strangers = Object.keys(RENDERERS).filter(t => !wire.has(t) && !CLIENT_ONLY.has(t))
        expect(strangers).toEqual([])
    })
})

describe('the client-side switch', () => {
    it('draws every type it lists with its own renderer', () => {
        const unknown: string[] = []
        for (const type of Object.values(ComponentMetadataType)) {
            if (NOT_IN_THE_SWITCH.has(type)) continue
            const target = draw({ id: 'x', type: ComponentType.ClientSide, children: CHILDREN[type],
                metadata: { type, ...MINIMAL[type] } })
            if (target.innerHTML.includes('Unknown metadata type')) unknown.push(type)
        }
        expect(unknown).toEqual([])
    })

    it('shows a diagnostic for a type it does not know', () => {
        const target = draw({ id: 'x', type: ComponentType.ClientSide, metadata: { type: 'Hologram' } })
        expect(target.textContent).toContain('Unknown metadata type Hologram for component x')
    })

    it('wraps a bare metadata object into a component and draws it', () => {
        const target = draw({ type: ComponentMetadataType.Form, title: 'Bare' })
        expect(target.querySelector('mateu-form')).not.toBeNull()
    })

    it('says so when there is nothing to draw', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(draw(undefined).textContent).toContain('No metadata for component')
    })

    it('a form gets its fields as children and its buttons in the buttons slot', () => {
        const target = draw({ id: 'f', type: ComponentType.ClientSide, style: 'gap:1rem', cssClasses: 'dense',
            metadata: { type: ComponentMetadataType.Form, buttons: [{ type: ComponentMetadataType.Button, label: 'Save', actionId: 'save' }] },
            children: [{ id: 't', type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Text, text: 'Hello' } }] },
            {}, { name: 'Ana' })
        const form = target.querySelector('mateu-form') as HTMLElement & Record<string, any>
        expect(form.id).toBe('f')
        expect(form.getAttribute('class')).toBe('dense')
        expect(form.state).toEqual({ name: 'Ana' })
        expect(form.textContent).toContain('Hello')
        expect(form.querySelector('[slot="buttons"]')).not.toBeNull()
    })

    it('an app shell is a mateu-app carrying the component', () => {
        const app = { id: 'app', type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.App }, children: [] }
        const el = draw(app).querySelector('mateu-app') as HTMLElement & Record<string, any>
        expect(el.id).toBe('app')
        expect(el.component.metadata.type).toBe(ComponentMetadataType.App)
    })

    it('a table shows the page of rows its search answered, else the rows in the state', () => {
        const columns = [{ id: 'name', metadata: { type: 'GridColumn', label: 'Name' } }]
        const fromData = draw({ id: 't', type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Table, columns } },
            { t: { page: { content: [{ name: 'Ana' }] } } })
        expect(fromData.textContent).toContain('Name')
        expect(fromData.textContent).toContain('Ana')
        const grid = draw({ id: 'g', type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Grid, columns,
            page: { content: [{ name: 'Bea' }] } } })
        expect(grid.textContent).toContain('Bea')
    })
})

describe('rule-driven overrides', () => {
    it('<id>.hidden hides the component, keeping its own style', () => {
        expect(updateStyle({ id: 'x', style: 'color:red' } as never, { 'x.hidden': true })).toBe('color:red;display: none;')
        expect(updateStyle({ id: 'x' } as never, {})).toBe('')
        expect(updateStyle({ style: 'a:b' } as never, { 'x.hidden': true })).toBe('a:b')
    })

    it('<id>.disabled disables a button or a field without touching the original metadata', () => {
        const button = { id: 'b', metadata: { type: ComponentMetadataType.Button, label: 'Go' } }
        expect((updateMedata(button as never, { 'b.disabled': true }) as any).disabled).toBe(true)
        expect((button.metadata as any).disabled).toBeUndefined()
        const field = { id: 'f', metadata: { type: ComponentMetadataType.FormField, fieldId: 'f' } }
        expect((updateMedata(field as never, { 'f.disabled': true }) as any).disabled).toBe(true)
        expect((updateMedata(field as never, {}) as any).disabled).toBeUndefined()
    })

    it('a hidden component is drawn hidden', () => {
        const target = draw({ id: 'x', type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Form } }, { 'x.hidden': true })
        expect(target.querySelector('mateu-form')?.getAttribute('style')).toContain('display: none;')
    })
})
