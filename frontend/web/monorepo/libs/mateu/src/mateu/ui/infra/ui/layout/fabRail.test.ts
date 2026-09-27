// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { html, render } from 'lit'
import {
    channelLayout, columnOverCorner, cornerFabPosition, fabBottom, fabCount, fabPosition, onFabRail, pageFabBottom,
    pageFabPosition, requestAside, trackFabAnchor, FAB_INSET_END,
} from './fabRail'
import type { AsidePlacement, ChannelInput } from './fabRail'

/**
 * The FABs live in an aside channel to the right of the work area, outside it: flush in the corner
 * of an edge-to-edge page, in a channel the view leaves free for fixed and full-width pages, in the
 * corner of a phone. The same channel holds a form's section index, then as wide as the index.
 */
describe('fabRail', () => {

    const settle = () => new Promise(resolve => setTimeout(resolve, 0))
    const root = () => document.documentElement.style
    const base: ChannelInput = { mode: 'full', viewportWidth: 1920, contentEnd: 1920, hasFabs: true, hasToc: false, rem: 16 }

    afterEach(() => {
        root().removeProperty('--mateu-fab-inset-end')
        root().removeProperty('--mateu-fab-inset-bottom')
    })

    it('puts the FABs of an edge-to-edge page flush in the corner, with no channel', () => {
        expect(channelLayout({ ...base, mode: 'edge' })).toEqual({ channel: 0, toc: 'bar', insetEnd: 0, insetBottom: 0 })
    })

    it('reserves a channel at the end of a full-width page, so the FAB is outside its content', () => {
        // inset 16 + FAB 44 + gap 8: the content ends 68px from the edge, the FAB 8px past it
        const layout = channelLayout({ ...base, contentEnd: 1920 })
        expect(layout.channel).toBe(68)
        expect(layout.insetEnd).toBe(16)
        expect(layout.padEnd).toBe(68)
    })

    it('counts the room a full-width view already has past its end edge', () => {
        // a view ending 24px short of the edge needs only 44px more
        expect(channelLayout({ ...base, contentEnd: 1896 }).padEnd).toBe(44)
        // but never less than its 24px gutter
        expect(channelLayout({ ...base, contentEnd: 1800 }).padEnd).toBe(24)
    })

    it('reserves nothing for a page with no FABs and no index', () => {
        expect(channelLayout({ ...base, hasFabs: false }).channel).toBe(0)
        expect(channelLayout({ ...base, hasFabs: false }).padEnd).toBeUndefined()
    })

    it('puts the FABs of a fixed-width page one gap past its end edge', () => {
        // a 1408px column centred in a 1920px viewport ends at 1664; the FAB starts at 1672
        const layout = channelLayout({ ...base, mode: 'fixed', contentEnd: 1664, containerEnd: 1664 })
        expect(layout.channel).toBe(68)
        expect(layout.insetEnd).toBe(204)
        expect(layout.padEnd).toBeUndefined()
        // centred in a column with a 256px margin to the viewport, which holds the channel: not narrowed
        expect(layout.squeeze).toBe(0)
    })

    it('narrows a fixed-width page only as much as its margin lacks for the channel', () => {
        // centred in a container ending 16px short of a 1440px viewport: 52px more are needed
        // (max-width: min(1408px, 100% - 2 * squeeze), so a container wider than the cap already
        // has the room in the view's own margin)
        expect(channelLayout({ ...base, mode: 'fixed', viewportWidth: 1440, contentEnd: 1424, containerEnd: 1424 }).squeeze).toBe(52)
    })

    it('keeps the corner inset when a fixed view reaches the channel', () => {
        // narrowed to leave the channel: it ends 68px from the edge, the FAB at the 16px inset
        expect(channelLayout({ ...base, mode: 'fixed', viewportWidth: 1440, contentEnd: 1372 }).insetEnd).toBe(16)
    })

    it('widens the channel for a section index, and folds the index where there is no room', () => {
        // inset 16 + index 240 + gap 32
        expect(channelLayout({ ...base, hasToc: true })).toMatchObject({ channel: 288, toc: 'aside' })
        expect(channelLayout({ ...base, hasToc: true, hasFabs: false })).toMatchObject({ channel: 288, toc: 'aside' })
        expect(channelLayout({ ...base, hasToc: true, viewportWidth: 1024, contentEnd: 1024 })).toMatchObject({ channel: 68, toc: 'bar' })
        expect(channelLayout({ ...base, hasToc: true, mode: 'edge' }).toc).toBe('bar')
    })

    it('ends the FABs of a fixed-width page under the index when the index widens the channel', () => {
        // the view ends at 1632, the channel (288) at 1904: the FAB ends there too, 16px from the edge
        expect(channelLayout({ ...base, mode: 'fixed', hasToc: true, contentEnd: 1632, containerEnd: 1664 }))
            .toMatchObject({ channel: 288, toc: 'aside', insetEnd: 16, squeeze: 32 })
    })

    it('goes to the corner on a phone, with no channel', () => {
        const layout = channelLayout({ ...base, viewportWidth: 390, contentEnd: 390, hasToc: true })
        expect(layout).toEqual({ channel: 0, toc: 'bar', insetEnd: 16 })
        expect(channelLayout({ ...base, mode: 'fixed', viewportWidth: 390, contentEnd: 390 }).insetEnd).toBe(16)
    })

    it('stacks the shell FABs upwards by slot, and the page FABs above them in the same column', () => {
        expect(fabBottom(0)).toContain('0 * (')
        expect(fabBottom(2)).toContain('2 * (')
        expect(fabPosition(1)).toBe(`bottom: ${fabBottom(1)}; right: ${FAB_INSET_END};`)
        expect(pageFabBottom(1)).toContain('(var(--mateu-fab-shell-slots, 0) + 1) * (')
        expect(pageFabPosition(0)).toBe(`bottom: ${pageFabBottom(0)}; right: ${FAB_INSET_END};`)
        // the column starts above the corner FAB when it is over it, at the bottom inset otherwise
        expect(fabBottom(0)).toContain('var(--mateu-fab-stack-bottom, var(--mateu-fab-inset-bottom')
        expect(pageFabBottom(0)).toContain('var(--mateu-fab-stack-bottom, var(--mateu-fab-inset-bottom')
    })

    it('knows which FABs are on the rail, and how high the shell stack goes', async () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const paint = (ai: boolean, pageFabs: number) => render(html`
            ${ai ? html`<button ${onFabRail('shell', 0)}></button>` : ''}
            <button ${onFabRail('shell', ai ? 1 : 0)}></button>
            ${Array.from({ length: pageFabs }, (_, i) => html`<button ${onFabRail('page', i)}></button>`)}
        `, host)

        paint(true, 2)
        await settle()
        expect(fabCount()).toBe(4)
        expect(root().getPropertyValue('--mateu-fab-shell-slots')).toBe('2')
        expect(root().getPropertyValue('--mateu-fab-slots')).toBe('4')

        paint(false, 0)
        await settle()
        expect(fabCount()).toBe(1)
        expect(root().getPropertyValue('--mateu-fab-shell-slots')).toBe('1')

        render('', host)
        await settle()
        expect(fabCount()).toBe(0)
        host.remove()
    })

    it('makes the content view reserve the channel and publish the anchor, and lets it go', async () => {
        const fabHost = document.createElement('div')
        document.body.appendChild(fabHost)
        render(html`<button ${onFabRail('shell', 0)}></button>`, fabHost)
        const content = document.createElement('div')
        document.body.appendChild(content)
        content.getBoundingClientRect = () => ({ right: 1896 } as DOMRect)
        Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })
        await settle()

        const release = trackFabAnchor(content, 'full')
        expect(content.hasAttribute('data-aside')).toBe(true)
        expect(content.style.getPropertyValue('--mateu-aside-pad-end')).toBe('44px')
        expect(root().getPropertyValue('--mateu-fab-inset-end')).toBe('16px')

        release()
        expect(content.hasAttribute('data-aside')).toBe(false)
        expect(root().getPropertyValue('--mateu-fab-inset-end')).toBe('')
        render('', fabHost)
        content.remove()
        fabHost.remove()
        await settle()
    })

    it('gives the channel to the outermost content view, not to one nested in it', () => {
        const outer = document.createElement('div')
        const inner = document.createElement('div')
        outer.appendChild(inner)
        document.body.appendChild(outer)
        outer.getBoundingClientRect = () => ({ right: 1664 } as DOMRect)
        inner.getBoundingClientRect = () => ({ right: 1000 } as DOMRect)
        Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })

        const releaseOuter = trackFabAnchor(outer, 'edge')
        const releaseInner = trackFabAnchor(inner, 'fixed')
        expect(root().getPropertyValue('--mateu-fab-inset-end')).toBe('0px')
        expect(root().getPropertyValue('--mateu-fab-inset-bottom')).toBe('0px')

        releaseOuter()
        // the inner view is the content view now: fixed, no FABs, so its end edge + one gap
        expect(root().getPropertyValue('--mateu-fab-inset-end')).toBe('868px')
        releaseInner()
        outer.remove()
    })

    it('tells a section index where it goes', async () => {
        const content = document.createElement('div')
        const page = document.createElement('div')
        content.appendChild(page)
        document.body.appendChild(content)
        content.getBoundingClientRect = () => ({ right: 1920 } as DOMRect)
        Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })
        const placements: AsidePlacement[] = []

        const withdraw = requestAside(page, placement => placements.push(placement))
        expect(placements).toEqual(['column'])
        const release = trackFabAnchor(content, 'full')
        await settle()
        expect(placements.at(-1)).toBe('aside')
        expect(content.style.getPropertyValue('--mateu-aside-pad-end')).toBe('288px')

        release()
        expect(placements.at(-1)).toBe('column')
        withdraw()
        content.remove()
    })

    it('puts the AI FAB flush in the corner, and the column above it only where the two meet', async () => {
        expect(cornerFabPosition()).toBe('bottom: 0; right: 0;')
        // the column is over the corner when its end inset is less than a FAB and its gap (52px)
        expect(columnOverCorner(0, 16)).toBe(true)
        expect(columnOverCorner(16, 16)).toBe(true)
        expect(columnOverCorner(204, 16)).toBe(false)

        const fabHost = document.createElement('div')
        document.body.appendChild(fabHost)
        render(html`<button ${onFabRail('corner')}></button><button ${onFabRail('page', 0)}></button>`, fabHost)
        await settle()
        // no content view: the column is in the corner, so it starts above the AI FAB
        expect(root().getPropertyValue('--mateu-fab-stack-bottom')).not.toBe('')
        expect(root().getPropertyValue('--mateu-fab-shell-slots')).toBe('0')
        expect(root().getPropertyValue('--mateu-fab-slots')).toBe('2')

        // a fixed page: the column is in its channel, away from the corner — no stacking
        const content = document.createElement('div')
        document.body.appendChild(content)
        content.getBoundingClientRect = () => ({ right: 1664 } as DOMRect)
        Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })
        const release = trackFabAnchor(content, 'fixed')
        expect(root().getPropertyValue('--mateu-fab-inset-end')).toBe('204px')
        expect(root().getPropertyValue('--mateu-fab-stack-bottom')).toBe('')
        release()

        // an edge-to-edge page: the column is the corner's, so it starts above the AI FAB
        const releaseEdge = trackFabAnchor(content, 'edge')
        expect(root().getPropertyValue('--mateu-fab-stack-bottom')).not.toBe('')
        releaseEdge()

        render('', fabHost)
        await settle()
        expect(root().getPropertyValue('--mateu-fab-stack-bottom')).toBe('')
        content.remove()
        fabHost.remove()
    })
})
