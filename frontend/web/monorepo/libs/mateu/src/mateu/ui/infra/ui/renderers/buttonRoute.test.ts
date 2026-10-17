// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'lit'
import { renderButton, resolvedRoute } from './buttonRenderer'

/**
 * A button carrying a route navigates on the client. A route whose `${…}` cannot be resolved —
 * the value is missing or blank — is not a route: `/p/${state.id}` with no id must not become
 * `/p/` and navigate there. The button is drawn disabled and a click does nothing (warned once).
 */
const button = (route: string) => ({ type: 'Button', label: 'Open', actionId: 'open', route }) as any

afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = '' })

describe('button routes', () => {
    it('resolve when every expression has a value', () => {
        expect(resolvedRoute(button('/p/${state.id}'), { id: 7 })).toBe('/p/7')
        expect(resolvedRoute(button('/p/${state.id}'), { id: 0 })).toBe('/p/0')
        expect(resolvedRoute(button('/plain'), {})).toBe('/plain')
    })

    it('do not resolve when a value is missing or blank', () => {
        expect(resolvedRoute(button('/p/${state.id}'), {})).toBeUndefined()
        expect(resolvedRoute(button('/p/${state.id}'), { id: '' })).toBeUndefined()
        expect(resolvedRoute(button('/p/${state.id}/x/${state.other}'), { id: 1 })).toBeUndefined()
    })

    it('a button with an unresolved route is disabled, and clicking it neither navigates nor runs an action', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const host = document.createElement('div')
        document.body.appendChild(host)
        render(renderButton({ id: 'b', type: 'ClientSide', metadata: button('/p/${state.id}') } as any, {}, {}), host)
        const el = host.querySelector('button') as HTMLButtonElement
        expect(el.disabled).toBe(true)
        expect(el.dataset.route).toBeUndefined()
        const events: string[] = []
        for (const type of ['action-requested', 'route-changed', 'navigate-to-requested']) {
            document.addEventListener(type, () => events.push(type))
        }
        el.disabled = false // a click that reaches the handler anyway
        el.click()
        el.click()
        expect(events).toEqual([])
        expect(warn).toHaveBeenCalledTimes(1)
    })
})
