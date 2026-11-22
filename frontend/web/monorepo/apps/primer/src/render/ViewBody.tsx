import React, { useEffect, useState } from 'react'
import { Button, Flash, Spinner, Stack, Text } from '@primer/react'
import { SkeletonText } from '@primer/react/experimental'
import type { MateuViewController, RenderedView } from '@rn/core/MateuViewController'
import { loadFailureMessage } from '@rn/core/uxRules'
import { ControllerProvider } from './ViewHost'
import { RenderBoundary } from './RenderBoundary'
import { ComponentRenderer } from './ComponentRenderer'

/** What a view shows: a skeleton while its first answer is on its way, a failure with Retry, or the tree. */
export function ViewBody({ controller, view, retry, embedded }: {
  controller: MateuViewController
  view: RenderedView
  retry: () => void
  embedded?: boolean
}) {
  if (view.loading && !view.component) return <LoadingSkeleton embedded={embedded} />
  if (view.error && !view.component) {
    const message = loadFailureMessage(view.error)
    if (embedded) return <Text as="p" className="mateu-island-error">{message.title}</Text>
    return (
      <Flash variant="danger" role="alert" style={{ margin: 'var(--base-size-16)' }}>
        <Stack gap="condensed">
          <Text weight="semibold">{message.title}</Text>
          <Text>{message.detail}</Text>
          <div><Button onClick={retry}>Try again</Button></div>
        </Stack>
      </Flash>
    )
  }
  if (!view.component) return null
  return (
    <ControllerProvider value={controller}>
      <div style={{ position: 'relative' }} key={view.version}>
        {view.loading && (
          <div style={{ position: 'absolute', top: 'var(--base-size-8)', right: 'var(--base-size-8)', zIndex: 1 }}>
            <Spinner size="small" srText="Loading" />
          </div>
        )}
        <RenderBoundary resetKey={view.version}>
          <ComponentRenderer component={view.component} state={view.state} data={view.data} />
        </RenderBoundary>
      </div>
    </ControllerProvider>
  )
}

function LoadingSkeleton({ embedded }: { embedded?: boolean }) {
  // nothing for a fast answer; the shape of what is coming after 400 ms
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 400)
    return () => clearTimeout(t)
  }, [])
  if (!shown) return null
  return (
    <div role="progressbar" aria-label="Loading" style={{ padding: embedded ? 'var(--base-size-8)' : 'var(--base-size-24)' }}>
      <SkeletonText lines={embedded ? 2 : 6} />
    </div>
  )
}
