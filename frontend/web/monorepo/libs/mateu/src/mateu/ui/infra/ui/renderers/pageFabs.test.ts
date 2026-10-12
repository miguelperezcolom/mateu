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
    })
})
