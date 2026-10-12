import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import {
    objectWith, listWith, listSet, listAdd, listRemove, listMove, parseOptions, formatOptions,
    optionsModeOf, withOptionsMode, switcherNavOf, withSwitcherNav,
    headerActionKind, headerActionWith, headerActionKindWith, headerActionAdd, headerActionRemove,
} from './headerProps'
import { parsePage, serializePage, updateProp } from './pageModel'
import { parseApp, serializeApp, withAppExtra, appExtra } from './appModel'
import { writePreserving } from './yamlPreserve'

describe('headerProps — list and group edits', () => {
    it('a blank value removes its key; a group left empty is removed as a whole (\'\')', () => {
        expect(objectWith({ a: 1, b: 2 }, { b: '' })).toEqual({ a: 1 })
        expect(objectWith({ a: 1 }, { a: '' })).toBe('')
        expect(objectWith(undefined, { a: 'x', b: false })).toEqual({ a: 'x' })
    })

    it('patches a row, keeping the keys the editor does not model', () => {
        const list = [{ label: 'A', color: 'success', description: 'hand-written' }]
        expect(listWith(list, 0, { color: 'error' })).toEqual([{ label: 'A', color: 'error', description: 'hand-written' }])
        expect(listWith(list, 0, { color: '' })).toEqual([{ label: 'A', description: 'hand-written' }])
        expect(listSet([{ a: 1 }, { b: 2 }], 1, { c: 3 })).toEqual([{ a: 1 }, { c: 3 }])
    })

    it('adds, moves and removes rows; removing the last one removes the key', () => {
        let list = listAdd(undefined, { label: 'A' })
        list = listAdd(list, { label: 'B' })
        expect(listMove(list, 1, -1).map((x) => x.label)).toEqual(['B', 'A'])
        expect(listMove(list, 0, -1)).toEqual(list)
        expect(listRemove(list, 0)).toEqual([{ label: 'B' }])
        expect(listRemove([{ label: 'B' }], 0)).toBe('')
    })

    it('options text ⇄ option list', () => {
        expect(parseOptions('H1=Palma, H2')).toEqual([{ value: 'H1', label: 'Palma' }, { value: 'H2', label: 'H2' }])
        expect(parseOptions(' ')).toBe('')
        expect(formatOptions([{ value: 'H1', label: 'Palma' }, { value: 'H2', label: 'H2' }])).toBe('H1=Palma, H2')
    })

    it('listed options and a source are exclusive; switching drops the other one', () => {
        const s = { label: 'Customer', options: [{ value: 'a', label: 'A' }] }
        expect(optionsModeOf(s)).toBe('options')
        const src = withOptionsMode(s, 'source', { ref: 'customers' })
        expect(src).toEqual({ label: 'Customer', optionsSource: { ref: 'customers' } })
        expect(optionsModeOf(src)).toBe('source')
        expect(withOptionsMode(src, 'options')).toEqual({ label: 'Customer' })
        expect(withOptionsMode(s, 'options')).toBe(s)
    })

    it('a switcher pick navigates to a route or runs an action, not both', () => {
        expect(switcherNavOf({})).toBe('route')
        expect(switcherNavOf({ actionId: 'pick' })).toBe('action')
        expect(withSwitcherNav({ route: 'c/${state._record}', label: 'C' }, 'action')).toEqual({ label: 'C', actionId: '_switchRecord' })
        expect(withSwitcherNav({ actionId: 'go' }, 'action')).toEqual({ actionId: 'go' })
        expect(withSwitcherNav({ actionId: 'pick' }, 'route')).toBe('')
    })
})

describe('headerProps — the header-action tree', () => {
    const tree = [
        { label: 'New', actionId: 'newBooking', icon: 'vaadin:plus' },
        { label: 'More', children: [{ label: 'Help', route: 'help' }] },
    ]

    it('knows what each action does', () => {
        expect(tree.map(headerActionKind)).toEqual(['action', 'menu'])
        expect(headerActionKind({ label: 'x' })).toBe('route')
    })

    it('edits a nested child by path', () => {
        const out = headerActionWith(tree, [1, 0], { route: 'docs' })
        expect(out[1].children).toEqual([{ label: 'Help', route: 'docs' }])
        expect(out[0]).toBe(tree[0])
    })

    it('switching kind clears the exclusive keys; a dropdown gets a first child', () => {
        expect(headerActionKindWith(tree, [0], 'route')[0]).toEqual({ label: 'New', icon: 'vaadin:plus' })
        expect(headerActionKindWith(tree, [0], 'menu')[0]).toEqual({ label: 'New', icon: 'vaadin:plus', children: [{ label: 'Item' }] })
        expect(headerActionKindWith(tree, [1], 'action', 'newBooking')[1]).toEqual({ label: 'More', actionId: 'newBooking' })
        expect(headerActionKindWith(tree, [0], 'action')[0]).toEqual(tree[0])
    })

    it('adds children and removes them; a dropdown emptied loses its children key', () => {
        const added = headerActionAdd(tree, [1], { label: 'About' })
        expect((added[1].children as unknown[]).length).toBe(2)
        expect(headerActionAdd(tree, []).length).toBe(3)
        const removed = headerActionRemove(tree, [1, 0]) as Record<string, unknown>[]
        expect(removed[1]).toEqual({ label: 'More' })
        expect(headerActionRemove([{ label: 'x' }], [0])).toBe('')
    })
})

// --- the YAML these edits produce, through the editor's own write path (minimal edits) ---

const FORM = `# Customer page — header data authored by hand
type: Form
title: \${state.name}
badges:
  - {label: VIP, color: success, description: kept} # a key the editor does not model
content:
  - type: Text
    text: Hello
`

/** One Properties edit on the page root, written the way the editor writes it. */
function editPage(text: string, key: string, value: unknown): string {
    const doc = parsePage(text)
    updateProp(doc.layout, key, value)
    return writePreserving(text, parse(serializePage(doc)))
}

describe('page header keys — YAML round trip', () => {
    it('writes a new key without touching the rest of the file', () => {
        const out = editPage(FORM, 'overline', 'Customers')
        expect(parse(out).overline).toBe('Customers')
        expect(out).toContain('# Customer page — header data authored by hand')
        expect(out).toContain('  - {label: VIP, color: success, description: kept} # a key the editor does not model')
    })

    it('edits a badge in place, keeping its unknown key and its comment', () => {
        const badges = listWith(parse(FORM).badges, 0, { color: 'error' })
        const out = editPage(FORM, 'badges', badges)
        expect(parse(out).badges).toEqual([{ label: 'VIP', color: 'error', description: 'kept' }])
        expect(out).toContain('# a key the editor does not model')
        expect(out.split('\n').length).toBe(FORM.split('\n').length)
    })

    it('removing the last badge removes the key', () => {
        const out = editPage(FORM, 'badges', listRemove(parse(FORM).badges, 0))
        expect(parse(out).badges).toBeUndefined()
        expect(parse(out).content).toEqual([{ type: 'Text', text: 'Hello' }])
    })

    it('writes the groups: banners, FABs, peerNav and a record switcher from a source', () => {
        let out = editPage(FORM, 'banners', [{ theme: 'WARNING', title: 'Overdue', closeable: true, timeoutSeconds: 5 }])
        out = editPage(out, 'fabs', [{ icon: 'vaadin:plus', label: 'New order', actionId: 'newOrder', order: 1 }])
        out = editPage(out, 'peerNav', objectWith(undefined, { prevLabel: 'Previous', prevRoute: 'customers/${state.prevId}' }))
        out = editPage(out, 'recordSwitcher', withOptionsMode({ label: 'Customer' }, 'source', { ref: 'customers' }))
        const v = parse(out)
        expect(v.banners).toEqual([{ theme: 'WARNING', title: 'Overdue', closeable: true, timeoutSeconds: 5 }])
        expect(v.fabs[0]).toEqual({ icon: 'vaadin:plus', label: 'New order', actionId: 'newOrder', order: 1 })
        expect(v.peerNav).toEqual({ prevLabel: 'Previous', prevRoute: 'customers/${state.prevId}' })
        expect(v.recordSwitcher).toEqual({ label: 'Customer', optionsSource: { ref: 'customers' } })
        expect(out.startsWith('# Customer page')).toBe(true)
        // and back out: clearing a group removes it
        expect(parse(editPage(out, 'peerNav', '')).peerNav).toBeUndefined()
    })
})

const SHELL = `type: AppShell
title: Front office # the console name
headerValues: [{label: Env, value: PRE}]
menu:
  - type: RouteLink
    label: Home
    route: home
`

function editShell(text: string, key: string, value: unknown): string {
    const doc = withAppExtra(parseApp(text), key, value)
    return writePreserving(text, parse(serializeApp(doc)))
}

describe('app-shell header keys — YAML round trip', () => {
    it('writes context selectors, header actions, notifications and global search', () => {
        let out = editShell(SHELL, 'contextSelectors', [{ fieldName: 'hotel', label: 'Hotel', options: parseOptions('H1=Palma') }])
        out = editShell(out, 'headerActions', headerActionAdd([{ label: 'More', children: [{ label: 'Help', route: 'help' }] }], [], { label: 'New', actionId: 'newBooking' }))
        out = editShell(out, 'notifications', objectWith(undefined, { source: { ref: 'inbox' }, markRead: { ref: 'inbox-read' } }))
        out = editShell(out, 'globalSearch', { source: { ref: 'search' } })
        const v = parse(out)
        expect(v.contextSelectors).toEqual([{ fieldName: 'hotel', label: 'Hotel', options: [{ value: 'H1', label: 'Palma' }] }])
        expect(v.headerActions).toEqual([{ label: 'More', children: [{ label: 'Help', route: 'help' }] }, { label: 'New', actionId: 'newBooking' }])
        expect(v.notifications).toEqual({ source: { ref: 'inbox' }, markRead: { ref: 'inbox-read' } })
        expect(v.globalSearch).toEqual({ source: { ref: 'search' } })
        // the rest of the file as written: the comment, the flow list, the menu
        expect(out).toContain('title: Front office # the console name')
        expect(out).toContain('headerValues: [{label: Env, value: PRE}]')
        expect(v.menu).toEqual([{ type: 'RouteLink', label: 'Home', route: 'home' }])
    })

    it('removes a key and keeps the unknown ones', () => {
        const withSearch = editShell(SHELL, 'globalSearch', { source: { ref: 'search' }, minChars: 2 })
        expect(appExtra(parseApp(withSearch), 'globalSearch')).toEqual({ source: { ref: 'search' }, minChars: 2 })
        // the picker clears the source: the unknown key stays
        const cleared = editShell(withSearch, 'globalSearch', objectWith(parse(withSearch).globalSearch, { source: '' }))
        expect(parse(cleared).globalSearch).toEqual({ minChars: 2 })
        const gone = editShell(SHELL, 'globalSearch', '')
        expect(gone).toBe(SHELL)
        expect(parse(editShell(withSearch, 'contextSelectors', [])).contextSelectors).toBeUndefined()
    })
})
