import React, { useCallback, useState } from 'react'
import { BusyIndicator, Button, IllustratedMessage } from '@ui5/webcomponents-react'
import { ConfirmDialog } from '@kit'
import type { ConfirmRequest } from '@mr/shell/useMateuApp'
import { tx } from '@mr/i18n/texts'

interface Pending extends ConfirmRequest { resolve: (ok: boolean) => void }

/** Fiori's confirmation dialog (the kit's ConfirmDialog, a ui5-dialog), as the boot asks for one. */
export function useConfirmDialog(): { confirm: (r: ConfirmRequest) => Promise<boolean>; dialog: React.ReactNode } {
  const [pending, setPending] = useState<Pending | null>(null)
  const confirm = useCallback((r: ConfirmRequest) => new Promise<boolean>((resolve) => setPending({ ...r, resolve })), [])
  const dialog = pending && (
    <ConfirmDialog title={pending.title} content={pending.message} confirmButtonContent={pending.confirmLabel} cancelButtonContent={pending.cancelLabel}
      confirmButtonType={pending.destructive ? 'danger' : 'primary'} onClose={(ok) => { pending.resolve(ok); setPending(null) }} />
  )
  return { confirm, dialog }
}

/** The fresh load failed: Fiori's error illustration, what happened, and Try again. */
export function BootFailure({ title, detail, onRetry }: { title: string; detail: string; onRetry: () => void }) {
  return (
    <div role="alert">
      <IllustratedMessage name="ErrorScreen" titleText={title} subtitleText={detail}>
        <Button design="Emphasized" onClick={onRetry}>{tx('tryAgain')}</Button>
      </IllustratedMessage>
    </div>
  )
}

/** The fresh load is on its way: Fiori's busy indicator. */
export function BootLoading() {
  return <BusyIndicator active size="L" aria-label={tx('loading')} style={{ display: 'block', margin: '4rem auto' }} />
}

/** A screen with no app shell: the content on the page background, Fiori's responsive margins. */
export function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mateu-page-container">
      <div id="mateu-main" tabIndex={-1} style={{ outline: 'none' }}>{children}</div>
    </main>
  )
}
