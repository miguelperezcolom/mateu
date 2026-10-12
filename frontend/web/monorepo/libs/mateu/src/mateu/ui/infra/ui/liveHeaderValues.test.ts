import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { headerValuesList, onHeaderValuesChanged, resetHeaderValues, seedHeaderValues, STORAGE_KEY, updateHeaderValue } from './headerValues'
import { headerChangesOf, reconnectDelay, shouldLead, STALE_MS } from './liveUpdates'

const memoryStorage = (): Storage => {
    const m = new Map<string, string>()
    return {
        get length() { return m.size },
        clear: () => m.clear(),
        getItem: (k) => m.get(k) ?? null,
        setItem: (k, v) => { m.set(k, String(v)) },
        removeItem: (k) => { m.delete(k) },
        key: (i) => [...m.keys()][i] ?? null,
    }
}

beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()))
afterEach(() => { resetHeaderValues(); vi.unstubAllGlobals() })

describe('header values store', () => {
    it('is seeded from the shell and changed by id, keeping the label', () => {
        seedHeaderValues([{ id: 'businessDate', label: 'Business date', value: '12 Oct' }])
        const seen: string[] = []
        onHeaderValuesChanged(() => seen.push(headerValuesList()[0].value ?? ''))
        updateHeaderValue('businessDate', '13 Oct', { quiet: true })
        expect(headerValuesList()).toEqual([{ id: 'businessDate', label: 'Business date', value: '13 Oct' }])
        expect(seen).toEqual(['13 Oct'])
    })

    it('tells the other tabs through storage, unless the change came from one', () => {
        updateHeaderValue('shift', 'Night', { quiet: true })
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toMatchObject({ id: 'shift', value: 'Night' })
        localStorage.removeItem(STORAGE_KEY)
        updateHeaderValue('shift', 'Morning', { quiet: true, broadcast: false })
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })

    it('ignores a change to the same value', () => {
        seedHeaderValues([{ id: 'x', value: 'a' }])
        let calls = 0
        onHeaderValuesChanged(() => calls++)
        updateHeaderValue('x', 'a', { quiet: true })
        expect(calls).toBe(0)
    })
})

describe('live updates stream', () => {
    it('elects one leader per browser and replaces a silent one', () => {
        expect(shouldLead(null, 'me', 1000)).toBe(true)
        expect(shouldLead({ tab: 'me', at: 0 }, 'me', 1000)).toBe(true)
        expect(shouldLead({ tab: 'other', at: 1000 }, 'me', 2000)).toBe(false)
        expect(shouldLead({ tab: 'other', at: 0 }, 'me', STALE_MS + 1)).toBe(true)
    })

    it('reconnects at once after a clean end and backs off on errors', () => {
        expect(reconnectDelay(0)).toBe(1000)
        expect(reconnectDelay(1)).toBe(2000)
        expect(reconnectDelay(3)).toBe(8000)
        expect(reconnectDelay(20)).toBe(60000)
    })

    it('reads the header-value commands of an increment', () => {
        expect(headerChangesOf({
            commands: [
                { type: 'UpdateHeaderValue', data: { id: 'businessDate', value: '13 Oct' } },
                { type: 'NavigateTo', data: '/x' },
            ],
        })).toEqual([{ id: 'businessDate', value: '13 Oct' }])
        expect(headerChangesOf({})).toEqual([])
    })
})
