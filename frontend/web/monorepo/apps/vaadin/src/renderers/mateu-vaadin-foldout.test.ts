// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-vaadin-foldout'
import type { MateuVaadinFoldout } from './mateu-vaadin-foldout'

/**
 * The Vaadin foldout (Foldout archetype): the overview column with its title/badges/object
 * navigation, one section per panel FIXED to its declared width, and a panel sent with open=false
 * drawn as a narrow strip that opens on click (and folds back). Geometry (pinning, snapping) needs
 * a layout jsdom does not have; the structure and the interactions are pinned here.
 */
describe('mateu-vaadin-foldout', () => {
    const mount = async (props: Partial<MateuVaadinFoldout>) => {
        const f = document.createElement('mateu-vaadin-foldout') as MateuVaadinFoldout
        Object.assign(f, props)
        const actions: string[] = []
        f.addEventListener('action-requested', (e) => actions.push((e as CustomEvent).detail.actionId))
        document.body.appendChild(f)
        await f.updateComplete
        return { f, actions, $: (s: string) => f.shadowRoot!.querySelector(s) as HTMLElement,
            $$: (s: string) => Array.from(f.shadowRoot!.querySelectorAll(s)) as HTMLElement[] }
    }

    afterEach(() => { document.body.innerHTML = '' })

    it('the overview carries the title and badges; one section per panel with its slot', async () => {
        const { $, $$ } = await mount({ headerTitle: 'Booking 42', badges: ['VIP', 'Late'],
            panels: [{ id: 'p0', title: 'Operations' }, { id: 'p1', title: 'Profile', subtitle: 'Guest' }] as never })
        expect($('.section--first .section-title').textContent).toBe('Booking 42')
        expect($$('.section-badge').map(b => b.textContent)).toEqual(['VIP', 'Late'])
        const panels = $$('section[part~="panel"]')
        expect(panels.map(p => p.getAttribute('data-node-id'))).toEqual(['p0', 'p1'])
        expect(panels[1].textContent).toContain('Guest')
        expect($('slot[name="overview"]')).not.toBeNull()
    })

    it('a declared panel width fixes the section (no width → the default)', async () => {
        const { $$ } = await mount({ panels: [{ title: 'Wide', width: '38rem' }, { title: 'Default' }] as never })
        const [wide, plain] = $$('section[part~="panel"]')
        expect(wide.getAttribute('style')).toContain('38rem')
        expect(plain.getAttribute('style') ?? '').not.toContain('38rem')
    })

    it('a panel sent folded is a strip that opens on click, and folds back', async () => {
        const { f, $, $$ } = await mount({ panels: [{ title: 'Profile', open: false }] as never })
        const strip = $('section.strip .strip-button')
        expect(strip.getAttribute('aria-expanded')).toBe('false')
        expect(strip.textContent).toContain('Profile')
        strip.click()
        await f.updateComplete
        expect($$('section.strip')).toHaveLength(0)
        const fold = $('.panel-fold')
        expect(fold.getAttribute('aria-expanded')).toBe('true')
        fold.click()
        await f.updateComplete
        expect($$('section.strip')).toHaveLength(1)
    })

    it('the user\'s open/closed choice survives a re-render with the same panels', async () => {
        const panels = [{ id: 'a', title: 'A', open: false }]
        const { f, $, $$ } = await mount({ panels: panels as never })
        $('section.strip .strip-button').click()
        await f.updateComplete
        f.panels = [...panels] as never
        await f.updateComplete
        expect($$('section.strip')).toHaveLength(0)
    })

    it('object navigation and Edit dispatch their actions', async () => {
        const { $, $$, actions } = await mount({
            navigation: { parentActionId: 'backToList', parentLabel: 'Bookings', previousActionId: 'prev', nextActionId: 'next' } as never,
            overviewEditActionId: 'edit', panels: [] as never,
        })
        expect($('.tb-parent').textContent).toContain('Bookings')
        $('.tb-parent').click()
        $$('.tb-move').forEach(b => b.click())
        $('.tb-edit').click()
        expect(actions).toEqual(['backToList', 'prev', 'next', 'edit'])
        expect($$('.tb-move').map(b => b.getAttribute('aria-label'))).toEqual(['Previous', 'Next'])
    })

    it('no title, badges or navigation: no header at all', async () => {
        const { $ } = await mount({ panels: [] as never })
        expect($('.section-head')).toBeNull()
    })
})
