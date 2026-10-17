// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const navigated: string[] = []
vi.mock('@infra/ui/safeNavigate.ts', async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>()
    return { ...original, safeNavigate: (url: string) => { navigated.push(url); return true } }
})

import './mateu-drawer'
import type { MateuDrawer } from './mateu-drawer'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'

class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

/**
 * The drawer's chrome as a user drives it: title + subtitle, the size ladder and Maximize, the
 * bottom drawer's collapse handle, peer navigation, the guided-process pager and the ways out
 * (✕, Esc, backdrop, a timed close), plus the layout drawer's push of the page.
 */
const open = async (metadata: Record<string, unknown>, extra: Record<string, unknown> = {}) => {
    const drawer = document.createElement('mateu-drawer') as MateuDrawer & Record<string, any>
    drawer.component = { type: 'ClientSide', id: 'd', children: [], metadata: { type: 'Drawer', ...metadata } } as never
    Object.assign(drawer, extra)
    document.body.appendChild(drawer)
    await drawer.updateComplete
    return { drawer, root: drawer.shadowRoot as ShadowRoot, panel: () => drawer.shadowRoot!.querySelector('[role="dialog"]') as HTMLElement }
}

const frame = () => new Promise(r => requestAnimationFrame(() => r(undefined)))

afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
    navigated.length = 0
})

describe('the drawer header', () => {
    it('shows the title and subtitle interpolated, and names the dialog after the title', async () => {
        const { root, panel } = await open({ headerTitle: 'Guest ${state.name}', subtitle: 'Room ${state.room}',
            initialData: { name: 'Ana', room: '101' } })
        expect(root.querySelector('h3')?.textContent).toBe('Guest Ana')
        expect(root.querySelector('.subtitle')?.textContent).toBe('Room 101')
        expect(panel().getAttribute('aria-label')).toBe('Guest Ana')
        expect(panel().getAttribute('aria-modal')).toBe('true')
    })

    it('opens on the next frame', async () => {
        const { drawer, panel } = await open({ headerTitle: 'X' })
        await frame()
        await drawer.updateComplete
        expect(panel().classList.contains('open')).toBe(true)
    })
})

describe('size and maximize', () => {
    it('a size maps to its width and Maximize steps up the ladder until the widest', async () => {
        const { drawer, root, panel } = await open({ headerTitle: 'X', size: 'm', maximizable: true })
        expect(panel().style.width).toBe('648px')
        const maximize = () => root.querySelector('[aria-label="Maximize"]') as HTMLButtonElement | null
        maximize()!.click()
        await drawer.updateComplete
        expect(panel().style.width).toBe('968px')
        maximize()!.click()
        await drawer.updateComplete
        expect(panel().style.width).toBe('90vw')
        expect(maximize()).toBeNull()
    })

    it('an explicit width wins over the size; not maximizable, no button', async () => {
        const { root, panel } = await open({ headerTitle: 'X', size: 's', width: '30rem' })
        expect(panel().style.width).toBe('30rem')
        expect(root.querySelector('[aria-label="Maximize"]')).toBeNull()
    })
})

describe('the bottom drawer', () => {
    it('ignores the width and collapses to its header strip and back', async () => {
        const { drawer, root, panel } = await open({ headerTitle: 'Tasks', position: 'bottom', collapsible: true, width: '30rem',
            content: { type: 'ClientSide', id: 'c', children: [], metadata: { type: 'Text', text: 'body' } } })
        expect(panel().classList.contains('bottom')).toBe(true)
        expect(panel().style.width).toBe('')
        expect(root.querySelector('.content')).not.toBeNull()
        ;(root.querySelector('[aria-label="Collapse"]') as HTMLButtonElement).click()
        await drawer.updateComplete
        expect(panel().classList.contains('collapsed')).toBe(true)
        expect(root.querySelector('.content')).toBeNull()
        ;(root.querySelector('[aria-label="Expand"]') as HTMLButtonElement).click()
        await drawer.updateComplete
        expect(root.querySelector('.content')).not.toBeNull()
    })
})

describe('peer navigation', () => {
    it('the arrows go to the previous/next object; a side without a route is disabled', async () => {
        const { root } = await open({ headerTitle: 'X', peerNav: { prevLabel: 'Ana', prevRoute: '/guests/1' } })
        const prev = root.querySelector('[aria-label="Ana"]') as HTMLButtonElement
        const next = root.querySelector('[aria-label="Next"]') as HTMLButtonElement
        expect(next.disabled).toBe(true)
        prev.click()
        expect(navigated).toEqual(['/guests/1'])
    })
})

describe('the guided-process pager', () => {
    it('shows current | total and jumps back to a done step', async () => {
        const content = { type: 'ClientSide', id: 'c', children: [], metadata: { type: 'Text', text: 'body' } }
        const { drawer, root } = await open({ headerTitle: 'Check-in', content })
        drawer.dispatchEvent(new CustomEvent('mateu-guided-progress', { detail: { current: 2, total: 3,
            steps: [{ id: 'one', title: 'Guest', status: 'done' }, { id: 'two', title: 'Room', status: 'current' }, { id: 'three', status: 'upcoming' }] } }))
        await drawer.updateComplete
        const pager = root.querySelector('.guided-pager') as HTMLButtonElement
        expect(pager.textContent).toContain('2 | 3')
        pager.click()
        await drawer.updateComplete
        const items = Array.from(root.querySelectorAll('.guided-pager-item')) as HTMLButtonElement[]
        expect(items.map(i => i.disabled)).toEqual([false, true, true])
        expect(items[2].textContent).toContain('Step 3')
        // the embedded component is a stand-in here: anything under .content that bubbles the action
        const embedded = document.createElement('mateu-component')
        root.querySelector('.content')!.appendChild(embedded)
        const asked: unknown[] = []
        embedded.addEventListener('action-requested', (e) => asked.push((e as CustomEvent).detail))
        items[0].click()
        expect(asked).toEqual([{ actionId: 'goToStep', parameters: { _stepId: 'one' } }])
        await drawer.updateComplete
        expect(root.querySelector('.guided-pager-menu')).toBeNull()
    })

    it('a single-step process shows no pager', async () => {
        const { drawer, root } = await open({ headerTitle: 'X' })
        drawer.dispatchEvent(new CustomEvent('mateu-guided-progress', { detail: { current: 1, total: 1 } }))
        await drawer.updateComplete
        expect(root.querySelector('.guided-pager')).toBeNull()
    })
})

describe('closing', () => {
    it('✕ closes the drawer and removes it', async () => {
        vi.useFakeTimers()
        const { drawer, root } = await open({ headerTitle: 'X' })
        ;(root.querySelector('.drawer-close') as HTMLButtonElement).click()
        expect(drawer.opened).toBe(false)
        vi.advanceTimersByTime(300)
        expect(drawer.isConnected).toBe(false)
    })

    it('a click on the backdrop closes it; a modeless drawer has no backdrop', async () => {
        vi.useFakeTimers()
        const { drawer, root } = await open({ headerTitle: 'X' })
        ;(root.querySelector('.backdrop') as HTMLElement).click()
        vi.advanceTimersByTime(300)
        expect(drawer.isConnected).toBe(false)
        const modeless = await open({ headerTitle: 'Y', modeless: true })
        expect(modeless.root.querySelector('.backdrop')).toBeNull()
        expect(modeless.panel().getAttribute('aria-modal')).toBe('false')
    })

    it('Esc closes only the topmost overlay', async () => {
        vi.useFakeTimers()
        const first = await open({ headerTitle: 'A' })
        const second = await open({ headerTitle: 'B' })
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(second.drawer.opened).toBe(false)
        vi.advanceTimersByTime(300)
        expect(second.drawer.isConnected).toBe(false)
        expect(first.drawer.isConnected).toBe(true)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(first.drawer.isConnected).toBe(true)
    })

    it('a fragment asking to close after some time closes it then', async () => {
        vi.useFakeTimers()
        const { drawer } = await open({ headerTitle: 'X' })
        drawer.applyFragment({ targetComponentId: 'd', state: { _closeAfterMillis: 1000 } } as never)
        vi.advanceTimersByTime(999)
        expect(drawer.isConnected).toBe(true)
        vi.advanceTimersByTime(301 + 1)
        expect(drawer.isConnected).toBe(false)
    })
})

describe('a layout drawer pushes the page instead of covering it', () => {
    it('pads the app by its width on its side while open, and gives the space back on close', async () => {
        const app = document.createElement('mateu-ui')
        document.body.appendChild(app)
        const { drawer, root } = await open({ headerTitle: 'X', layout: true, position: 'start', size: 's' })
        await frame()
        expect(app.style.paddingLeft).toBe('464px')
        expect(root.querySelector('.backdrop')).toBeNull()
        drawer.close()
        expect(app.style.paddingLeft).toBe('')
    })

    it('a bottom layout drawer pads the bottom by its height', async () => {
        const app = document.createElement('mateu-ui')
        document.body.appendChild(app)
        await open({ headerTitle: 'X', layout: true, position: 'bottom' })
        await frame()
        expect(app.style.paddingBottom).toBe('var(--mateu-drawer-height, 50vh)')
    })
})
