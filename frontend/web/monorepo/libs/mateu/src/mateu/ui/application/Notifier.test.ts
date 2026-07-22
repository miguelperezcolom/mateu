import { describe, it, expect, vi } from 'vitest'
import { notify, setNotifier, Notifier, ToastMessage } from '@application/Notifier.ts'

describe('Notifier port', () => {
    it('delegates notify() to the registered adapter with message and initiator', () => {
        const seen: { message: ToastMessage; initiator: HTMLElement }[] = []
        const fake: Notifier = { show: (message, initiator) => seen.push({ message, initiator }) }
        setNotifier(fake)

        const initiator = {} as HTMLElement
        notify({ text: 'hello', variant: 'success' }, initiator)

        expect(seen).toHaveLength(1)
        expect(seen[0].message.text).toBe('hello')
        expect(seen[0].message.variant).toBe('success')
        expect(seen[0].initiator).toBe(initiator)
    })

    it('the last registered adapter wins (composition root override)', () => {
        const a = { show: vi.fn() }
        const b = { show: vi.fn() }
        setNotifier(a)
        setNotifier(b)

        notify({ text: 'x' }, {} as HTMLElement)

        expect(a.show).not.toHaveBeenCalled()
        expect(b.show).toHaveBeenCalledOnce()
    })
})
