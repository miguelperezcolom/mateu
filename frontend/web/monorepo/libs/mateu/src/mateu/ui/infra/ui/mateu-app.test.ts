// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import './mateu-app'
import type { MateuApp } from './mateu-app'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { AppVariant } from '@mateu/shared/apiClients/dtos/componentmetadata/AppVariant'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { RuleAction } from '@mateu/shared/apiClients/dtos/componentmetadata/RuleAction'
import { configureRunJs, resetRunJs } from './runJs'

/**
 * mateu-app + appRenderer: the app shell. Each variant draws its chrome from the same metadata;
 * these pin what every variant must do (title, menu entries, no javascript: links), the theme
 * toggle (persisted, but never failing on blocked storage), the server-chosen language, and the
 * menu-leaf rules (RunJS stays behind its opt-in).
 */
class TestRenderer extends BasicComponentRenderer {}

beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

const app = (over: Record<string, unknown> = {}) => ({
    id: 'app', type: 'ClientSide', children: [],
    metadata: {
        type: ComponentMetadataType.App,
        title: 'Back office',
        variant: AppVariant.MENU_ON_TOP,
        route: '',
        homeRoute: '/orders',
        menu: [
            { label: 'Orders', path: '/orders', destination: { route: '/orders' } },
            { label: 'Customers', path: '/customers', destination: { route: '/customers' } },
        ],
        ...over,
    },
})

const mount = async (component: unknown) => {
    const el = document.createElement('mateu-app') as MateuApp
    el.component = component as never
    el.baseUrl = ''
    el.state = {}
    el.data = {}
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.removeAttribute('lang')
    document.documentElement.removeAttribute('theme')
    resetRunJs()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

const text = (el: MateuApp) => el.shadowRoot!.textContent ?? ''

describe('the app shell variants', () => {
    for (const variant of [AppVariant.MENU_ON_TOP, AppVariant.HAMBURGUER_MENU, AppVariant.MENU_ON_LEFT,
        AppVariant.TABS, AppVariant.TILES, AppVariant.RAIL, AppVariant.HAMBURGER_SECTIONS]) {
        it(`${variant} renders, with a main landmark and no javascript: links`, async () => {
            const el = await mount(app({ variant }))
            const root = el.shadowRoot!
            expect(root.innerHTML.length).toBeGreaterThan(0)
            expect(root.querySelectorAll('a[href^="javascript:"]')).toHaveLength(0)
            expect(root.querySelector('[role="main"], main')).not.toBeNull()
        })
    }

    it('shows the title and the menu entries', async () => {
        const el = await mount(app({ variant: AppVariant.MENU_ON_TOP }))
        const all = text(el) + JSON.stringify(Array.from(el.shadowRoot!.querySelectorAll('*')).map((n) => (n as { items?: unknown }).items).filter(Boolean))
        expect(all).toContain('Back office')
        expect(all).toContain('Orders')
        expect(all).toContain('Customers')
    })

    it('the brand that goes home is a button, not a javascript: link', async () => {
        const el = await mount(app({ variant: AppVariant.MENU_ON_TOP }))
        const brand = el.shadowRoot!.querySelector('.mateu-app-brand')
        expect(brand?.tagName).toBe('BUTTON')
        expect(brand?.getAttribute('type')).toBe('button')
    })
})

describe('the page language', () => {
    it("is the server's when the app shell carries one", async () => {
        await mount(app({ locale: 'es-ES' }))
        expect(document.documentElement.lang).toBe('es-ES')
    })

    it("is left to the browser when it carries none", async () => {
        document.documentElement.lang = 'en-GB'
        await mount(app())
        expect(document.documentElement.lang).toBe('en-GB')
    })
})

describe('the theme toggle', () => {
    it('flips the theme and remembers it', async () => {
        const store = new Map<string, string>()
        vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) })
        const el = await mount(app({ themeToggle: true }))
        el.isDark = false
        el.toggleTheme()
        expect(document.documentElement.getAttribute('theme')).toBe('dark')
        expect(store.get('mateu-theme')).toBe('dark')
        el.toggleTheme()
        expect(store.get('mateu-theme')).toBe('light')
    })

    it('still works when storage is blocked', async () => {
        const boom = () => { throw new Error('SecurityError') }
        vi.stubGlobal('localStorage', { getItem: boom, setItem: boom, removeItem: boom })
        const el = await mount(app({ themeToggle: true }))
        el.isDark = false
        expect(() => el.toggleTheme()).not.toThrow()
        expect(document.documentElement.getAttribute('theme')).toBe('dark')
    })
})

describe('menu-leaf rules', () => {
    it('RunAction leaves dispatch the action; RunJS leaves only run when enabled', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const el = await mount(app())
        const ran: string[] = []
        el.runAction = (actionId: string) => { ran.push(actionId) }
        const w = window as unknown as { __menuRan?: boolean }
        el.runMenuRules([
            { action: RuleAction.RunAction, actionId: 'refresh' },
            { action: RuleAction.RunJS, value: 'window.__menuRan = true' },
        ] as never)
        expect(ran).toEqual(['refresh'])
        expect(w.__menuRan).toBeUndefined()
        configureRunJs(true)
        el.runMenuRules([{ action: RuleAction.RunJS, value: 'window.__menuRan = true' }] as never)
        expect(w.__menuRan).toBe(true)
        delete w.__menuRan
    })
})
