import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Banner } from '@primer/react'
import type { MessageVariant, NotifyOptions } from '@rn/core/MateuSession'
import { toastLifetime } from '@rn/core/toastLifetime'

interface Toast {
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

/** The session's `notify` hook: messages stacked bottom-left as Primer Banners (GitHub's toast corner — the floating buttons own the right). */
export function useToasts(): ToastsState {
  const [toasts, setToasts] = useState<Toast[]>([])
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback((title: string | null, text: string, variant: MessageVariant, options?: NotifyOptions) => {
    const toast: Toast = { id: nextId++, key: (options as { key?: string } | undefined)?.key, title, text, variant, options }
    setToasts((t) => [...t.filter((x) => !toast.key || x.key !== toast.key), toast])
  }, [])
  return { toasts, notify, dismiss }
}

export function Toasts({ state }: { state: ToastsState }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed', left: 'var(--base-size-16)', bottom: 'var(--base-size-16)', zIndex: 100,
        display: 'flex', flexDirection: 'column', gap: 'var(--base-size-8)', width: 'min(28rem, calc(100vw - 2rem))',
      }}
    >
      {state.toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={() => state.dismiss(t.id)} />)}
    </div>
  )
}

const BANNER_VARIANT: Record<string, 'critical' | 'warning' | 'success' | 'info'> = {
  error: 'critical', warning: 'warning', success: 'success', info: 'info', primary: 'info', contrast: 'info',
}
const BANNER_TITLE = { critical: 'Error', warning: 'Warning', success: 'Success', info: 'Information' } as const

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const actions = toast.options?.actions ?? (toast.options?.undo ? [toast.options.undo] : [])
  // the same lifetime rule as every Mateu renderer: errors stay, actionable toasts stay longer,
  // and a toast the pointer or the focus is on does not go away under it
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
  // the wire's variants (success, warning, error, primary, contrast, info) in Primer's Banner tones;
  // the core types it as info|warning|error but passes the wire's word through
  const wire = String(toast.variant)
  const variant = BANNER_VARIANT[wire] ?? 'info'
  return (
    <div
      onMouseEnter={() => { hovering.current = true }}
      onMouseLeave={() => { hovering.current = false }}
      onFocus={() => { hovering.current = true }}
      onBlur={() => { hovering.current = false }}
      role={toast.variant === 'error' ? 'alert' : 'status'}
    >
      <Banner
        title={toast.title || BANNER_TITLE[variant]}
        hideTitle={!toast.title}
        description={toast.text}
        variant={variant}
        onDismiss={onDismiss}
        primaryAction={actions[0] ? <Banner.PrimaryAction onClick={() => { actions[0].onPress(); onDismiss() }}>{actions[0].label}</Banner.PrimaryAction> : undefined}
        secondaryAction={actions[1] ? <Banner.SecondaryAction onClick={() => { actions[1].onPress(); onDismiss() }}>{actions[1].label}</Banner.SecondaryAction> : undefined}
      />
    </div>
  )
}
