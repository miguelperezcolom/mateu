import type Message from '@mateu/shared/apiClients/dtos/Message.ts'
import type { MessageAction } from '@mateu/shared/apiClients/dtos/Progress.ts'
import { notify, type ToastAction, type ToastMessage } from '@application/Notifier.ts'
import { requestActionOn } from '@infra/ui/requestAction.ts'
import { leaveToRoute } from '@infra/ui/rowRoute.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { entryOfMessage, inboxStore } from '@infra/notify/inboxStore.ts'

/**
 * A server message on its way to the screen — ONE place for every transport (HttpService,
 * SSEService): the toast it becomes (severity, persistence, actions, dedup key), and, for an
 * `inbox` message, the inbox entry it also leaves behind.
 */

/** Pure: the label of an action, with the client's own words for an unlabelled undo. */
export const actionLabelOf = (action: MessageAction, undoLabel = chromeText('undo')): string =>
    action.label?.trim() ? action.label : action.style === 'undo' ? undoLabel : (action.actionId ?? action.route ?? '')

/**
 * Pure: the actions of a message. A newer server sends them all in `actions` (the undo included,
 * style `undo`); an older one only the legacy `undo*` fields, turned into one action here.
 */
export const messageActionsOf = (message: Partial<Message>): MessageAction[] => {
    if (message.actions && message.actions.length > 0) return message.actions
    if (message.undoActionId) {
        return [{ label: message.undoLabel ?? null, actionId: message.undoActionId, parameters: message.undoParameters ?? {}, style: 'undo' }]
    }
    return []
}

/** Runs an action of a message / a finished task on the element that ran the action it answers. */
export const runMessageAction = (action: MessageAction, initiator: HTMLElement): boolean => {
    if (action.route) return leaveToRoute(initiator, action.route)
    if (!action.actionId) return false
    requestActionOn(initiator, { actionId: action.actionId, parameters: action.parameters ?? {}, serverNamed: true })
    return true
}

/** Pure-ish: the toast a server message becomes (actions bound to `initiator`). */
export const toastOf = (message: Partial<Message>, initiator: HTMLElement): ToastMessage => {
    const actions: ToastAction[] = messageActionsOf(message).map((action) => ({
        label: actionLabelOf(action),
        style: action.style,
        run: () => runMessageAction(action, initiator),
    }))
    return {
        text: message.text ?? '',
        title: message.title || undefined,
        position: message.position,
        variant: message.variant,
        duration: message.duration,
        undoLabel: message.undoLabel,
        undoActionId: message.undoActionId,
        undoParameters: message.undoParameters,
        persistence: message.persistence ?? null,
        actions: actions.length > 0 ? actions : undefined,
        key: message.key ?? null,
    }
}

/** Shows a server message: the toast, and for persistence `inbox` its entry in the inbox. */
export const showServerMessage = (message: Message, initiator: HTMLElement): void => {
    notify(toastOf(message, initiator), initiator)
    if (message.persistence === 'inbox') {
        inboxStore.addSessionEntry(entryOfMessage(message, new Date(), initiator))
    }
}
