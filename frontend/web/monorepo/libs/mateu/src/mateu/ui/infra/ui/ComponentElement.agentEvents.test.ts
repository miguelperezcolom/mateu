// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { MateuComponent } from './mateu-component'
import { agentMayDispatch } from './agentEventPolicy'

/**
 * NM9: an agent may dispatch a custom event only while a component on screen subscribes to it
 * (`@SubscribeTo` → an OnCustomEvent trigger). The component declares it when it registers its
 * listeners and releases it when it leaves the page.
 */
afterEach(() => { document.body.innerHTML = '' })

describe('a component declares the events it subscribes to', () => {
    it('while it is on the page', () => {
        const el = new MateuComponent() as any
        el.id = 'p'
        el.component = { id: 'p', type: 'ServerSide', serverSideType: 'x.Page', children: [],
            triggers: [{ type: 'OnCustomEvent', eventName: 'booking-changed', actionId: 'reload', source: 'DOCUMENT' }] }
        el.state = {}
        el.data = {}
        expect(agentMayDispatch('booking-changed')).toBe(false)
        document.body.appendChild(el)
        el.triggerOnLoad()
        expect(agentMayDispatch('booking-changed')).toBe(true)
        el.remove()
        expect(agentMayDispatch('booking-changed')).toBe(false)
    })
})
