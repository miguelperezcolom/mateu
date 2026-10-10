// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-page'
import type { MateuPage } from './mateu-page'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

/**
 * mateu-page: the page chrome around a form — header, banners (static, action-returned, with
 * timeouts and dismiss), the attributes the shell styles key off (nested, crud page, edge, hero).
 */
const page = (metadata: Record<string, unknown>, children: unknown[] = [], style?: string) => ({
    id: 'p1', type: 'ClientSide', style,
    metadata: { type: ComponentMetadataType.Page, ...metadata },
    children,
})

const mount = async (component: unknown, state: Record<string, unknown> = {}) => {
    const el = document.createElement('mateu-page') as MateuPage
    el.component = component as never
    el.state = state
    el.data = {}
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const banners = (el: MateuPage) => Array.from(el.shadowRoot!.querySelectorAll('.page-banner'))

afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.lang = 'en'
    vi.useRealTimers()
})

describe('mateu-page banners', () => {
    it('renders the static banners with their texts interpolated against the state, and the theme class', async () => {
        const el = await mount(page({ title: 'Order', banners: [
            { theme: 'WARNING', title: 'Hi ${state.name}', description: 'Total ${state.total}', hasCloseButton: false, hasIcon: false },
        ] }), { name: 'Ana', total: 3 })
        const [b] = banners(el)
        expect(b.className).toContain('page-banner--warning')
        expect(b.textContent).toContain('Hi Ana')
        expect(b.textContent).toContain('Total 3')
    })

    it('a closeable banner has a localized dismiss button that removes it', async () => {
        document.documentElement.lang = 'es'
        const el = await mount(page({ banners: [
            { theme: 'INFO', title: 'Closeable', hasCloseButton: true, hasIcon: false, description: '' },
        ] }))
        const close = el.shadowRoot!.querySelector('.banner-close') as HTMLButtonElement
        expect(close.getAttribute('aria-label')).toBe('Descartar')
        close.click()
        await el.updateComplete
        expect(banners(el)).toHaveLength(0)
    })

    it('action-returned banners replace or append, and vanish after their timeout', async () => {
        vi.useFakeTimers()
        const el = await mount(page({ title: 'x' }))
        const send = (bs: unknown[], append = false) =>
            document.dispatchEvent(new CustomEvent('page-banners-received', { detail: { banners: bs, append } }))
        send([{ theme: 'INFO', title: 'one', hasCloseButton: false }])
        send([{ theme: 'SUCCESS', title: 'two', hasCloseButton: false, timeoutSeconds: 2 }], true)
        await el.updateComplete
        expect(banners(el).map((b) => b.textContent?.trim())).toEqual(['one', 'two'])
        vi.advanceTimersByTime(2100)
        await el.updateComplete
        expect(banners(el).map((b) => b.textContent?.trim())).toEqual(['one'])
        send([{ theme: 'DANGER', title: 'three', hasCloseButton: false }])
        await el.updateComplete
        expect(banners(el).map((b) => b.textContent?.trim())).toEqual(['three'])
    })

    it('a static banner with a timeout dismisses itself', async () => {
        vi.useFakeTimers()
        const el = await mount(page({ banners: [{ theme: 'INFO', title: 'brief', timeoutSeconds: 1, hasCloseButton: false }] }))
        expect(banners(el)).toHaveLength(1)
        vi.advanceTimersByTime(1100)
        await el.updateComplete
        expect(banners(el)).toHaveLength(0)
    })

    it('stops listening for banners once disconnected', async () => {
        const el = await mount(page({ title: 'x' }))
        el.remove()
        document.dispatchEvent(new CustomEvent('page-banners-received', { detail: { banners: [{ title: 'late' }] } }))
        expect(el.actionBanners).toEqual([])
    })
})

describe('mateu-page attributes the shell styles read', () => {
    it('marks nested pages, listing pages and edge-to-edge pages', async () => {
        const nested = await mount(page({ level: 1 }))
        expect(nested.hasAttribute('data-nested')).toBe(true)
        const listing = await mount(page({ title: 'L' }, [{ id: 'c', type: 'ClientSide', metadata: { type: ComponentMetadataType.Crud } }]))
        expect(listing.hasAttribute('data-crud-page')).toBe(true)
        const edge = await mount(page({ pageWidth: 'edgeToEdge' }))
        expect(edge.hasAttribute('data-edge')).toBe(true)
    })

    it('announces compact mode to the shell', async () => {
        const seen: unknown[] = []
        document.addEventListener('compact-changed', (e) => seen.push((e as CustomEvent).detail), { once: true })
        await mount(page({ title: 'x' }, [], '--mateu-compact:1'))
        expect(seen).toEqual([{ compact: true }])
    })

    it('a welcome hero with no header on top marks the page hero-top and draws no header band', async () => {
        const hero = { id: 'h', type: 'ClientSide', metadata: { type: ComponentMetadataType.HeroSection } }
        const el = await mount(page({}, [hero]))
        expect(el.hasAttribute('data-hero-top')).toBe(true)
        expect(el.shadowRoot!.querySelector('.page-header-band')).toBeNull()
        const titled = await mount(page({ title: 'Home' }))
        expect(titled.shadowRoot!.querySelector('.page-header-band')).not.toBeNull()
    })
})
