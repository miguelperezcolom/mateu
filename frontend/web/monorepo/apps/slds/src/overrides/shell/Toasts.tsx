import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon, XIcon, type Icon } from '@kit/icons'
import { toastActions, useToastLifetime, type Toast, type ToastsState } from '@mr/shell/toasts'
import { tx } from '@mr/i18n/texts'

export type { ToastsState } from '@mr/shell/toasts'

/**
 * Messages as SLDS's Toast blueprint — `slds-notify_container` at the top centre of the page (where
 * Lightning shows them), each `slds-notify slds-notify_toast` in its theme, its actions as links.
 */
export function Toasts({ state }: { state: ToastsState }) {
  if (state.toasts.length === 0) return null
  return (
    <div className="slds-notify_container mateu-toasts" aria-live="polite">
      {state.toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={() => state.dismiss(t.id)} />)}
    </div>
  )
}

type Tone = 'error' | 'warning' | 'success' | 'info'
// the wire's variants (success, warning, error, primary, contrast, info); the core types it as
// info|warning|error but passes the wire's word through
const TONE: Record<string, Tone> = { error: 'error', warning: 'warning', success: 'success', info: 'info', primary: 'info', contrast: 'info' }
const ICON: Record<Tone, Icon> = { error: ErrorIcon, warning: WarningIcon, success: SuccessIcon, info: InfoIcon }
const TITLE = { error: 'toastError', warning: 'toastWarning', success: 'toastSuccess', info: 'toastInfo' } as const

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const actions = toastActions(toast)
  // the lifetime rule of every Mateu renderer (shared): it pauses while hovered or focused
  const hold = useToastLifetime(toast, onDismiss)
  const tone = TONE[String(toast.variant)] ?? 'info'
  const Ic = ICON[tone]
  const word = tx(TITLE[tone])
  return (
    <div {...hold} className={`slds-notify slds-notify_toast slds-theme_${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="slds-assistive-text">{word}</span>
      <span className={`slds-icon_container slds-icon-utility-${tone} slds-m-right_small slds-no-flex slds-align-top`}>
        <Ic size={20} className="slds-icon slds-icon_small" />
      </span>
      <div className="slds-notify__content">
        <h2 className="slds-text-heading_small">{toast.title || toast.text}</h2>
        {toast.title && toast.text && <p>{toast.text}</p>}
        {actions.length > 0 && (
          <p className="mateu-toast-actions">
            {actions.map((a, i) => (
              <button key={i} type="button" className="slds-button mateu-toast-action" onClick={() => { a.onPress(); onDismiss() }}>{a.label}</button>
            ))}
          </p>
        )}
      </div>
      <div className="slds-notify__close">
        <button type="button" className="slds-button slds-button_icon slds-button_icon-inverse" title={tx('dismiss')} onClick={onDismiss}>
          <XIcon size={16} className="slds-button__icon slds-button__icon_large" />
          <span className="slds-assistive-text">{tx('dismiss')}</span>
        </button>
      </div>
    </div>
  )
}

