// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'lit'
import { renderBadge } from './badgeRenderer'

const draw = (metadata: Record<string, unknown>) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    render(renderBadge({ type: 'ClientSide', id: 'b', metadata: { type: 'Badge', ...metadata }, children: [] } as any, {}, {}) as any, host)
    return host.firstElementChild as HTMLElement
}
afterEach(() => { document.body.innerHTML = '' })

describe('Badge icons', () => {
    it('iconOnLeft is drawn before the text and iconOnRight after it', () => {
        const left = draw({ text: 'Paid', color: 'success', iconOnLeft: 'vaadin:check' })
        expect(left.textContent?.trim()).toBe('Paid')
        expect(left.firstElementChild?.getAttribute('data-icon')).toBe('vaadin:check')
        const right = draw({ text: 'Details', iconOnRight: 'vaadin:arrow-right' })
        expect(right.lastElementChild?.getAttribute('data-icon')).toBe('vaadin:arrow-right')
    })

    it('a badge without icons is just its text', () => {
        expect(draw({ text: 'Pending' }).querySelector('[data-icon]')).toBeNull()
    })
})
