import { useCallback, useEffect, useRef, useState } from 'react'
import type { MessageVariant, NotifyOptions } from '@rn/core/MateuSession'
import { toastLifetime } from '@rn/core/toastLifetime'

export interface Toast {
  id: number
  key?: string
  title: string | null
  text: string
  variant: MessageVariant
  options?: NotifyOptions
}

export interface ToastsState {
  toasts: Toast[]
  notify: (title: string | null, text: string, variant: MessageVariant, options?: NotifyOptions) => void
  dismiss: (id: number) => void
}

let nextId = 1

/** The session's `notify` hook: the toasts on screen (a message re-sent with the same key replaces its old one). */
export function useToasts(): ToastsState {
  const [toasts, setToasts] = useState<Toast[]>([])
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback((title: string | null, text: string, variant: MessageVariant, options?: NotifyOptions) => {
    const toast: Toast = { id: nextId++, key: (options as { key?: string } | undefined)?.key, title, text, variant, options }
    setToasts((t) => [...t.filter((x) => !toast.key || x.key !== toast.key), toast])
  }, [])
  return { toasts, notify, dismiss }
}

/** A toast's actions: its own, else its Undo. */
export const toastActions = (toast: Toast) => toast.options?.actions ?? (toast.options?.undo ? [toast.options.undo] : [])

/**
 * The lifetime rule of every Mateu renderer: errors stay, actionable toasts stay longer, and a toast
 * the pointer or the focus is on — or a hidden tab's — does not go away under the user. Spread the
 * returned handlers on the toast's wrapper.
 */
export function useToastLifetime(toast: Toast, onDismiss: () => void) {
  const actions = toastActions(toast)
  const lifetime = toastLifetime(toast.variant, { duration: toast.options?.duration, sticky: toast.options?.sticky, undo: actions.length > 0 ? true : undefined })
  const hovering = useRef(false)
  useEffect(() => {
    if (!lifetime) return
    let left = lifetime
    let last = Date.now()
    const timer = setInterval(() => {
      const now = Date.now()
      if (!hovering.current && document.visibilityState === 'visible') left -= now - last
      last = now
      if (left <= 0) onDismiss()
    }, 250)
    return () => clearInterval(timer)
  }, [lifetime, onDismiss])
  return {
    onMouseEnter: () => { hovering.current = true },
    onMouseLeave: () => { hovering.current = false },
    onFocus: () => { hovering.current = true },
    onBlur: () => { hovering.current = false },
  }
}
