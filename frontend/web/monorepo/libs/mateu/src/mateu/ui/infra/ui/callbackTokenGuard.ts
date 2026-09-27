/**
 * Whether a fragment that names an element as its target is still wanted by that element.
 *
 * <p>The callback token guards against out-of-order responses: an element that fires a request
 * and then moves on (a navigation replaced by another one, a component replaced by the next
 * screen) takes a new token, so the slower answer to the earlier request, which carries the old
 * token, is dropped instead of overwriting what is on screen now.
 *
 * <p>The token is the INITIATOR's, though, and only the initiator can hold it. A fragment can be
 * addressed to another element: a list's "+" is fired by the form or wizard that holds the list,
 * and the row editor it returns goes to the list's detail container. That container takes a token
 * of its own the first time a component lands in it, so from then on it never holds the one the
 * next request carries — every row editor after the first was dropped, and the dialog kept showing
 * the first one: the previous row's values on a second "+", the ROOM editor on the guests step of
 * a wizard (the container is the same element, renamed guests-container, when the step changes).
 * Such a fragment is not stale for the element it goes to, so the guard only applies to the
 * element that fired the request.
 */
export function fragmentIsCurrent(
    receiver: { callbackToken: string },
    message: { callbackToken?: string, initiator?: unknown }
): boolean {
    if (!message.callbackToken || !receiver.callbackToken) {
        return true
    }
    if (message.callbackToken === receiver.callbackToken) {
        return true
    }
    // Without an initiator (a message that did not come from a request) the token is all there is.
    return message.initiator != null && message.initiator !== receiver
}
