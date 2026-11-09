// @vitest-environment jsdom
// The org chart's TREE display draws its connectors as real elements: a line down from every
// parent, the sibling bar from the first child's centre to the last's (each child draws the halves
// facing its siblings), and a line up into each child. The pseudo-element version drew no line down
// from a parent and a bar spanning only the last siblings (Mateu Explorer, 3.0-beta.51).
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-org-chart'
import { treeConnectors } from './orgChartModel'

type Chart = HTMLElement & { shadowRoot: ShadowRoot, updateComplete: Promise<boolean> } & Record<string, unknown>

const mount = async (root: unknown) => {
    const el = document.createElement('mateu-org-chart') as unknown as Chart
    el.root = root
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

afterEach(() => { document.body.innerHTML = '' })

describe('org chart tree connectors', () => {
    it('the bar halves face the siblings; a root has no line', () => {
        expect(treeConnectors(0, 1, true)).toEqual({ up: false, left: false, right: false })
        expect(treeConnectors(0, 1)).toEqual({ up: true, left: false, right: false })
        expect(treeConnectors(0, 3)).toEqual({ up: true, left: false, right: true })
        expect(treeConnectors(1, 3)).toEqual({ up: true, left: true, right: true })
        expect(treeConnectors(2, 3)).toEqual({ up: true, left: true, right: false })
    })

    it('every parent has a line down to its children; each child its line up and its bar halves', async () => {
        const el = await mount({ id: 'ceo', title: 'CEO', children: [
            { id: 'a', title: 'A', children: [{ id: 'a1', title: 'A1' }] },
            { id: 'b', title: 'B' },
            { id: 'c', title: 'C' },
        ] })
        const items = [...el.shadowRoot.querySelectorAll('li')] as HTMLElement[]
        const own = (li: HTMLElement, sel: string) => [...li.children].filter((c) => c.matches(sel)).length
        const byTitle = (t: string) => items.find((li) => [...li.children].find((c) => c.classList.contains('node'))?.querySelector('.title')?.textContent === t)!
        // the root: no line up, a line down
        expect(own(byTitle('CEO'), '.up, .bar')).toBe(0)
        expect(own(byTitle('CEO'), '.down')).toBe(1)
        // the first child: up + right half; the middle: both halves; the last: left half
        expect([own(byTitle('A'), '.up'), own(byTitle('A'), '.bar.left'), own(byTitle('A'), '.bar.right')]).toEqual([1, 0, 1])
        expect([own(byTitle('B'), '.bar.left'), own(byTitle('B'), '.bar.right')]).toEqual([1, 1])
        expect([own(byTitle('C'), '.bar.left'), own(byTitle('C'), '.bar.right')]).toEqual([1, 0])
        // a parent further down also has its line down; an only child has a line up and no bar
        expect(own(byTitle('A'), '.down')).toBe(1)
        expect([own(byTitle('A1'), '.up'), own(byTitle('A1'), '.bar')]).toEqual([1, 0])
    })
})
