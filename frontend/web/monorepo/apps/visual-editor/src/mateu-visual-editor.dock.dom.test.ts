// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parse } from 'yaml'

// The editor's dock (Actions, Triggers, Quick start, Templates, Tidy, YAML) against a fake IDE host:
// each panel's edits must reach the host as the file text it will save.

const posted: any[] = []
let listener: ((e: MessageEvent) => void) | undefined
const host = {
    postMessage: (m: unknown) => posted.push(m),
    addEventListener: (_: 'message', cb: (e: MessageEvent) => void) => { listener = cb },
}
const send = (data: unknown) => listener?.(new MessageEvent('message', { data }))
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0)) }
const lastYaml = () => posted.filter((m) => m.type === 'contentChanged').at(-1)?.yaml as string

const PAGE = 'type: Form\ntitle: Orders\ncontent:\n  - type: Text\n    text: Hello\n'

beforeEach(async () => {
    posted.length = 0
    ;(window as any).__mateuHost = host
    ;(window as any).__mateuBaseUrl = ''
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as any
    const css = ((globalThis as any).CSS ??= {})
    css.escape ??= (v: string) => String(v).replace(/[^a-zA-Z0-9_-]/g, (c) => '\\' + c)
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })))
    ;(globalThis as any).ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
    ;(globalThis as any).IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} }
    await import('./index')
})
afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    delete (window as any).__mateuHost
})

async function mount(yaml = PAGE, path = 'orders.yaml') {
    const el = document.createElement('mateu-visual-editor') as any
    document.body.appendChild(el)
    send({ type: 'init', yaml, baseUrl: 'http://127.0.0.1:1', path })
    await settle()
    await el.updateComplete
    return el
}
const root = (el: any) => el.shadowRoot as ShadowRoot
const button = (scope: ParentNode, text: string | RegExp) =>
    [...scope.querySelectorAll('button')].find((b) => (typeof text === 'string' ? b.textContent!.trim() === text : text.test(b.textContent!.trim()))) as HTMLButtonElement
async function openDock(el: any, label: string) {
    button(root(el).querySelector('.dock-tabs')!, new RegExp('^' + label))!.click()
    await el.updateComplete
    return root(el).querySelector('.dock-body') as HTMLElement
}
const change = (input: HTMLInputElement | HTMLTextAreaElement | HTMLElement, value: string | boolean) => {
    if (typeof value === 'boolean') (input as HTMLInputElement).checked = value
    else (input as HTMLInputElement).value = value
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
}

describe('the YAML tab', () => {
    it('shows the file as saved; an edit there that parses is applied, one that does not is refused', async () => {
        const el = await mount()
        const body = await openDock(el, 'YAML')
        const source = body.querySelector('textarea.source') as HTMLTextAreaElement
        expect(source.value).toBe(PAGE)
        change(source, PAGE.replace('Hello', 'Hi'))
        await el.updateComplete
        expect(lastYaml()).toContain('text: Hi')
        const before = posted.length
        change(root(el).querySelector('textarea.source') as HTMLTextAreaElement, 'type: [')
        await el.updateComplete
        expect(posted.length).toBe(before)
        expect(root(el).textContent).toContain('That YAML does not parse')
    })

    it('clicking an open tab closes the dock', async () => {
        const el = await mount()
        await openDock(el, 'YAML')
        await openDock(el, 'YAML')
        expect(root(el).querySelector('.dock-body')).toBeNull()
    })
})

describe('the Actions tab', () => {
    it('adds a REST action, edits what it calls and does, gives it a button, and removes it', async () => {
        const el = await mount()
        vi.spyOn(window, 'prompt').mockReturnValue('approve')
        let body = await openDock(el, 'Actions')
        expect(body.textContent).toContain('No actions yet')
        button(body, '+ REST action').click()
        await el.updateComplete
        expect(lastYaml()).toMatch(/actions:\n\s+- id: approve/)
        body = root(el).querySelector('.dock-body')!
        expect(body.textContent).toContain('no button runs it yet')

        const inputs = () => [...root(el).querySelectorAll('.act-form input')] as HTMLInputElement[]
        change(inputs().find((i) => i.placeholder.startsWith('https://'))!, 'https://api.test/orders/${state.id}')
        await el.updateComplete
        change(inputs().find((i) => i.placeholder === 'Saved (a toast)')!, 'Approved')
        await el.updateComplete
        change(inputs().find((i) => i.placeholder === 'route (optional)')!, 'orders')
        await el.updateComplete
        change(inputs().filter((i) => i.type === 'checkbox')[1], true)
        await el.updateComplete
        change(inputs().find((i) => i.placeholder === 'Are you sure?')!, 'Approve it?')
        await el.updateComplete
        const yaml = lastYaml()
        expect(yaml).toContain('url: https://api.test/orders/${state.id}')
        expect(yaml).toContain('successMessage: Approved')
        expect(yaml).toContain('successRoute: orders')
        expect(yaml).toContain('confirmationRequired: true')
        expect(yaml).toContain('message: Approve it?')

        // a Form gets the button in its buttons slot
        button(root(el).querySelector('.act-form')!, 'Add a button').click()
        await el.updateComplete
        expect(lastYaml()).toMatch(/buttons:\n\s+- type: Button\n\s+label: Approve\n\s+actionId: approve/)
        expect(root(el).querySelector('.act-form')!.textContent).toContain('used by 1 button')

        button(root(el).querySelector('.act-form')!, 'Remove action').click()
        await el.updateComplete
        expect(lastYaml()).not.toContain('id: approve')
    })

    it('asking for an action id that exists selects it instead of adding a second one', async () => {
        const el = await mount('type: Form\ntitle: Orders\nactions:\n  - id: save\n    restAction: {source: {url: /x, method: POST}}\n')
        vi.spyOn(window, 'prompt').mockReturnValue('save')
        const body = await openDock(el, 'Actions')
        const before = posted.length
        button(body, '+ REST action').click()
        await el.updateComplete
        expect(posted.length).toBe(before)
        expect(button(root(el).querySelector('.chips')!, 'save').classList.contains('active')).toBe(true)
    })

    it('a flow is a list of steps: add, set, reorder and remove them', async () => {
        const el = await mount()
        vi.spyOn(window, 'prompt').mockReturnValue('goHome')
        const body = await openDock(el, 'Actions')
        button(body, '+ Flow').click()
        await el.updateComplete
        const add = () => button(root(el).querySelector('.fl-steps')!, '+ Step').click()
        add(); await el.updateComplete
        add(); await el.updateComplete
        expect(root(el).querySelectorAll('.fl-step')).toHaveLength(2)
        // the second becomes an Emit with an event name
        const second = root(el).querySelectorAll('.fl-step')[1] as HTMLElement
        const type = second.querySelector('ve-select') as any
        change(type, 'Emit')
        await el.updateComplete
        const event = root(el).querySelectorAll('.fl-step')[1].querySelector('input') as HTMLInputElement
        change(event, 'refresh')
        await el.updateComplete
        expect(parse(lastYaml()).actions[0].steps).toEqual([{ type: 'Navigate' }, { type: 'Emit', event: 'refresh' }])
        // move it up: now first
        button(root(el).querySelectorAll('.fl-step')[1] as HTMLElement, '↑').click()
        await el.updateComplete
        expect(parse(lastYaml()).actions[0].steps.map((x: any) => x.type)).toEqual(['Emit', 'Navigate'])
        button(root(el).querySelectorAll('.fl-step')[0] as HTMLElement, '✕').click()
        await el.updateComplete
        expect(parse(lastYaml()).actions[0].steps).toEqual([{ type: 'Navigate' }])
        expect(root(el).querySelectorAll('.fl-step')).toHaveLength(1)
    })
})

describe('the Triggers tab', () => {
    it('adds a trigger, edits its type, action and event, and removes it', async () => {
        const el = await mount()
        let body = await openDock(el, 'Triggers')
        expect(body.textContent).toContain('No triggers')
        button(body, '+ Trigger').click()
        await el.updateComplete
        expect(lastYaml()).toMatch(/triggers:\n\s+- type: OnLoadTrigger/)
        body = root(el).querySelector('.dock-body')!
        change(body.querySelector('ve-select') as HTMLElement, 'OnCustomEventTrigger')
        await el.updateComplete
        const [action, eventName] = [...root(el).querySelectorAll('.tp-row input')] as HTMLInputElement[]
        change(action, 'reload')
        await el.updateComplete
        change(eventName, 'orders-changed')
        await el.updateComplete
        expect(lastYaml()).toMatch(/type: OnCustomEventTrigger/)
        expect(lastYaml()).toContain('actionId: reload')
        expect(lastYaml()).toContain('eventName: orders-changed')
        // the tab counts them
        expect(button(root(el).querySelector('.dock-tabs')!, /^Triggers/).textContent).toContain('1')
        button(root(el).querySelector('.tp-row')!, '✕').click()
        await el.updateComplete
        expect(lastYaml()).not.toContain('triggers:')
    })
})

describe('Quick start and Templates', () => {
    it('Turn into listing replaces the page with a table; Wire an action adds a button running it', async () => {
        const el = await mount('type: VerticalLayout\ncontent:\n  - {type: FormField, id: name, label: Name}\n')
        let body = await openDock(el, 'Quick start')
        expect(body.textContent).toContain('not bound')
        button(body, 'Turn into listing').click()
        await el.updateComplete
        expect(lastYaml()).toMatch(/^type: Listing/m)
        expect(root(el).querySelector('.dock-body')).toBeNull()

        const el2 = await mount('type: VerticalLayout\ncontent: []\n', 'other.yaml')
        const prompt = vi.spyOn(window, 'prompt').mockReturnValueOnce('approve').mockReturnValueOnce('Approve it')
        body = await openDock(el2, 'Quick start')
        button(body, 'Wire an action…').click()
        await el2.updateComplete
        expect(prompt).toHaveBeenCalledTimes(2)
        expect(lastYaml()).toContain('label: Approve it')
        expect(lastYaml()).toContain('actionId: approve')
    })

    it('a template replaces a page with content only once the author confirms', async () => {
        const el = await mount()
        const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
        const body = await openDock(el, 'Templates')
        const use = () => button(root(el).querySelector('.tg-card')!, 'Use').click()
        const before = posted.length
        use()
        await el.updateComplete
        expect(posted.length).toBe(before)
        use()
        await el.updateComplete
        expect(confirm).toHaveBeenCalledTimes(2)
        expect(lastYaml()).not.toContain('text: Hello')
        // the gallery closes once a template is used
        expect(root(el).querySelector('.dock-body')).toBeNull()
        expect(body.isConnected).toBe(false)
    })
})

describe('the Tidy tab', () => {
    const MESSY = 'type: VerticalLayout\ncontent:\n  - {type: FormField, id: firstName}\n  - type: VerticalLayout\n    content: []\n  - {type: FormField, id: email, label: Email}\n  - {type: FormField, id: email, label: Again}\n'

    it('lists what it found, applies the ticked rules as one edit, and leaves an unticked rule alone', async () => {
        const el = await mount(MESSY, 'messy.yaml')
        const body = await openDock(el, 'Tidy')
        expect(body.textContent).toContain('Remove empty layouts')
        expect(body.textContent).toContain('Fields sharing an id')
        // untick "label fields": firstName stays unlabelled
        const label = [...body.querySelectorAll('label.tp-head')].find((l) => l.textContent!.includes('Label fields')) as HTMLElement
        change(label.querySelector('input') as HTMLInputElement, false)
        await el.updateComplete
        button(root(el).querySelector('.dock-body')!, /^Apply/).click()
        await el.updateComplete
        const yaml = lastYaml()
        expect(yaml).not.toMatch(/content: \[\]/)
        expect(yaml).not.toContain('label: First name')
        expect(root(el).textContent).toMatch(/Tidied \d+ thing/)
    })

    it('a clean page has nothing to tidy; clicking a finding selects it', async () => {
        const el = await mount()
        expect((await openDock(el, 'Tidy')).textContent).toContain('Nothing to tidy')
        const el2 = await mount(MESSY, 'messy.yaml')
        const body = await openDock(el2, 'Tidy')
        ;(body.querySelector('button.tidy-item') as HTMLButtonElement).click()
        await el2.updateComplete
        expect(el2.selectedPath).not.toBeNull()
    })
})

describe('read-only data files', () => {
    it('a translations catalogue lists its keys; an environment says what it re-points', async () => {
        const el = await mount('type: Translations\nlocale: es\nmessages:\n  greeting: Hola\n  bye: Adiós\n', 'translations/es.yaml')
        expect(root(el).textContent).toContain('Translations · es')
        expect(root(el).textContent).toContain('2 keys')
        expect(root(el).textContent).toContain('Adiós')
        const env = await mount('type: Environment\nsources:\n  orders: {baseUrl: https://staging}\n', 'environments/staging.yaml')
        expect(root(env).textContent).toContain('Environment · staging')
    })
})
