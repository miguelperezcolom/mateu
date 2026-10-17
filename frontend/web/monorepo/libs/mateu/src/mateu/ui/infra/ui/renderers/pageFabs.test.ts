// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { LitElement, render } from 'lit'
import type Fab from '@mateu/shared/apiClients/dtos/componentmetadata/Fab'
import { renderPageFabs } from './pageRenderer'

/** A page FAB has to reach the component the way every button does. The component listens for
 *  `action-requested` on the element wrapping its content — BELOW its own host — so a FAB that fired
 *  the event on the host went past it to the ancestors and did nothing, on every backend. */
describe('a page FAB', () => {
    it('dispatches its action from inside the content, where the component listens', () => {
        const host = document.createElement('div') // the component's host
        const content = document.createElement('div') // the wrapper the component listens on
        host.appendChild(content)
        document.body.appendChild(host)
        const heard: string[] = []
        content.addEventListener('action-requested', (e) => heard.push((e as CustomEvent).detail.actionId))

        render(renderPageFabs(host as unknown as LitElement, [{ icon: 'vaadin:plus', actionId: 'add', label: 'Add' } as Fab]), content)
        ;(content.querySelector('.page-fab') as HTMLButtonElement).click()

        expect(heard).toEqual(['add'])
        host.remove()
    })

    it('dispatches FROM the button, so the listener that wraps it (the api caller) hears it', () => {
        // The container is the page's mateu-component HOST; its listener sits on an element INSIDE
        // it, around the page. Dispatched on the host the event never passed that listener and was
        // dropped as unhandled — every page FAB was a dead click.
        const host = document.createElement('div')
        const listener = document.createElement('div')
        host.appendChild(listener)
        document.body.appendChild(host)
        const heard: string[] = []
        listener.addEventListener('action-requested', (e) => heard.push((e as CustomEvent).detail.actionId))
        render(renderPageFabs(host as unknown as LitElement, [{ id: 'add', actionId: 'add', icon: 'vaadin:plus', label: 'Add' } as unknown as Fab]), listener)
        listener.querySelector('button')!.click()
        expect(heard).toEqual(['add'])
        host.remove()
    })
})
