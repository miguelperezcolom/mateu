// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './mateu-workflow'
import type { MateuWorkflow } from './mateu-workflow'

/**
 * The workflow designer field: the value is a WorkflowDefinition JSON; the canvas lays the steps
 * out in layers by precondition, selecting a step opens its properties, every edit emits the new
 * JSON through value-changed, and nodes can be dragged around.
 */
describe('mateu-workflow (DOM)', () => {
    const WF = {
        name: 'Onboarding', status: 'ACTIVE',
        steps: [
            { id: 'a', type: 'ACTION', name: 'Create account', topic: 't.create' },
            { id: 'b', type: 'USER_TASK', name: 'Review the application thoroughly', preconditionStepId: 'a' },
            { id: 'c', type: 'END', name: 'Done', preconditionStepId: 'b' },
        ],
    }
    let emitted: Record<string, unknown>[]
    const listener = (e: Event) => emitted.push(JSON.parse((e as CustomEvent).detail.value))

    const mount = async (value: unknown = WF) => {
        const el = document.createElement('mateu-workflow') as MateuWorkflow
        el.value = typeof value === 'string' ? value : JSON.stringify(value)
        document.body.appendChild(el)
        await el.updateComplete
        await el.updateComplete
        return el
    }
    const $ = (el: MateuWorkflow, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuWorkflow, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const button = (el: MateuWorkflow, text: string) => $$(el, 'button').find(b => b.textContent!.includes(text))!
    const nodes = (el: MateuWorkflow) => $$(el, 'g[transform]')
    const node = (el: MateuWorkflow, id: string) => nodes(el).find(g => g.textContent!.includes(id) && g.querySelectorAll('text')[2].textContent === id)!
    const change = async (el: MateuWorkflow, input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string | boolean) => {
        if (typeof value === 'boolean') (input as HTMLInputElement).checked = value
        else input.value = value
        input.dispatchEvent(new Event('change'))
        await el.updateComplete
    }
    const field = (el: MateuWorkflow, label: string) =>
        $$(el, '.field').find(f => f.querySelector('.field-label')!.textContent === label)!.querySelector('input, select, textarea') as HTMLInputElement

    beforeEach(() => { emitted = []; document.addEventListener('value-changed', listener) })
    afterEach(() => { document.removeEventListener('value-changed', listener); document.body.innerHTML = ''; vi.restoreAllMocks() })

    it('shows the name and status, and lays the steps out in layers by precondition with arrows', async () => {
        const el = await mount()
        expect($(el, '.wf-name').textContent).toBe('Onboarding')
        expect($(el, '.badge').textContent).toBe('ACTIVE')
        expect($(el, '.badge').classList.contains('badge-active')).toBe(true)
        expect(nodes(el).map(g => g.getAttribute('transform'))).toEqual(['translate(60,60)', 'translate(280,60)', 'translate(500,60)'])
        // a long name is truncated on the node
        expect(node(el, 'b').querySelectorAll('text')[1].textContent!.trim()).toBe('Review the appl…')
        expect($$(el, 'path[marker-end]')).toHaveLength(2)
        expect($(el, '.properties')).toBeNull()
    })

    it('keeps the previous definition when the value is not valid JSON; defaults to DRAFT', async () => {
        const el = await mount({ name: 'X', steps: [] })
        expect($(el, '.badge').textContent).toBe('DRAFT')
        el.value = '{oops'
        await el.updateComplete
        expect($(el, '.wf-name').textContent).toBe('X')
    })

    it('clicking a node opens its properties; ✕ or a click on the empty canvas closes them', async () => {
        const el = await mount()
        node(el, 'a').dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await el.updateComplete
        expect($(el, '.properties')).not.toBeNull()
        expect(field(el, 'ID').value).toBe('a')
        expect(field(el, 'Topic').value).toBe('t.create')
        $(el, '.close-btn').click()
        await el.updateComplete
        expect($(el, '.properties')).toBeNull()

        node(el, 'a').dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await el.updateComplete
        $(el, 'svg.canvas').dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await el.updateComplete
        expect($(el, '.properties')).toBeNull()
    })

    it('editing a step emits the whole definition with the change', async () => {
        const el = await mount()
        node(el, 'a').dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await el.updateComplete
        await change(el, field(el, 'Name'), 'Open account')
        await change(el, field(el, 'Description'), 'desc')
        await change(el, field(el, 'Precondition expression'), 'x > 1')
        await change(el, field(el, 'Timeout (ms)'), '500')
        await change(el, field(el, 'Retries'), '3')
        await change(el, field(el, 'Topic'), '')
        const last = emitted.at(-1) as { steps: Record<string, unknown>[] }
        expect(last.steps[0]).toMatchObject({ name: 'Open account', description: 'desc', preconditionExpression: 'x > 1', timeout: 500, retries: 3 })
        expect(last.steps[0].topic).toBeUndefined()
        expect(node(el, 'a').textContent).toContain('Open account')

        const checks = $$(el, '.field.row input[type=checkbox]')
        await change(el, checks[0] as HTMLInputElement, true) // parallel
        await change(el, checks[1] as HTMLInputElement, true) // rollbackable → compensation select appears
        expect(field(el, 'Compensation step')).toBeTruthy()
        await change(el, field(el, 'Compensation step'), 'c')
        expect((emitted.at(-1) as { steps: Record<string, unknown>[] }).steps[0]).toMatchObject({ parallel: true, rollbackable: true, compensationStepId: 'c' })
    })

    it('the type decides the type-specific field, and the precondition rewires the layout', async () => {
        const el = await mount()
        node(el, 'c').dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await el.updateComplete
        expect($$(el, '.field-label').map(l => l.textContent)).not.toContain('Topic')
        await change(el, field(el, 'Type'), 'USER_TASK')
        await change(el, field(el, 'Form ID'), 'form-1')
        await change(el, field(el, 'Type'), 'PROCESS')
        await change(el, field(el, 'Child workflow ID'), 'wf-2')
        await change(el, field(el, 'Precondition step'), '')
        const c = (emitted.at(-1) as { steps: Record<string, unknown>[] }).steps[2]
        expect(c).toMatchObject({ type: 'PROCESS', formId: 'form-1', childWorkflowDefinitionId: 'wf-2' })
        expect(c.preconditionStepId).toBeUndefined()
        expect($$(el, 'path[marker-end]')).toHaveLength(1)
        // the precondition options are the OTHER steps
        expect(Array.from(field(el, 'Precondition step').querySelectorAll('option')).map(o => o.value)).toEqual(['', 'a', 'b'])
    })

    it('Add Step appends an ACTION below the last node, selects it and emits', async () => {
        const el = await mount()
        button(el, 'Add Step').click()
        await el.updateComplete
        expect(nodes(el)).toHaveLength(4)
        expect(nodes(el)[3].getAttribute('transform')).toBe('translate(60,170)')
        const last = emitted.at(-1) as { steps: Record<string, unknown>[] }
        expect(last.steps).toHaveLength(4)
        expect(last.steps[3]).toMatchObject({ type: 'ACTION', name: 'New Step' })
        expect(field(el, 'ID').value).toBe(last.steps[3].id)
    })

    it('deleting a step removes it and clears preconditions that pointed at it', async () => {
        const el = await mount()
        node(el, 'b').dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await el.updateComplete
        $(el, '.del-btn').click()
        await el.updateComplete
        const last = emitted.at(-1) as { steps: Record<string, unknown>[] }
        expect(last.steps.map(s => s.id)).toEqual(['a', 'c'])
        expect(last.steps[1].preconditionStepId).toBeUndefined()
        expect($(el, '.properties')).toBeNull()
        expect(nodes(el)).toHaveLength(2)
    })

    it('Settings edits the definition metadata, including the concurrency limits', async () => {
        const el = await mount()
        button(el, 'Settings').click()
        await el.updateComplete
        const meta = $(el, '.meta-panel')
        const [name] = Array.from(meta.querySelectorAll('input.inp')) as HTMLInputElement[]
        await change(el, name, 'Renamed')
        await change(el, meta.querySelector('textarea')!, 'about')
        await change(el, meta.querySelector('select')!, 'ARCHIVED')
        await change(el, meta.querySelector('input[type=checkbox]') as HTMLInputElement, true)
        const max = $(el, '.meta-panel input[type=number]') as HTMLInputElement
        await change(el, max, '4')
        const boxes = $$(el, '.meta-panel input[type=checkbox]') as HTMLInputElement[]
        await change(el, boxes[1], true)
        expect(emitted.at(-1)).toMatchObject({ name: 'Renamed', description: 'about', status: 'ARCHIVED', limitConcurrentExecutions: true, maxConcurrentExecutions: 4, enqueueOnLimit: true })
        expect($(el, '.wf-name').textContent).toBe('Renamed')
        button(el, 'Settings').click()
        await el.updateComplete
        expect($(el, '.meta-panel')).toBeNull()
    })

    it('dragging a node moves it on the canvas until the mouse is released', async () => {
        const el = await mount()
        const svgEl = $(el, 'svg.canvas')
        svgEl.getBoundingClientRect = () => ({ left: 10, top: 10, width: 800, height: 400, right: 810, bottom: 410, x: 10, y: 10, toJSON() {} }) as DOMRect
        // grab node a (at 60,60) 5px inside its corner
        node(el, 'a').dispatchEvent(new MouseEvent('mousedown', { clientX: 75, clientY: 75, bubbles: true, cancelable: true }))
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 215, clientY: 315 }))
        await el.updateComplete
        expect(node(el, 'a').getAttribute('transform')).toBe('translate(200,300)')
        window.dispatchEvent(new MouseEvent('mouseup'))
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 500 }))
        await el.updateComplete
        expect(node(el, 'a').getAttribute('transform')).toBe('translate(200,300)')
        // the canvas grows to fit the nodes
        expect(Number(svgEl.getAttribute('height'))).toBeGreaterThanOrEqual(400)
    })

    it('Export downloads the definition as a JSON file named after it', async () => {
        const el = await mount()
        const createObjectURL = vi.fn(() => 'blob:x')
        const revokeObjectURL = vi.fn()
        const orig = { createObjectURL: URL.createObjectURL, revokeObjectURL: URL.revokeObjectURL }
        Object.assign(URL, { createObjectURL, revokeObjectURL })
        let downloaded: HTMLAnchorElement | undefined
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { downloaded = this })
        button(el, 'Export').click()
        expect(downloaded!.download).toBe('onboarding.json')
        expect(downloaded!.href).toBe('blob:x')
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:x')
        Object.assign(URL, orig)
    })
})
