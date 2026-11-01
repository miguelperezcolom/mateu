// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-kanban'
import type { MateuKanban } from './mateu-kanban'

const columns = [
    { id: 'todo', title: 'To do', cards: [{ id: 't1', title: 'Write' }, { id: 't2', title: 'Review' }] },
    { id: 'done', title: 'Done', cards: [] },
]

const mount = async (props: Partial<MateuKanban>) => {
    const el = document.createElement('mateu-kanban') as MateuKanban
    Object.assign(el, props)
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const titlesOf = (el: MateuKanban) =>
    [...el.shadowRoot!.querySelectorAll('.column')].map(c => [...c.querySelectorAll('.card-title')].map(t => t.textContent))

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-kanban', () => {
    it('a board without a move action stays as it was: no drag, no Move menu', async () => {
        const el = await mount({ columns })
        expect(el.shadowRoot!.querySelector('.card')!.getAttribute('draggable')).toBe('false')
        expect(el.shadowRoot!.querySelector('.move')).toBeNull()
    })

    it('moves a card from the keyboard menu at once and sends where it went', async () => {
        const el = await mount({ columns, moveActionId: 'moveTask' })
        const sent: any[] = []
        el.addEventListener('action-requested', (e: Event) => sent.push((e as CustomEvent).detail))
        expect(el.shadowRoot!.querySelector('.card')!.getAttribute('draggable')).toBe('true')
        ;(el.shadowRoot!.querySelector('[data-move-for="t1"]') as HTMLElement).click()
        await el.updateComplete
        const items = [...el.shadowRoot!.querySelectorAll('.menu [role=menuitem]')].map(b => b.textContent)
        expect(items).toEqual(['Move down', 'Move to Done'])
        ;(el.shadowRoot!.querySelectorAll('.menu [role=menuitem]')[1] as HTMLElement).click()
        await el.updateComplete
        expect(titlesOf(el)).toEqual([['Review'], ['Write']])
        expect(sent).toHaveLength(1)
        expect(sent[0].actionId).toBe('moveTask')
        expect(sent[0].parameters).toEqual({ _cardId: 't1', _fromColumnId: 'todo', _toColumnId: 'done', _toIndex: 0 })
    })

    it('puts the card back when the move action fails', async () => {
        const el = await mount({ columns, moveActionId: 'moveTask' })
        let settled: ((ok: boolean) => void) | undefined
        el.addEventListener('action-requested', (e: Event) => { settled = (e as CustomEvent).detail.settled })
        el.commit({ cardId: 't2', fromColumnId: 'todo', toColumnId: 'todo', toIndex: 0 })
        await el.updateComplete
        expect(titlesOf(el)).toEqual([['Review', 'Write'], []])
        settled!(false)
        await el.updateComplete
        expect(titlesOf(el)).toEqual([['Write', 'Review'], []])
    })

    it('a server re-render replaces the moved board with its own', async () => {
        const el = await mount({ columns, moveActionId: 'moveTask' })
        el.commit({ cardId: 't1', fromColumnId: 'todo', toColumnId: 'done', toIndex: 0 })
        await el.updateComplete
        el.columns = [{ id: 'todo', title: 'To do', cards: [] }, { id: 'done', title: 'Done', cards: [{ id: 't1', title: 'Write (saved)' }] }]
        await el.updateComplete
        expect(titlesOf(el)).toEqual([[], ['Write (saved)']])
    })

    it('a live board draws its cards from the source and reads it again after a move', async () => {
        let status = 'todo'
        const fetchMock = vi.fn(async () => ({
            ok: true, status: 200,
            text: async () => JSON.stringify({ content: [{ id: 9, title: 'Varnish', status }] }),
        }))
        vi.stubGlobal('fetch', fetchMock)
        try {
            const el = await mount({
                columns: [{ id: 'todo', title: 'To do' }, { id: 'done', title: 'Done' }],
                rowsSource: { url: 'https://api.example.com/tasks', itemsPath: 'content' } as any,
                card: { title: '${row.title}' },
                moveActionId: 'moveTask',
            })
            await vi.waitFor(() => expect(titlesOf(el)).toEqual([['Varnish'], []]))
            let detail: any
            el.addEventListener('action-requested', (e: Event) => { detail = (e as CustomEvent).detail })
            el.commit({ cardId: '9', fromColumnId: 'todo', toColumnId: 'done', toIndex: 0 })
            // the item travels with the move: a PUT needs the whole record
            expect(detail.parameters).toMatchObject({ id: 9, title: 'Varnish', _toColumnId: 'done' })
            status = 'done'
            detail.settled(true)
            await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
            await vi.waitFor(() => expect(titlesOf(el)).toEqual([[], ['Varnish']]))
        } finally {
            vi.unstubAllGlobals()
        }
    })
})
