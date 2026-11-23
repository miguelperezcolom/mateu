/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { trapFocus } from '@infra/a11y/focusTrap.ts'
import { Button, cx, type P } from './core'
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from './icons'
import { tx } from '@mr/i18n/texts'

/**
 * The SLDS kit's layers. Lightning Base Components are not open source, so the behaviour is ours —
 * written to each blueprint's documented markup, keyboard and ARIA:
 *  - Menus (`slds-dropdown`, role=menu: arrows, Home/End, Esc returns to the trigger),
 *  - Listbox options (`slds-listbox`, role=listbox / option, aria-selected),
 *  - Popover (`slds-popover`, a dialog that closes on Esc or a press outside),
 *  - Modals (`slds-modal` + `slds-backdrop`: focus trapped, Esc, focus back to the opener),
 *  - Panel (`slds-panel_docked`): the drawer docked at an edge.
 * Layers are portalled to the body and placed under their anchor (fixed, flipped above when the
 * window has no room below) — the placement is ours, the look is the blueprint's.
 */

// ── placement ──────────────────────────────────────────────────────────────────────────────────

const WIDTHS: Record<string, string> = { small: '16rem', medium: '20rem', large: '30rem', xlarge: '40rem', auto: 'auto' }

export function usePlacement(open: boolean, anchor: React.RefObject<HTMLElement | null>, layer: React.RefObject<HTMLElement | null>, align: 'start' | 'end' = 'start') {
  const [pos, setPos] = useState<React.CSSProperties>({ visibility: 'hidden' })
  const place = useCallback(() => {
    const a = anchor.current
    const l = layer.current
    if (!a || !l) return
    const r = a.getBoundingClientRect()
    const h = l.offsetHeight
    const w = l.offsetWidth
    const below = r.bottom + 4
    const top = below + h > window.innerHeight - 8 && r.top - h - 4 > 8 ? r.top - h - 4 : below
    let left = align === 'end' ? r.right - w : r.left
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8))
    setPos({ position: 'fixed', top, left, visibility: 'visible', margin: 0 })
  }, [anchor, layer, align])
  useLayoutEffect(() => {
    if (!open) return undefined
    place()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null
    if (layer.current) ro?.observe(layer.current)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place, layer])
  return pos
}

/** Closes a layer on Esc and on a press outside both it and its anchor; the focus goes back to the anchor. */
export function useDismiss(open: boolean, close: (refocus: boolean) => void, anchor: React.RefObject<HTMLElement | null>, layer: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e: Event) => {
      const t = e.target as Node
      if (layer.current?.contains(t) || anchor.current?.contains(t)) return
      // a press inside another layer opened from this one (a nested menu, a dialog) is not outside
      if ((t as Element).closest?.('[data-mateu-layer]') && !(t as Element).closest?.('[data-mateu-layer]')?.contains(layer.current)) return
      close(false)
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [open, close, anchor, layer])
  return (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      e.preventDefault()
      close(true)
    }
  }
}

const focusables = (root: HTMLElement | null): HTMLElement[] =>
  root ? [...root.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), select, textarea, a[href], [tabindex="0"], [role="menuitem"], [role="menuitemradio"], [role="option"]')] : []

// ── AnchoredOverlay (blueprint: Popover) ───────────────────────────────────────────────────────

type AnchorProps = Record<string, any>
export interface AnchoredOverlayProps {
  open?: boolean; onOpen?: (gesture?: string) => void; onClose?: (gesture?: string) => void
  renderAnchor?: ((props: AnchorProps) => React.ReactNode) | null; anchorRef?: React.RefObject<HTMLElement | null>
  overlayProps?: Record<string, any>; width?: string; children?: React.ReactNode; align?: string; side?: string; focusZoneSettings?: unknown; focusTrapSettings?: unknown; height?: string
}

export function AnchoredOverlay({ open, onOpen, onClose, renderAnchor, anchorRef: givenAnchor, overlayProps, width, children, align, side }: AnchoredOverlayProps) {
  const ownAnchor = useRef<HTMLElement | null>(null)
  const anchor = givenAnchor ?? ownAnchor
  const layer = useRef<HTMLElement | null>(null)
  const id = useId()
  const pos = usePlacement(!!open, anchor, layer, align === 'end' || side === 'outside-left' ? 'end' : 'start')
  const close = useCallback((refocus: boolean) => {
    onClose?.(refocus ? 'escape' : 'click-outside')
    if (refocus) requestAnimationFrame(() => anchor.current?.focus())
  }, [onClose, anchor])
  const onKey = useDismiss(!!open, close, anchor, layer)
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => {
      const first = focusables(layer.current)[0]
      ;(first ?? layer.current)?.focus()
    })
  }, [open])
  const setAnchor = (el: HTMLElement | null) => {
    if (!givenAnchor) ownAnchor.current = el
  }
  const anchorProps = {
    ref: setAnchor,
    'aria-haspopup': (overlayProps?.role as string) ?? 'dialog',
    'aria-expanded': !!open,
    'aria-controls': open ? id : undefined,
    onClick: () => (open ? close(false) : onOpen?.('anchor-click')),
  }
  const { role = 'dialog', width: ow, height, className: oc, style: os, ...restOverlay } = overlayProps ?? {}
  return (
    <>
      {renderAnchor ? renderAnchor(anchorProps) : null}
      {open && createPortal(
        <section
          ref={layer as never}
          id={id}
          data-mateu-layer=""
          role={role === 'none' ? undefined : role}
          tabIndex={-1}
          onKeyDown={onKey}
          className={cx('slds-popover', 'mateu-layer', oc)}
          style={{ ...pos, width: WIDTHS[String(ow ?? width ?? 'auto')] ?? ow ?? width, maxWidth: 'calc(100vw - 16px)', maxHeight: height === 'medium' ? '24rem' : 'calc(100vh - 32px)', overflow: 'auto', ...os }}
          {...restOverlay}
        >
          {children}
        </section>,
        document.body,
      )}
    </>
  )
}

// ── ActionMenu + ActionList (blueprints: Menus, Listbox) ─────────────────────────────────────────

interface MenuCtx {
  open: boolean
  setOpen: (open: boolean, refocus?: boolean) => void
  anchor: React.RefObject<HTMLElement | null>
  id: string
}
const MenuContext = createContext<MenuCtx | null>(null)
type ListKind = 'menu' | 'listbox' | 'list'
const ListContext = createContext<{ kind: ListKind; selection?: 'single' | 'multiple'; close?: () => void }>({ kind: 'list' })

function ActionMenuRoot({ open: controlled, onOpenChange, anchorRef, children }: P) {
  const [own, setOwn] = useState(false)
  const open = controlled ?? own
  const ownAnchor = useRef<HTMLElement | null>(null)
  const id = useId()
  const anchor = anchorRef ?? ownAnchor
  const setOpen = useCallback((o: boolean, refocus = false) => {
    if (controlled === undefined) setOwn(o)
    onOpenChange?.(o)
    if (!o && refocus) requestAnimationFrame(() => anchor.current?.focus())
  }, [controlled, onOpenChange, anchor])
  return <MenuContext.Provider value={{ open, setOpen, anchor, id }}>{children}</MenuContext.Provider>
}

function useAnchorProps() {
  const m = useContext(MenuContext)!
  return {
    ref: (el: HTMLElement | null) => { (m.anchor as React.MutableRefObject<HTMLElement | null>).current = el },
    'aria-haspopup': 'true' as const,
    'aria-expanded': m.open,
    'aria-controls': m.open ? m.id : undefined,
    onClick: () => m.setOpen(!m.open),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        m.setOpen(true)
      }
    },
  }
}

function MenuButton({ children, ...rest }: P) {
  const a = useAnchorProps()
  return <Button {...rest} {...a} trailingAction={ChevronDownIcon}>{children}</Button>
}

function MenuAnchor({ children }: P) {
  const a = useAnchorProps()
  if (!React.isValidElement(children)) return <>{children}</>
  const child = children as React.ReactElement<P>
  return React.cloneElement(child, {
    ...a,
    onClick: (e: React.MouseEvent) => { child.props.onClick?.(e); a.onClick() },
  })
}

function MenuOverlay({ children, width, align = 'start', className }: P) {
  const m = useContext(MenuContext)!
  const layer = useRef<HTMLElement | null>(null)
  const pos = usePlacement(m.open, m.anchor, layer, align === 'end' ? 'end' : 'start')
  const close = useCallback((refocus: boolean) => m.setOpen(false, refocus), [m])
  const onKey = useDismiss(m.open, close, m.anchor, layer)
  useEffect(() => {
    if (!m.open) return
    requestAnimationFrame(() => {
      const items = focusables(layer.current).filter((el) => el.matches('[role^="menuitem"], [role="option"]'))
      const chosen = items.find((el) => el.getAttribute('aria-checked') === 'true' || el.getAttribute('aria-selected') === 'true')
      ;(chosen ?? items[0] ?? layer.current)?.focus()
    })
  }, [m.open])
  if (!m.open) return null
  return createPortal(
    <div ref={layer as never} id={m.id} data-mateu-layer="" className={cx('slds-dropdown', 'mateu-layer', className)} onKeyDown={onKey}
      style={{ ...pos, width: WIDTHS[width ?? 'auto'], minWidth: '12rem', maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100vh - 32px)', overflow: 'auto' }}>
      <ListContext.Provider value={{ kind: 'menu', close: () => close(true) }}>{children}</ListContext.Provider>
    </div>,
    document.body,
  )
}

export const ActionMenu = Object.assign(ActionMenuRoot, { Button: MenuButton, Anchor: MenuAnchor, Overlay: MenuOverlay })

/** Arrow keys between a list's items (a menu or a listbox: one tab stop, roving). */
function rove(e: React.KeyboardEvent<HTMLElement>, selector: string) {
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>(selector)].filter((el) => el.getAttribute('aria-disabled') !== 'true')
  if (!items.length) return
  const i = items.indexOf(document.activeElement as HTMLElement)
  let next = -1
  if (e.key === 'ArrowDown') next = i < 0 ? 0 : (i + 1) % items.length
  else if (e.key === 'ArrowUp') next = i < 0 ? items.length - 1 : (i - 1 + items.length) % items.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = items.length - 1
  if (next < 0) return
  e.preventDefault()
  items[next].focus()
}

const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"]'

function ActionListRoot({ children, selectionVariant, role, showDividers, className, ...rest }: P) {
  const parent = useContext(ListContext)
  const kind: ListKind = parent.kind === 'menu' ? 'menu' : role === 'listbox' || selectionVariant ? 'listbox' : 'list'
  if (kind === 'menu') {
    return (
      <ListContext.Provider value={{ kind, selection: selectionVariant, close: parent.close }}>
        <ul className={cx('slds-dropdown__list', className)} role="menu" {...rest} onKeyDown={(e) => rove(e, ITEM_SELECTOR)}>{children}</ul>
      </ListContext.Provider>
    )
  }
  if (kind === 'listbox') {
    return (
      <ListContext.Provider value={{ kind, selection: selectionVariant ?? 'single' }}>
        <ul className={cx('slds-listbox', 'slds-listbox_vertical', className)} role="listbox" {...rest} onKeyDown={(e) => rove(e, ITEM_SELECTOR)}>{children}</ul>
      </ListContext.Provider>
    )
  }
  return (
    <ListContext.Provider value={{ kind }}>
      <ul className={cx('mateu-action-list', showDividers && 'slds-has-dividers_bottom-space', className)} role={role} {...rest}>{children}</ul>
    </ListContext.Provider>
  )
}

const isPart = (el: React.ReactNode, type: unknown) => React.isValidElement(el) && el.type === type
const LeadingVisual = ({ children }: P) => <>{children}</>
const TrailingVisual = ({ children }: P) => <>{children}</>
const Description = ({ children }: P) => <>{children}</>

function splitItem(children: React.ReactNode) {
  const kids = React.Children.toArray(children)
  const lead = kids.find((k) => isPart(k, LeadingVisual)) as React.ReactElement<P> | undefined
  const trail = kids.find((k) => isPart(k, TrailingVisual)) as React.ReactElement<P> | undefined
  const desc = kids.find((k) => isPart(k, Description)) as React.ReactElement<P> | undefined
  const label = kids.filter((k) => k !== lead && k !== trail && k !== desc)
  return { lead: lead?.props.children, trail: trail?.props.children, desc: desc?.props.children, label }
}

export interface ActionListItemProps {
  children?: React.ReactNode; onSelect?: (e: React.SyntheticEvent) => void; selected?: boolean; active?: boolean; disabled?: boolean; variant?: string
  role?: string; id?: string; className?: string; href?: string; onMouseEnter?: (e: React.MouseEvent) => void; 'aria-selected'?: boolean; 'aria-label'?: string
  [data: `data-${string}`]: unknown
}

function ActionListItem({ children, onSelect, selected, active, disabled, variant, role, id, className, href, onMouseEnter, ...rest }: ActionListItemProps) {
  const list = useContext(ListContext)
  const { lead, trail, desc, label } = splitItem(children)
  const activate = (e: React.SyntheticEvent) => {
    if (disabled) return
    onSelect?.(e)
    if (list.kind === 'menu' && list.selection !== 'multiple') list.close?.()
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      activate(e)
    }
  }
  if (list.kind === 'menu') {
    const itemRole = list.selection === 'single' ? 'menuitemradio' : list.selection === 'multiple' ? 'menuitemcheckbox' : 'menuitem'
    return (
      <li className={cx('slds-dropdown__item', selected && 'slds-is-selected', className)} role="presentation">
        <a href={href ?? '#'} role={itemRole} tabIndex={-1} id={id} aria-disabled={disabled || undefined}
          aria-checked={list.selection ? !!selected : undefined} onMouseEnter={onMouseEnter}
          onClick={(e) => { if (!href) e.preventDefault(); activate(e) }} onKeyDown={onKey}
          className={variant === 'danger' ? 'slds-text-color_error' : undefined} {...rest}>
          <span className="slds-truncate" title={typeof label[0] === 'string' ? label[0] : undefined}>
            {list.selection && <CheckIcon size={12} className={cx('slds-icon', 'slds-icon_selected', 'slds-icon_x-small', 'slds-icon-text-default', 'slds-m-right_x-small')} />}
            {lead && <span className="slds-m-right_x-small mateu-item-lead">{lead}</span>}
            {label}
          </span>
          {desc && <span className="slds-text-body_small slds-text-color_weak mateu-item-desc">{desc}</span>}
          {trail && <span className="slds-m-left_small mateu-item-trail">{trail}</span>}
        </a>
      </li>
    )
  }
  if (list.kind === 'listbox') {
    return (
      <li role="presentation" className={cx('slds-listbox__item', className)}>
        <div id={id} role={role ?? 'option'} tabIndex={active ? 0 : -1} aria-selected={!!selected} aria-disabled={disabled || undefined}
          className={cx('slds-media', 'slds-listbox__option', 'slds-listbox__option_plain', 'slds-media_small', selected && 'slds-is-selected', active && 'slds-has-focus')}
          onClick={activate} onKeyDown={onKey} onMouseEnter={onMouseEnter} {...rest}>
          <span className="slds-media__figure slds-listbox__option-icon">
            {selected && <CheckIcon size={12} className="slds-icon slds-icon_x-small slds-icon-text-default" />}
          </span>
          <span className="slds-media__body">
            <span className="slds-truncate" title={typeof label[0] === 'string' ? label[0] : undefined}>{lead && <span className="slds-m-right_x-small">{lead}</span>}{label}</span>
            {desc && <span className="slds-listbox__option-meta slds-listbox__option-meta_entity">{desc}</span>}
          </span>
          {trail && <span className="slds-media__figure slds-media__figure_reverse">{trail}</span>}
        </div>
      </li>
    )
  }
  return (
    <li className={cx('mateu-action-list__item', className)} role={role === 'option' ? 'option' : undefined}>
      {href ? (
        <a href={href} className={cx('mateu-action-list__action', active && 'slds-is-active')} aria-current={selected ? 'true' : undefined} {...rest}>
          {lead}<span className="mateu-action-list__label">{label}{desc && <span className="slds-text-body_small slds-text-color_weak">{desc}</span>}</span>{trail}
        </a>
      ) : (
        <button type="button" className={cx('mateu-action-list__action', variant === 'danger' && 'slds-text-color_error', active && 'slds-is-active')}
          disabled={disabled} aria-pressed={selected === undefined ? undefined : !!selected} onClick={activate} onMouseEnter={onMouseEnter} id={id} {...rest}>
          {lead}<span className="mateu-action-list__label">{label}{desc && <span className="slds-text-body_small slds-text-color_weak">{desc}</span>}</span>{trail}
        </button>
      )}
    </li>
  )
}

function ActionListGroup({ children, title }: P) {
  const list = useContext(ListContext)
  const kids = React.Children.toArray(children)
  const heading = kids.find((k) => isPart(k, GroupHeading)) as React.ReactElement<P> | undefined
  const rest = kids.filter((k) => k !== heading)
  const text = heading?.props.children ?? title
  return (
    <>
      {text && <li className={list.kind === 'menu' ? 'slds-dropdown__header slds-truncate' : 'slds-listbox__item mateu-group-heading'} role="presentation">
        <span className={list.kind === 'menu' ? undefined : 'slds-text-title_caps'}>{text}</span>
      </li>}
      {rest}
    </>
  )
}
const GroupHeading = ({ children }: P) => <>{children}</>
const Divider = () => <li className="slds-has-divider_top-space" role="separator" />
const LinkItem = (p: ActionListItemProps) => <ActionListItem {...p} />

export const ActionList = Object.assign(ActionListRoot, {
  Item: ActionListItem, LinkItem, Group: ActionListGroup, GroupHeading, Divider, LeadingVisual, TrailingVisual, Description,
  Heading: ({ children }: P) => <li className="slds-dropdown__header" role="presentation"><span>{children}</span></li>,
})

// ── SelectPanel (blueprints: Combobox's listbox under a search Input, in a Popover) ─────────────

export interface SelectPanelItemInput {
  id?: string | number
  text?: string
  description?: string
  leadingVisual?: unknown
  disabled?: boolean
  [k: string]: unknown
}

export interface SelectPanelProps {
  open?: boolean; onOpenChange?: (open: boolean, gesture?: string) => void; renderAnchor?: ((props: AnchorProps) => React.ReactNode) | null
  items?: any[]; selected?: any; onSelectedChange?: (selected: any) => void; filterValue?: string; onFilterChange?: (text: string, e?: unknown) => void
  title?: React.ReactNode; placeholder?: string; inputLabel?: string; overlayProps?: Record<string, any>; placeholderText?: string; showSelectedOptionsFirst?: boolean; loading?: boolean
  message?: unknown; footer?: React.ReactNode; variant?: string; subtitle?: React.ReactNode; textInputProps?: Record<string, any>
}

export function SelectPanel({ open, onOpenChange, renderAnchor, items = [], selected, onSelectedChange, filterValue, onFilterChange, title, placeholder, inputLabel, overlayProps, placeholderText }: SelectPanelProps) {
  const multiple = Array.isArray(selected)
  const anchor = useRef<HTMLElement | null>(null)
  const layer = useRef<HTMLElement | null>(null)
  const id = useId()
  const [active, setActive] = useState(0)
  const pos = usePlacement(!!open, anchor, layer)
  const close = useCallback((refocus: boolean) => {
    onOpenChange?.(false)
    if (refocus) requestAnimationFrame(() => anchor.current?.focus())
  }, [onOpenChange])
  const onKey = useDismiss(!!open, close, anchor, layer)
  const list = items as SelectPanelItemInput[]
  const isSelected = (it: SelectPanelItemInput) => (multiple ? (selected as SelectPanelItemInput[]).some((s) => s.id === it.id) : selected?.id === it.id)
  useEffect(() => { if (open) setActive(0) }, [open, filterValue])
  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => (layer.current?.querySelector('input') as HTMLElement | null ?? focusables(layer.current)[0])?.focus())
  }, [open])
  const choose = (it: SelectPanelItemInput) => {
    if (it.disabled) return
    if (multiple) {
      const now = isSelected(it) ? (selected as SelectPanelItemInput[]).filter((s) => s.id !== it.id) : [...(selected as SelectPanelItemInput[]), it]
      onSelectedChange?.(now)
    } else {
      onSelectedChange?.(it)
      close(true)
    }
  }
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(list.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter' && list[active]) { e.preventDefault(); choose(list[active]) }
  }
  const anchorProps = {
    ref: (el: HTMLElement | null) => { anchor.current = el },
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': !!open,
    onClick: () => onOpenChange?.(!open),
    children: null,
  }
  const optionId = (i: number) => `${id}-o${i}`
  const searchLabel = inputLabel ?? placeholder ?? (typeof title === 'string' ? title : undefined)
  return (
    <>
      {renderAnchor ? renderAnchor(anchorProps) : <Button {...anchorProps} trailingAction={ChevronDownIcon}>{placeholderText ?? title}</Button>}
      {open && createPortal(
        <section ref={layer as never} data-mateu-layer="" role="dialog" aria-label={typeof title === 'string' ? title : undefined} className="slds-popover mateu-layer mateu-select-panel" onKeyDown={onKey}
          style={{ ...pos, width: WIDTHS[overlayProps?.width ?? 'medium'], maxWidth: 'calc(100vw - 16px)' }}>
          {title && <header className="slds-popover__header"><h2 className="slds-text-heading_small">{title}</h2></header>}
          <div className="slds-popover__body">
            {onFilterChange && (
              <div className="slds-form-element slds-m-bottom_x-small">
                <label className="slds-assistive-text" htmlFor={`${id}-q`}>{searchLabel}</label>
                <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left">
                  <SearchIcon size={14} className="slds-icon slds-input__icon slds-input__icon_left slds-icon-text-default" />
                  <input id={`${id}-q`} type="search" className="slds-input" placeholder={placeholder} value={filterValue ?? ''}
                    role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={`${id}-list`} aria-activedescendant={list[active] ? optionId(active) : undefined}
                    onChange={(e) => onFilterChange(e.target.value)} onKeyDown={onListKey} />
                </div>
              </div>
            )}
            <ul id={`${id}-list`} role="listbox" aria-label={typeof title === 'string' ? title : searchLabel ?? undefined} aria-multiselectable={multiple || undefined} className="slds-listbox slds-listbox_vertical mateu-select-panel__list"
              tabIndex={onFilterChange ? -1 : 0} onKeyDown={onFilterChange ? undefined : onListKey}>
              {list.map((it, i) => (
                <li key={String(it.id ?? i)} role="presentation" className="slds-listbox__item">
                  <div id={optionId(i)} role="option" aria-selected={isSelected(it)} aria-disabled={it.disabled || undefined}
                    className={cx('slds-media', 'slds-listbox__option', 'slds-listbox__option_plain', 'slds-media_small', isSelected(it) && 'slds-is-selected', i === active && 'slds-has-focus')}
                    onMouseEnter={() => setActive(i)} onClick={() => choose(it)}>
                    <span className="slds-media__figure slds-listbox__option-icon">
                      {isSelected(it) && <CheckIcon size={12} className="slds-icon slds-icon_x-small slds-icon-text-default" />}
                    </span>
                    <span className="slds-media__body">
                      <span className="slds-truncate" title={it.text}>{it.text}</span>
                      {it.description && <span className="slds-listbox__option-meta">{it.description}</span>}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {multiple && (
            <footer className="slds-popover__footer slds-text-align_right">
              <button type="button" className="slds-button slds-button_brand" onClick={() => close(true)}>{tx('ok')}</button>
            </footer>
          )}
        </section>,
        document.body,
      )}
    </>
  )
}

// ── Dialog (blueprints: Modals; Panel docked for a drawer) ───────────────────────────────────────

let layerDepth = 0
const MODAL_WIDTH: Record<string, string> = { small: 'slds-modal_small', medium: 'slds-modal_medium', large: 'slds-modal_large', xlarge: 'slds-modal_large' }
const PANEL_WIDTH: Record<string, string> = { small: '20rem', medium: '28rem', large: '40rem', xlarge: '60rem' }

const DialogIds = createContext<{ labelId: string; descId: string; onClose?: () => void; panel: boolean }>({ labelId: '', descId: '', panel: false })

export interface DialogProps {
  title?: React.ReactNode; subtitle?: React.ReactNode; onClose?: (gesture?: string) => void; footerButtons?: Record<string, any>[]
  renderHeader?: (p: { dialogLabelId: string; dialogDescriptionId: string; title?: React.ReactNode; subtitle?: React.ReactNode; onClose?: (g?: string) => void }) => React.ReactNode
  renderBody?: (p: { children?: React.ReactNode }) => React.ReactNode; renderFooter?: (p: { footerButtons?: Record<string, any>[] }) => React.ReactNode
  position?: string | Record<string, string>; width?: string; height?: string; className?: string; style?: React.CSSProperties; role?: string
  initialFocusRef?: React.RefObject<HTMLElement | null>; returnFocusRef?: unknown; children?: React.ReactNode; 'aria-label'?: string; sx?: unknown
}

function DialogRoot({ title, subtitle, onClose, footerButtons, renderHeader, renderBody, renderFooter, position = 'center', width = 'large', className, style, role = 'dialog', initialFocusRef, children, 'aria-label': ariaLabel }: DialogProps) {
  const labelId = useId()
  const descId = useId()
  const box = useRef<HTMLElement | null>(null)
  const [depth] = useState(() => ++layerDepth)
  useEffect(() => () => { layerDepth = Math.max(0, layerDepth - 1) }, [])
  useEffect(() => {
    const el = box.current
    if (!el) return undefined
    const trap = trapFocus(el, { initialFocus: () => initialFocusRef?.current ?? null })
    return () => trap.release()
  }, [initialFocusRef])
  const side = typeof position === 'object' ? (position.regular ?? 'center') : position
  const panel = side === 'left' || side === 'right' || side === 'bottom'
  const modeless = typeof className === 'string' && className.includes('modeless')
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose?.('escape')
    }
  }
  const header = renderHeader
    ? renderHeader({ dialogLabelId: labelId, dialogDescriptionId: descId, title, subtitle, onClose })
    : <DialogHeader><DialogTitle id={labelId}>{title}</DialogTitle>{subtitle && <DialogSubtitle id={descId}>{subtitle}</DialogSubtitle>}<DialogClose onClose={onClose} /></DialogHeader>
  const footer = renderFooter
    ? renderFooter({ footerButtons })
    : footerButtons?.length
      ? <DialogFooter>{(footerButtons as P[]).map((b, i) => (
          <button key={i} type="button" autoFocus={b.autoFocus}
            className={cx('slds-button', b.buttonType === 'primary' ? 'slds-button_brand' : b.buttonType === 'danger' ? 'slds-button_destructive' : 'slds-button_neutral')}
            onClick={b.onClick}>{b.content}</button>
        ))}</DialogFooter>
      : null
  const body = renderBody ? renderBody({ children }) : children
  const z = 9000 + depth * 10
  const ids = { labelId, descId, onClose: () => onClose?.('close-button'), panel }
  if (panel) {
    const pos: React.CSSProperties = side === 'bottom'
      ? { left: 0, right: 0, bottom: 0, maxHeight: '90vh', height: '50vh' }
      : { top: 0, bottom: 0, [side === 'left' ? 'left' : 'right']: 0, width: PANEL_WIDTH[width] ?? width, maxWidth: '100vw' } as React.CSSProperties
    return createPortal(
      <DialogIds.Provider value={ids}>
        {!modeless && <div className="slds-backdrop slds-backdrop_open mateu-panel-backdrop" role="presentation" style={{ zIndex: z - 1 }} onClick={() => onClose?.('click-outside')} />}
        <div ref={box as never} data-mateu-layer="" role={role} aria-modal={!modeless || undefined} aria-labelledby={ariaLabel ? undefined : labelId} aria-label={ariaLabel}
          className={cx('slds-panel', 'slds-panel_docked', side === 'left' ? 'slds-panel_docked-left' : 'slds-panel_docked-right', 'slds-is-open', 'mateu-panel', `mateu-panel_${side}`, className)}
          style={{ position: 'fixed', zIndex: z, ...pos, ...style }} onKeyDown={onKey}>
          {header}
          <div className="slds-panel__body mateu-panel__body">{body}</div>
          {footer}
        </div>
      </DialogIds.Provider>,
      document.body,
    )
  }
  return createPortal(
    <DialogIds.Provider value={ids}>
      <section ref={box as never} data-mateu-layer="" role={role} tabIndex={-1} aria-modal={!modeless || undefined} aria-labelledby={ariaLabel ? undefined : labelId} aria-label={ariaLabel}
        aria-describedby={subtitle ? descId : undefined}
        className={cx('slds-modal', 'slds-fade-in-open', MODAL_WIDTH[width] ?? '', 'mateu-modal', className)} style={{ zIndex: z, ...(modeless ? { pointerEvents: 'none' } : {}) }} onKeyDown={onKey}>
        <div className="slds-modal__container mateu-modal__container" style={{ ...(modeless ? { pointerEvents: 'auto' } : {}), ...style }}>
          {header}
          <div className="slds-modal__content slds-p-around_medium mateu-modal__content">{body}</div>
          {footer}
        </div>
      </section>
      {!modeless && <div className="slds-backdrop slds-backdrop_open" role="presentation" style={{ zIndex: z - 1 }} />}
    </DialogIds.Provider>,
    document.body,
  )
}

function DialogHeader({ children, className }: P) {
  const d = useContext(DialogIds)
  return d.panel
    ? <div className={cx('slds-panel__header', 'mateu-panel__header', className)}>{children}</div>
    : <div className={cx('slds-modal__header', 'mateu-modal__header', className)}>{children}</div>
}
function DialogTitle({ children, id, className }: P) {
  const d = useContext(DialogIds)
  return d.panel
    ? <h2 id={id ?? d.labelId} className={cx('slds-panel__header-title', 'slds-text-heading_small', 'slds-truncate', className)}>{children}</h2>
    : <h1 id={id ?? d.labelId} className={cx('slds-modal__title', 'slds-hyphenate', className)}>{children}</h1>
}
function DialogSubtitle({ children, id }: P) {
  const d = useContext(DialogIds)
  return <p id={id ?? d.descId} className="slds-m-top_x-small slds-text-color_weak">{children}</p>
}
function DialogClose({ onClose }: P) {
  const d = useContext(DialogIds)
  const close = () => (onClose ?? d.onClose)?.('close-button')
  return (
    <button type="button" className={cx('slds-button', 'slds-button_icon', d.panel ? 'slds-button_icon-small slds-panel__close' : 'slds-modal__close', 'mateu-dialog-close')} title={tx('close')} onClick={close}>
      <XIcon size={16} className="slds-button__icon slds-button__icon_large" />
      <span className="slds-assistive-text">{tx('close')}</span>
    </button>
  )
}
function DialogFooter({ children }: P) {
  const d = useContext(DialogIds)
  return <div className={d.panel ? 'slds-panel__footer mateu-panel__footer' : 'slds-modal__footer'}>{children}</div>
}

export const Dialog = Object.assign(DialogRoot, {
  Header: DialogHeader, Title: DialogTitle, Subtitle: DialogSubtitle, CloseButton: DialogClose, Footer: DialogFooter, Body: ({ children }: P) => <>{children}</>,
  Buttons: ({ buttons }: P) => <>{(buttons as P[] ?? []).map((b, i) => <Button key={i} variant={b.buttonType === 'primary' ? 'primary' : 'default'} onClick={b.onClick}>{b.content}</Button>)}</>,
})

// ── useConfirm (blueprint: Modals — a prompt) ────────────────────────────────────────────────────

type ConfirmOptions = { title?: string; content?: React.ReactNode; confirmButtonContent?: string; cancelButtonContent?: string; confirmButtonType?: 'primary' | 'danger' | 'normal' }
type Pending = ConfirmOptions & { resolve: (yes: boolean) => void }
const ConfirmContext = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null)

/** The confirmation dialog the session asks with (provided once at the root). */
export function ConfirmProvider({ children }: P) {
  const [pending, setPending] = useState<Pending[]>([])
  const confirm = useCallback((o: ConfirmOptions) => new Promise<boolean>((resolve) => setPending((p) => [...p, { ...o, resolve }])), [])
  const top = pending[pending.length - 1]
  const answer = (yes: boolean) => {
    top?.resolve(yes)
    setPending((p) => p.slice(0, -1))
  }
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {top && (
        <Dialog title={top.title ?? ''} onClose={() => answer(false)} width="small" role="alertdialog"
          footerButtons={[
            { content: top.cancelButtonContent ?? tx('cancel'), onClick: () => answer(false) },
            { content: top.confirmButtonContent ?? tx('ok'), buttonType: top.confirmButtonType === 'danger' ? 'danger' : 'primary', onClick: () => answer(true), autoFocus: true },
          ]}>
          {typeof top.content === 'string' ? <p>{top.content}</p> : top.content}
        </Dialog>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): (o: ConfirmOptions) => Promise<boolean> {
  const c = useContext(ConfirmContext)
  return c ?? (async (o: ConfirmOptions) => window.confirm(String(o.content ?? o.title ?? '')))
}

/** The root of the views: the confirmation prompt every screen may ask through (the theme is SLDS's CSS). */
export function BaseStyles({ children }: P) {
  return <ConfirmProvider>{children}</ConfirmProvider>
}
