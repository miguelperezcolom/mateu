// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { html, render } from 'lit'
import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import type { MateuApp } from '@infra/ui/mateu-app.ts'
import { componentRenderer, type ComponentRenderer, type HeaderIconButton } from './ComponentRenderer'
import { renderChatToggle, renderHeaderIconButton, renderThemeToggle } from './appRenderer'

/**
 * The agent's chat is opened from a header widget, not a FAB: a conversation-icon button, only when
 * the app declares the chat, named for assistive tech and pressed while the panel is open.
 */
describe('the chat toggle in the app header', () => {
    const renderToggle = (sseUrl: string | undefined, chatOpen: boolean) => {
        const host = document.createElement('div')
        const showHideIa = vi.fn()
        const container = { chatOpen, showHideIa } as unknown as MateuApp
        render(renderChatToggle({ sseUrl } as App, container), host)
        return { button: host.querySelector('button.mateu-chat-toggle'), showHideIa }
    }

    it('is not there when the app declares no chat', () => {
        expect(renderToggle(undefined, false).button).toBeNull()
    })

    it('is a named, unpressed button that toggles the panel', () => {
        const { button, showHideIa } = renderToggle('/chat', false)
        expect(button).not.toBeNull()
        expect(button!.getAttribute('aria-label')).toBe('Assistant')
        expect(button!.getAttribute('title')).toBe('Open the assistant')
        expect(button!.getAttribute('aria-pressed')).toBe('false')
        expect(button!.classList.contains('mateu-chat-toggle--open')).toBe(false)
        ;(button as HTMLButtonElement).click()
        expect(showHideIa).toHaveBeenCalledOnce()
    })

    it('reads as pressed while the panel is open', () => {
        const { button } = renderToggle('/chat', true)
        expect(button!.getAttribute('aria-pressed')).toBe('true')
        expect(button!.getAttribute('title')).toBe('Close the assistant')
        expect(button!.classList.contains('mateu-chat-toggle--open')).toBe(true)
    })

    it('draws the outline conversation icon', () => {
        const { button } = renderToggle('/chat', false)
        expect(button!.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('vaadin:comments-o')
    })
})

describe('the theme toggle in the app header', () => {
    const renderToggle = (themeToggle: boolean, isDark: boolean) => {
        const host = document.createElement('div')
        const toggleTheme = vi.fn()
        render(renderThemeToggle({ themeToggle } as App, { isDark, toggleTheme } as unknown as MateuApp), host)
        return { button: host.querySelector('button.mateu-theme-toggle'), toggleTheme }
    }

    it('is not there unless the app asks for it', () => {
        expect(renderToggle(false, false).button).toBeNull()
    })

    it('offers the dark theme with an outline moon, and is not a two-state button', () => {
        const { button, toggleTheme } = renderToggle(true, false)
        expect(button!.getAttribute('aria-label')).toBe('Switch to dark mode')
        expect(button!.hasAttribute('aria-pressed')).toBe(false)
        expect(button!.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('vaadin:moon-o')
        ;(button as HTMLButtonElement).click()
        expect(toggleTheme).toHaveBeenCalledOnce()
    })

    it('offers the light theme with an outline sun when dark', () => {
        const { button } = renderToggle(true, true)
        expect(button!.getAttribute('aria-label')).toBe('Switch to light mode')
        expect(button!.querySelector('[data-icon]')!.getAttribute('data-icon')).toBe('vaadin:sun-o')
    })
})

describe('a header icon button', () => {
    afterEach(() => componentRenderer.set({} as ComponentRenderer))

    it('is drawn by the active renderer when it has its own (the Vaadin adapter: a tertiary icon vaadin-button)', () => {
        const seen: HeaderIconButton[] = []
        componentRenderer.set({
            renderHeaderIconButton: (b: HeaderIconButton) => { seen.push(b); return html`<x-ds-button aria-label="${b.label}"></x-ds-button>` },
        } as unknown as ComponentRenderer)
        const host = document.createElement('div')
        render(renderHeaderIconButton({ icon: 'vaadin:comments-o', label: 'Assistant', pressed: true, onClick: () => {} }), host)
        expect(host.querySelector('x-ds-button')!.getAttribute('aria-label')).toBe('Assistant')
        expect(seen[0].pressed).toBe(true)
    })

    it('falls back to a neutral button that takes the header font', () => {
        const host = document.createElement('div')
        render(renderHeaderIconButton({ icon: 'vaadin:moon-o', label: 'Dark', onClick: () => {} }), host)
        const button = host.querySelector('button.app-chrome-icon-btn')
        expect(button).not.toBeNull()
        expect(button!.getAttribute('title')).toBe('Dark')
    })
})
