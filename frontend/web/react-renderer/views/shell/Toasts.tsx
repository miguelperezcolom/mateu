import React from 'react'
import { Banner } from '@kit'
import { toastActions, useToastLifetime, type Toast, type ToastsState } from '@mr/shell/toasts'
import { tx } from '@mr/i18n/texts'

export type { ToastsState } from '@mr/shell/toasts'

/** Messages stacked bottom-left as Primer Banners (GitHub's toast corner — the floating buttons own the right). */
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
const BANNER_TITLE = { critical: 'toastError', warning: 'toastWarning', success: 'toastSuccess', info: 'toastInfo' } as const

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const actions = toastActions(toast)
  // the lifetime rule of every Mateu renderer (shared): it pauses while hovered or focused
  const hold = useToastLifetime(toast, onDismiss)
  // the wire's variants (success, warning, error, primary, contrast, info) in Primer's Banner tones;
  // the core types it as info|warning|error but passes the wire's word through
  const wire = String(toast.variant)
  const variant = BANNER_VARIANT[wire] ?? 'info'
  return (
    <div
      {...hold}
      role={toast.variant === 'error' ? 'alert' : 'status'}
    >
      <Banner
        title={toast.title || tx(BANNER_TITLE[variant])}
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
