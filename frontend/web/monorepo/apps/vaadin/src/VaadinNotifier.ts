import { Notification, NotificationPosition } from '@vaadin/notification'
import { Notifier, ToastMessage } from '@application/Notifier.ts'
import { announce } from '@infra/a11y/announcer.ts'

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

/** One inline control on the toast: a client-side closure (Retry) or a server action (Undo). */
function controlOf(message: ToastMessage, initiator: HTMLElement) {
    if (message.onAction) {
        return { label: message.actionLabel ?? 'Retry', run: message.onAction }
    }
    if (message.undoActionId) {
        return {
            label: message.undoLabel ?? 'Undo',
            run: () => initiator.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId: message.undoActionId, parameters: message.undoParameters ?? {} },
                bubbles: true,
                composed: true,
            })),
        }
    }
    return undefined
}

function showWithControl(message: ToastMessage, initiator: HTMLElement) {
    const notification = new Notification()
    notification.position = mapPosition(message.position)
    notification.duration = message.duration ?? 10000
    if (message.variant) notification.setAttribute('theme', message.variant)
    notification.renderer = (root: HTMLElement) => {
        if (root.firstElementChild) return
        const text = document.createElement('span')
        text.textContent = message.text
        const control = controlOf(message, initiator)!
        const button = document.createElement('button')
        button.textContent = control.label
        button.style.cssText = 'margin-left: 0.75rem; background: none; border: 1px solid currentColor;'
            + ' border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer;'
            + ' padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;'
        button.addEventListener('click', () => {
            control.run()
            notification.opened = false
        })
        root.append(text, button)
    }
    document.body.appendChild(notification)
    notification.opened = true
    notification.addEventListener('opened-changed', (e: Event) => {
        if (!(e as CustomEvent).detail.value) notification.remove()
    })
}

export const vaadinNotifier: Notifier = {
    show(message: ToastMessage, initiator: HTMLElement): void {
        // vaadin-notification renders into a shared overlay that is not a live region, so a toast
        // can appear and vanish without ever being announced. Announce it ourselves: errors
        // interrupt, everything else waits for a pause.
        announce(message.text, { politeness: message.variant === 'error' ? 'assertive' : 'polite' })
        if (message.undoActionId || message.onAction) {
            showWithControl(message, initiator)
            return
        }
        Notification.show(message.text, {
            position: message.position ? mapPosition(message.position) : 'bottom-end',
            theme: message.variant,
            duration: message.duration,
        })
    },
}
