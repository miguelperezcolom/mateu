// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { render, type LitElement } from 'lit'
import { expandDefinition } from '@infra/expander/expandDefinition.ts'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'
import { setNodeIdStamping } from '@infra/ui/renderers/nodeIdStamp.ts'
import { parse } from 'yaml'
import { NodePath, PageDoc, PageNode, decorateForPreview, parsePage, pathToId, presentSlots, slotSeg } from '../model/pageModel'
import { installNeutralRenderer } from './canvasRenderer'
import { nodePathOfEventPath } from './canvasSelection'

const TEMPLATES = resolve(__dirname, '../../../../../../app/intellij-plugin/src/main/resources/fileTemplates/internal')

/** A page template as the IDE writes it (its placeholders filled). */
function template(name: string): string {
    return readFileSync(resolve(TEMPLATES, `Mateu Page ${name}.yaml.ft`), 'utf-8')
        .replace('__PAGE_WIDTH__', '')
        .replace(/__TITLE__/g, 'Title')
}

/** Every node of the definition, with its path — content children and slot items alike. */
function allPaths(node: PageNode, path: NodePath = []): { path: NodePath; node: PageNode }[] {
    const out = [{ path, node }]
    for (const key of presentSlots(node)) {
        (node[key] as PageNode[]).forEach((c, i) => out.push(...allPaths(c, [...path, slotSeg(key, i)])))
    }
    ;(node.content ?? []).forEach((c, i) => out.push(...allPaths(c, [...path, i])))
    return out
}

/** The composed path a click on `el` would report (target first, out through shadow roots). */
function composedPathOf(el: Element): EventTarget[] {
    const out: EventTarget[] = []
    let n: Node | null = el
    while (n) {
        out.push(n)
        n = n.parentNode ?? ((n as ShadowRoot).host ?? null)
    }
    return out
}

/** Paint a page with the canvas's DS-neutral renderer, the way the canvas does (ids stamped). */
async function paint(doc: PageDoc): Promise<HTMLElement> {
    const tree = parse(decorateForPreview(doc))
    const fragment = expandDefinition(tree, 'preview')?.fragments?.[0] as unknown as { component: never; state: never; data: never }
    const host = document.createElement('div')
    document.body.appendChild(host)
    const container = host as unknown as LitElement
    render(renderComponent(container, fragment.component, '', fragment.state ?? {}, fragment.data ?? {}, {}, {}), host)
    // the stamps land in a microtask after the commit
    for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 10))
    return host
}

/** Deep querySelectorAll across open shadow roots. */
function all(root: ParentNode): Element[] {
    const out: Element[] = []
    for (const el of Array.from(root.querySelectorAll('*'))) {
        out.push(el)
        if (el.shadowRoot) out.push(...all(el.shadowRoot))
    }
    return out
}

// The nodes the canvas never paints as an element of their own: a column/filter keeps its binding
// id (selected from Layers instead).
const UNPAINTED = new Set(['GridColumn', 'GridGroupColumn'])

beforeAll(() => {
    installNeutralRenderer()
    setNodeIdStamping(true)
})

// Every page template. The two listing templates (Listing, Smart Search) are left to the browser
// run: mateu-table-crud paints nothing under jsdom (its toolbar is stamped by stampButton, see the
// e2e probe), and their filters keep their binding id by design (selected from Layers).
describe('every definition node is reachable from a click on the canvas', () => {
    for (const name of ['Welcome', 'Dashboard', 'Item Overview', 'Form', 'Foldout', 'Blank', 'Calendar', 'Collection Detail', 'Data Management', 'Gantt', 'General Overview', 'Hero Search', 'Matrix Grid', 'Planning Board', 'Todo List', 'Wizard']) {
        it(name, async () => {
            const doc = parsePage(template(name))
            const host = await paint(doc)
            const elements = all(host)
            const missing: string[] = []
            for (const { path, node } of allPaths(doc.layout)) {
                if (UNPAINTED.has(node.type)) continue
                const id = pathToId(path)
                const el = elements.find((e) => e.getAttribute('data-node-id') === id)
                    ?? elements.find((e) => e.id === id)
                if (!el) { missing.push(`${id} (${node.type})`); continue }
                // a click on the element (or on anything it contains) selects exactly that node
                const target = (el.querySelector('*') ?? el)
                const hit = nodePathOfEventPath(composedPathOf(el === target ? el : target))
                if (el === target && JSON.stringify(hit) !== JSON.stringify(path)) missing.push(`${id} → ${JSON.stringify(hit)}`)
            }
            expect(missing).toEqual([])
            host.remove()
        })
    }
})
