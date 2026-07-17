export default interface Message {
    title: string,
    text: string,
    position: string,
    variant: string,
    duration: number,
    // undoable toasts (Message.undoable on the server): the toast renders an Undo button that
    // dispatches undoActionId (with undoParameters) on the initiator component
    undoLabel?: string,
    undoActionId?: string,
    undoParameters?: Record<string, unknown>
}
