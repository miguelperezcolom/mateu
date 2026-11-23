/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useId, useState } from 'react'
import { XIcon, type Icon } from './icons'
import { tx } from '@mr/i18n/texts'

/**
 * The SLDS kit, basic pieces — each one the Lightning Design System blueprint it names (markup +
 * the design system's own CSS classes; nothing restyled). The views were written in a component
 * vocabulary (Button, Text, Stack, Label…); the kit keeps those names and draws them the SLDS way.
 */

export type P = Record<string, any>
type Visual = unknown
/** What a kit piece accepts besides the element's own attributes (data-* go through JSX as usual). */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: string; size?: string; block?: boolean; leadingVisual?: Visual; trailingVisual?: Visual; trailingAction?: Visual
  count?: React.ReactNode; loading?: boolean; as?: unknown; href?: string; target?: string; rel?: string; download?: string | boolean
  alignContent?: string; inactive?: boolean; labelWrap?: boolean; type?: string; [data: `data-${string}`]: unknown
}
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: Visual; label?: string; variant?: string; size?: string; tooltipDirection?: string; description?: string
  keybindingHint?: string; unsafeDisableTooltip?: boolean; [data: `data-${string}`]: unknown
}
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { as?: unknown; muted?: boolean; inline?: boolean; type?: string }
export const cx = (...c: unknown[]): string => c.filter((x) => typeof x === 'string' && x).join(' ')

const renderIcon = (I: unknown, className: string, size = 14): React.ReactNode => {
  if (!I) return null
  if (React.isValidElement(I)) return I
  const C = I as Icon
  return <C size={size} className={className} />
}

// ── Button (blueprint: Buttons) ───────────────────────────────────────────────────────────────

const BUTTON_VARIANT: Record<string, string> = {
  default: 'slds-button_neutral',
  primary: 'slds-button_brand',
  danger: 'slds-button_destructive',
  invisible: '',
  link: '',
  outline: 'slds-button_outline-brand',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'default', size, block, leadingVisual, trailingVisual, trailingAction, count, loading, as, children, className, alignContent, inactive, labelWrap, ...rest },
  ref,
) {
  const classes = cx('slds-button', BUTTON_VARIANT[variant] ?? 'slds-button_neutral', block && 'slds-button_stretch', size === 'small' && 'mateu-button_small', size === 'large' && 'mateu-button_large', alignContent === 'start' && 'mateu-button_start', className)
  const body = (
    <>
      {loading && <span className="mateu-button-spinner" aria-hidden="true" />}
      {renderIcon(leadingVisual, 'slds-button__icon slds-button__icon_left')}
      <span className="mateu-button-label">{children}</span>
      {count !== undefined && count !== null && count !== '' && <span className="slds-badge slds-badge_lightest slds-m-left_x-small mateu-button-count">{count}</span>}
      {renderIcon(trailingVisual, 'slds-button__icon slds-button__icon_right')}
      {renderIcon(trailingAction, 'slds-button__icon slds-button__icon_right')}
    </>
  )
  if (as === 'a' || (rest.href && as !== 'button')) {
    return <a ref={ref as never} className={classes} {...(rest as P)}>{body}</a>
  }
  const Tag = (typeof as === 'string' ? as : 'button') as 'button'
  return (
    <Tag ref={ref} className={classes} aria-busy={loading || undefined} {...(rest as P)} type={(rest.type ?? 'button') as 'button'}>
      {body}
    </Tag>
  )
})

/** Blueprint: Button Icons — bordered-filled by default, bare when invisible. */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, 'aria-label': ariaLabel, label, variant = 'default', size, className, tooltipDirection, description, keybindingHint, unsafeDisableTooltip, ...rest },
  ref,
) {
  const name = ariaLabel ?? label ?? description
  const classes = cx(
    'slds-button', 'slds-button_icon',
    variant === 'invisible' ? '' : variant === 'primary' ? 'slds-button_icon-brand' : variant === 'danger' ? 'slds-button_icon-error slds-button_icon-border-filled' : 'slds-button_icon-border-filled',
    size === 'small' && 'slds-button_icon-small',
    className,
  )
  return (
    <button ref={ref} type="button" className={classes} title={rest.title ?? name} aria-label={name} {...rest}>
      {renderIcon(icon, 'slds-button__icon', 14)}
      <span className="slds-assistive-text">{name}</span>
    </button>
  )
})

/** Blueprint: Button Groups. */
export function ButtonGroup({ className, children, ...rest }: P) {
  return <div className={cx('slds-button-group', className)} role="group" {...rest}>{children}</div>
}

// ── text ──────────────────────────────────────────────────────────────────────────────────────

const TEXT_SIZE: Record<string, string> = { small: 'slds-text-body_small', medium: 'slds-text-body_regular', large: 'slds-text-heading_small' }

export const Text = React.forwardRef<HTMLElement, P>(function Text({ as = 'span', size, weight, className, style, children, ...rest }, ref) {
  const Tag = as as 'span'
  return (
    <Tag ref={ref as never} className={cx(size && TEXT_SIZE[size], className)}
      style={{ ...(weight === 'semibold' || weight === 'bold' ? { fontWeight: 'var(--slds-g-font-weight-bold, 700)' } : weight === 'light' ? { fontWeight: 300 } : {}), ...style }} {...rest}>
      {children}
    </Tag>
  )
})

const HEADING_VARIANT: Record<string, string> = { large: 'slds-text-heading_large', medium: 'slds-text-heading_medium', small: 'slds-text-heading_small' }

export const Heading = React.forwardRef<HTMLHeadingElement, P>(function Heading({ as = 'h2', variant, className, children, ...rest }, ref) {
  const Tag = as as 'h2'
  const v = variant ?? (as === 'h1' ? 'large' : as === 'h2' ? 'medium' : 'small')
  return <Tag ref={ref} className={cx(HEADING_VARIANT[v], className)} {...rest}>{children}</Tag>
})

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link({ as, className, muted, inline, children, ...rest }, ref) {
  if (as === 'button') {
    return <button ref={ref as never} type="button" className={cx('slds-button', 'mateu-link-button', className)} {...(rest as P)}>{children}</button>
  }
  const Tag = (typeof as === 'string' ? as : 'a') as 'a'
  return <Tag ref={ref} className={cx(muted && 'slds-text-color_weak', className)} {...rest}>{children}</Tag>
})

export function VisuallyHidden({ children, as = 'span', ...rest }: P) {
  const Tag = as as 'span'
  return <Tag className="slds-assistive-text" {...rest}>{children}</Tag>
}

// ── layout ────────────────────────────────────────────────────────────────────────────────────

const GAP: Record<string, string> = {
  none: '0', condensed: 'var(--slds-g-spacing-2, .5rem)', normal: 'var(--slds-g-spacing-4, 1rem)', spacious: 'var(--slds-g-spacing-6, 1.5rem)',
}
const ALIGN: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' }
const JUSTIFY: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', 'space-between': 'space-between', 'space-evenly': 'space-evenly' }

/** A flex row or column with the design system's spacing scale (SLDS has no Stack blueprint: its grid utilities). */
export const Stack = React.forwardRef<HTMLElement, P>(function Stack({ as = 'div', direction = 'vertical', gap = 'normal', align, justify, wrap, padding, className, style, children, ...rest }, ref) {
  const Tag = as as 'div'
  const dir = typeof direction === 'object' ? (direction.regular ?? direction.normal ?? 'vertical') : direction
  return (
    <Tag ref={ref as never} className={className} style={{
      display: 'flex', flexDirection: dir === 'horizontal' ? 'row' : 'column',
      gap: GAP[typeof gap === 'object' ? 'normal' : gap] ?? gap, alignItems: align ? ALIGN[align] : undefined,
      justifyContent: justify ? JUSTIFY[justify] : undefined, flexWrap: wrap === 'wrap' || wrap === true ? 'wrap' : undefined,
      padding: padding ? GAP[padding] : undefined, minWidth: 0, ...style,
    }} {...rest}>
      {children}
    </Tag>
  )
})

// ── status ────────────────────────────────────────────────────────────────────────────────────

/** Blueprint: Spinners (inline, brand). */
export function Spinner({ size = 'medium', srText = tx('loading'), className, ...rest }: P) {
  const s = size === 'small' ? 'x-small' : size === 'large' ? 'large' : 'small'
  return (
    <span className={cx('mateu-spinner', `mateu-spinner_${s}`, className)} {...rest}>
      <span role="status" className={cx('slds-spinner', `slds-spinner_${s}`, 'slds-spinner_brand', 'slds-spinner_inline')}>
        <span className="slds-assistive-text">{srText}</span>
        <span className="slds-spinner__dot-a" />
        <span className="slds-spinner__dot-b" />
      </span>
    </span>
  )
}

/** Blueprint: Progress Bar. */
export function ProgressBar({ progress = 0, barSize, animated, bg, className, style, 'aria-label': ariaLabel, 'aria-valuetext': valueText, 'aria-hidden': ariaHidden, ...rest }: P) {
  const value = Math.max(0, Math.min(100, Number(progress) || 0))
  return (
    <div className={cx('slds-progress-bar', barSize === 'small' ? 'slds-progress-bar_x-small' : barSize === 'large' ? 'slds-progress-bar_large' : '', animated && 'mateu-progress_animated', className)}
      role={ariaHidden ? undefined : 'progressbar'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label={ariaLabel} aria-valuetext={valueText} aria-hidden={ariaHidden} style={style} {...rest}>
      <span className="slds-progress-bar__value" style={{ width: `${value}%`, ...(bg ? { background: bg } : {}) }}>
        <span className="slds-assistive-text">{valueText ?? `${Math.round(value)}%`}</span>
      </span>
    </div>
  )
}

const BADGE_TONE: Record<string, string> = {
  default: 'slds-badge_lightest', secondary: 'slds-badge_lightest', primary: 'slds-badge_inverse', accent: 'slds-badge_inverse',
  success: 'slds-theme_success', done: 'slds-theme_success', attention: 'slds-theme_warning', severe: 'slds-theme_warning', warning: 'slds-theme_warning',
  danger: 'slds-theme_error', error: 'slds-theme_error', sponsors: 'slds-badge_inverse',
}

/** Blueprint: Badges (the Label the views use: a tone, a text). */
export function Label({ variant = 'default', size, className, children, ...rest }: P) {
  return <span className={cx('slds-badge', BADGE_TONE[variant] ?? '', size === 'large' && 'mateu-badge_large', className)} {...rest}>{children}</span>
}

/** Blueprint: Badges — the count beside a control. */
export function CounterLabel({ scheme, className, children, ...rest }: P) {
  return <span className={cx('slds-badge', scheme === 'primary' ? 'slds-badge_inverse' : 'slds-badge_lightest', 'mateu-counter', className)} {...rest}>{children}</span>
}

/** Blueprint: Pills. */
export function Token({ text, onRemove, leadingVisual, className, ...rest }: P) {
  return (
    <span className={cx('slds-pill', className)} {...rest}>
      {leadingVisual && <span className="slds-pill__icon_container">{renderIcon(leadingVisual, 'slds-icon slds-icon_x-small slds-icon-text-default')}</span>}
      <span className="slds-pill__label" title={typeof text === 'string' ? text : undefined}>{text}</span>
      {onRemove && (
        <button type="button" className="slds-button slds-button_icon slds-pill__remove" title={`${tx('remove')} ${typeof text === 'string' ? text : ''}`.trim()} onClick={onRemove}>
          <RemoveGlyph />
          <span className="slds-assistive-text">{`${tx('remove')} ${typeof text === 'string' ? text : ''}`.trim()}</span>
        </button>
      )}
    </span>
  )
}

const RemoveGlyph = () => <XIcon size={12} className="slds-button__icon" />

/** Blueprint: Avatar. */
export function Avatar({ src, alt = '', size = 24, square, className, ...rest }: P) {
  const s = size <= 20 ? 'x-small' : size <= 24 ? 'small' : size <= 32 ? 'medium' : 'large'
  return (
    <span className={cx('slds-avatar', square ? '' : 'slds-avatar_circle', `slds-avatar_${s}`, className)} style={{ width: size, height: size }} {...rest}>
      <img src={src} alt={alt} />
    </span>
  )
}

/** Blueprint: Tooltip (a popover that names the control it is attached to, on hover and focus). */
export function Tooltip({ text, direction = 'n', children, className }: P) {
  const id = useId()
  const [shown, setShown] = useState(false)
  const nubbin = direction.startsWith('s') ? 'slds-nubbin_top' : direction.startsWith('e') ? 'slds-nubbin_left' : direction.startsWith('w') ? 'slds-nubbin_right' : 'slds-nubbin_bottom'
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<P>, { 'aria-describedby': id })
    : children
  return (
    <span className={cx('mateu-tooltip-anchor', className)} onMouseEnter={() => setShown(true)} onMouseLeave={() => setShown(false)}
      onFocus={() => setShown(true)} onBlur={() => setShown(false)} onKeyDown={(e) => { if (e.key === 'Escape') setShown(false) }}>
      {child}
      <span id={id} role="tooltip" className={cx('slds-popover', 'slds-popover_tooltip', nubbin, 'mateu-tooltip', `mateu-tooltip_${direction}`, !shown && 'slds-hide')}>
        <span className="slds-popover__body">{text}</span>
      </span>
    </span>
  )
}

/** While a lazy part loads: muted lines in the design system's neutral (SLDS has no skeleton blueprint). */
export function SkeletonText({ lines = 1 }: P) {
  return (
    <span className="mateu-skeleton" aria-hidden="true">
      {Array.from({ length: Number(lines) || 1 }, (_, i) => <span key={i} className="mateu-skeleton__line" />)}
    </span>
  )
}

/** The theme belongs to SLDS's CSS: these only keep the views' composition. */
export function ThemeProvider({ children }: P) { return <>{children}</> }
