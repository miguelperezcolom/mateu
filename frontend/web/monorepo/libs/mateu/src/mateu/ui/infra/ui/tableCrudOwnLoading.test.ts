// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { MateuTableCrud } from './mateu-table-crud'

/**
 * A listing with no rows on screen draws its own skeleton while it waits; its search must then
 * travel as `background`, or the page veil spins on top of the skeleton after 600ms — two
 * "loading" signs for one wait. With rows still visible nothing is drawn, so the page indicator
 * keeps its say.
 */
const crud = (content: unknown[] | undefined) => {
    const el = new MateuTableCrud() as any
    el.id = 'crud'
    el.component = { id: 'crud', metadata: { type: 'Crud', pageSize: 10, filters: [] } }
    el.state = {}
    el.data = content ? { crud: { page: { pageNumber: 0, pageSize: 10, totalElements: 50, content } } } : {}
    const asked: any[] = []
    el.dispatchEvent = (e: CustomEvent) => { if (e.detail?.actionId === 'search') asked.push(e.detail); return true }
    return { el, asked }
}

describe('listing search vs the page busy indicator', () => {
    it('a page change clears the rows and shows the skeleton: background', () => {
        const { el, asked } = crud([{ id: 1 }])
        el.pageChanged(new CustomEvent('page-changed', { detail: { page: 1 } }))
        expect(asked[0].background).toBe(true)
    })

    it('a first search, with nothing on screen yet: background', () => {
        const { el, asked } = crud(undefined)
        el.search()
        expect(asked[0].background).toBe(true)
    })

    it('a filter-bar search keeps the old rows visible: the page indicator still shows', () => {
        const { el, asked } = crud([{ id: 1 }])
        el.search()
        expect(asked[0].background).toBeUndefined()
    })
})
