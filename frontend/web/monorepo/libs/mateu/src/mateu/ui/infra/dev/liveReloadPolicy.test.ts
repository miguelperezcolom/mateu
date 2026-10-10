import { describe, expect, it } from 'vitest'
import { decideLiveReload, devEventsUrl, strongest } from './liveReloadPolicy'

describe('decideLiveReload', () => {
    it('the first hello only records the boot id', () => {
        expect(decideLiveReload({ type: 'hello', bootId: 'a' }, undefined))
            .toEqual({ action: 'none', bootId: 'a', reason: undefined })
    })

    it('a hello from the SAME server (a dropped connection) changes nothing', () => {
        expect(decideLiveReload({ type: 'hello', bootId: 'a' }, 'a').action).toBe('none')
    })

    it('a hello from a RESTARTED server re-renders the page', () => {
        const decision = decideLiveReload({ type: 'hello', bootId: 'b' }, 'a')
        expect(decision.action).toBe('page')
        expect(decision.bootId).toBe('b')
        expect(decision.reason).toBe('server restarted')
    })

    it('a page-scoped spec change re-renders the page, an app-scoped one remounts the app', () => {
        expect(decideLiveReload({ type: 'specs-changed', scope: 'page', files: ['specs/ui/a.yaml'] }, 'x'))
            .toEqual({ action: 'page', bootId: 'x', reason: 'a.yaml' })
        expect(decideLiveReload({ type: 'specs-changed', scope: 'app', files: [] }, 'x').action).toBe('app')
    })

    it('summarises many files', () => {
        expect(decideLiveReload({ type: 'specs-changed', files: ['a/x.yaml', 'b.yaml', 'c.yaml'] }, 'x').reason)
            .toBe('x.yaml and 2 more')
    })

    it('an IDE reload request re-renders with its scope', () => {
        expect(decideLiveReload({ type: 'reload', scope: 'page' }, 'x').action).toBe('page')
        expect(decideLiveReload({ type: 'reload', scope: 'app' }, 'x').action).toBe('app')
    })

    it('pings, unknown messages and garbage are ignored', () => {
        expect(decideLiveReload({ type: 'ping' }, 'x').action).toBe('none')
        expect(decideLiveReload({ type: 'whatever' }, 'x').action).toBe('none')
        expect(decideLiveReload(undefined, 'x')).toEqual({ action: 'none', bootId: 'x' })
    })
})

describe('strongest', () => {
    it('an app remount absorbs a page reload', () => {
        expect(strongest('page', 'app')).toBe('app')
        expect(strongest('app', 'page')).toBe('app')
        expect(strongest('none', 'page')).toBe('page')
    })
})

describe('devEventsUrl', () => {
    const doc = (content?: string) => ({
        querySelector: (selector: string) =>
            selector === 'meta[name="mateu-dev"]' && content !== undefined ? { content } : null,
    }) as unknown as Document

    it('is read off the meta tag a dev-mode backend stamps on the index', () => {
        expect(devEventsUrl(doc('/mateu/dev/events'), {})).toBe('/mateu/dev/events')
    })

    it('is absent outside dev mode', () => {
        expect(devEventsUrl(doc(), {})).toBeUndefined()
    })

    it('a host may point at one explicitly', () => {
        expect(devEventsUrl(doc(), { __MATEU_DEV_EVENTS__: 'http://localhost:8080/mateu/dev/events' }))
            .toBe('http://localhost:8080/mateu/dev/events')
    })
})
