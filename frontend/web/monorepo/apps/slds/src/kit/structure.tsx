/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useId, useRef, useState } from 'react'
import { cx, type P } from './core'
import { ChevronRightIcon, ErrorIcon, InfoIcon, SuccessIcon, WarningIcon, XIcon } from './icons'
import { tx } from '@mr/i18n/texts'
import emptyIllustration from '@salesforce-ux/design-system/assets/images/illustrations/empty-state-tasks.svg?url'

/**
 * The SLDS kit's structure: Vertical Navigation, Tabs, Breadcrumbs, Tree, Page Headers, Activity
 * Timeline, Scoped Notifications, Illustration — the blueprints' markup, ARIA and keyboard.
 */

const isPart = (el: React.ReactNode, type: unknown) => React.isValidElement(el) && el.type === type

// ── NavList (blueprint: Vertical Navigation) ─────────────────────────────────────────────────────

const NavDepth = createContext(0)

function NavListRoot({ children, 'aria-label': ariaLabel, className }: P) {
  const kids = React.Children.toArray(children)
  const grouped = kids.some((k) => isPart(k, NavGroup))
  return (
    <nav className={cx('slds-nav-vertical', 'slds-nav-vertical_compact', className)} aria-label={ariaLabel}>
      {grouped ? kids.map((k, i) => (isPart(k, NavGroup) ? k : <div key={i} className="slds-nav-vertical__section"><ul>{k}</ul></div>)) : (
        <div className="slds-nav-vertical__section"><ul>{children}</ul></div>
      )}
    </nav>
  )
}

function NavGroup({ title, children }: P) {
  const id = useId()
  return (
    <div className="slds-nav-vertical__section">
      {title && <h2 id={id} className="slds-nav-vertical__title">{title}</h2>}
      <ul aria-labelledby={title ? id : undefined}>{children}</ul>
    </div>
  )
}

function NavItem({ children, href, onClick, 'aria-current': current, defaultOpen, ...rest }: P) {
  const kids = React.Children.toArray(children)
  const sub = kids.find((k) => isPart(k, NavSubNav)) as React.ReactElement<P> | undefined
  const desc = kids.find((k) => isPart(k, NavDescription)) as React.ReactElement<P> | undefined
  const trailing = kids.find((k) => isPart(k, NavTrailing)) as React.ReactElement<P> | undefined
  const leading = kids.find((k) => isPart(k, NavLeading)) as React.ReactElement<P> | undefined
  const label = kids.filter((k) => k !== sub && k !== desc && k !== trailing && k !== leading)
  const depth = useContext(NavDepth)
  const [open, setOpen] = useState(!!defaultOpen)
  const active = current === 'page' || current === true || current === 'true'
  if (sub) {
    return (
      <li className="slds-nav-vertical__item">
        <button type="button" className="slds-nav-vertical__action mateu-nav-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)} style={{ paddingInlineStart: `${1 + depth}rem` }}>
          <ChevronRightIcon size={12} className={cx('slds-icon', 'slds-icon_x-small', 'slds-icon-text-default', 'slds-m-right_x-small', open && 'mateu-rotate-90')} />
          {label}
        </button>
        {open && <NavDepth.Provider value={depth + 1}><ul>{sub.props.children}</ul></NavDepth.Provider>}
      </li>
    )
  }
  return (
    <li className={cx('slds-nav-vertical__item', active && 'slds-is-active')}>
      <a href={href ?? '#'} className="slds-nav-vertical__action" aria-current={active ? 'page' : undefined} onClick={onClick}
        style={depth ? { paddingInlineStart: `${1 + depth}rem` } : undefined} {...rest}>
        {leading && <span className="slds-m-right_x-small">{leading.props.children}</span>}
        <span className="mateu-nav-label">
          {label}
          {desc && <span className="slds-text-body_small slds-text-color_weak mateu-nav-desc">{desc.props.children}</span>}
        </span>
        {trailing && <span className="slds-col_bump-left">{trailing.props.children}</span>}
      </a>
    </li>
  )
}
const NavSubNav = ({ children }: P) => <>{children}</>
const NavDescription = ({ children }: P) => <>{children}</>
const NavTrailing = ({ children }: P) => <>{children}</>
const NavLeading = ({ children }: P) => <>{children}</>
const NavDivider = () => <li className="slds-has-divider_top-space" role="separator" />

export const NavList = Object.assign(NavListRoot, {
  Group: NavGroup, Item: NavItem, SubNav: NavSubNav, Description: NavDescription, TrailingVisual: NavTrailing, LeadingVisual: NavLeading, Divider: NavDivider,
})

// ── UnderlineNav (blueprint: Tabs — as navigation links) ─────────────────────────────────────────

function UnderlineNavRoot({ children, 'aria-label': ariaLabel, className }: P) {
  return (
    <nav className={cx('slds-tabs_default', 'mateu-underline-nav', className)} aria-label={ariaLabel}>
      <ul className="slds-tabs_default__nav">{children}</ul>
    </nav>
  )
}
function UnderlineNavItem({ children, href, onSelect, 'aria-current': current, counter, ...rest }: P) {
  const active = current === 'page' || current === true || current === 'true'
  return (
    <li className={cx('slds-tabs_default__item', active && 'slds-is-active')}>
      <a href={href ?? '#'} className="slds-tabs_default__link" aria-current={active ? 'page' : undefined} onClick={(e) => { if (onSelect) { e.preventDefault(); onSelect(e) } }} {...rest}>
        {children}
        {counter != null && <span className="slds-badge slds-badge_lightest slds-m-left_x-small">{counter}</span>}
      </a>
    </li>
  )
}
export const UnderlineNav = Object.assign(UnderlineNavRoot, { Item: UnderlineNavItem })

// ── UnderlinePanels (blueprint: Tabs — role=tablist, arrows move between tabs) ──────────────────

function UnderlinePanelsRoot({ children, 'aria-label': ariaLabel, value, onChange, className }: { children?: React.ReactNode; 'aria-label'?: string; value?: string; onChange?: (e: { value: string }) => void; className?: string; id?: string }) {
  const kids = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<P>[]
  const tabs = kids.filter((k) => k.type === PanelsTab)
  const panels = kids.filter((k) => k.type === PanelsPanel)
  const id = useId()
  const [own, setOwn] = useState<string>(() => String(tabs[0]?.props.value ?? ''))
  const current = value ?? own
  const select = (v: string) => {
    setOwn(v)
    onChange?.({ value: v })
  }
  const list = useRef<HTMLUListElement>(null)
  const onKey = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => String(t.props.value) === current)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next < 0) return
    e.preventDefault()
    select(String(tabs[next].props.value))
    requestAnimationFrame(() => list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus())
  }
  return (
    <div className={cx('slds-tabs_default', className)}>
      <ul ref={list} className="slds-tabs_default__nav" role="tablist" aria-label={ariaLabel} onKeyDown={onKey}>
        {tabs.map((t, i) => {
          const on = String(t.props.value) === current
          return (
            <li key={i} className={cx('slds-tabs_default__item', on && 'slds-is-active')} role="presentation">
              <a href="#" className="slds-tabs_default__link" role="tab" id={`${id}-tab-${i}`} aria-selected={on} tabIndex={on ? 0 : -1}
                aria-controls={`${id}-panel-${i}`} onClick={(e) => { e.preventDefault(); select(String(t.props.value)) }}>
                {t.props.children}
                {t.props.counter != null && <span className="slds-badge slds-badge_lightest slds-m-left_x-small">{t.props.counter}</span>}
              </a>
            </li>
          )
        })}
      </ul>
      {panels.map((p, i) => {
        const ti = tabs.findIndex((t) => String(t.props.value) === String(p.props.value))
        const on = String(p.props.value) === current
        return (
          <div key={i} id={`${id}-panel-${ti}`} className={cx('slds-tabs_default__content', on ? 'slds-show' : 'slds-hide')} role="tabpanel" aria-labelledby={`${id}-tab-${ti}`} tabIndex={0}>
            {on ? p.props.children : null}
          </div>
        )
      })}
    </div>
  )
}
const PanelsTab = ({ children }: P) => <>{children}</>
const PanelsPanel = ({ children }: P) => <>{children}</>
export const UnderlinePanels = Object.assign(UnderlinePanelsRoot, { Tab: PanelsTab, Panel: PanelsPanel })

// ── Breadcrumbs (blueprint: Breadcrumbs) ─────────────────────────────────────────────────────────

function BreadcrumbsRoot({ children, className }: P) {
  return (
    <nav role="navigation" aria-label={tx('breadcrumb')} className={className}>
      <ol className="slds-breadcrumb slds-list_horizontal slds-wrap">{children}</ol>
    </nav>
  )
}
function BreadcrumbsItem({ children, href, onClick, selected }: P) {
  return (
    <li className="slds-breadcrumb__item">
      {selected ? <span aria-current="page" className="mateu-crumb-current">{children}</span> : <a href={href ?? '#'} onClick={onClick}>{children}</a>}
    </li>
  )
}
export const Breadcrumbs = Object.assign(BreadcrumbsRoot, { Item: BreadcrumbsItem })

// ── TreeView (blueprint: Trees — role=tree, arrows, Enter) ───────────────────────────────────────

const TreeLevel = createContext(1)

function TreeViewRoot({ children, 'aria-label': ariaLabel, className }: P) {
  const onKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter((el) => el.offsetParent !== null)
    const i = items.indexOf(document.activeElement as HTMLElement)
    const cur = items[i]
    if (!cur) return
    let next = -1
    if (e.key === 'ArrowDown') next = Math.min(items.length - 1, i + 1)
    else if (e.key === 'ArrowUp') next = Math.max(0, i - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    else if (e.key === 'ArrowRight' && cur.getAttribute('aria-expanded') === 'false') { e.preventDefault(); cur.dispatchEvent(new CustomEvent('mateu-tree-toggle')); return }
    else if (e.key === 'ArrowLeft' && cur.getAttribute('aria-expanded') === 'true') { e.preventDefault(); cur.dispatchEvent(new CustomEvent('mateu-tree-toggle')); return }
    else if (e.key === 'ArrowLeft') {
      const parent = cur.parentElement?.closest<HTMLElement>('[role="treeitem"]')
      if (parent) { e.preventDefault(); parent.focus() }
      return
    }
    if (next < 0) return
    e.preventDefault()
    items.forEach((el) => el.setAttribute('tabindex', '-1'))
    items[next].setAttribute('tabindex', '0')
    items[next].focus()
  }
  // one tab stop: the selected item, else the first
  const root = useRef<HTMLUListElement>(null)
  React.useEffect(() => {
    const items = root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]')
    if (items?.length && ![...items].some((el) => el.tabIndex === 0)) items[0].tabIndex = 0
  })
  return (
    <div className={cx('slds-tree_container', className)}>
      <ul ref={root} className="slds-tree" role="tree" aria-label={ariaLabel} onKeyDown={onKey}>{children}</ul>
    </div>
  )
}

function TreeItem({ children, id, current, defaultExpanded, onSelect, expanded: controlled, onExpandedChange }: P) {
  const kids = React.Children.toArray(children)
  const sub = kids.find((k) => isPart(k, TreeSubTree)) as React.ReactElement<P> | undefined
  const trailing = kids.find((k) => isPart(k, TreeTrailing)) as React.ReactElement<P> | undefined
  const leading = kids.find((k) => isPart(k, TreeLeading)) as React.ReactElement<P> | undefined
  const label = kids.filter((k) => k !== sub && k !== trailing && k !== leading)
  const level = useContext(TreeLevel)
  const [own, setOwn] = useState(!!defaultExpanded)
  const open = controlled ?? own
  const toggle = () => { setOwn(!open); onExpandedChange?.(!open) }
  const ref = useRef<HTMLLIElement>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el || !sub) return undefined
    const h = (e: Event) => { e.stopPropagation(); toggle() }
    el.addEventListener('mateu-tree-toggle', h)
    return () => el.removeEventListener('mateu-tree-toggle', h)
  })
  const activate = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    if (onSelect) onSelect(e)
    else if (sub) toggle()
  }
  return (
    <li ref={ref} id={id} role="treeitem" aria-level={level} aria-expanded={sub ? open : undefined} aria-selected={current ? true : undefined}
      tabIndex={current ? 0 : -1}
      onClick={activate} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e) } }}>
      <div className={cx('slds-tree__item', current && 'slds-is-selected')}>
        <button type="button" className={cx('slds-button', 'slds-button_icon', 'slds-m-right_x-small', !sub && 'slds-is-disabled')} aria-hidden="true" tabIndex={-1}
          onClick={(e) => { e.stopPropagation(); if (sub) toggle() }}>
          <ChevronRightIcon size={12} className={cx('slds-button__icon', 'slds-button__icon_small', open && 'mateu-rotate-90')} />
        </button>
        <span className="slds-has-flexi-truncate">
          {leading && <span className="slds-m-right_x-small">{leading.props.children}</span>}
          <span className="slds-tree__item-label slds-truncate">{label}</span>
        </span>
        {trailing && <span className="slds-m-left_small">{trailing.props.children}</span>}
      </div>
      {sub && open && <TreeLevel.Provider value={level + 1}><ul role="group">{sub.props.children}</ul></TreeLevel.Provider>}
    </li>
  )
}
const TreeSubTree = ({ children }: P) => <>{children}</>
const TreeTrailing = ({ children }: P) => <>{children}</>
const TreeLeading = ({ children }: P) => <>{children}</>
export const TreeView = Object.assign(TreeViewRoot, { Item: TreeItem, SubTree: TreeSubTree, TrailingVisual: TreeTrailing, LeadingVisual: TreeLeading, DirectoryIcon: () => null })

// ── PageLayout (the content area: SLDS has no page-layout blueprint, only its spacing) ───────────

const CONTAINER: Record<string, string> = { full: '100%', xlarge: '1280px', large: '1012px', medium: '768px' }

function PageLayoutRoot({ children, containerWidth = 'xlarge', padding = 'normal', className }: P) {
  return (
    <div className={cx('mateu-page-layout', className)} style={{ maxWidth: CONTAINER[containerWidth] ?? containerWidth, margin: '0 auto', padding: padding === 'none' ? 0 : 'var(--slds-g-spacing-4, 1rem)' }}>
      {children}
    </div>
  )
}
const PageLayoutContent = ({ children, as = 'div', ...rest }: P) => { const Tag = as as 'div'; return <Tag className="mateu-page-layout__content" {...rest}>{children}</Tag> }
const PageLayoutHeader = ({ children }: P) => <div className="mateu-page-layout__header">{children}</div>
const PageLayoutPane = ({ children, 'aria-label': l }: P) => <aside className="mateu-page-layout__pane" aria-label={l}>{children}</aside>
export const PageLayout = Object.assign(PageLayoutRoot, { Content: PageLayoutContent, Header: PageLayoutHeader, Pane: PageLayoutPane, Footer: PageLayoutHeader })

// ── PageHeader (blueprint: Page Headers — record home / object home) ─────────────────────────────

function PageHeaderRoot({ children, role, 'aria-label': ariaLabel, className }: P) {
  const kids = React.Children.toArray(children)
  const context = kids.find((k) => isPart(k, PHContext)) as React.ReactElement<P> | undefined
  const titleArea = kids.find((k) => isPart(k, PHTitleArea)) as React.ReactElement<P> | undefined
  const actions = kids.find((k) => isPart(k, PHActions)) as React.ReactElement<P> | undefined
  const description = kids.filter((k) => isPart(k, PHDescription))
  const rest = kids.filter((k) => k !== context && k !== titleArea && k !== actions && !description.includes(k))
  const ta = titleArea ? React.Children.toArray(titleArea.props.children) : []
  const leadAction = ta.find((k) => isPart(k, PHLeadingAction)) as React.ReactElement<P> | undefined
  const leadVisual = ta.find((k) => isPart(k, PHLeadingVisual)) as React.ReactElement<P> | undefined
  const title = ta.find((k) => isPart(k, PHTitle)) as React.ReactElement<P> | undefined
  const trailVisual = ta.filter((k) => isPart(k, PHTrailingVisual))
  const trailAction = ta.find((k) => isPart(k, PHTrailingAction))
  const others = ta.filter((k) => k !== leadAction && k !== leadVisual && k !== title && !trailVisual.includes(k) && k !== trailAction)
  const Tag = (title?.props.as ?? 'h1') as 'h1'
  return (
    <div className={cx('slds-page-header', 'slds-page-header_record-home', 'mateu-page-header', className)} role={role} aria-label={ariaLabel}>
      <div className="slds-page-header__row">
        <div className="slds-page-header__col-title">
          {context && !context.props.hidden && <div className="mateu-page-header__context">{context.props.children}</div>}
          <div className="slds-media">
            {leadAction && <div className="slds-media__figure">{leadAction.props.children}</div>}
            {leadVisual && <div className="slds-media__figure">{leadVisual.props.children}</div>}
            <div className="slds-media__body">
              <div className="slds-page-header__name">
                <div className="slds-page-header__name-title">
                  <Tag className={title?.props.className}>
                    <span className="slds-page-header__title slds-truncate" title={typeof title?.props.children === 'string' ? title.props.children : undefined}>{title?.props.children}</span>
                  </Tag>
                </div>
                {trailVisual.length > 0 && <div className="slds-page-header__name-switcher mateu-page-header__badges">{trailVisual.map((v, i) => <React.Fragment key={i}>{(v as React.ReactElement<P>).props.children}</React.Fragment>)}</div>}
                {trailAction}
              </div>
              {others}
            </div>
          </div>
        </div>
        {actions && (
          <div className="slds-page-header__col-actions">
            <div className="slds-page-header__controls">
              <div className="slds-page-header__control mateu-page-header__actions">{actions.props.children}</div>
            </div>
          </div>
        )}
      </div>
      {description.map((d, i) => (
        <div key={i} className="slds-page-header__row slds-page-header__row_gutters">
          <div className="slds-page-header__col-details mateu-page-header__details">{(d as React.ReactElement<P>).props.children}</div>
        </div>
      ))}
      {rest}
    </div>
  )
}
const PHContext = ({ children }: P) => <>{children}</>
const PHTitleArea = ({ children }: P) => <>{children}</>
const PHActions = ({ children }: P) => <>{children}</>
const PHDescription = ({ children }: P) => <>{children}</>
const PHLeadingAction = ({ children }: P) => <>{children}</>
const PHLeadingVisual = ({ children }: P) => <>{children}</>
const PHTitle = ({ children }: P) => <>{children}</>
const PHTrailingVisual = ({ children }: P) => <>{children}</>
const PHTrailingAction = ({ children }: P) => <>{children}</>
export const PageHeader = Object.assign(PageHeaderRoot, {
  ContextArea: PHContext, TitleArea: PHTitleArea, Actions: PHActions, Description: PHDescription, LeadingAction: PHLeadingAction,
  LeadingVisual: PHLeadingVisual, Title: PHTitle, TrailingVisual: PHTrailingVisual, TrailingAction: PHTrailingAction,
  ParentLink: ({ children, href }: P) => <a href={href}>{children}</a>, ContextBar: PHContext, ContextAreaActions: PHActions, Navigation: ({ children }: P) => <>{children}</>,
})

// ── Timeline (blueprint: Activity Timeline) ──────────────────────────────────────────────────────

function TimelineRoot({ children, className }: P) {
  return <ul className={cx('slds-timeline', className)}>{children}</ul>
}
function TimelineItem({ children }: P) {
  const kids = React.Children.toArray(children)
  const badge = kids.find((k) => isPart(k, TimelineBadge)) as React.ReactElement<P> | undefined
  const rest = kids.filter((k) => k !== badge)
  return (
    <li>
      <div className="slds-timeline__item_expandable slds-timeline__item_task mateu-timeline-item">
        <div className="slds-media">
          <div className="slds-media__figure">
            <div className="slds-icon_container slds-timeline__icon mateu-timeline-badge" style={badge?.props.style}>{badge?.props.children}</div>
          </div>
          <div className="slds-media__body">{rest}</div>
        </div>
      </div>
    </li>
  )
}
const TimelineBadge = ({ children }: P) => <>{children}</>
const TimelineBody = ({ children }: P) => <div className="mateu-timeline-body">{children}</div>
const TimelineBreak = () => <li className="slds-has-divider_top" role="separator" />
export const Timeline = Object.assign(TimelineRoot, { Item: TimelineItem, Badge: TimelineBadge, Body: TimelineBody, Break: TimelineBreak })

// ── Banner / Flash (blueprint: Scoped Notifications) ─────────────────────────────────────────────

const TONE: Record<string, { theme: string; icon: React.FC<P>; word: string }> = {
  critical: { theme: 'slds-theme_error', icon: ErrorIcon, word: 'error' },
  danger: { theme: 'slds-theme_error', icon: ErrorIcon, word: 'error' },
  warning: { theme: 'slds-theme_warning', icon: WarningIcon, word: 'warning' },
  attention: { theme: 'slds-theme_warning', icon: WarningIcon, word: 'warning' },
  success: { theme: 'slds-theme_success', icon: SuccessIcon, word: 'success' },
  info: { theme: 'slds-scoped-notification_light', icon: InfoIcon, word: 'info' },
  default: { theme: 'slds-scoped-notification_light', icon: InfoIcon, word: 'info' },
  upsell: { theme: 'slds-scoped-notification_light', icon: InfoIcon, word: 'info' },
}

function BannerRoot({ title, description, variant = 'info', onDismiss, primaryAction, secondaryAction, hideTitle, leadingVisual, children, className, style, role, 'aria-label': ariaLabel }: P) {
  const t = TONE[variant] ?? TONE.info
  const Ic = t.icon
  return (
    <div className={cx('slds-scoped-notification', 'slds-media', 'slds-media_center', t.theme, 'mateu-banner', className)} role={role ?? (variant === 'critical' ? 'alert' : 'status')} aria-label={ariaLabel} style={style}>
      <div className="slds-media__figure">
        <span className={cx('slds-icon_container', `slds-icon-utility-${t.word}`)} title={t.word}>
          {leadingVisual ? (React.isValidElement(leadingVisual) ? leadingVisual : React.createElement(leadingVisual as React.FC<P>, { size: 20, className: 'slds-icon slds-icon_small' }))
            : <Ic size={20} className={cx('slds-icon', 'slds-icon_small', t.theme.includes('light') ? 'slds-icon-text-default' : '')} />}
          <span className="slds-assistive-text">{t.word}</span>
        </span>
      </div>
      <div className="slds-media__body">
        {title && <h2 className={cx('slds-text-heading_small', hideTitle && 'slds-assistive-text')}>{title}</h2>}
        {description && <div className="mateu-banner__description">{description}</div>}
        {children}
      </div>
      {(primaryAction || secondaryAction) && <div className="slds-media__figure slds-media__figure_reverse mateu-banner__actions">{secondaryAction}{primaryAction}</div>}
      {onDismiss && (
        <div className="slds-media__figure slds-media__figure_reverse">
          <button type="button" className={cx('slds-button', 'slds-button_icon', t.theme.includes('light') ? '' : 'slds-button_icon-inverse')} title={tx('dismiss')} onClick={onDismiss}>
            <XIcon size={14} className="slds-button__icon" />
            <span className="slds-assistive-text">{tx('dismiss')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
const BannerPrimary = ({ children, onClick }: P) => <button type="button" className="slds-button slds-button_neutral" onClick={onClick}>{children}</button>
const BannerSecondary = ({ children, onClick }: P) => <button type="button" className="slds-button slds-button_neutral slds-m-right_x-small" onClick={onClick}>{children}</button>
export const Banner = Object.assign(BannerRoot, { PrimaryAction: BannerPrimary, SecondaryAction: BannerSecondary, Title: ({ children }: P) => <>{children}</>, Description: ({ children }: P) => <>{children}</> })

export function Flash({ variant = 'default', children, className, style, role, full }: P) {
  return <BannerRoot variant={variant === 'danger' ? 'critical' : variant} className={className} style={style} role={role}>{children}</BannerRoot>
}

// ── Blankslate (blueprint: Illustration — the empty state) ──────────────────────────────────────

function BlankslateRoot({ children, border, spacious, narrow, className }: P) {
  const kids = React.Children.toArray(children)
  const visual = kids.find((k) => isPart(k, BSVisual)) as React.ReactElement<P> | undefined
  const rest = kids.filter((k) => k !== visual)
  return (
    <div className={cx('slds-illustration', spacious ? 'slds-illustration_large' : 'slds-illustration_small', border && 'mateu-illustration_border', className)}>
      {visual ? <div className="mateu-illustration__visual">{visual.props.children}</div> : <img src={emptyIllustration} alt="" className="slds-illustration__svg" aria-hidden="true" />}
      <div className="slds-text-longform">{rest}</div>
    </div>
  )
}
const BSVisual = ({ children }: P) => <>{children}</>
const BSHeading = ({ children, as = 'h3' }: P) => { const Tag = as as 'h3'; return <Tag className="slds-text-heading_medium">{children}</Tag> }
const BSDescription = ({ children }: P) => <div className="slds-text-body_regular">{children}</div>
const BSPrimary = ({ children, onClick, href }: P) => href
  ? <a className="slds-button slds-button_brand" href={href}>{children}</a>
  : <button type="button" className="slds-button slds-button_brand" onClick={onClick}>{children}</button>
const BSSecondary = ({ children, href, onClick }: P) => <a className="slds-button slds-m-left_small" href={href ?? '#'} onClick={onClick}>{children}</a>
export const Blankslate = Object.assign(BlankslateRoot, { Visual: BSVisual, Heading: BSHeading, Description: BSDescription, PrimaryAction: BSPrimary, SecondaryAction: BSSecondary })
