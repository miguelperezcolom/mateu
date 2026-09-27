// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render } from 'lit'
import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import type { MateuApp } from '@infra/ui/mateu-app.ts'
import { renderChatToggle } from './appRenderer'

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
        expect(button!.getAttribute('aria-label')).toBe('Chat')
        expect(button!.getAttribute('title')).toBe('Chat')
        expect(button!.getAttribute('aria-pressed')).toBe('false')
        expect(button!.classList.contains('mateu-chat-toggle--open')).toBe(false)
        ;(button as HTMLButtonElement).click()
        expect(showHideIa).toHaveBeenCalledOnce()
    })

    it('reads as pressed while the panel is open', () => {
        const { button } = renderToggle('/chat', true)
        expect(button!.getAttribute('aria-pressed')).toBe('true')
        expect(button!.getAttribute('title')).toBe('Cerrar el chat')
        expect(button!.classList.contains('mateu-chat-toggle--open')).toBe(true)
    })
})
