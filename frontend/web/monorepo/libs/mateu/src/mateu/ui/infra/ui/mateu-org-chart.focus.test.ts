// @vitest-environment jsdom
// The org chart's `focus` presentation: one node in focus, its ancestors above (a long chain
// collapsed), its children below; clicking a card moves the focus client-side, clicking a name runs
// the node's action exactly like the tree does.
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-org-chart'

const dev1 = { id: 'dev1', title: 'Dev One', actionId: 'open' }
const dev2 = { id: 'dev2', title: 'Dev Two' }
const lead = { id: 'lead', title: 'Team Lead', subtitle: 'Platform', children: [dev1, dev2] }
const cto = { id: 'cto', title: 'CTO', children: [lead] }
const vp = { id: 'vp', title: 'VP', children: [cto] }
const ceo = { id: 'ceo', title: 'Ana García', children: [vp, { id: 'cfo', title: 'CFO' }] }

type Chart = HTMLElement & { shadowRoot: ShadowRoot, updateComplete: Promise<boolean> } & Record<string, unknown>

const mount = async (props: Record<string, unknown>) => {
    const el = document.createElement('mateu-org-chart') as unknown as Chart
    Object.assign(el, props)
    document.body.appendChild(el)
    await el.updateComplete
    return el
}
const q = (el: Chart, sel: string) => el.shadowRoot.querySelector(sel) as HTMLElement | null
const qa = (el: Chart, sel: string) => [...el.shadowRoot.querySelectorAll(sel)] as HTMLElement[]
const titles = (el: Chart, sel: string) => qa(el, `${sel} .title`).map((t) => t.textContent!.trim())

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-org-chart display=focus', () => {
    it('without display it is still the tree', async () => {
        const el = await mount({ root: ceo })
        expect(q(el, '.tree')).not.toBeNull()
        expect(q(el, '.focus-view')).toBeNull()
    })

    it('opens on the node named by focusId: collapsed ancestors, the node, its reports', async () => {
        const el = await mount({ root: ceo, display: 'focus', focusId: 'lead' })
        expect(q(el, '.tree')).toBeNull()
        expect(titles(el, '.card.focused')).toEqual(['Team Lead'])
        // 3 ancestors (ceo, vp, cto): only the direct parent shows, the rest behind the toggle
        expect(titles(el, '.card.ancestor')).toEqual(['CTO'])
        const toggle = q(el, '.levels')!
        expect(toggle.getAttribute('aria-expanded')).toBe('false')
        expect(toggle.textContent).toMatch(/2/)
        expect(titles(el, '.card.child')).toEqual(['Dev One', 'Dev Two'])
        expect(q(el, '.reports-heading')!.textContent).toMatch(/2/)

        toggle.click()
        await el.updateComplete
        expect(titles(el, '.card.ancestor')).toEqual(['Ana García', 'VP', 'CTO'])
        expect(q(el, '.levels')!.getAttribute('aria-expanded')).toBe('true')
    })

    it('unknown focus opens on the root, with no ancestors', async () => {
        const el = await mount({ root: ceo, display: 'focus', focusId: 'nobody' })
        expect(titles(el, '.card.focused')).toEqual(['Ana García'])
        expect(q(el, '.chain')).toBeNull()
        expect(q(el, '.card.focused .avatar')!.textContent).toBe('AG')
    })

    it('clicking a child card moves the focus there (and no action is requested)', async () => {
        const el = await mount({ root: ceo, display: 'focus', focusId: 'cto' })
        const requested: unknown[] = []
        el.addEventListener('action-requested', (e) => requested.push((e as CustomEvent).detail))
        const leadCard = qa(el, '.card.child').find((c) => c.textContent!.includes('Team Lead'))!
        ;(leadCard.querySelector('.hit') as HTMLElement).click()
        await el.updateComplete
        expect(titles(el, '.card.focused')).toEqual(['Team Lead'])
        expect(requested).toEqual([])
        // ...and back up through an ancestor card
        ;(qa(el, '.card.ancestor .hit').at(-1) as HTMLElement).click()
        await el.updateComplete
        expect(titles(el, '.card.focused')).toEqual(['CTO'])
    })

    it('a node with an action runs it from its name, with the tree\'s event and detail', async () => {
        const el = await mount({ root: ceo, display: 'focus', focusId: 'lead' })
        const requested: any[] = []
        el.addEventListener('action-requested', (e) => requested.push((e as CustomEvent).detail))
        const link = qa(el, '.card.child button.title.link')
        expect(link.length).toBe(1)
        link[0].click()
        expect(requested).toEqual([{ actionId: 'open', parameters: { _clickedNode: dev1 } }])
        // the name is a button; the focus did not move
        await el.updateComplete
        expect(titles(el, '.card.focused')).toEqual(['Team Lead'])
    })

    it('new data from the server resets the focus', async () => {
        const el = await mount({ root: ceo, display: 'focus', focusId: 'cto' })
        ;(qa(el, '.card.child .hit')[0]).click()
        await el.updateComplete
        expect(titles(el, '.card.focused')).toEqual(['Team Lead'])
        el.focusId = 'vp'
        await el.updateComplete
        expect(titles(el, '.card.focused')).toEqual(['VP'])
        el.root = { ...ceo }
        await el.updateComplete
        expect(titles(el, '.card.focused')).toEqual(['VP'])
    })
})
