import React, { useCallback } from 'react'
import { Button, Flash, PageLayout, Spinner, Stack, Text, useConfirm } from '@kit'
import type { ConfirmRequest } from '@mr/shell/useMateuApp'
import { tx } from '@mr/i18n/texts'

// Split out of MateuApp.tsx: the root's design-system pieces — the confirmation dialog, the boot's
// failure and wait, the page without an app shell. A renderer draws them its own way (an override
// of this file); the boot itself (useMateuApp) stays shared.

/** The kit's confirmation dialog, as the boot asks for one: a promise of the user's answer. */
export function useConfirmDialog(): { confirm: (r: ConfirmRequest) => Promise<boolean>; dialog: React.ReactNode } {
  const kitConfirm = useConfirm()
  const confirm = useCallback((r: ConfirmRequest) => kitConfirm({
    title: r.title,
    content: r.message,
    confirmButtonContent: r.confirmLabel,
    cancelButtonContent: r.cancelLabel,
    confirmButtonType: r.destructive ? 'danger' : 'primary',
  }), [kitConfirm])
  return { confirm, dialog: null }
}

/** The fresh load failed: what happened, and Try again. */
export function BootFailure({ title, detail, onRetry }: { title: string; detail: string; onRetry: () => void }) {
  return (
    <Flash variant="danger" role="alert">
      <Stack gap="condensed">
        <Text weight="semibold">{title}</Text>
        <Text>{detail}</Text>
        <div><Button onClick={onRetry}>{tx('tryAgain')}</Button></div>
      </Stack>
    </Flash>
  )
}

/** The fresh load is on its way. */
export function BootLoading() {
  return <Spinner size="large" srText={tx('loading')} />
}

/** A screen with no app shell: the kit's page container (centred, its margins). */
export function Centered({ children }: { children: React.ReactNode }) {
  return (
    <PageLayout containerWidth="xlarge" padding="normal">
      <PageLayout.Content as="main" width="full">
        <div id="mateu-main" tabIndex={-1} style={{ outline: 'none' }}>{children}</div>
      </PageLayout.Content>
    </PageLayout>
  )
}
