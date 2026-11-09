import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    applyChange, emptyInbox, entryOfMessage, filtered, groupedByCategory, inboxStore, mergedEntries, notificationChangesOf,
    unreadCount, withRead, withServerList, withSessionEntry, withoutEntry,
} from './inboxStore'
import type { AppNotification } from '@mateu/shared/apiClients/dtos/Progress.ts'

/**
 * The inbox on the page: the server's list merged with the session's own entries (inbox messages,
 * live pushes), deduplicated by id; filters, grouping by category, and the live change.
 */
const n = (id: string, over: Partial<AppNotification> = {}): AppNotification => ({ id, title: id, unread: true, ...over })

describe('inboxStore (pure)', () => {
    it('merges server and session entries by id: session entries on top, a pushed change wins', () => {
        let s = withServerList(emptyInbox(), [n('a'), n('b', { unread: false })])
        s = withSessionEntry(s, { ...n('local'), local: true })
        s = withSessionEntry(s, { ...n('b', { title: 'B changed', unread: true }), local: true })
        expect(mergedEntries(s).map((e) => [e.id, e.title, e.unread])).toEqual([
            ['local', 'local', true], ['a', 'a', true], ['b', 'B changed', true],
        ])
    })

    it('a pushed entry is the server\'s (its actions, read and dismiss go there); a message\'s is the session\'s', () => {
        const pushed = applyChange(emptyInbox(), { notification: n('p1') }).state
        expect(mergedEntries(pushed)[0].local).toBe(false)
        expect(entryOfMessage({ text: 'Hi' }, new Date()).local).toBe(true)
    })

    it('a fresh server list keeps a pushed entry it does not list yet', () => {
        const pushed = applyChange(emptyInbox(), { notification: n('p1') }).state
        expect(mergedEntries(withServerList(pushed, [n('a')])).map((e) => e.id)).toEqual(['p1', 'a'])
    })

    it('a fresh server list drops the session copies of what it now lists', () => {
        let s = withSessionEntry(emptyInbox(), { ...n('pushed'), local: true })
        s = withServerList(s, [n('pushed', { title: 'stored' })])
        expect(s.session).toEqual([])
        expect(mergedEntries(s).map((e) => e.title)).toEqual(['stored'])
    })

    it('the same id replaces a session entry (dedup by key)', () => {
        let s = withSessionEntry(emptyInbox(), n('k', { title: 'Syncing…' }))
        s = withSessionEntry(s, n('k', { title: 'Synced' }))
        expect(mergedEntries(s).map((e) => e.title)).toEqual(['Synced'])
    })

    it('marks read and removes, in both halves', () => {
        let s = withServerList(emptyInbox(), [n('a'), n('b')])
        s = withSessionEntry(s, n('c'))
        expect(unreadCount(mergedEntries(withRead(s, ['a'])))).toBe(2)
        expect(unreadCount(mergedEntries(withRead(s, 'all')))).toBe(0)
        expect(mergedEntries(withoutEntry(s, 'c')).map((e) => e.id)).toEqual(['a', 'b'])
    })

    it('filters: unread (and not resolved), all, resolved', () => {
        const entries = [n('u'), n('r', { unread: false }), n('done', { unread: false, resolved: true }), n('ur', { resolved: true })]
        expect(filtered(entries, 'unread').map((e) => e.id)).toEqual(['u'])
        expect(filtered(entries, 'all')).toHaveLength(4)
        expect(filtered(entries, 'resolved').map((e) => e.id)).toEqual(['done', 'ur'])
        expect(unreadCount(entries)).toBe(1)
    })

    it('groups by category in order of appearance, uncategorised first', () => {
        const groups = groupedByCategory([n('1', { category: 'Approvals' }), n('2'), n('3', { category: 'Imports' }), n('4', { category: 'Approvals' })])
        expect(groups.map((g) => [g.category, g.entries.map((e) => e.id)])).toEqual([
            [null, ['2']], ['Approvals', ['1', '4']], ['Imports', ['3']],
        ])
    })

    it('a live change upserts, removes, or asks for the list again', () => {
        const s = withServerList(emptyInbox(), [n('a')])
        const added = applyChange(s, { notification: n('new') })
        expect(added.added?.id).toBe('new')
        expect(mergedEntries(added.state).map((e) => e.id)).toEqual(['new', 'a'])
        // a change of a known entry is no new arrival (no toast)
        expect(applyChange(s, { notification: n('a', { title: 'x' }) }).added).toBeUndefined()
        expect(mergedEntries(applyChange(s, { removedId: 'a' }).state)).toEqual([])
        expect(applyChange(s, {})).toMatchObject({ refetch: true })
    })

    it('reads the NotificationsChanged commands of an increment', () => {
        expect(notificationChangesOf({ commands: [
            { type: 'UpdateHeaderValue', data: { id: 'x' } },
            { type: 'NotificationsChanged', data: { removedId: 'r' } },
            { type: 'NotificationsChanged' },
        ] })).toEqual([{ removedId: 'r' }, {}])
        expect(notificationChangesOf(null)).toEqual([])
    })

    it('an inbox message becomes a session entry keyed by its key', () => {
        const entry = entryOfMessage({ key: 'task-1', title: 'Import finished', text: '3 errors', variant: 'success',
            actions: [{ label: 'View', route: '/x' }] }, new Date(2026, 0, 1, 10, 30))
        expect(entry).toMatchObject({ id: 'task-1', title: 'Import finished', text: '3 errors', unread: true, local: true })
        expect(entryOfMessage({ text: 'Only text' }, new Date()).title).toBe('Only text')
    })
})

describe('inboxStore (singleton)', () => {
    beforeEach(() => inboxStore.reset())

    it('tells the bell to refetch and announces a new unread arrival', () => {
        const refetch = vi.fn()
        const added = vi.fn()
        inboxStore.onRefetch(refetch)
        inboxStore.onAdded(added)
        inboxStore.applyChange({})
        inboxStore.applyChange({ notification: n('x') })
        inboxStore.applyChange({ notification: n('y', { unread: false }) })
        expect(refetch).toHaveBeenCalledTimes(1)
        expect(added.mock.calls.map((c) => c[0].id)).toEqual(['x'])
        expect(inboxStore.entries().map((e) => e.id)).toEqual(['y', 'x'])
    })
})
