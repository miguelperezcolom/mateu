// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { html, LitElement, render, type TemplateResult } from 'lit'
import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer.ts'
import * as navigation from '@infra/ui/safeNavigate.ts'
import { VaadinComponentRenderer } from './VaadinComponentRenderer'

/**
 * The Vaadin adapter's dispatch: a wire component of a type the adapter claims comes out as the
 * vaadin element (the core keeps a neutral fallback for each), with the server's per-request rules
 * applied on the way, and each of those elements does what the wire asks of it — a button runs its
 * action or follows its route, a confirm dialog answers once, a message input submits.
 */
class Host extends LitElement {
    createRenderRoot() { return this }
}
customElements.define('vaadin-renderer-test-host', Host)

const renderer = new VaadinComponentRenderer()

beforeAll(() => {
    componentRenderer.set(renderer)
})

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

const client = (type: string, metadata: Record<string, unknown>, over: Record<string, unknown> = {}) => ({
    type: 'ClientSide', id: 'c1', metadata: { type, ...metadata }, ...over,
}) as any

const text = (t: string) => client('Text', { text: t }, { id: undefined })

const paint = (component: any, state: Record<string, unknown> = {}, data: Record<string, unknown> = {}) => {
    const host = document.createElement('vaadin-renderer-test-host') as Host
    document.body.appendChild(host)
    const out = document.createElement('div')
    host.appendChild(out)
    const template = renderer.renderClientSideComponent(host, component, '', state, data, {}, {}, false)
    render(template, out)
    const actions: any[] = []
    host.addEventListener('action-requested', (e) => actions.push((e as CustomEvent).detail))
    const routes: string[] = []
    host.addEventListener('navigate-to-requested', (e) => routes.push((e as CustomEvent).detail.route))
    return { host, out, actions, routes }
}

describe('VaadinComponentRenderer dispatch', () => {
    it('names itself vaadin and falls back to the core for a type it does not claim', () => {
        expect(renderer.rendererName()).toBe('vaadin')
        const { out } = paint(text('plain'))
        expect(out.textContent).toContain('plain')
        expect(out.querySelector('[class^="vaadin"], vaadin-button')).toBeNull()
    })
})

describe('Button', () => {
    it('is a vaadin-button whose theme composes style, colour and size, and whose click runs the action', () => {
        const { out, actions } = paint(client('Button', {
            label: 'Save ${state.name}', actionId: 'save', buttonStyle: 'primary', color: 'success', size: 'small',
            shortcut: 'ctrl+s', iconOnLeft: 'vaadin:check', parameters: { x: 1 },
        }), { name: 'Ada' })
        const b = out.querySelector('vaadin-button')!
        expect(b.getAttribute('theme')!.trim().split(/\s+/)).toEqual(['primary', 'success', 'small'])
        expect(b.textContent).toContain('Save Ada')
        expect(b.getAttribute('data-shortcut')).toBe('ctrl+s')
        expect(b.getAttribute('title')).toMatch(/^Save Ada \(/)
        expect(b.querySelector('vaadin-icon')!.getAttribute('icon')).toBe('vaadin:check')
        ;(b as HTMLElement).click()
        expect(actions).toEqual([{ actionId: 'save', parameters: { x: 1 } }])
    })

    it('a "normal"/"none" colour and size add no theme', () => {
        const { out } = paint(client('Button', { label: 'Go', actionId: 'go', color: 'normal', size: 'none' }))
        expect(out.querySelector('vaadin-button')!.getAttribute('theme')!.trim()).toBe('')
    })

    it('a button carrying a route navigates instead of running an action', () => {
        const { out, actions, routes } = paint(client('Button', { label: 'Open', route: '/orders/${state.id}', iconOnRight: 'vaadin:arrow-right' }), { id: 7 })
        ;(out.querySelector('vaadin-button') as HTMLElement).click()
        expect(routes).toEqual(['/orders/7'])
        expect(actions).toEqual([])
    })

    it('a button the server disabled for this request (<id>.disabled in data) is disabled', () => {
        const { out } = paint(client('Button', { label: 'Delete', actionId: 'delete' }), {}, { 'c1.disabled': true })
        expect(out.querySelector('vaadin-button')!.hasAttribute('disabled')).toBe(true)
    })
})

describe('ConfirmDialog', () => {
    const dialog = (over: Record<string, unknown> = {}) => client('ConfirmDialog', {
        header: 'Delete?', confirmText: 'Yes', rejectText: 'No', canCancel: true, canReject: true,
        confirmActionId: 'doDelete', rejectActionId: 'keep', cancelActionId: 'cancelled', ...over,
    }, { children: [text('This cannot be undone')] })

    it('opens as soon as it arrives, and an answer dispatches its action once and closes it', async () => {
        const component = dialog()
        const { host, out, actions } = paint(component)
        const el = out.querySelector('vaadin-confirm-dialog') as any
        expect(el.opened).toBe(true)
        expect(el.getAttribute('header')).toBe('Delete?')
        expect(el.hasAttribute('reject-button-visible')).toBe(true)
        // the user presses Confirm: the dialog closes itself and fires `confirm`
        el.opened = false
        el.dispatchEvent(new CustomEvent('confirm'))
        expect(actions).toEqual([{ actionId: 'doDelete', serverNamed: true }])
        // the host re-renders after the answer: it stays closed
        render(renderer.renderClientSideComponent(host, component, '', {}, {}, {}, {}, false), out)
        expect((out.querySelector('vaadin-confirm-dialog') as any).opened).toBe(false)
    })

    it('reject and cancel dispatch their own ids; an opened condition decides whether it shows', () => {
        const a = paint(dialog())
        ;(a.out.querySelector('vaadin-confirm-dialog') as any).dispatchEvent(new CustomEvent('reject'))
        expect(a.actions).toEqual([{ actionId: 'keep', serverNamed: true }])
        const b = paint(dialog())
        ;(b.out.querySelector('vaadin-confirm-dialog') as any).dispatchEvent(new CustomEvent('cancel'))
        expect(b.actions).toEqual([{ actionId: 'cancelled', serverNamed: true }])
        const closed = paint(dialog({ openedCondition: 'state.ask' }), { ask: false })
        expect((closed.out.querySelector('vaadin-confirm-dialog') as any).opened).toBe(false)
        const open = paint(dialog({ openedCondition: 'state.ask' }), { ask: true })
        expect((open.out.querySelector('vaadin-confirm-dialog') as any).opened).toBe(true)
    })

    it('an answer with no action id only closes it', () => {
        const { out, actions } = paint(dialog({ cancelActionId: undefined }))
        ;(out.querySelector('vaadin-confirm-dialog') as any).dispatchEvent(new CustomEvent('cancel'))
        expect(actions).toEqual([])
    })
})

describe('Card, Details, Avatar, ProgressBar', () => {
    it('a card puts each part in its vaadin-card slot and maps the media variants to theme names', () => {
        const { out } = paint(client('Card', {
            variants: ['outlined', 'stretchMedia', 'coverMedia'],
            title: text('Title'), subtitle: text('Sub'), header: text('Head'), headerPrefix: text('Pre'),
            headerSuffix: text('Suf'), footer: text('Foot'), media: text('Media'), content: text('Body'),
        }))
        const card = out.querySelector('vaadin-card')!
        expect(card.getAttribute('theme')).toBe('outlined stretch-media cover-media')
        expect(card.textContent).toContain('Body')
        for (const slot of ['title', 'subtitle', 'header', 'header-prefix', 'header-suffix', 'footer', 'media']) {
            expect(card.querySelector(`[slot="${slot}"]`), slot).not.toBeNull()
        }
    })

    it('a card without metadata renders nothing', () => {
        const { out } = paint({ type: 'ClientSide', id: 'c', metadata: undefined } as any)
        expect(out.querySelector('vaadin-card')).toBeNull()
    })

    it('details: summary in its slot, content below, opened as declared', () => {
        const { out } = paint(client('Details', { opened: true, summary: text('More'), content: text('Hidden') }))
        const d = out.querySelector('vaadin-details')!
        expect(d.hasAttribute('opened')).toBe(true)
        expect(d.querySelector('vaadin-details-summary')!.textContent).toContain('More')
        expect(d.textContent).toContain('Hidden')
    })

    it('an avatar resolves its name against the state; a group carries its avatars', () => {
        const a = paint(client('Avatar', { name: '${state.who}', abbreviation: 'AL', image: '/a.png' }), { who: 'Ada Lovelace' })
        const av = a.out.querySelector('vaadin-avatar')!
        expect([av.getAttribute('name'), av.getAttribute('abbr'), av.getAttribute('img')]).toEqual(['Ada Lovelace', 'AL', '/a.png'])
        const g = paint(client('AvatarGroup', { maxItemsVisible: 2, avatars: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] }))
        const group = g.out.querySelector('vaadin-avatar-group') as any
        expect(group.getAttribute('max-items-visible')).toBe('2')
        expect(group.items.length).toBe(3)
    })

    it('a progress bar reads its value from the state key, and is named by its text', () => {
        const { out } = paint(client('ProgressBar', { valueKey: 'pct', min: 0, max: 1, text: 'Importing' }), { pct: 0.4 })
        const bar = out.querySelector('vaadin-progress-bar')!
        expect(bar.getAttribute('value')).toBe('0.4')
        expect(bar.getAttribute('max')).toBe('1')
        expect(bar.hasAttribute('min')).toBe(false)
        expect(bar.getAttribute('aria-label')).toBe('Importing')
        expect(out.textContent).toContain('Importing')
        const ind = paint(client('ProgressBar', { indeterminate: true }))
        const ib = ind.out.querySelector('vaadin-progress-bar')!
        expect(ib.hasAttribute('indeterminate')).toBe(true)
        expect(ib.getAttribute('aria-label')).toBe('Progress')
    })
})

describe('Messages, notifications, popovers, virtual lists, menus', () => {
    it('a message input submits its text as the action\'s message, never an empty one', () => {
        const { out, actions } = paint(client('MessageInput', { actionId: 'send' }))
        const input = out.querySelector('vaadin-message-input')!
        input.dispatchEvent(new CustomEvent('submit', { detail: { value: '   ' } }))
        input.dispatchEvent(new CustomEvent('submit', { detail: { value: 'hello' } }))
        expect(actions).toEqual([{ actionId: 'send', parameters: { message: 'hello' } }])
    })

    it('a message list carries its items', () => {
        const { out } = paint(client('MessageList', { items: [{ text: 'Hi', userName: 'Ada', time: 'now' }] }))
        const list = out.querySelector('vaadin-message-list') as any
        expect(list.items).toEqual([{ text: 'Hi', userName: 'Ada', time: 'now', userImg: undefined, userAbbr: undefined, userColorIndex: undefined }])
        expect(list.hasAttribute('markdown')).toBe(true)
    })

    it('a notification is an open vaadin-notification', async () => {
        const { out } = paint(client('Notification', { title: 'Saved', text: 'All good' }))
        const n = out.querySelector('vaadin-notification') as any
        expect(n.opened).toBe(true)
        // let it close and detach its card before the page is cleared
        n.opened = false
        await new Promise((r) => setTimeout(r, 50))
    })

    it('every popover gets its own anchor id; a hover popover is focusable and non-modal', () => {
        const a = paint(client('Popover', { wrapped: text('A'), content: text('a') }, { id: undefined }))
        const b = paint(client('Popover', { wrapped: text('B'), content: text('b') }, { id: undefined }))
        const idA = a.out.querySelector('vaadin-popover')!.getAttribute('for')
        const idB = b.out.querySelector('vaadin-popover')!.getAttribute('for')
        expect(idA).not.toBe(idB)
        expect(a.out.querySelector(`#${idA}`)!.textContent).toContain('A')
        const named = paint(client('Popover', { wrapped: text('N'), content: text('n'), trigger: 'hover' }, { id: 'rate' }))
        const p = named.out.querySelector('vaadin-popover') as any
        expect(p.getAttribute('for')).toBe('mateu-popover-rate')
        expect(p.trigger).toEqual(['hover', 'focus'])
        expect(p.hasAttribute('modal')).toBe(false)
        expect(named.out.querySelector('#mateu-popover-rate')!.getAttribute('tabindex')).toBe('0')
    })

    it('a virtual list virtualizes the page content', () => {
        const { out } = paint(client('VirtualList', { page: { content: [text('one'), text('two')] } }))
        expect((out.querySelector('vaadin-virtual-list') as any).items.length).toBe(2)
    })

    it('a menu bar maps options to items: submenus, separators, selection and disabled state', () => {
        const { out } = paint(client('MenuBar', { options: [
            { label: 'File', path: '/file', submenus: [{ label: 'Open', path: '/open', selected: true }, { separator: true }, { label: 'Close', disabled: true }] },
            { label: 'Help', path: '/help', className: 'help' },
        ] }))
        const items = (out.querySelector('vaadin-menu-bar') as any).items
        expect(items[0].text).toBe('File')
        expect(items[0].children.map((c: any) => c.text ?? c.component)).toEqual(['Open', 'hr', 'Close'])
        expect(items[0].children[0].checked).toBe(true)
        expect(items[0].children[2].disabled).toBe(true)
        expect(items[1]).toMatchObject({ text: 'Help', route: '/help', className: 'help' })
    })

    it('a context menu wraps its target and opens on left click when asked; an option component is rendered into the item', () => {
        const { out } = paint(client('ContextMenu', { activateOnLeftClick: true, wrapped: text('Row'), menu: [
            { component: text('Custom') }, { label: 'Plain' },
        ] }))
        const menu = out.querySelector('vaadin-context-menu') as any
        expect(menu.getAttribute('open-on')).toBe('click')
        expect(menu.textContent).toContain('Row')
        expect(menu.items[0].text).toBeUndefined()
        expect(menu.items[0].component.textContent).toContain('Custom')
        expect(menu.items[1].text).toBe('Plain')
    })
})

describe('the renderer hooks the shared chrome calls', () => {
    const mountTemplate = (t: TemplateResult) => {
        const out = document.createElement('div')
        document.body.appendChild(out)
        render(t, out)
        return out
    }

    it('toolbar buttons are vaadin-buttons with the button theme and icons', () => {
        const onClick = vi.fn()
        const out = mountTemplate(renderer.renderToolbarButton({ id: 'save', buttonStyle: 'primary', iconOnLeft: 'vaadin:check', iconOnRight: 'vaadin:arrow-right', disabled: false }, 'Save', onClick))
        const b = out.querySelector('vaadin-button')!
        expect(b.getAttribute('data-action-id')).toBe('save')
        expect(b.querySelectorAll('vaadin-icon').length).toBe(2)
        ;(b as HTMLElement).click()
        expect(onClick).toHaveBeenCalled()
    })

    it('peer navigation: arrows named by their labels navigate, a missing side is disabled', () => {
        const nav = vi.spyOn(navigation, 'safeNavigate').mockImplementation(() => true as never)
        const out = mountTemplate(renderer.renderPeerNav({ prevLabel: 'Employee 1', prevRoute: '/e/1' }))
        const prev = out.querySelector('.peer-nav-prev') as HTMLElement
        const next = out.querySelector('.peer-nav-next') as HTMLElement
        expect(prev.getAttribute('aria-label')).toBe('Employee 1')
        expect(next.getAttribute('aria-label')).toBe('Next')
        expect(next.hasAttribute('disabled')).toBe(true)
        prev.click()
        next.click()
        expect(nav.mock.calls).toEqual([['/e/1']])
    })

    it('icons with no Vaadin glyph map to the closest one', () => {
        const out = mountTemplate(html`${renderer.renderIcon('vaadin:wifi', 'color: red', 'big')}${renderer.renderIcon('vaadin:plus')}`)
        const icons = Array.from(out.querySelectorAll('vaadin-icon'))
        expect(icons.map(i => i.getAttribute('icon'))).toEqual(['vaadin:connect', 'vaadin:plus'])
        expect(icons[0].getAttribute('class')).toBe('big')
    })

    it('a header icon button carries its toggle state for assistive tech', () => {
        const onClick = vi.fn()
        const out = mountTemplate(renderer.renderHeaderIconButton({ icon: 'vaadin:moon', label: 'Dark mode', pressed: true, expanded: false, controls: 'chat', onClick } as any))
        const b = out.querySelector('vaadin-button')!
        expect([b.getAttribute('aria-pressed'), b.getAttribute('aria-expanded'), b.getAttribute('aria-controls'), b.getAttribute('title')])
            .toEqual(['true', 'false', 'chat', 'Dark mode'])
        ;(b as HTMLElement).click()
        expect(onClick).toHaveBeenCalled()
        const plain = mountTemplate(renderer.renderHeaderIconButton({ icon: 'vaadin:chat', label: 'Chat', onClick } as any))
        expect(plain.querySelector('vaadin-button')!.hasAttribute('aria-pressed')).toBe(false)
    })

    it('the top navigation is a tertiary vaadin-menu-bar that reports the picked item', () => {
        const onSelect = vi.fn()
        const items = [{ text: 'Orders', route: '/orders' }] as any
        const out = mountTemplate(renderer.renderTopNav(items, onSelect, 'top'))
        const bar = out.querySelector('vaadin-menu-bar')!
        expect(bar.getAttribute('theme')).toBe('tertiary contrast')
        expect(bar.getAttribute('class')).toBe('top')
        bar.dispatchEvent(new CustomEvent('item-selected', { detail: { value: items[0] } }))
        expect(onSelect).toHaveBeenCalledWith(items[0])
    })

    it('a tree listing is a mateu-vaadin-tree with the rows, columns and selection', () => {
        const out = mountTemplate(renderer.renderTreeComponent({} as any, {
            rows: [{ id: 1 }], columns: [{ id: 'name' }], idField: 'id', navigable: true, selectedId: '1',
        }))
        const tree = out.querySelector('mateu-vaadin-tree') as any
        expect([tree.rows.length, tree.idField, tree.navigable, tree.selectedId]).toEqual([1, 'id', true, '1'])
    })
})
