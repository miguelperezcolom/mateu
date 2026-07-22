import { Notification, NotificationPosition } from '@vaadin/notification'
import { Notifier, ToastMessage } from '@application/Notifier.ts'

/**
 * Vaadin {@link Notifier} adapter — renders toasts with vaadin-notification for full Lumo
 * fidelity. Registered by the Vaadin app's index.ts, overriding the DS-neutral default.
 */
function mapPosition(position: string | undefined): NotificationPosition {
    switch (position) {
        case 'topStretch': return 'top-stretch'
        case 'topStart': return 'top-start'
        case 'topCenter': return 'top-center'
        case 'topEnd': return 'top-end'
        case 'middle': return 'middle'
        case 'bottomStart': return 'bottom-start'
        case 'bottomEnd': return 'bottom-end'
        case 'bottomStretch': return 'bottom-stretch'
        case 'bottomCenter': return 'bottom-center'
    }
    return 'bottom-end'
}

function showUndoable(message: ToastMessage, initiator: HTMLElement) {
    const notification = new Notification()
    notification.position = mapPosition(message.position)
    notification.duration = message.duration ?? 10000
    if (message.variant) notification.setAttribute('theme', message.variant)
    notification.renderer = (root: HTMLElement) => {
        if (root.firstElementChild) return
        const text = document.createElement('span')
        text.textContent = message.text
        const undo = document.createElement('button')
        undo.textContent = message.undoLabel ?? 'Undo'
        undo.style.cssText = 'margin-left: 0.75rem; background: none; border: 1px solid currentColor;'
            + ' border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer;'
            + ' padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;'
        undo.addEventListener('click', () => {
            initiator.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId: message.undoActionId, parameters: message.undoParameters ?? {} },
                bubbles: true,
                composed: true,
            }))
            notification.opened = false
        })
        root.append(text, undo)
    }
    document.body.appendChild(notification)
    notification.opened = true
    notification.addEventListener('opened-changed', (e: Event) => {
        if (!(e as CustomEvent).detail.value) notification.remove()
    })
}

export const vaadinNotifier: Notifier = {
    show(message: ToastMessage, initiator: HTMLElement): void {
        if (message.undoActionId) {
            showUndoable(message, initiator)
            return
        }
        Notification.show(message.text, {
            position: message.position ? mapPosition(message.position) : 'bottom-end',
            theme: message.variant,
            duration: message.duration,
        })
    },
}
