// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-drop-zone'
import type { MateuDropZone } from './mateu-drop-zone'

afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers() })

const MIME = 'application/x-mateu-booking'
const dragEvent = (type: string, types: string[], data: Record<string, string> = {}) => {
    const e = new Event(type, { bubbles: true, cancelable: true, composed: true }) as any
    e.dataTransfer = { types, dropEffect: 'none', getData: (t: string) => data[t] ?? '' }
    return e as DragEvent
}

async function mount(zone: Record<string, unknown> | undefined = { accept: 'booking', actionId: 'moveToWindow', parameters: { window: 2 }, title: 'Window 2', subtitle: 'Folio' }) {
    const el = document.createElement('mateu-drop-zone') as MateuDropZone
    el.zone = zone as any
    const actions: any[] = []
    el.addEventListener('action-requested', e => actions.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, actions, zoneDiv: () => el.shadowRoot!.querySelector('.zone') as HTMLElement }
}

describe('drop zone', () => {
    it('renders nothing without a zone, and a labelled drop target with one', async () => {
        const none = await mount(null as any)
        expect(none.zoneDiv()).toBeNull()
        const { zoneDiv } = await mount()
        expect(zoneDiv().getAttribute('role')).toBe('group')
        expect(zoneDiv().getAttribute('aria-label')).toBe('Window 2, Folio — drop target')
        expect(zoneDiv().querySelector('.title')!.textContent).toBe('Window 2')
    })

    it('offers itself while rows of its type are dragged anywhere, and stops on drag end', async () => {
        vi.useFakeTimers()
        const { el, zoneDiv } = await mount()
        document.dispatchEvent(dragEvent('dragstart', [MIME]))
        vi.runAllTimers()
        await el.updateComplete
        expect(zoneDiv().classList.contains('ready')).toBe(true)
        expect(zoneDiv().querySelector('.hint')).toBeTruthy()
        document.dispatchEvent(dragEvent('dragend', []))
        await el.updateComplete
        expect(zoneDiv().classList.contains('ready')).toBe(false)
    })

    it('ignores drags of another type', async () => {
        vi.useFakeTimers()
        const { el, zoneDiv, actions } = await mount()
        document.dispatchEvent(dragEvent('dragstart', ['application/x-mateu-invoice']))
        vi.runAllTimers()
        await el.updateComplete
        expect(zoneDiv().classList.contains('ready')).toBe(false)
        const over = dragEvent('dragover', ['application/x-mateu-invoice'])
        zoneDiv().dispatchEvent(over)
        expect(over.defaultPrevented).toBe(false)
        zoneDiv().dispatchEvent(dragEvent('drop', ['text/plain']))
        expect(actions).toHaveLength(0)
    })

    it('lights up under the pointer and runs its action with the dragged ids on drop', async () => {
        const { el, zoneDiv, actions } = await mount()
        const over = dragEvent('dragover', [MIME])
        zoneDiv().dispatchEvent(over)
        expect(over.defaultPrevented).toBe(true)
        expect((over as any).dataTransfer.dropEffect).toBe('move')
        await el.updateComplete
        expect(zoneDiv().classList.contains('over')).toBe(true)
        zoneDiv().dispatchEvent(dragEvent('dragleave', [MIME]))
        await el.updateComplete
        expect(zoneDiv().classList.contains('over')).toBe(false)

        zoneDiv().dispatchEvent(dragEvent('drop', [MIME], { [MIME]: JSON.stringify([{ id: 7 }, { id: 9 }]) }))
        expect(actions).toEqual([{ actionId: 'moveToWindow', parameters: { window: 2, _draggedIds: ['7', '9'], _dragType: 'booking' } }])
    })

    it('a drop carrying no ids runs nothing', async () => {
        const { zoneDiv, actions } = await mount()
        zoneDiv().dispatchEvent(dragEvent('drop', [MIME], { [MIME]: 'not json' }))
        expect(actions).toHaveLength(0)
    })
})
