// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import { renderPageFabs } from './pageRenderer'

describe('page FABs', () => {
    it('dispatch FROM the button, so the listener that wraps them (the api caller) hears it', () => {
        // The container is the page's mateu-component HOST; its listener sits on an element INSIDE
        // it, around the page. Dispatched on the host the event never passed that listener and was
        // dropped as unhandled — every page FAB was a dead click.
        const host = document.createElement('div')
        const listener = document.createElement('div')
        host.appendChild(listener)
        document.body.appendChild(host)
        const heard: string[] = []
        listener.addEventListener('action-requested', (e) => heard.push((e as CustomEvent).detail.actionId))
        render(renderPageFabs(host as any, [{ id: 'add', actionId: 'add', icon: 'vaadin:plus', label: 'Add' } as any]), listener)
        listener.querySelector('button')!.click()
        expect(heard).toEqual(['add'])
        host.remove()
    })
})
