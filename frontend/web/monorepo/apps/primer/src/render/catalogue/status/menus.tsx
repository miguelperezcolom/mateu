import React, { useEffect, useRef, useState } from 'react'
import { ActionList, ActionMenu, Button, Dialog, Heading, NavList, Text, ToggleSwitch } from '@primer/react'
import { TriangleDownIcon } from '@primer/octicons-react'
import { menuIntent, type MenuOptionLike } from '@rn/renderer/wireWidgets'
import { actionPanelView, panelLabel, type ActionPanelMeta } from '@rn/renderer/actionPanel'
import { dragMimeOf, draggedIdsOf, dropParamsOf, draggableSelectionOf, DRAG_SELECTION_EVENT } from '@infra/ui/dragAndDrop.ts'
import { useController } from '../../ViewHost'
import { ComponentRenderer } from '../../ComponentRenderer'
import { type CatalogueProps, type Dict, list, str, useText } from './common'

/** What a menu entry does: run its action, or open its route (in the app; an absolute url leaves it). */
function useRunOption() {
  const controller = useController()
  return (o: MenuOptionLike) => {
    const intent = menuIntent(o)
    if (intent.kind === 'action') void controller.runAction(intent.target)
    else if (intent.kind === 'route') {
      if (/^https?:/i.test(intent.target)) window.open(intent.target, '_blank', 'noopener')
      else controller.session.openView({ label: o.label ?? intent.target, route: intent.target, consumedRoute: '', serverSideType: '' })
    }
  }
}

function OptionItems({ options, run }: { options: MenuOptionLike[]; run: (o: MenuOptionLike) => void }) {
  return (
    <>
      {options.map((o, i) =>
        o.separator ? <ActionList.Divider key={i} />
          : o.submenus?.length ? (
            <ActionList.Group key={i}>
              <ActionList.GroupHeading>{o.label}</ActionList.GroupHeading>
              <OptionItems options={o.submenus} run={run} />
            </ActionList.Group>
          ) : (
            <ActionList.Item key={i} disabled={!!o.disabled} onSelect={() => run(o)}>{o.label}</ActionList.Item>
          ))}
    </>
  )
}

/** A bar of commands: a leaf is a button, an entry with submenus opens Primer's ActionMenu. */
export function MenuBar({ metadata: m }: CatalogueProps) {
  const run = useRunOption()
  const options = list<MenuOptionLike>(m['options'])
  return (
    <div role="menubar" className="mateu-st-row mateu-st-wrap">
      {options.map((o, i) =>
        o.separator ? <span key={i} className="mateu-st-vr" aria-hidden="true" />
          : o.submenus?.length ? (
            <ActionMenu key={i}>
              <ActionMenu.Button variant="invisible" disabled={!!o.disabled}>{o.label}</ActionMenu.Button>
              <ActionMenu.Overlay><ActionList><OptionItems options={o.submenus} run={run} /></ActionList></ActionMenu.Overlay>
            </ActionMenu>
          ) : (
            <Button key={i} variant="invisible" role="menuitem" disabled={!!o.disabled} onClick={() => run(o)}>{o.label}</Button>
          ))}
    </div>
  )
}

/** Its content, with a menu on right click (or a left click when asked), and from the keyboard (Shift+F10 / the context-menu key). */
export function ContextMenu({ metadata: m, state, data }: CatalogueProps) {
  const run = useRunOption()
  const anchor = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const leftClick = m['activateOnLeftClick'] === true
  return (
    <>
      <div ref={anchor} tabIndex={0} aria-haspopup="menu" aria-expanded={open}
        onContextMenu={(e) => { e.preventDefault(); setOpen(true) }}
        onClick={leftClick ? () => setOpen(true) : undefined}
        onKeyDown={(e) => { if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); setOpen(true) } }}>
        {m['wrapped'] ? <ComponentRenderer component={m['wrapped']} state={state} data={data} /> : null}
      </div>
      <ActionMenu open={open} onOpenChange={setOpen} anchorRef={anchor}>
        <ActionMenu.Overlay><ActionList><OptionItems options={list<MenuOptionLike>(m['menu'])} run={(o) => { setOpen(false); run(o) }} /></ActionList></ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}

/** A directory of the app's places: Primer's NavList, groups as sub-lists. */
export function Directory({ metadata: m }: CatalogueProps) {
  const run = useRunOption()
  const item = (o: MenuOptionLike, i: number): React.ReactNode =>
    o.separator ? <NavList.Divider key={i} />
      : o.submenus?.length ? (
        <NavList.Group key={i} title={o.label}>{o.submenus.map(item)}</NavList.Group>
      ) : (
        <NavList.Item key={i} href="#" aria-disabled={o.disabled || undefined} onClick={(e: React.MouseEvent) => { e.preventDefault(); if (!o.disabled) run(o) }}>{o.label}</NavList.Item>
      )
  return <NavList aria-label="Directory">{list<MenuOptionLike>(m['menu']).map(item)}</NavList>
}

/** "I want to…": a button (and its shortcut) opening the categorised actions; populated first, "Show more", hide the empty ones. */
export function ActionPanel({ metadata: m }: CatalogueProps) {
  const controller = useController()
  const meta = m as unknown as ActionPanelMeta
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [hide, setHide] = useState(false)
  const shortcut = str(m['shortcut']).toLowerCase()
  useEffect(() => {
    if (!shortcut) return
    const parts = shortcut.split('+')
    const key = parts[parts.length - 1]
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey !== parts.includes('ctrl') || e.altKey !== parts.includes('alt') || e.shiftKey !== parts.includes('shift') || e.metaKey !== parts.includes('meta')) return
      if (e.key.toLowerCase() !== key && e.code.toLowerCase() !== `key${key}`) return
      e.preventDefault()
      setOpen(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcut])
  const categories = actionPanelView(meta, { expanded, hideUnpopulated: hide })
  const label = panelLabel(meta)
  return (
    <>
      <Button trailingVisual={TriangleDownIcon} onClick={() => setOpen(true)} aria-keyshortcuts={shortcut || undefined}>{label}</Button>
      {open && (
        <Dialog title={label} onClose={() => setOpen(false)} width="xlarge">
          {m['hideUnpopulatedToggle'] === true && (
            <div className="mateu-st-row" style={{ marginBottom: 'var(--base-size-12)' }}>
              <ToggleSwitch size="small" checked={hide} onClick={() => setHide(!hide)} aria-labelledby="mateu-ap-hide" />
              <Text id="mateu-ap-hide" size="small">Hide empty</Text>
            </div>
          )}
          <div className="mateu-st-grid">
            {categories.map((c) => (
              <section key={c.index} className="mateu-st-stack-xs">
                <Heading as="h3" className="mateu-st-h">{c.title}</Heading>
                <ActionList>
                  {c.actions.map((a, i) => (
                    <ActionList.Item key={i} disabled={a.disabled} onSelect={() => { setOpen(false); void controller.runAction(a.actionId, a.parameters) }}>
                      <span style={{ fontWeight: a.populated ? 600 : undefined }}>{a.label}</span>
                    </ActionList.Item>
                  ))}
                </ActionList>
                {c.hiddenCount > 0 && <Button size="small" variant="link" onClick={() => setExpanded(new Set([...expanded, c.index]))}>{c.moreLabel}</Button>}
              </section>
            ))}
          </div>
        </Dialog>
      )}
    </>
  )
}

/** A destination for dragged rows: drop them (their ids travel as {_draggedIds, _dragType} with its
 *  parameters), or — from the keyboard — "Move the selected rows here" while a listing has some selected. */
export function DropZone({ component, metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const accept = str(m['accept'])
  const mime = dragMimeOf(accept)
  const [over, setOver] = useState(false)
  const [selection, setSelection] = useState<string[]>(() => draggableSelectionOf(accept))
  useEffect(() => {
    const on = (e: Event) => { const d = (e as CustomEvent).detail as { type?: string; ids?: string[] }; if (d?.type === accept) setSelection(d.ids ?? []) }
    document.addEventListener(DRAG_SELECTION_EVENT, on)
    return () => document.removeEventListener(DRAG_SELECTION_EVENT, on)
  }, [accept])
  const drop = (ids: string[]) => {
    const actionId = str(m['actionId'])
    if (actionId && ids.length) void controller.runAction(actionId, dropParamsOf(m['parameters'] as Dict | undefined, ids, accept))
  }
  const accepts = (e: React.DragEvent) => !!mime && e.dataTransfer.types.includes(mime)
  const children = (component['children'] as unknown[] | undefined) ?? []
  return (
    <div className={`mateu-st-dropzone${over ? ' mateu-st-dropzone-over' : ''}`}
      onDragOver={(e) => { if (accepts(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(true) } }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { setOver(false); if (!accepts(e)) return; e.preventDefault(); drop(draggedIdsOf(e.dataTransfer.getData(mime))) }}>
      {m['title'] ? <Text weight="semibold">{t(m['title'])}</Text> : null}
      {m['subtitle'] ? <Text size="small" className="mateu-st-muted">{t(m['subtitle'])}</Text> : null}
      {children.map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
      {selection.length > 0 && <div><Button size="small" onClick={() => drop(selection)}>Move the selected rows here ({selection.length})</Button></div>}
    </div>
  )
}
