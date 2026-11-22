import React, { useEffect, useState } from 'react'
import { Button, Flash, Spinner, Stack, Text } from '@primer/react'
import { SkeletonText } from '@primer/react/experimental'
import type { MateuViewController, RenderedView } from '@rn/core/MateuViewController'
import { loadFailureMessage } from '@rn/core/uxRules'
import { ControllerProvider } from '@mr/render/ViewHost'
import { RenderBoundary } from './RenderBoundary'
import { ComponentRenderer } from './ComponentRenderer'
import { pageWidthOf } from '@mr/page/pageWidth'
import './page/page.css'
import { tx } from '@mr/i18n/texts'

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
          <div><Button onClick={retry}>{tx('tryAgain')}</Button></div>
        </Stack>
      </Flash>
    )
  }
  if (!view.component) return null
  // the content area's view takes its page width (an island or an overlay is sized by its host)
  const width = embedded ? null : pageWidthOf(view.component)
  return (
    <ControllerProvider value={controller}>
      <div
        style={{ position: 'relative', ...(width?.width === 'fixed' ? { maxWidth: columnCapOf(view.component) } : null) }}
        key={view.version}
        className={width ? 'mateu-view' : undefined}
        data-page-width={width?.width}
        data-page-type={width?.type}
      >
        {view.loading && (
          <div style={{ position: 'absolute', top: 'var(--base-size-8)', right: 'var(--base-size-8)', zIndex: 1 }}>
            <Spinner size="small" srText={tx('loading')} />
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
    <div role="progressbar" aria-label={tx('loading')} style={{ padding: embedded ? 'var(--base-size-8)' : 'var(--base-size-24)' }}>
      <SkeletonText lines={embedded ? 2 : 6} />
    </div>
  )
}

/**
 * A fixed page's measure: the column the server's envelope declares (`max-width: 1200px` on a form,
 * the 900px reading column of a component tree), else Primer's xlarge container. Full and edge pages
 * drop it — the web renderers' --mateu-page-column-cap rule.
 */
function columnCapOf(component: unknown): string {
  const style = String((component as Record<string, unknown> | null)?.['style'] ?? '')
  const m = /(?:^|;)\s*max-width\s*:\s*([0-9.]+(?:px|rem|em|ch|%))/i.exec(style)
  return m ? m[1] : '1280px'
}
