import type { MessageAction } from './Progress.ts'

export default interface Message {
    title: string,
    text: string,
    /** a HINT (a web toast corner): renderers may ignore it */
    position: string,
    variant: string,
    duration: number,
    // undoable toasts (Message.undoable on the server): the toast renders an Undo button that
    // dispatches undoActionId (with undoParameters) on the initiator component. A newer server
    // also sends the undo as one of `actions` (style 'undo'): when `actions` is non-empty it wins.
    undoLabel?: string,
    undoActionId?: string,
    undoParameters?: Record<string, unknown>,
    /** toast (goes away) | sticky (until dismissed) | inbox (also lands in the inbox) */
    persistence?: 'toast' | 'sticky' | 'inbox' | null,
    actions?: MessageAction[] | null,
    /** a message with the same key replaces the one on screen (and the inbox entry) */
    key?: string | null,
}
