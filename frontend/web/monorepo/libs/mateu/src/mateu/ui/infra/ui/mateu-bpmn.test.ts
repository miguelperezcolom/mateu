// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

// bpmn-js needs a real layout engine; the contract under test is only what the element does when
// the import FAILS, so the viewer is a stand-in whose importXML rejects like bpmn-js does for a
// process without diagram interchange.
vi.mock('bpmn-js', () => ({
    default: class {
        importXML() { return Promise.reject(new Error('no diagram to display')) }
        destroy() {}
    },
}))

import './mateu-bpmn'

describe('mateu-bpmn', () => {
    it('says why a diagram cannot be displayed instead of an unhandled rejection and a blank box', async () => {
        const unhandled = vi.fn()
        process.on('unhandledRejection', unhandled)
        const el = document.createElement('mateu-bpmn') as any
        document.body.appendChild(el)
        el.xml = '<definitions/>'
        await vi.waitFor(() => {
            expect(el.shadowRoot.querySelector('.failure')?.textContent).toContain('no diagram to display')
        })
        expect(unhandled).not.toHaveBeenCalled()
        process.off('unhandledRejection', unhandled)
        el.remove()
    })
})
