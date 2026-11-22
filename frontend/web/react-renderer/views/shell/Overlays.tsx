import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog, IconButton } from '@kit'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ScreenFullIcon, ScreenNormalIcon } from '@kit/icons'
import './overlays.css'
import type { MateuSession, OverlayOpenerContext } from '@rn/core/MateuSession'
import type { MateuViewController } from '@rn/core/MateuViewController'
import { interpolate } from '@rn/core/expressions'
import { overlayContentWithData } from '@rn/renderer/patternGaps'
import type { OverlayEntry, OverlaysState } from '@mr/shell/overlays'
import { ViewHost, ControllerProvider } from '@mr/render/ViewHost'
import { ComponentRenderer } from '../render/ComponentRenderer'
import { tx } from '@mr/i18n/texts'

type Dict = Record<string, unknown>

export type { OverlaysState } from '@mr/shell/overlays'
type Entry = OverlayEntry

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
  const declaredTitle = interpolate(entry.title, { state: entry.state })
  // an overlay with no title still needs an accessible name — kept for screen readers, not shown
  const title = declaredTitle || (type === 'Drawer' ? tx('details') : tx('dialog'))
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
      ...(meta['canCancel'] ? [{ content: String(meta['cancelText'] ?? tx('cancel')), onClick: () => press(meta['cancelActionId']) }] : []),
      ...(meta['canReject'] ? [{ content: String(meta['rejectText'] ?? tx('no')), onClick: () => press(meta['rejectActionId']) }] : []),
      { content: String(meta['confirmText'] ?? tx('ok')), buttonType: 'primary' as const, onClick: () => press(meta['confirmActionId']) },
    ]
    return (
      <Dialog title={interpolate(String(meta['header'] ?? ''), { state: entry.state }) || tx('confirm')} onClose={onClose} footerButtons={footer}>
        {((entry.component as Dict)?.['children'] as unknown[] | undefined ?? []).map((n, i) => <React.Fragment key={i}>{onOpener(n)}</React.Fragment>)}
        {onOpener(meta['content'])}
      </Dialog>
    )
  }

  return <PanelLayer entry={entry} meta={meta} type={String(type ?? '')} title={title} titleShown={!!declaredTitle} subtitle={subtitle} session={session} onClose={onClose} onOpener={onOpener} />
}

const DRAWER_STEPS = ['small', 'medium', 'large', 'xlarge'] as const

/**
 * A Dialog or a Drawer (Primer's side sheet / bottom sheet) with every member the wire gives them:
 * `width` / `height` as declared, `noPadding`, `modeless` (no scrim, the page stays usable), a
 * `header` component beside the title, and for a Drawer `maximizable` (steps up the sizes),
 * `collapsible` (a bottom drawer folds to its header strip) and `peerNav` (previous / next object).
 */
function PanelLayer({ entry, meta, type, title, titleShown, subtitle, session, onClose, onOpener }: {
  entry: Entry; meta: Dict; type: string; title: string; titleShown: boolean; subtitle: string; session: MateuSession
  onClose: () => void; onOpener: (node: unknown) => React.ReactNode
}) {
  const drawer = type === 'Drawer'
  const bottom = drawer && meta['position'] === 'bottom'
  const [step, setStep] = useState(() => Math.max(0, DRAWER_STEPS.indexOf(drawerWidth(meta['size']))))
  const [collapsed, setCollapsed] = useState(false)
  const content = overlayContentWithData({ ...meta, initialData: entry.state })
  // a Drawer is Primer's side sheet (Dialog at the edge); a bottom drawer docks at the bottom
  const position = drawer
    ? (bottom ? { narrow: 'bottom', regular: 'bottom' } : meta['position'] === 'start' ? 'left' : 'right')
    : 'center'
  const declaredWidth = typeof meta['width'] === 'string' && meta['width'] && !bottom && step === DRAWER_STEPS.indexOf(drawerWidth(meta['size'])) ? String(meta['width']) : undefined
  const declaredHeight = !drawer && typeof meta['height'] === 'string' && meta['height'] ? String(meta['height']) : undefined
  // a Dialog's own placement: `top`/`left` (CSS lengths), `draggable` by its header, `resizable` by its corner
  const placed = !drawer && (typeof meta['top'] === 'string' && meta['top'] || typeof meta['left'] === 'string' && meta['left'])
  const draggable = !drawer && meta['draggable'] === true
  const resizable = !drawer && meta['resizable'] === true
  const drag = useDialogDrag(draggable)
  const peer = drawer ? (meta['peerNav'] as Dict | null | undefined) ?? null : null
  const goPeer = (route: unknown, label: unknown) => {
    if (typeof route !== 'string' || !route) return
    onClose()
    session.openView({ label: String(label ?? ''), route, consumedRoute: '', serverSideType: '' })
  }
  const className = [
    'mateu-overlay',
    meta['noPadding'] === true ? 'mateu-overlay--flush' : '',
    meta['modeless'] === true ? 'mateu-overlay--modeless' : '',
    collapsed ? 'mateu-overlay--collapsed' : '',
  ].filter(Boolean).join(' ')
  const header = meta['header'] && typeof meta['header'] === 'object' ? meta['header'] : null
  return (
    <Dialog
      title={title}
      subtitle={subtitle || undefined}
      onClose={onClose}
      position={position as never}
      width={drawer ? DRAWER_STEPS[step] : 'large'}
      className={className}
      style={{
        ...(declaredWidth ? { width: declaredWidth, maxWidth: '100vw' } : {}),
        ...(declaredHeight ? { height: declaredHeight } : {}),
        ...(placed ? { position: 'fixed', margin: 0, top: String(meta['top'] || 'auto'), left: String(meta['left'] || 'auto') } : {}),
        ...(resizable ? { resize: 'both', overflow: 'auto', minWidth: '16rem', minHeight: '8rem' } : {}),
        ...(drag.offset ? { translate: `${drag.offset.x}px ${drag.offset.y}px` } : {}),
      } as React.CSSProperties}
      renderHeader={({ dialogLabelId, dialogDescriptionId }) => (
        <Dialog.Header>
          <div className={'mateu-overlay__head' + (draggable ? ' mateu-overlay__head--drag' : '')} ref={drag.handleRef} onPointerDown={drag.onPointerDown}>
            <div className="mateu-overlay__titles">
              <Dialog.Title id={dialogLabelId} className={titleShown ? undefined : 'sr-only'}>{title}</Dialog.Title>
              {subtitle && <Dialog.Subtitle id={dialogDescriptionId}>{subtitle}</Dialog.Subtitle>}
            </div>
            {header && <div className="mateu-overlay__header">{onOpener(header)}</div>}
            {peer && (
              <>
                <IconButton icon={ChevronLeftIcon} size="small" variant="invisible" disabled={!peer['prevRoute']}
                  aria-label={peer['prevLabel'] ? tx('previousNamed', { name: String(peer['prevLabel']) }) : tx('previous')} onClick={() => goPeer(peer['prevRoute'], peer['prevLabel'])} />
                <IconButton icon={ChevronRightIcon} size="small" variant="invisible" disabled={!peer['nextRoute']}
                  aria-label={peer['nextLabel'] ? tx('nextNamed', { name: String(peer['nextLabel']) }) : tx('next')} onClick={() => goPeer(peer['nextRoute'], peer['nextLabel'])} />
              </>
            )}
            {drawer && meta['maximizable'] === true && !bottom && (
              <IconButton icon={step >= DRAWER_STEPS.length - 1 ? ScreenNormalIcon : ScreenFullIcon} size="small" variant="invisible"
                aria-label={step >= DRAWER_STEPS.length - 1 ? tx('restoreSize') : tx('maximize')}
                onClick={() => setStep((st) => (st >= DRAWER_STEPS.length - 1 ? Math.max(0, DRAWER_STEPS.indexOf(drawerWidth(meta['size']))) : st + 1))} />
            )}
            {drawer && bottom && meta['collapsible'] === true && (
              <IconButton icon={collapsed ? ChevronUpIcon : ChevronDownIcon} size="small" variant="invisible"
                aria-label={collapsed ? tx('expand') : tx('collapse')} aria-expanded={!collapsed} onClick={() => setCollapsed((c) => !c)} />
            )}
            {(drawer || meta['closeButtonOnHeader'] !== false) && <Dialog.CloseButton onClose={onClose} />}
          </div>
        </Dialog.Header>
      )}
      renderFooter={meta['footer'] && !collapsed ? () => <Dialog.Footer>{onOpener(meta['footer'])}</Dialog.Footer> : undefined}
    >
      {content && !collapsed ? <ViewHost session={session} serverSideNode={content} opener={entry.opener} embedded /> : null}
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

/**
 * A `draggable` Dialog moves with its header: the pointer drags it (controls inside the header keep
 * working — a press that starts on a button is not a drag), and the offset is kept while it is open.
 */
function useDialogDrag(enabled: boolean) {
  const handleRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if (!enabled || e.button !== 0) return
    if ((e.target as Element).closest('button, a, input, select, textarea, [role="button"]')) return
    const start = { x: e.clientX, y: e.clientY }
    const from = offset ?? { x: 0, y: 0 }
    const move = (ev: PointerEvent) => setOffset({ x: from.x + ev.clientX - start.x, y: from.y + ev.clientY - start.y })
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    e.preventDefault()
  }
  return { handleRef, offset, onPointerDown }
}
