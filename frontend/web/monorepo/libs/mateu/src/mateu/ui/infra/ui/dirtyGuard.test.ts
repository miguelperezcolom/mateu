import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dirtyGuard } from './dirtyGuard'

// dirtyGuard talks to `document` / `window` directly; stub the two entry points
// it uses so the wiring can be verified without a DOM implementation.
const documentListeners: Record<string, EventListener> = {}
const windowListeners: Record<string, EventListener> = {}

vi.stubGlobal('document', {
    addEventListener: (type: string, listener: EventListener) => {
        documentListeners[type] = listener
    },
})
vi.stubGlobal('window', {
    addEventListener: (type: string, listener: EventListener) => {
        windowListeners[type] = listener
    },
    confirm: vi.fn(),
})

const confirmMock = window.confirm as ReturnType<typeof vi.fn>

describe('dirtyGuard', () => {
    beforeEach(() => {
        dirtyGuard.markClean()
        confirmMock.mockReset()
    })

    it('starts clean and toggles via markDirty/markClean', () => {
        expect(dirtyGuard.dirty).toBe(false)
        dirtyGuard.markDirty()
        expect(dirtyGuard.dirty).toBe(true)
        dirtyGuard.markClean()
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('install wires the dirty/clean document listeners and beforeunload once', () => {
        dirtyGuard.install()
        expect(Object.keys(documentListeners).sort()).toEqual(['clean', 'dirty'])
        expect(Object.keys(windowListeners)).toEqual(['beforeunload'])

        // idempotent: a second install must not re-register
        const dirtyListener = documentListeners['dirty']
        delete documentListeners['dirty']
        dirtyGuard.install()
        expect(documentListeners['dirty']).toBeUndefined()
        documentListeners['dirty'] = dirtyListener
    })

    it('sets/clears the dirty flag from the document dirty/clean events', () => {
        dirtyGuard.install()
        documentListeners['dirty'](new CustomEvent('dirty'))
        expect(dirtyGuard.dirty).toBe(true)
        documentListeners['clean'](new CustomEvent('clean'))
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('confirmLeave allows navigation without prompting when clean', () => {
        expect(dirtyGuard.confirmLeave()).toBe(true)
        expect(confirmMock).not.toHaveBeenCalled()
    })

    it('confirmLeave prompts when dirty and clears the flag when confirmed', () => {
        dirtyGuard.markDirty()
        confirmMock.mockReturnValue(true)
        expect(dirtyGuard.confirmLeave()).toBe(true)
        expect(confirmMock).toHaveBeenCalledWith(dirtyGuard.message)
        // confirming clears the dirty state so a follow-up navigation does not prompt twice
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('confirmLeave blocks navigation and stays dirty when the user cancels', () => {
        dirtyGuard.markDirty()
        confirmMock.mockReturnValue(false)
        expect(dirtyGuard.confirmLeave()).toBe(false)
        expect(dirtyGuard.dirty).toBe(true)
    })

    it('beforeunload triggers the native prompt only when dirty', () => {
        dirtyGuard.install()
        const preventDefault = vi.fn()

        const cleanEvent = { preventDefault, returnValue: 'untouched' } as unknown as BeforeUnloadEvent
        windowListeners['beforeunload'](cleanEvent as unknown as Event)
        expect(preventDefault).not.toHaveBeenCalled()
        expect((cleanEvent as any).returnValue).toBe('untouched')

        dirtyGuard.markDirty()
        const dirtyEvent = { preventDefault, returnValue: 'untouched' } as unknown as BeforeUnloadEvent
        windowListeners['beforeunload'](dirtyEvent as unknown as Event)
        expect(preventDefault).toHaveBeenCalledTimes(1)
        expect((dirtyEvent as any).returnValue).toBe('')
    })
})
