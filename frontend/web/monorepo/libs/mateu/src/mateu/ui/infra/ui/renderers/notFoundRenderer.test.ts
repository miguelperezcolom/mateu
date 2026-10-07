// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { renderNotFound } from './notFoundRenderer'

/** The page a route renders when the record it names does not exist (a deleted stay, a wrong link). */
describe('the not-found page', () => {
    const draw = (metadata: Record<string, unknown>) => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const component = { type: 'ClientSide', id: 'not-found', metadata: { type: 'NotFound', ...metadata }, children: [] } as unknown as ClientSideComponent
        render(renderNotFound(component), host)
        return host.querySelector('.mateu-not-found') as HTMLElement
    }

    afterEach(() => {
        document.body.innerHTML = ''
        document.documentElement.lang = ''
    })

    it("heads the page with the server's message, under an icon", () => {
        const page = draw({ title: 'Reserva FO-X6JB7F no encontrada', message: 'Puede que se haya borrado o que el enlace no sea correcto.' })
        expect(page.querySelector('h2')!.textContent).toBe('Reserva FO-X6JB7F no encontrada')
        expect(page.querySelector('.mateu-not-found-message')!.textContent).toBe('Puede que se haya borrado o que el enlace no sea correcto.')
        expect(page.querySelector('.mateu-not-found-icon')).not.toBeNull()
        expect(page.querySelector('.mateu-not-found-icon')!.getAttribute('aria-hidden')).toBe('true')
    })

    it('is centered and drawn with the theme tokens, so it follows light and dark', () => {
        const style = draw({ title: 'x' }).getAttribute('style')!
        expect(style).toContain('align-items: center')
        expect(style).toContain('text-align: center')
        expect(style).toContain('var(--lumo-secondary-text-color')
    })

    it('falls back to a generic heading and line in the page language', () => {
        document.documentElement.lang = 'es'
        const page = draw({})
        expect(page.querySelector('h2')!.textContent).toBe('No encontrado')
        expect(page.querySelector('.mateu-not-found-message')!.textContent).toContain('borrado')
        document.documentElement.lang = 'en'
        expect(draw({}).querySelector('h2')!.textContent).toBe('Not found')
    })

    it('offers the way back as an in-app navigation to the back route', () => {
        const page = draw({ title: 'x', backRoute: '/reservas', backLabel: 'Volver' })
        const link = page.querySelector('a.mateu-not-found-back') as HTMLAnchorElement
        expect(link.getAttribute('href')).toBe('/reservas')
        expect(link.textContent).toContain('Volver')

        const heard: Array<[string, string]> = []
        for (const type of ['route-changed', 'navigate-to-requested']) {
            document.body.addEventListener(type, (e) => heard.push([type, (e as CustomEvent).detail.route]))
        }
        const click = new MouseEvent('click', { bubbles: true, cancelable: true })
        const prevent = vi.spyOn(click, 'preventDefault')
        link.dispatchEvent(click)
        expect(prevent).toHaveBeenCalled()
        expect(heard).toEqual([['route-changed', '/reservas'], ['navigate-to-requested', '/reservas']])
    })

    it('has no way back when the server names none', () => {
        expect(draw({ title: 'x' }).querySelector('a')).toBeNull()
    })
})
