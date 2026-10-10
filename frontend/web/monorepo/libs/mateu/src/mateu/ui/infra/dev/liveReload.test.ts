// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyLiveReload, contentUxs, reloadContent } from './liveReload'

const app = { type: 'ServerSide', children: [{ metadata: { type: 'App' } }] }
const page = { type: 'ServerSide', children: [{ metadata: { type: 'Form' } }] }

/** A mateu-ux stand-in carrying a fragment, a (shadow) mateu-component with state, and liveReload. */
const ux = (component: unknown, state?: Record<string, unknown>) => {
    const el = document.createElement('mateu-ux') as unknown as HTMLElement & {
        fragment?: unknown
        liveReload?: ReturnType<typeof vi.fn>
    }
    el.fragment = { component }
    el.liveReload = vi.fn()
    const shadow = el.attachShadow({ mode: 'open' })
    const comp = document.createElement('mateu-component') as HTMLElement & { state?: unknown }
    comp.state = state
    shadow.appendChild(comp)
    return { el, shadow }
}

afterEach(() => {
    document.body.innerHTML = ''
})

describe('contentUxs', () => {
    it('walks THROUGH the app shell into its content area, across shadow roots', () => {
        const root = document.createElement('div')
        const shell = ux(app)
        const content = ux(page)
        shell.shadow.appendChild(content.el)
        root.appendChild(shell.el)
        expect(contentUxs(root)).toEqual([content.el])
    })

    it('leaves an island inside a screen alone: re-rendering the screen re-renders it', () => {
        const root = document.createElement('div')
        const screen = ux(page)
        const island = ux(page)
        screen.shadow.appendChild(island.el)
        root.appendChild(screen.el)
        expect(contentUxs(root)).toEqual([screen.el])
    })
})

describe('reloadContent', () => {
    it('re-requests the screen in place with what the user typed', () => {
        const root = document.createElement('div')
        const screen = ux(page, { name: 'typed by the user' })
        root.appendChild(screen.el)
        expect(reloadContent(root)).toBe(1)
        expect(screen.el.liveReload).toHaveBeenCalledWith({ name: 'typed by the user' })
    })
})

describe('applyLiveReload', () => {
    const host = () => {
        const el = document.createElement('mateu-ui') as unknown as HTMLElement & { remount: ReturnType<typeof vi.fn> }
        el.remount = vi.fn()
        document.body.appendChild(el)
        return el
    }

    it('an app-level change remounts the app', () => {
        const h = host()
        applyLiveReload(h, 'app', 'routes.yaml')
        expect(h.remount).toHaveBeenCalled()
    })

    it('a page change with a screen on it does NOT remount, and says so unobtrusively', () => {
        const h = host()
        const screen = ux(page, { a: 1 })
        h.appendChild(screen.el)
        applyLiveReload(h, 'page', 'a.yaml')
        expect(h.remount).not.toHaveBeenCalled()
        expect(screen.el.liveReload).toHaveBeenCalled()
        const pill = document.getElementById('mateu-live-reload-indicator')
        expect(pill?.textContent).toContain('Reloaded')
        expect(pill?.getAttribute('role')).toBe('status')
    })

    it('a page change with nothing routed on screen falls back to a remount', () => {
        const h = host()
        applyLiveReload(h, 'page')
        expect(h.remount).toHaveBeenCalled()
    })
})
