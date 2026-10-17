// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { html, LitElement, render } from 'lit'

vi.mock('@infra/ui/renderers/renderComponent.ts', () => ({
    renderComponent: (_c: unknown, comp: { id?: string }) => html`<i data-child="${comp?.id}"></i>`,
}))

import { renderButton, resolvedRoute } from './buttonRenderer'
import { renderNeutralField } from './neutralFieldRenderer'
import { renderContentLayout } from './contentLayoutRenderer'
import { renderConfirmDialog } from './confirmDialogRenderer'
import { renderLinkCell } from './columnRenderers/linkColumnRenderer'
import { renderText } from './textRenderer'

const cs = (metadata: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
    ({ type: 'ClientSide', id: 'c1', metadata, children: [], ...extra }) as any
let host: HTMLElement
const draw = (tpl: unknown) => {
    host = document.createElement('div')
    document.body.appendChild(host)
    render(tpl as any, host)
    return host
}
afterEach(() => { document.body.innerHTML = '' })

describe('neutral button', () => {
    it('renders the interpolated label with icons, shortcut tooltip and disabled state', () => {
        const el = draw(renderButton(cs({ type: 'Button', label: 'Save ${state.name}', actionId: 'save', shortcut: 'ctrl+s', disabled: true, iconOnLeft: 'vaadin:check' }), { name: 'Ana' }))
        const b = el.querySelector('button')!
        expect(b.textContent).toContain('Save Ana')
        expect(b.getAttribute('title')).toBe('Save Ana (Ctrl+S)')
        expect(b.getAttribute('data-shortcut')).toBe('ctrl+s')
        expect(b.disabled).toBe(true)
    })

    it.each([
        [{ buttonStyle: 'primary' }, 'var(--lumo-primary-color'],
        [{ buttonStyle: 'primary', color: 'success' }, 'var(--lumo-success-color'],
        [{ buttonStyle: 'primary', color: 'error' }, 'var(--lumo-error-color'],
        [{ buttonStyle: 'primary', color: 'contrast' }, 'var(--lumo-contrast,'],
        [{ buttonStyle: 'tertiary' }, 'background:transparent'],
        [{ size: 'small' }, 'padding:.25rem .6rem'],
        [{ size: 'large', color: 'normal' }, 'padding:.65rem 1.4rem'],
        [{}, 'border-color:var(--lumo-contrast-20pct'],
    ])('themes %o', (md, expected) => {
        expect(draw(renderButton(cs({ type: 'Button', label: 'x', ...md }))).querySelector('button')!.getAttribute('style')).toContain(expected)
    })

    it('a click runs its action with its parameters', () => {
        const el = draw(renderButton(cs({ type: 'Button', label: 'Go', actionId: 'go', parameters: { a: 1 } })))
        const seen: any[] = []
        el.addEventListener('action-requested', e => seen.push((e as CustomEvent).detail))
        el.querySelector('button')!.click()
        expect(seen).toEqual([{ actionId: 'go', parameters: { a: 1 } }])
    })

    it('a button with a route navigates on the client instead, only when the template resolved', () => {
        const el = draw(renderButton(cs({ type: 'Button', label: 'Open', actionId: 'x', route: '/people/${state.id}' }), { id: 7 }))
        const events: string[] = []
        for (const t of ['route-changed', 'navigate-to-requested', 'action-requested']) el.addEventListener(t, e => events.push(`${t}:${(e as CustomEvent).detail.route ?? ''}`))
        el.querySelector('button')!.click()
        expect(events).toEqual(['route-changed:/people/7', 'navigate-to-requested:/people/7'])
        // a template that does not evaluate is never followed literally
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(resolvedRoute({ route: '/p/${state.(}' } as any, {})).toBeUndefined()
        vi.restoreAllMocks()
        expect(resolvedRoute({} as any)).toBeUndefined()
    })
})

describe('neutral field', () => {
    const field = (md: Record<string, unknown>, state: Record<string, unknown> = {}) =>
        draw(renderNeutralField(cs({ type: 'FormField', fieldId: 'f', label: 'Name', ...md }), state))
    const changes = (el: HTMLElement) => { const out: any[] = []; el.addEventListener('value-changed', e => out.push((e as CustomEvent).detail)); return out }

    it('read-only and plain text show the value as text', () => {
        expect(field({ readOnly: true }, { f: 'Ana' }).textContent).toContain('Ana')
        expect(field({ stereotype: 'plainText' }, { f: 'Bob' }).querySelector('input')).toBeNull()
        expect(field({}, {}).querySelector('label')!.textContent).toBe('Name')
    })

    it('a boolean is a checkbox emitting checked', () => {
        const el = field({ dataType: 'bool' }, { f: true })
        const input = el.querySelector('input[type=checkbox]') as HTMLInputElement
        expect(input.checked).toBe(true)
        const out = changes(el)
        input.checked = false
        input.dispatchEvent(new Event('change', { bubbles: true }))
        expect(out).toEqual([{ fieldId: 'f', value: false }])
    })

    it('options become a select with an empty choice', () => {
        const el = field({ options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] }, { f: 'b' })
        const select = el.querySelector('select')!
        expect([...select.options].map(o => o.textContent)).toEqual(['—', 'A', 'B'])
        expect(select.value).toBe('b')
        const out = changes(el)
        select.value = 'a'
        select.dispatchEvent(new Event('change', { bubbles: true }))
        expect(out).toEqual([{ fieldId: 'f', value: 'a' }])
    })

    it('long text is a textarea', () => {
        const el = field({ stereotype: 'textarea' }, { f: 'long' })
        const ta = el.querySelector('textarea')!
        // the value is shown in the textarea (a child expression inside <textarea> is not supported by lit)
        expect(ta.value).toBe('long')
        const out = changes(el)
        ta.value = 'longer'
        ta.dispatchEvent(new Event('input', { bubbles: true }))
        expect(out).toEqual([{ fieldId: 'f', value: 'longer' }])
        // a value the server sends afterwards (a reset) replaces what was typed
        render(renderNeutralField(cs({ type: 'FormField', fieldId: 'f', label: 'Name', stereotype: 'textarea' }), { f: 'reset' }), el)
        expect(ta.value).toBe('reset')
    })

    it.each([
        ['integer', undefined, 'number'], ['money', undefined, 'number'], ['date', undefined, 'date'],
        ['datetime', undefined, 'datetime-local'], ['time', undefined, 'time'], ['string', 'password', 'password'],
        ['email', undefined, 'email'], ['string', undefined, 'text'],
    ])('dataType %s / stereotype %s is an input of type %s', (dataType, stereotype, type) => {
        const el = field({ dataType, stereotype, placeholder: 'type…' }, { f: 'v' })
        const input = el.querySelector('input')!
        expect(input.type).toBe(type)
    })

    it('a text input emits what is typed and carries the placeholder', () => {
        const el = field({ placeholder: 'type…', disabled: true }, { f: 'v' })
        const input = el.querySelector('input')!
        expect(input.value).toBe('v')
        expect(input.placeholder).toBe('type…')
        expect(input.disabled).toBe(true)
        const out = changes(el)
        input.value = 'w'
        input.dispatchEvent(new Event('input', { bubbles: true }))
        expect(out).toEqual([{ fieldId: 'f', value: 'w' }])
    })
})

describe('content layout', () => {
    const layout = (md: Record<string, unknown>, slots: string[]) =>
        draw(renderContentLayout({} as LitElement, cs({ type: 'ContentLayout', ...md }, { children: slots.map(s => ({ type: 'ClientSide', id: s, slot: s, metadata: {} })) }), undefined, {}, {}, {}, {}))

    it('lays main, a sticky aside on the end and a footer below', () => {
        const el = layout({}, ['main-0', 'aside-0', 'footer-0'])
        const row = el.querySelector('.mateu-content-layout > div')!
        expect([...row.children].map(c => c.className)).toEqual(['mateu-content-main', 'mateu-content-aside'])
        expect(el.querySelector('.mateu-content-aside')!.getAttribute('style')).toContain('calc(32% -')
        expect(el.querySelector('.mateu-content-aside')!.getAttribute('style')).toContain('position: sticky')
        expect(el.querySelector('.mateu-content-footer [data-child="footer-0"]')).toBeTruthy()
    })

    it('puts the aside first when asked, with its width, not sticky; no aside/footer when none', () => {
        const el = layout({ asidePosition: 'start', asideWidth: '20rem', asideSticky: false }, ['main-0', 'aside-0'])
        const row = el.querySelector('.mateu-content-layout > div')!
        expect(row.firstElementChild!.className).toBe('mateu-content-aside')
        expect(row.firstElementChild!.getAttribute('style')).toContain('calc(20rem -')
        expect(row.firstElementChild!.getAttribute('style')).not.toContain('sticky')
        const bare = layout({}, ['main-0'])
        expect(bare.querySelector('.mateu-content-aside')).toBeNull()
        expect(bare.querySelector('.mateu-content-footer')).toBeNull()
    })
})

describe('neutral confirm dialog', () => {
    const container = { requestUpdate: vi.fn() } as unknown as LitElement
    const dialog = (md: Record<string, unknown>, state: Record<string, unknown> = {}) =>
        draw(renderConfirmDialog(container, cs({ type: 'ConfirmDialog', header: 'Delete?', confirmActionId: 'yes', ...md }, { children: [{ type: 'ClientSide', id: 'body', metadata: {} }] }), undefined, state, {}, {}, {}))

    it('is open with no condition and offers confirm only by default', () => {
        const el = dialog({})
        expect(el.querySelector('h3')!.textContent).toBe('Delete?')
        expect(el.querySelector('[data-child="body"]')).toBeTruthy()
        expect([...el.querySelectorAll('button')].map(b => b.textContent)).toEqual(['OK'])
    })

    it('follows its opened condition', () => {
        expect(dialog({ openedCondition: 'state.ask' }, { ask: false }).querySelector('.mateu-confirm-dialog')).toBeNull()
        expect(dialog({ openedCondition: 'state.ask' }, { ask: true }).querySelector('.mateu-confirm-dialog')).toBeTruthy()
    })

    it('runs the answered action and stays dismissed', () => {
        const md = { type: 'ConfirmDialog', confirmText: 'Yes', rejectText: 'No way', canReject: true, canCancel: true, confirmActionId: 'yes', rejectActionId: 'no', cancelActionId: 'cancel' }
        const component = cs(md)
        const el = draw(renderConfirmDialog(container, component, undefined, {}, {}, {}, {}))
        const buttons = [...el.querySelectorAll('button')]
        expect(buttons.map(b => b.textContent)).toEqual(['Cancel', 'No way', 'Yes'])
        const seen: any[] = []
        el.addEventListener('action-requested', e => seen.push((e as CustomEvent).detail))
        buttons[1].click()
        expect(seen).toEqual([{ actionId: 'no', serverNamed: true }])
        expect(container.requestUpdate).toHaveBeenCalled()
        const again = draw(renderConfirmDialog(container, component, undefined, {}, {}, {}, {}))
        expect(again.querySelector('.mateu-confirm-dialog')).toBeNull()
    })

    it('a cancel-only dialog labels cancel with the reject text', () => {
        const el = dialog({ canCancel: true, rejectText: 'Back' })
        expect([...el.querySelectorAll('button')].map(b => b.textContent)).toEqual(['Back', 'OK'])
    })
})

describe('link column cells', () => {
    const column = (xcolumn: Record<string, unknown>) => {
        const col = document.createElement('div') as any
        col.path = 'site'
        col.xcolumn = xcolumn
        document.body.appendChild(col)
        return col
    }
    const cell = (item: any, col: any, type: string) => { render(renderLinkCell(item, {} as any, col, type, '', col.xcolumn), col); return col as HTMLElement }

    it('a fixed text with an action is a link-styled button running it with the row', () => {
        const col = column({ text: 'Open', actionId: 'open' })
        const seen: any[] = []
        col.addEventListener('action-requested', (e: Event) => seen.push((e as CustomEvent).detail))
        cell({ id: 1 }, col, 'string').querySelector('button')!.click()
        expect(seen).toEqual([{ actionId: 'open', parameters: { id: 1 } }])
    })

    it('a fixed text without action links to the cell value, refusing unsafe urls', () => {
        expect(cell({ site: 'https://a.test' }, column({ text: 'Visit' }), 'string').querySelector('a')!.getAttribute('href')).toBe('https://a.test')
        expect(cell({ site: 'javascript:alert(1)' }, column({ text: 'Visit' }), 'string').querySelector('a')!.hasAttribute('href')).toBe(false)
    })

    it('a string cell shows its value as the link (or button) text', () => {
        expect(cell({ site: 'https://b.test' }, column({}), 'string').querySelector('a')!.textContent).toBe('https://b.test')
        expect(cell({ site: 'Label' }, column({ actionId: 'x' }), 'string').querySelector('button')!.textContent).toBe('Label')
    })

    it('a link-typed cell reads href and text from the value', () => {
        const a = cell({ site: { href: '/x', text: 'X' } }, column({}), 'link').querySelector('a')!
        expect(a.getAttribute('href')).toBe('/x')
        expect(a.textContent).toBe('X')
    })
})

describe('text', () => {
    const text = (md: Record<string, unknown>, state: Record<string, unknown> = {}) =>
        draw(renderText(cs({ type: 'Text', ...md }, { style: 'color: red;' }), state, {}, {}, {})).firstElementChild as HTMLElement

    it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'])('renders a %s container', (container) => {
        const el = text({ text: 'Hi ${state.n}', container, size: 'xl', noMargins: true, attributes: { 'data-colspan': '2' } }, { n: 'Ana' })
        expect(el.localName).toBe(container)
        expect(el.textContent!.trim()).toBe('Hi Ana')
        expect(el.getAttribute('style')).toContain('font-size: var(--lumo-font-size-xl')
        expect(el.getAttribute('style')).toContain('margin-block-start: 0')
        expect(el.getAttribute('data-colspan')).toBe('2')
    })

    it('defaults to a div, applies no size for m, and reports an unknown container', () => {
        const plain = text({ text: '<b>bold</b>', size: 'm' })
        expect(plain.localName).toBe('div')
        expect(plain.querySelector('b')).toBeTruthy()
        expect(plain.getAttribute('style')).toBe('color: red;')
        expect(text({ text: 'x', container: 'marquee' }).textContent).toContain('Unknown text container: marquee')
    })
})
