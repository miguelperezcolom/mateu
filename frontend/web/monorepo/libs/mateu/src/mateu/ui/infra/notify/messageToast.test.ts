// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { actionLabelOf, messageActionsOf, runMessageAction, toastOf } from './messageToast'

/**
 * A server message on its way to a toast: its actions (the legacy undo turned into one), the
 * client's own "Undo" for an unlabelled undo, and where each action runs.
 */
describe('messageToast', () => {
    afterEach(() => { document.body.innerHTML = '' })

    it('a newer server sends every action; an older one only the undo fields, made one action', () => {
        expect(messageActionsOf({ actions: [{ label: 'Open', route: '/r' }], undoActionId: 'u' }))
            .toEqual([{ label: 'Open', route: '/r' }])
        expect(messageActionsOf({ undoActionId: 'undoDelete', undoParameters: { id: 1 } }))
            .toEqual([{ label: null, actionId: 'undoDelete', parameters: { id: 1 }, style: 'undo' }])
        expect(messageActionsOf({})).toEqual([])
    })

    it('an unlabelled undo takes the client word; a labelled action keeps its label', () => {
        expect(actionLabelOf({ style: 'undo', actionId: 'u' })).toBe('Undo')
        expect(actionLabelOf({ style: 'undo', actionId: 'u' }, 'Deshacer')).toBe('Deshacer')
        expect(actionLabelOf({ label: 'Approve', actionId: 'a' })).toBe('Approve')
    })

    it('the toast carries title, persistence, key and runnable actions', () => {
        const t = toastOf({ title: 'T', text: 'x', persistence: 'sticky', key: 'k', actions: [{ label: 'Go', route: '/r' }] }, document.body)
        expect(t).toMatchObject({ title: 'T', text: 'x', persistence: 'sticky', key: 'k' })
        expect(t.actions?.map((a) => a.label)).toEqual(['Go'])
        expect(toastOf({ text: 'plain' }, document.body).actions).toBeUndefined()
    })

    it('a route action navigates from the initiator; an action id is requested on it', () => {
        const initiator = document.createElement('div')
        document.body.appendChild(initiator)
        const events: string[] = []
        for (const type of ['route-changed', 'navigate-to-requested', 'action-requested']) {
            initiator.addEventListener(type, (e) => events.push(type + ':' + JSON.stringify((e as CustomEvent).detail)))
        }
        runMessageAction({ route: '/reports/1' }, initiator)
        runMessageAction({ actionId: 'approve', parameters: { id: 3 } }, initiator)
        expect(events).toEqual([
            'route-changed:{"route":"/reports/1"}',
            'navigate-to-requested:{"route":"/reports/1"}',
            'action-requested:{"actionId":"approve","parameters":{"id":3},"serverNamed":true}',
        ])
    })

    it('a component initiator is handed the request directly', () => {
        const manage = vi.fn()
        const initiator = Object.assign(document.createElement('div'), { manageActionRequestedEvent: manage })
        runMessageAction({ actionId: 'undo' }, initiator)
        expect(manage).toHaveBeenCalledTimes(1)
    })
})
