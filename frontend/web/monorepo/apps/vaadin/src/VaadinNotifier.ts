import { Notification, NotificationPosition } from '@vaadin/notification'
import { Notifier, ToastMessage, toastDuration } from '@application/Notifier.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { requestActionOn } from '@infra/ui/requestAction.ts'

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

/** The vaadin-notification theme of a toast variant: Lumo has no 'info' theme, so the
 * informational toast every backend sends as 'info' takes the accent ('primary') theme. */
export function themeOf(variant: string | undefined): string | undefined {
    return variant === 'info' ? 'primary' : variant
}

/** One inline control on the toast: a client-side closure (Retry) or a server action (Undo). */
function controlOf(message: ToastMessage, initiator: HTMLElement) {
    if (message.onAction) {
        return { label: message.actionLabel ?? chromeText('retry'), run: message.onAction }
    }
    if (message.undoActionId) {
        return {
            label: message.undoLabel ?? chromeText('undo'),
            run: () => requestActionOn(initiator, {
                actionId: message.undoActionId, parameters: message.undoParameters ?? {}, serverNamed: true,
            }),
        }
    }
    return undefined
}

function showWithControl(message: ToastMessage, initiator: HTMLElement) {
    const notification = new Notification()
    notification.position = mapPosition(message.position)
    const duration = toastDuration(message, 10000)
    notification.duration = duration
    const theme = themeOf(message.variant)
    if (theme) notification.setAttribute('theme', theme)
    notification.renderer = (root: HTMLElement) => {
        if (root.firstElementChild) return
        const text = document.createElement('span')
        text.textContent = message.text
        root.append(text)
        const control = controlOf(message, initiator)
        if (control) {
            const button = document.createElement('button')
            button.textContent = control.label
            button.style.cssText = 'margin-left: 0.75rem; background: none; border: 1px solid currentColor;'
                + ' border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer;'
                + ' padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;'
            button.addEventListener('click', () => {
                control.run()
                notification.opened = false
            })
            root.append(button)
        }
        if (duration <= 0) {
            // a toast that stays needs a way out
            const close = document.createElement('button')
            close.textContent = '✕'
            close.setAttribute('aria-label', chromeText('dismiss'))
            close.style.cssText = 'margin-left: 0.75rem; background: none; border: none; color: inherit;'
                + ' cursor: pointer; font: inherit; font-weight: 600;'
            close.addEventListener('click', () => { notification.opened = false })
            root.append(close)
        }
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
        if (message.undoActionId || message.onAction || toastDuration(message, 5000) <= 0) {
            showWithControl(message, initiator)
            return
        }
        Notification.show(message.text, {
            position: message.position ? mapPosition(message.position) : 'bottom-end',
            theme: themeOf(message.variant),
            duration: message.duration,
        })
    },
}
