import React, { useCallback, useEffect, useState } from 'react'
import { Dialog } from '@primer/react'
import type { MateuSession, OverlayOpenerContext } from '@rn/core/MateuSession'
import type { MateuViewController } from '@rn/core/MateuViewController'
import { interpolate } from '@rn/core/expressions'
import { overlayContentWithData, upsertOverlay, withOverlayState } from '@rn/renderer/patternGaps'
import { ViewHost, ControllerProvider } from '../render/ViewHost'
import { ComponentRenderer } from '../render/ComponentRenderer'

type Dict = Record<string, unknown>

interface Entry {
  component: unknown
  title: string
  opener?: OverlayOpenerContext
  revision: number
  state: Dict
}

export interface OverlaysState {
  entries: Entry[]
  session: MateuSession
  open: (component: unknown, state: unknown, data: unknown, opener?: OverlayOpenerContext) => void
  closeTop: () => void
}

/**
 * The session's overlay hooks: a Dialog / Drawer fragment (Add) opens a layer, `CloseModal` closes
 * the top one. The stacking rules (an overlay re-sent by id replaces itself, a state update aimed
 * at an open one) are the React Native renderer's, reused as they are (patternGaps.ts).
 */
export function useOverlays(session: MateuSession): OverlaysState {
  const [entries, setEntries] = useState<Entry[]>([])
  const open = useCallback((component: unknown, _state: unknown, _data: unknown, opener?: OverlayOpenerContext) => {
    const meta = ((component as Dict)?.['metadata'] as Dict) ?? {}
    const title = String(meta['headerTitle'] ?? meta['title'] ?? '')
    const state = { ...((meta['initialData'] as Dict) ?? {}) }
    setEntries((o) => upsertOverlay(o, { component, title, opener, revision: 0, state }))
  }, [])
  const closeTop = useCallback(() => setEntries((o) => o.slice(0, -1)), [])
  useEffect(() => {
    session.updateOverlayState = (id, state) => {
      let took = false
      setEntries((o) => {
        const next = withOverlayState(o, id, state)
        took = !!next
        return next ?? o
      })
      return took
    }
  }, [session])
  return { entries, session, open, closeTop }
}

export function Overlays({ state }: { state: OverlaysState }) {
  return (
    <>
      {state.entries.map((entry, i) => (
        <OverlayLayer key={`${i}#${entry.revision}`} entry={entry} session={state.session} onClose={state.closeTop} />
      ))}
    </>
  )
}

function OverlayLayer({ entry, session: fallback, onClose }: { entry: Entry; session: MateuSession; onClose: () => void }) {
  const session = (entry.opener as { session?: MateuSession } | undefined)?.session ?? fallback
  const opener = (entry.opener as { controller?: MateuViewController } | undefined)?.controller
  const meta = ((entry.component as Dict)?.['metadata'] as Dict) ?? {}
  const type = meta['type']
  const title = interpolate(entry.title, { state: entry.state }) || (type === 'Drawer' ? 'Details' : 'Dialog')
  const subtitle = interpolate(String(meta['subtitle'] ?? ''), { state: entry.state })

  // what the overlay draws OUTSIDE its content (a footer, a ConfirmDialog's body) runs on the view that opened it
  const onOpener = (node: unknown) => {
    if (!node || typeof node !== 'object') return null
    if (opener) {
      return (
        <ControllerProvider value={opener}>
          <ComponentRenderer component={node} state={opener.rendered.state ?? {}} data={opener.rendered.data} />
        </ControllerProvider>
      )
    }
    return <ViewHost session={session} serverSideNode={node} opener={entry.opener} embedded />
  }

  if (type === 'ConfirmDialog') {
    const press = (actionId: unknown) => {
      onClose()
      if (typeof actionId === 'string' && actionId && opener) void opener.runAction(actionId)
    }
    const footer = [
      ...(meta['canCancel'] ? [{ content: String(meta['cancelText'] ?? 'Cancel'), onClick: () => press(meta['cancelActionId']) }] : []),
      ...(meta['canReject'] ? [{ content: String(meta['rejectText'] ?? 'No'), onClick: () => press(meta['rejectActionId']) }] : []),
      { content: String(meta['confirmText'] ?? 'OK'), buttonType: 'primary' as const, onClick: () => press(meta['confirmActionId']) },
    ]
    return (
      <Dialog title={interpolate(String(meta['header'] ?? ''), { state: entry.state }) || 'Confirm'} onClose={onClose} footerButtons={footer}>
        {((entry.component as Dict)?.['children'] as unknown[] | undefined ?? []).map((n, i) => <React.Fragment key={i}>{onOpener(n)}</React.Fragment>)}
        {onOpener(meta['content'])}
      </Dialog>
    )
  }

  const content = overlayContentWithData({ ...meta, initialData: entry.state })
  // a Drawer is Primer's side sheet (Dialog at the edge); a bottom drawer docks at the bottom
  const position = type === 'Drawer'
    ? (meta['position'] === 'bottom' ? { narrow: 'bottom', regular: 'bottom' } : meta['position'] === 'start' ? 'left' : 'right')
    : 'center'
  const width = type === 'Drawer' ? drawerWidth(meta['size']) : 'large'
  return (
    <Dialog
      title={title}
      subtitle={subtitle || undefined}
      onClose={onClose}
      position={position as never}
      width={width}
      renderFooter={meta['footer'] ? () => <Dialog.Footer>{onOpener(meta['footer'])}</Dialog.Footer> : undefined}
    >
      {content ? <ViewHost session={session} serverSideNode={content} opener={entry.opener} embedded /> : null}
    </Dialog>
  )
}

function drawerWidth(size: unknown): 'small' | 'medium' | 'large' | 'xlarge' {
  switch (size) {
    case 's': return 'small'
    case 'l': return 'large'
    case 'xl': return 'xlarge'
    default: return 'medium'
  }
}
