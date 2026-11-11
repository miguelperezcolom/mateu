import { Notification, NotificationPosition } from '@vaadin/notification'
import { Notifier, ToastMessage, forgetKeyedToast, replaceKeyedToast, toastLifetime } from '@application/Notifier.ts'
import { DismissTimer, pausableDismiss } from '@infra/notify/dismissTimer.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'
import { controlsOf } from '@infra/notify/neutralNotifier.ts'

/**
 * Vaadin {@link Notifier} adapter — renders toasts with vaadin-notification for full Lumo
 * fidelity. Registered by the Vaadin app's index.ts, overriding the DS-neutral default.
 *
 * The message's semantics drive it (design/progress-and-notifications.md): its actions are buttons
 * on the toast, a sticky one (or an error) stays until closed, and one with the same key as a toast
 * on screen replaces it. Position is a hint the toast follows.
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

/**
 * Every toast is drawn by hand: vaadin-notification's own clock cannot be paused, so it gets
 * `duration = 0` and the toast's lifetime is a {@link pausableDismiss} timer on the card — it stops
 * while the toast is hovered, focused or the page is hidden (WCAG 2.2.1). A toast with a control
 * never stays less than 10 s.
 */
function show(message: ToastMessage, initiator: HTMLElement) {
    const notification = new Notification()
    notification.position = mapPosition(message.position)
    const controls = controlsOf(message, initiator)
    const duration = toastLifetime(message, controls.length > 0)
    notification.duration = 0
    const theme = themeOf(message.variant)
    if (theme) notification.setAttribute('theme', theme)
    let timer: DismissTimer | undefined
    const close = () => { timer?.cancel(); notification.opened = false }
    notification.renderer = (root: HTMLElement) => {
        if (root.firstElementChild) return
        if (duration > 0) timer = pausableDismiss(root, duration, close)
        if (message.title) {
            const title = document.createElement('strong')
            title.textContent = message.title
            title.style.marginRight = '0.5rem'
            root.append(title)
        }
        const text = document.createElement('span')
        text.textContent = message.text
        root.append(text)
        for (const control of controls) {
            const button = document.createElement('button')
            button.textContent = control.label
            button.style.cssText = 'margin-left: 0.75rem; background: none; border: 1px solid currentColor;'
                + ' border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer;'
                + ' padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;'
            button.addEventListener('click', () => {
                control.run()
                close()
            })
            root.append(button)
        }
        if (duration <= 0) {
            // a toast that stays needs a way out
            const closeButton = document.createElement('button')
            closeButton.textContent = '✕'
            closeButton.setAttribute('aria-label', chromeText('dismiss'))
            closeButton.style.cssText = 'margin-left: 0.75rem; background: none; border: none; color: inherit;'
                + ' cursor: pointer; font: inherit; font-weight: 600;'
            closeButton.addEventListener('click', close)
            root.append(closeButton)
        }
    }
    replaceKeyedToast(message.key, close)
    document.body.appendChild(notification)
    notification.opened = true
    notification.addEventListener('opened-changed', (e: Event) => {
        if (!(e as CustomEvent).detail.value) {
            forgetKeyedToast(message.key, close)
            notification.remove()
        }
    })
}

export const vaadinNotifier: Notifier = {
    show(message: ToastMessage, initiator: HTMLElement): void {
        // vaadin-notification renders into a shared overlay that is not a live region, so a toast
        // can appear and vanish without ever being announced. Announce it ourselves: errors
        // interrupt, everything else waits for a pause.
        const spoken = message.title ? `${message.title}. ${message.text}` : message.text
        announce(spoken, { politeness: message.variant === 'error' ? 'assertive' : 'polite' })
        show(message, initiator)
    },
}
