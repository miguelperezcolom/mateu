// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { httpService } from './HttpService'
import { sseService } from './SSEService'
import { setNotifier, ToastMessage } from './Notifier'
import { appData, appState, upstream } from '@domain/state'
import type Message from '@domain/Message'
import UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'

/**
 * What an answer from the server DOES on the client, whichever transport brought it (a plain
 * request or a streamed one): fragments and commands go to the components through the upstream
 * bus, messages become toasts, banners reach the page, app state/data are stored and announced.
 */
const increment = (over: Partial<Record<keyof UIIncrement, unknown>>) => ({
    commands: [], messages: [], fragments: [], appState: undefined, appData: undefined, ...over,
} as unknown as UIIncrement)

for (const [name, service] of [['HttpService', httpService], ['SSEService', sseService]] as const) {
    describe(`${name}.handleUIIncrement`, () => {
        let toasts: ToastMessage[]
        let bus: Message[]
        let initiator: HTMLElement
        let unsubscribe: () => void

        beforeEach(() => {
            toasts = []
            bus = []
            setNotifier({ show: (m: ToastMessage) => { toasts.push(m) } })
            const sub = upstream.subscribe((m) => bus.push(m))
            unsubscribe = () => sub.unsubscribe()
            initiator = document.createElement('div')
            document.body.appendChild(initiator)
        })
        afterEach(() => {
            unsubscribe()
            document.body.innerHTML = ''
        })

        it('sends fragments and commands to the components, tagged with the callback token', () => {
            service.handleUIIncrement(increment({
                fragments: [{ targetComponentId: 'c1' }],
                commands: [{ type: 'SetWindowTitle', data: 'X' }],
            }), initiator, 'tok-1')
            expect(bus.map((m) => (m.fragment ? 'fragment' : 'command'))).toEqual(
                name === 'HttpService' ? ['fragment', 'command'] : ['command', 'fragment'])
            expect(bus.every((m) => m.callbackToken === 'tok-1')).toBe(true)
        })

        it('turns messages into toasts, undo included', () => {
            service.handleUIIncrement(increment({
                messages: [{ text: 'Saved', variant: 'success', position: 'bottomEnd', duration: 2000,
                    undoLabel: 'Undo', undoActionId: 'undoSave', undoParameters: { id: 1 } }],
            }), initiator, '')
            expect(toasts).toHaveLength(1)
            expect(toasts[0]).toMatchObject({ text: 'Saved', variant: 'success', position: 'bottomEnd', duration: 2000,
                undoLabel: 'Undo', undoActionId: 'undoSave', undoParameters: { id: 1 } })
            // the legacy undo becomes the toast's one action
            expect(toasts[0].actions?.map((a) => a.label)).toEqual(['Undo'])
        })

        it('a Progress command goes to the task center, not to the components', async () => {
            const { taskStore } = await import('@infra/progress/taskStore.ts')
            taskStore.reset()
            service.handleUIIncrement(increment({
                commands: [{ type: 'Progress', data: { taskId: 't1', title: 'Import', state: 'running', blocking: false } },
                    { type: 'NavigateTo', data: '/x' }],
            }), initiator, '')
            expect(taskStore.find('t1')?.progress.title).toBe('Import')
            expect(bus.map((m) => m.command?.type)).toEqual(['NavigateTo'])
        })

        it('a command with no target is addressed to the component that ran the action', () => {
            initiator.id = 'comp-7'
            service.handleUIIncrement(increment({ commands: [{ type: 'NavigateTo', data: '/x' }] }), initiator, '')
            expect(bus[0].command?.targetComponentId).toBe('comp-7')
        })

        it('an inbox message also lands in the inbox; actions and key reach the toast', async () => {
            const { inboxStore } = await import('@infra/notify/inboxStore.ts')
            inboxStore.reset()
            service.handleUIIncrement(increment({
                messages: [{ title: 'Import finished', text: '3 errors', variant: 'success', persistence: 'inbox',
                    key: 'task-1', actions: [{ label: 'View', route: '/imports/1' }] }],
            }), initiator, '')
            expect(toasts[0]).toMatchObject({ title: 'Import finished', key: 'task-1', persistence: 'inbox' })
            expect(toasts[0].actions?.map((a) => a.label)).toEqual(['View'])
            expect(inboxStore.entries().map((e) => [e.id, e.title, e.text])).toEqual([['task-1', 'Import finished', '3 errors']])
        })

        it('delivers banners to the page, replace or append', () => {
            const seen: unknown[] = []
            const listener = (e: Event) => seen.push((e as CustomEvent).detail)
            document.addEventListener('page-banners-received', listener)
            service.handleUIIncrement(increment({ banners: [{ title: 'b' }], appendBanners: true }), initiator, '')
            document.removeEventListener('page-banners-received', listener)
            expect(seen).toEqual([{ banners: [{ title: 'b' }], append: true }])
        })

        it('stores app state and app data and announces the change', () => {
            let announced = 0
            initiator.addEventListener('app-data-updated', () => announced++)
            service.handleUIIncrement(increment({ appState: { hotel: 'H1' }, appData: { user: 'ana' } }), initiator, '')
            expect(appState.value).toEqual({ hotel: 'H1' })
            expect(appData.value).toEqual({ user: 'ana' })
            expect(announced).toBe(2)
        })

        it('an empty answer does nothing', () => {
            service.handleUIIncrement(undefined, initiator, '')
            expect(bus).toEqual([])
            expect(toasts).toEqual([])
        })
    })
}
