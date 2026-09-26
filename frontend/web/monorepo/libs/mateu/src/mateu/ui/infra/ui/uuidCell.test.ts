// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import { abbreviateUuid, isUuid, uuidAwareText } from './uuidCell'

/**
 * A listing cell holding a UUID shows "…-<last block>", keeps the whole UUID in its tooltip and puts
 * the whole UUID on the clipboard; anything else is shown untouched.
 */
describe('uuidCell', () => {

    const uuid = '750f3bce-b760-4370-9ceb-0994d4bb705b'

    it('recognises a canonical UUID only when it is the whole value', () => {
        expect(isUuid(uuid)).toBe(true)
        expect(isUuid(uuid.toUpperCase())).toBe(true)
        expect(isUuid(`process ${uuid}`)).toBe(false)
        expect(isUuid('750f3bce-b760-4370-9ceb')).toBe(false)
        expect(isUuid('MRU01')).toBe(false)
        expect(isUuid(42)).toBe(false)
        expect(isUuid(null)).toBe(false)
    })

    it('abbreviates a UUID to its last block and leaves anything else as it is', () => {
        expect(abbreviateUuid(uuid)).toBe('…-0994d4bb705b')
        expect(abbreviateUuid('CU838F')).toBe('CU838F')
        expect(abbreviateUuid(7)).toBe(7)
    })

    it('renders the abbreviation with the whole UUID in the tooltip and on the clipboard', () => {
        const host = document.createElement('div')
        render(uuidAwareText(uuid), host)
        const span = host.querySelector('span.mateu-uuid') as HTMLElement
        expect(span.textContent).toBe('…-0994d4bb705b')
        expect(span.title).toBe(uuid)
        expect(span.dataset.uuid).toBe(uuid)

        const data = new Map<string, string>()
        const copy = new Event('copy', { bubbles: true, cancelable: true }) as any
        copy.clipboardData = { setData: (type: string, value: string) => data.set(type, value) }
        span.dispatchEvent(copy)
        expect(data.get('text/plain')).toBe(uuid)
        expect(copy.defaultPrevented).toBe(true)
    })

    it('renders a value that is not a UUID as plain text', () => {
        const host = document.createElement('div')
        render(uuidAwareText('MRU01'), host)
        expect(host.querySelector('span.mateu-uuid')).toBeNull()
        expect(host.textContent).toBe('MRU01')
    })
})
