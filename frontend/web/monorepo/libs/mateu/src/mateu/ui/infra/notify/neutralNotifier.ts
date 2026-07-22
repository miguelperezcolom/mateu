/**
 * Design-system-neutral {@link Notifier} adapter — a dependency-free DOM toast.
 *
 * Uses Lumo CSS custom properties with plain fallbacks so it looks at home on any renderer and
 * carries zero `@vaadin` (or other DS) imports. Installed as the default by mateu-ui; a DS app
 * may override it via {@link setNotifier} (e.g. the Vaadin app's VaadinNotifier).
 */
import { Notifier, ToastMessage, setNotifier } from '@application/Notifier.ts'

type Corner = { top?: string; bottom?: string; left?: string; right?: string; transform?: string }

function anchor(position: string | undefined): Corner {
    const gap = 'var(--lumo-space-m, 1rem)'
    const centerX = { left: '50%', transform: 'translateX(-50%)' }
    switch (position) {
        case 'topStart': return { top: gap, left: gap }
        case 'topCenter': return { top: gap, ...centerX }
        case 'topEnd': return { top: gap, right: gap }
        case 'topStretch': return { top: gap, left: gap, right: gap }
        case 'middle': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        case 'bottomStart': return { bottom: gap, left: gap }
        case 'bottomCenter': return { bottom: gap, ...centerX }
        case 'bottomStretch': return { bottom: gap, left: gap, right: gap }
        case 'bottomEnd':
        default: return { bottom: gap, right: gap }
    }
}

function variantColors(variant: string | undefined): { bg: string; fg: string } {
    switch (variant) {
        case 'success': return { bg: 'var(--lumo-success-color, #2e7d32)', fg: '#fff' }
        case 'error': return { bg: 'var(--lumo-error-color, #c62828)', fg: '#fff' }
        case 'warning': return { bg: 'var(--lumo-warning-color, #f9a825)', fg: '#1a1a1a' }
        case 'contrast': return { bg: 'var(--lumo-contrast-90pct, #1a1a1a)', fg: '#fff' }
        default: return { bg: 'var(--lumo-base-color, #fff)', fg: 'var(--lumo-body-text-color, #1a1a1a)' }
    }
}

export const neutralNotifier: Notifier = {
    show(message: ToastMessage, initiator: HTMLElement): void {
        const { bg, fg } = variantColors(message.variant)
        const corner = anchor(message.position)

        const toast = document.createElement('div')
        toast.setAttribute('role', 'status')
        Object.assign(toast.style, {
            position: 'fixed',
            zIndex: '2000',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            maxWidth: 'min(90vw, 28rem)',
            padding: '0.7rem 1rem',
            borderRadius: 'var(--lumo-border-radius-m, 8px)',
            boxShadow: 'var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,0.2))',
            background: bg,
            color: fg,
            font: 'inherit',
            fontSize: 'var(--lumo-font-size-s, 0.875rem)',
            opacity: '0',
            transition: 'opacity 0.2s ease',
            ...corner,
        } as Partial<CSSStyleDeclaration>)

        const text = document.createElement('span')
        text.textContent = message.text
        toast.appendChild(text)

        const remove = () => {
            toast.style.opacity = '0'
            setTimeout(() => toast.remove(), 200)
        }

        if (message.undoActionId) {
            const undo = document.createElement('button')
            undo.textContent = message.undoLabel ?? 'Undo'
            undo.style.cssText =
                'margin-left: 0.25rem; background: none; border: 1px solid currentColor;'
                + ' border-radius: var(--lumo-border-radius-s, 4px); color: inherit; cursor: pointer;'
                + ' padding: 0.15rem 0.6rem; font: inherit; font-weight: 600;'
            undo.addEventListener('click', () => {
                initiator.dispatchEvent(new CustomEvent('action-requested', {
                    detail: { actionId: message.undoActionId, parameters: message.undoParameters ?? {} },
                    bubbles: true,
                    composed: true,
                }))
                remove()
            })
            toast.appendChild(undo)
        }

        document.body.appendChild(toast)
        requestAnimationFrame(() => { toast.style.opacity = '1' })

        const duration = message.duration ?? (message.undoActionId ? 10000 : 5000)
        if (duration > 0) setTimeout(remove, duration)
    },
}

/** Install the neutral notifier as the current adapter. Idempotent. */
export function registerNeutralNotifier(): void {
    setNotifier(neutralNotifier)
}
