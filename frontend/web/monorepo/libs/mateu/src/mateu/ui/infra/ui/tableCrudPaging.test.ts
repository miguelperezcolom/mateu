// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { MateuTableCrud } from './mateu-table-crud'

/**
 * A page change always asks for the page size the pager numbered its pages with. The listing's
 * state loses `size` when the parent re-binds it with a fresh server state (a listing re-entered
 * from the menu keeps this element), and a search without a size made the server fall back to its
 * own default (20): «next» showed rows 20–39 under a pager that turned into "Page 2 of 3".
 */
const crud = (state: Record<string, any>, pageSize: number | undefined = 10) => {
    const el = new MateuTableCrud() as any
    el.id = 'crud'
    el.component = { id: 'crud', metadata: { type: 'Crud', pageSize, filters: [] } }
    el.state = state
    el.data = { crud: { page: { pageNumber: 0, pageSize: 10, totalElements: 50, content: [] } } }
    const asked: any[] = []
    el.dispatchEvent = (e: CustomEvent) => { if (e.detail?.actionId === 'search') asked.push(e.detail.parameters._searchState); return true }
    return { el, asked }
}

describe('listing paging', () => {
    it('a page change carries the declared page size even when the state lost it', () => {
        const { el, asked } = crud({ _route: 'list' })
        el.pageChanged(new CustomEvent('page-changed', { detail: { page: 1 } }))
        expect(asked).toHaveLength(1)
        expect(asked[0].page).toBe(1)
        expect(asked[0].size).toBe(10)
    })

    it('without a declared page size it keeps the size it was served at', () => {
        const { el, asked } = crud({}, undefined)
        el.pageChanged(new CustomEvent('page-changed', { detail: { page: 3 } }))
        expect(asked[0]).toMatchObject({ page: 3, size: 10 })
    })
})
