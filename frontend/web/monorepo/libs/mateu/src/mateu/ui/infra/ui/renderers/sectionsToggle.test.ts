// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'lit'
import type { MateuApp } from '@infra/ui/mateu-app.ts'
import { componentRenderer, type ComponentRenderer } from './ComponentRenderer'
import { renderSectionsToggle } from './appRenderer'

/**
 * HAMBURGER_SECTIONS' hamburger is one more of the header's icon buttons — the same drawing as the
 * chat and theme toggles, not a heavier glyph of its own — and turns into a close icon while the
 * sections are open, as Redwood's does.
 */
describe("the sections' hamburger", () => {
    afterEach(() => componentRenderer.set({} as ComponentRenderer))

    const draw = (sectionsOpen: boolean) => {
        const host = document.createElement('div')
        const container = { sectionsOpen } as unknown as MateuApp
        render(renderSectionsToggle(container), host)
        return { button: host.querySelector('button.mateu-sections-toggle') as HTMLButtonElement, container, host }
    }

    it('is a header icon button with the thin menu glyph, collapsed', () => {
        const { button } = draw(false)
        expect(button.classList.contains('app-chrome-icon-btn')).toBe(true)
        expect(button.getAttribute('aria-label')).toBe('Sections')
        expect(button.getAttribute('aria-expanded')).toBe('false')
        expect(button.getAttribute('aria-controls')).toBe('mateu-sections-panel')
        expect(button.hasAttribute('aria-pressed')).toBe(false)
        expect(button.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('lumo:menu')
    })

    it('shows a close icon while the sections are open', () => {
        const { button } = draw(true)
        expect(button.getAttribute('aria-expanded')).toBe('true')
        expect(button.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('lumo:cross')
    })

    it('opens and closes the sections', () => {
        const { button, container } = draw(false)
        button.click()
        expect(container.sectionsOpen).toBe(true)
        button.click()
        expect(container.sectionsOpen).toBe(false)
    })
})
