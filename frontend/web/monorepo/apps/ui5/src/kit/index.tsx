/**
 * The SAP renderer's controls: every one is SAP's own UI5 Web Component (through the official
 * @ui5/webcomponents-react wrappers), under the names the views compose with. Horizon's look is
 * never restyled here — a control only picks the UI5 design (Emphasized, Negative, Transparent…),
 * the value state and the size the wire asks for. What UI5 has no component for (a flex row, a
 * visually hidden span) is plain markup with SAP's theming parameters.
 *
 * The composites follow the Fiori patterns: an action menu is a ui5-menu on its opener, a list of
 * actions a ui5-list, a message a ui5-message-strip, an empty state a ui5-illustrated-message, a
 * tree a ui5-tree, tabs a ui5-tabcontainer, a dialog a ui5-dialog with its footer bar.
 */
import React, { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  Avatar as Ui5Avatar, Bar, BusyIndicator, Button as Ui5Button, CheckBox, Dialog as Ui5Dialog,
  IllustratedMessage, Input, Label as Ui5Label, Link as Ui5Link, List, ListItemGroup, ListItemStandard,
  Menu, MenuItem, MenuSeparator, MessageStrip, Option, ProgressIndicator, RadioButton,
  ResponsivePopover, SegmentedButton, SegmentedButtonItem, Select as Ui5Select, Switch, Tab,
  TabContainer, Tag, TextArea, Title, Token as Ui5Token, Tokenizer, Tree, TreeItem,
} from '@ui5/webcomponents-react'
// the Fiori illustrations it shows are registered in src/ui5/assets.ts (one lazy chunk each)
import { tx } from '@mr/i18n/texts'
import { iconName } from './icons'

export * from './icons'

type Dict = Record<string, unknown>
/** What every control takes besides its own props: children, aria-* and data-* attributes, and the
 *  look hints the views pass (size, as…) which a UI5 control may not need. */
type AnyProps = {
  children?: React.ReactNode; className?: string; style?: React.CSSProperties; id?: string; role?: string; title?: string
  size?: string | number; as?: React.ElementType | string; sx?: unknown; tabIndex?: number; variant?: string; value?: unknown
  onMouseEnter?: (e: React.MouseEvent) => void; onClick?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void; onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void; onBlur?: (e: React.FocusEvent) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- attributes pass through as written
  [attr: `aria-${string}` | `data-${string}`]: any
}
type Gap = 'none' | 'condensed' | 'normal' | 'spacious'

const GAP: Record<Gap, string> = { none: '0', condensed: '0.5rem', normal: '1rem', spacious: '1.5rem' }

/** The text of a React tree (labels a web component takes as an attribute). */
export function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    if (el.type === Description || el.type === LeadingVisual || el.type === TrailingVisual) return ''
    return textOf(el.props.children)
  }
  return ''
}

const childrenOfType = (children: React.ReactNode, type: unknown): React.ReactElement<AnyProps>[] =>
  React.Children.toArray(children).filter((c): c is React.ReactElement<AnyProps> => React.isValidElement(c) && c.type === type)

const assignRef = <T,>(ref: React.Ref<T> | undefined, value: T) => {
  if (!ref) return
  if (typeof ref === 'function') ref(value)
  else (ref as React.MutableRefObject<T>).current = value
}

const ariaOf = (p: AnyProps): Dict => Object.fromEntries(Object.entries(p).filter(([k]) => k.startsWith('aria-') || k.startsWith('data-')))

// ── layout and text ────────────────────────────────────────────────────────────────────────────

export function Stack({ direction = 'vertical', gap = 'normal', align, justify, wrap, padding, className, style, children, as = 'div', ...rest }: AnyProps & {
  direction?: 'horizontal' | 'vertical' | Dict; gap?: Gap | Dict; align?: string; justify?: string; wrap?: string | boolean; padding?: Gap
  className?: string; style?: React.CSSProperties; as?: React.ElementType
}) {
  const dir = typeof direction === 'string' ? direction : ((direction as Dict)['regular'] as string) ?? 'vertical'
  const g = typeof gap === 'string' ? gap : ((gap as Dict)['regular'] as Gap) ?? 'normal'
  const Tag = as as React.ElementType
  const map = (v?: string) => (v === 'start' ? 'flex-start' : v === 'end' ? 'flex-end' : v === 'space-between' ? 'space-between' : v === 'space-evenly' ? 'space-evenly' : v)
  return (
    <Tag className={className} {...ariaOf(rest)} id={rest['id'] as string | undefined} role={rest['role'] as string | undefined}
      style={{
        display: 'flex', flexDirection: dir === 'horizontal' ? 'row' : 'column', gap: GAP[g as Gap] ?? GAP.normal,
        alignItems: map(align as string | undefined), justifyContent: map(justify as string | undefined),
        flexWrap: wrap === 'wrap' || wrap === true ? 'wrap' : undefined, padding: padding ? GAP[padding] : undefined, minWidth: 0, ...style,
      }}>
      {children}
    </Tag>
  )
}
Stack.Item = function StackItem({ grow, children, style }: AnyProps & { grow?: boolean; style?: React.CSSProperties }) {
  return <div style={{ flexGrow: grow ? 1 : undefined, minWidth: 0, ...style }}>{children}</div>
}

const TEXT_SIZE: Record<string, string> = { small: 'var(--sapFontSmallSize)', medium: 'var(--sapFontSize)', large: 'var(--sapFontLargeSize)' }
const TEXT_WEIGHT: Record<string, string | number> = { light: 300, normal: 'normal', medium: 500, semibold: 'bold' }

/** Body text in SAP's font, sizes and weights (a ui5-text wraps a plain run of text only). */
export const Text = React.forwardRef<HTMLElement, AnyProps & { as?: React.ElementType; size?: string; weight?: string; className?: string; style?: React.CSSProperties; id?: string }>(
  function Text({ as = 'span', size, weight, className, style, children, ...rest }, ref) {
    const T = as as React.ElementType
    return (
      <T ref={ref} className={className} id={rest['id']} role={rest['role']} title={rest['title']} {...ariaOf(rest)}
        style={{ fontFamily: 'var(--sapFontFamily)', fontSize: size ? TEXT_SIZE[size] : undefined, fontWeight: weight ? TEXT_WEIGHT[weight] : undefined, color: 'inherit', ...style }}>
        {children}
      </T>
    )
  },
)

const TITLE_SIZE: Record<string, string> = { small: 'H5', medium: 'H4', large: 'H3' }

/** A ui5-title: the level the document outline needs, the size the design asks for. */
export function Heading({ as = 'h2', variant, children, className, style, id }: AnyProps & { as?: string; variant?: string; className?: string; style?: React.CSSProperties; id?: string }) {
  const level = String(as).toUpperCase().replace(/^H/, 'H') as 'H1'
  const size = (variant ? TITLE_SIZE[variant] : level) as 'H1'
  return <Title level={/^H[1-6]$/.test(level) ? level : 'H2'} size={size} className={className} style={style} id={id} wrappingType="Normal">{children}</Title>
}

export function VisuallyHidden({ children, id, as = 'span' }: AnyProps & { as?: React.ElementType; id?: string }) {
  const T = as as React.ElementType
  return <T className="sr-only" id={id}>{children}</T>
}

export const Link = React.forwardRef<HTMLElement, AnyProps & { href?: string; target?: string; rel?: string; download?: string; type?: string; muted?: boolean; inline?: boolean }>(
  function Link({ href, onClick, target, children, className, style, ...rest }, ref) {
    return (
      <Ui5Link ref={ref as never} href={href} target={target} className={className} style={style} wrappingType="Normal"
        accessibleName={rest['aria-label'] as string | undefined}
        onClick={onClick as never}>
        {children}
      </Ui5Link>
    )
  },
)

// ── buttons ────────────────────────────────────────────────────────────────────────────────────

const DESIGN: Record<string, 'Emphasized' | 'Default' | 'Negative' | 'Transparent' | 'Positive' | 'Attention'> = {
  primary: 'Emphasized', default: 'Default', danger: 'Negative', invisible: 'Transparent', link: 'Transparent', success: 'Positive', attention: 'Attention',
}

type ButtonProps = AnyProps & {
  variant?: string; size?: string; leadingVisual?: unknown; trailingVisual?: unknown; trailingAction?: unknown; block?: boolean
  disabled?: boolean; loading?: boolean; inactive?: boolean; onClick?: (e: React.MouseEvent) => void; type?: string
  count?: number; alignContent?: string; autoFocus?: boolean; href?: string
}

/** A ui5-button: Emphasized for the primary action, Negative for a destructive one, Transparent in a toolbar. */
export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  { variant = 'default', leadingVisual, trailingVisual, trailingAction, block, disabled, loading, inactive, onClick, type, count, className, style, children, id, title, autoFocus, href, as, ...rest }, ref,
) {
  const own = useRef<HTMLElement | null>(null)
  useEffect(() => { if (autoFocus) setTimeout(() => own.current?.focus(), 0) }, [autoFocus])
  // a button that is a link (`as="a" href`): it navigates like one
  const press = href && as === 'a' ? () => window.location.assign(href) : onClick
  const label = children ?? null
  const counted = count ? <>{label} ({count})</> : label
  return (
    <Ui5Button
      ref={(el: HTMLElement | null) => { own.current = el; assignRef(ref, el as HTMLElement) }}
      id={id}
      design={DESIGN[variant] ?? 'Default'}
      icon={iconName(leadingVisual)}
      endIcon={iconName(trailingVisual) ?? iconName(trailingAction)}
      disabled={disabled || inactive || undefined}
      loading={loading || undefined}
      type={type === 'submit' ? 'Submit' : undefined}
      tooltip={title}
      accessibleName={rest['aria-label'] as string | undefined}
      accessibilityAttributes={rest['aria-haspopup'] || rest['aria-expanded'] !== undefined
        ? { hasPopup: rest['aria-haspopup'] ? 'menu' : undefined, expanded: rest['aria-expanded'] as boolean | undefined } as never
        : undefined}
      className={className}
      style={{ ...(block ? { width: '100%' } : {}), ...style }}
      {...Object.fromEntries(Object.entries(rest).filter(([k]) => k.startsWith('data-')))}
      onClick={press as never}
      onKeyDown={rest.onKeyDown as never}
    >
      {counted}
    </Ui5Button>
  )
})

/** An icon-only ui5-button: its name is its accessible name and its tooltip. */
export const IconButton = React.forwardRef<HTMLElement, ButtonProps & { icon: unknown; 'aria-label'?: string; description?: string; tooltipDirection?: string }>(
  function IconButton({ icon, variant = 'invisible', description, tooltipDirection: _t, ...rest }, ref) {
    const label = (rest['aria-label'] as string | undefined) ?? description
    return <Button ref={ref} {...rest} variant={variant} leadingVisual={icon} title={label} aria-label={label} />
  },
)

/** Buttons that belong together, side by side (Fiori lays them out in a toolbar, never glued). */
export function ButtonGroup({ children, className, style, ...rest }: AnyProps & { className?: string; style?: React.CSSProperties }) {
  return <div role="group" className={className} {...ariaOf(rest)} style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center', ...style }}>{children}</div>
}

// ── status ─────────────────────────────────────────────────────────────────────────────────────

const TAG_DESIGN: Record<string, 'Positive' | 'Negative' | 'Critical' | 'Information' | 'Neutral' | 'Set2'> = {
  success: 'Positive', danger: 'Negative', attention: 'Critical', severe: 'Critical', accent: 'Information', primary: 'Information',
  done: 'Information', sponsors: 'Set2', default: 'Neutral', secondary: 'Neutral',
}

/** A status tag (ui5-tag) — Fiori's object status in a header or a cell. */
export function Label({ variant = 'default', size, children, className, style, ...rest }: AnyProps & { variant?: string; size?: string; className?: string; style?: React.CSSProperties }) {
  return (
    <Tag design={TAG_DESIGN[variant] ?? 'Neutral'} hideStateIcon size={size === 'large' ? 'L' : 'S'} wrappingType="None" className={className} style={style} {...ariaOf(rest)}>
      {children}
    </Tag>
  )
}

export function CounterLabel({ children, scheme, ...rest }: AnyProps & { scheme?: string }) {
  return <Tag design={scheme === 'primary' ? 'Information' : 'Neutral'} hideStateIcon size="S" {...ariaOf(rest)}>{children}</Tag>
}

/** One removable token (a filter in force) — a ui5-tokenizer of one, Fiori's token pattern. */
export function Token({ text, onRemove, size: _s, ...rest }: AnyProps & { text: React.ReactNode; onRemove?: () => void; size?: string }) {
  return (
    <Tokenizer readonly={!onRemove} onTokenDelete={() => onRemove?.()} style={{ display: 'inline-flex' }} accessibleName={rest['aria-label'] as string | undefined}>
      <Ui5Token text={textOf(text)} />
    </Tokenizer>
  )
}

export function Spinner({ size = 'medium', srText }: AnyProps & { size?: string; srText?: string | null }) {
  return <BusyIndicator active size={size === 'small' ? 'S' : size === 'large' ? 'L' : 'M'} aria-label={srText ?? undefined} />
}

/** A loading placeholder: Fiori shows the busy indicator where the content will be. */
export function SkeletonText({ lines: _l }: AnyProps & { lines?: number }) {
  return <BusyIndicator active size="S" style={{ display: 'block', minHeight: '1.5rem' }} />
}

export function ProgressBar({ progress, barSize: _b, animated, 'aria-label': label, 'aria-valuetext': valueText, className, style }: AnyProps & {
  progress?: number; barSize?: string; animated?: boolean; bg?: string; 'aria-label'?: string; 'aria-valuetext'?: string
}) {
  if (animated && progress === undefined) return <BusyIndicator active size="S" />
  return <ProgressIndicator value={Math.max(0, Math.min(100, Number(progress ?? 0)))} accessibleName={label} displayValue={valueText} className={className} style={style} />
}

export function Avatar({ src, alt, size: sizeProp = 32, square, className, style }: AnyProps & { src?: string; alt?: string; square?: boolean }) {
  const size = Number(sizeProp) || 32
  const ui5Size = size <= 24 ? 'XS' : size <= 40 ? 'S' : size <= 64 ? 'M' : size <= 96 ? 'L' : 'XL'
  const initials = (alt ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
  return (
    <Ui5Avatar size={ui5Size} shape={square ? 'Square' : 'Circle'} initials={src ? undefined : initials || undefined} accessibleName={alt} className={className} style={style}>
      {src ? <img src={src} alt={alt ?? ''} /> : null}
    </Ui5Avatar>
  )
}

/** A tooltip on what it wraps (UI5 shows a control's tooltip natively; plain markup gets a title). */
export function Tooltip({ text, children }: AnyProps & { text: string; direction?: string }) {
  const only = React.Children.only(children) as React.ReactElement<Dict>
  return React.cloneElement(only, { title: text, tooltip: text })
}

// ── messages and empty states ──────────────────────────────────────────────────────────────────

const STRIP: Record<string, 'Information' | 'Positive' | 'Negative' | 'Critical'> = {
  critical: 'Negative', danger: 'Negative', warning: 'Critical', success: 'Positive', info: 'Information', default: 'Information', upsell: 'Information',
}

type ActionNode = React.ReactElement<AnyProps> | undefined

/** A ui5-message-strip — Fiori's message strip, its title in bold, its actions as links in it. */
export function Banner({ title, description, variant = 'info', onDismiss, primaryAction, secondaryAction, hideTitle, className, style, children, ...rest }: AnyProps & {
  title?: React.ReactNode; description?: React.ReactNode; variant?: string; onDismiss?: () => void
  primaryAction?: ActionNode; secondaryAction?: ActionNode; hideTitle?: boolean; leadingVisual?: React.ReactNode; layout?: string
}) {
  return (
    <MessageStrip design={STRIP[variant] ?? 'Information'} hideCloseButton={!onDismiss} onClose={() => onDismiss?.()} className={className} style={style} {...ariaOf(rest)}>
      {!hideTitle && title ? <b>{title} </b> : null}
      {description}
      {children}
      {primaryAction ? <> {primaryAction}</> : null}
      {secondaryAction ? <> {secondaryAction}</> : null}
    </MessageStrip>
  )
}
Banner.PrimaryAction = function BannerAction({ onClick, children }: AnyProps & { onClick?: () => void }) {
  return <Ui5Link onClick={() => onClick?.()} style={{ marginInlineStart: '0.5rem' }}>{children}</Ui5Link>
}
Banner.SecondaryAction = Banner.PrimaryAction

export function Flash({ variant = 'default', children, className, style, full: _f, ...rest }: AnyProps & { variant?: string; full?: boolean; className?: string; style?: React.CSSProperties }) {
  return <MessageStrip design={STRIP[variant] ?? 'Information'} hideCloseButton className={className} style={style} {...ariaOf(rest)}>{children}</MessageStrip>
}

function BlankslateHeading({ children }: AnyProps) { return <>{children}</> }
function BlankslateDescription({ children }: AnyProps) { return <>{children}</> }
function BlankslateVisual({ children }: AnyProps) { return <>{children}</> }
function BlankslateAction({ children, onClick, href }: AnyProps & { onClick?: () => void; href?: string }) {
  return href ? <Ui5Link href={href}>{children}</Ui5Link> : <Ui5Button design="Emphasized" onClick={() => onClick?.()}>{children}</Ui5Button>
}

/** An empty state: Fiori's illustrated message, its title, its subtitle and its actions. */
export function Blankslate({ children, illustration = 'NoData', className, style }: AnyProps & { illustration?: string; spacious?: boolean; border?: boolean; narrow?: boolean }) {
  const heading = childrenOfType(children, BlankslateHeading)[0]
  const description = childrenOfType(children, BlankslateDescription)[0]
  const actions = [...childrenOfType(children, BlankslateAction)]
  return (
    <IllustratedMessage name={illustration as never} titleText={textOf(heading?.props.children)} subtitleText={textOf(description?.props.children)} className={className} style={style}>
      {actions}
    </IllustratedMessage>
  )
}
Blankslate.Heading = BlankslateHeading
Blankslate.Description = BlankslateDescription
Blankslate.Visual = BlankslateVisual
Blankslate.PrimaryAction = BlankslateAction
Blankslate.SecondaryAction = BlankslateAction

// ── form controls ──────────────────────────────────────────────────────────────────────────────

interface FieldCtx { id: string; captionId: string; validationId: string; required: boolean; disabled: boolean; invalid: boolean; labelText: string; inline: boolean }
const FormControlContext = createContext<FieldCtx | null>(null)
const useField = () => useContext(FormControlContext)

function FCLabel({ children, visuallyHidden, requiredIndicator: _r }: AnyProps & { visuallyHidden?: boolean; requiredIndicator?: boolean }) {
  const f = useField()
  // a checkbox / radio / switch carries its label as its own text (Fiori draws it beside the box)
  if (f?.inline) return null
  const label = <Ui5Label for={f?.id} required={f?.required || undefined} showColon={false} wrappingType="Normal" id={f ? `${f.id}-label` : undefined}>{children}</Ui5Label>
  return visuallyHidden ? <span className="sr-only">{label}</span> : label
}
function FCCaption({ children }: AnyProps) {
  const f = useField()
  return <Text as="div" size="small" id={f?.captionId} style={{ color: 'var(--sapContent_LabelColor)' }}>{children}</Text>
}
function FCValidation({ children, variant: _v }: AnyProps & { variant?: string }) {
  const f = useField()
  return <Text as="div" size="small" id={f?.validationId} role="alert" style={{ color: 'var(--sapNegativeTextColor)' }}>{children}</Text>
}
function FCLeadingVisual({ children }: AnyProps) { return <>{children}</> }

/** A field: its ui5-label bound to the control, the control, its help and its message. */
export function FormControl({ children, required, disabled, id, className, style, layout: _l }: AnyProps & { required?: boolean; disabled?: boolean; id?: string; className?: string; style?: React.CSSProperties; layout?: string }) {
  const auto = useId()
  const cid = id ?? `f${auto.replace(/:/g, '')}`
  const kids = React.Children.toArray(children)
  const invalid = kids.some((c) => React.isValidElement(c) && c.type === FCValidation)
  const labelEl = kids.find((c) => React.isValidElement(c) && c.type === FCLabel) as React.ReactElement<AnyProps> | undefined
  // a checkbox or a radio carries its own label, after the box (as Fiori draws it)
  const inline = kids.some((c) => React.isValidElement(c) && (c.type === Checkbox || c.type === Radio || c.type === ToggleSwitch))
  const ctx = useMemo<FieldCtx>(() => ({
    id: cid, captionId: `${cid}-caption`, validationId: `${cid}-validation`, required: !!required, disabled: !!disabled, invalid, labelText: textOf(labelEl?.props.children), inline,
  }), [cid, required, disabled, invalid, labelEl, inline])
  return (
    <FormControlContext.Provider value={ctx}>
      <div className={className} style={{ display: 'flex', flexDirection: inline ? 'row' : 'column', justifyContent: inline ? 'flex-start' : undefined, alignItems: inline ? 'center' : undefined, gap: '0.25rem', minWidth: 0, ...style }}>
        {children}
      </div>
    </FormControlContext.Provider>
  )
}
FormControl.Label = FCLabel
FormControl.Caption = FCCaption
FormControl.Validation = FCValidation
FormControl.LeadingVisual = FCLeadingVisual

const valueStateOf = (f: FieldCtx | null, status?: string) =>
  status === 'error' || f?.invalid ? 'Negative' : status === 'success' ? 'Positive' : status === 'warning' ? 'Critical' : 'None'

/** The synthetic event a view reads (`e.target.value` / `e.target.checked`), from a UI5 event. */
const asChange = (el: EventTarget | null, value: unknown, checked?: boolean) =>
  ({ target: Object.assign(Object.create(null), { value, checked, ...((el as object) ?? {}) }, { value, checked }), currentTarget: el }) as unknown as React.ChangeEvent<HTMLInputElement>

type InputProps = AnyProps & {
  value?: string | number; defaultValue?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string
  block?: boolean; size?: string; disabled?: boolean; readOnly?: boolean; required?: boolean; validationStatus?: string; leadingVisual?: unknown
  trailingVisual?: unknown; trailingAction?: React.ReactNode; monospace?: boolean; loading?: boolean
  autoFocus?: boolean; maxLength?: number; name?: string; autoComplete?: string; min?: unknown; max?: unknown; step?: unknown
  onKeyDown?: (e: React.KeyboardEvent) => void; onBlur?: (e: React.FocusEvent) => void; onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
}

const INPUT_TYPE: Record<string, string> = { email: 'Email', number: 'Number', password: 'Password', tel: 'Tel', url: 'URL', search: 'Search', text: 'Text' }

/** A ui5-input: typed on every key (`input`), committed on blur/enter (`change`). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a view's ref to an input (the ui5-input has `.value`, `.focus()`)
export const TextInput = React.forwardRef<any, InputProps>(function TextInput(
  { value, defaultValue, onChange, placeholder, type = 'text', block, disabled, readOnly, required, validationStatus, leadingVisual, trailingAction, className, style, id, autoFocus, maxLength, name, autoComplete, onKeyDown, onBlur, onFocus, ...rest }, ref,
) {
  const f = useField()
  const local = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (autoFocus) setTimeout(() => (local.current as HTMLElement | null)?.focus(), 0)
    // the HTML autocomplete token (WCAG 1.3.5) lands on the native input inside
    if (autoComplete && local.current) {
      const inner = () => local.current?.shadowRoot?.querySelector('input')
      setTimeout(() => inner()?.setAttribute('autocomplete', autoComplete), 0)
    }
  }, [autoFocus, autoComplete])
  return (
    <Input
      ref={(el: HTMLElement | null) => { local.current = el; assignRef(ref, el as HTMLElement) }}
      id={id ?? f?.id}
      value={value === undefined ? defaultValue : String(value ?? '')}
      placeholder={placeholder}
      type={(INPUT_TYPE[type] ?? 'Text') as never}
      disabled={disabled || f?.disabled || undefined}
      readonly={readOnly || undefined}
      required={required || f?.required || undefined}
      valueState={valueStateOf(f, validationStatus) as never}
      maxlength={maxLength}
      name={name}
      icon={leadingVisual && iconName(leadingVisual) ? <IconOf name={iconName(leadingVisual)!} /> : undefined}
      accessibleName={(rest['aria-label'] as string | undefined) ?? undefined}
      accessibleDescriptionRef={f && f.invalid ? f.validationId : undefined}
      className={className}
      style={{ width: block === false ? undefined : '100%', ...style }}
      {...Object.fromEntries(Object.entries(rest).filter(([k]) => k.startsWith('data-')))}
      onInput={(e: Event) => onChange?.(asChange(e.target, (e.target as HTMLInputElement).value))}
      onKeyDown={onKeyDown as never}
      onBlur={onBlur as never}
      onFocus={onFocus as never}
    >
      {trailingAction}
    </Input>
  )
})

function IconOf({ name }: { name: string }) {
  return React.createElement('ui5-icon', { name, slot: 'icon' })
}

export const Textarea = React.forwardRef<HTMLElement, InputProps & { rows?: number; resize?: string }>(function Textarea(
  { value, onChange, placeholder, rows, disabled, readOnly, required, validationStatus, className, style, id, block: _b, resize: _r, ...rest }, ref,
) {
  const f = useField()
  return (
    <TextArea
      ref={ref as never}
      id={id ?? f?.id}
      value={String(value ?? '')}
      placeholder={placeholder}
      rows={rows}
      growing
      disabled={disabled || f?.disabled || undefined}
      readonly={readOnly || undefined}
      required={required || f?.required || undefined}
      valueState={valueStateOf(f, validationStatus) as never}
      accessibleName={rest['aria-label'] as string | undefined}
      className={className}
      style={{ width: '100%', ...style }}
      onInput={(e: Event) => onChange?.(asChange(e.target, (e.target as HTMLTextAreaElement).value))}
    />
  )
})

export const Checkbox = React.forwardRef<HTMLElement, AnyProps & { checked?: boolean; indeterminate?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; value?: string; id?: string; name?: string; required?: boolean }>(
  function Checkbox({ checked, indeterminate, onChange, disabled, value, id, name, required, ...rest }, ref) {
    const f = useField()
    return (
      <CheckBox
        ref={ref as never}
        id={id ?? f?.id}
        checked={!!checked}
        indeterminate={indeterminate || undefined}
        disabled={disabled || f?.disabled || undefined}
        required={required || f?.required || undefined}
        name={name}
        value={value}
        text={f?.labelText || undefined}
        accessibleName={(rest['aria-label'] as string | undefined) ?? (f ? undefined : undefined)}
        accessibleNameRef={rest['aria-labelledby'] as string | undefined}
        valueState={valueStateOf(f) as never}
        onChange={(e: Event) => onChange?.(asChange(e.target, value, (e.target as HTMLInputElement).checked))}
      />
    )
  },
)

export const Radio = React.forwardRef<HTMLElement, AnyProps & { checked?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; value: string; name?: string; disabled?: boolean }>(
  function Radio({ checked, onChange, value, name, disabled, id, ...rest }, ref) {
    const f = useField()
    return (
      <RadioButton ref={ref as never} id={id ?? f?.id} checked={!!checked} name={name} value={value} disabled={disabled || undefined}
        text={f?.labelText || undefined} accessibleName={rest['aria-label'] as string | undefined}
        onChange={(e: Event) => onChange?.(asChange(e.target, value, (e.target as HTMLInputElement).checked))} />
    )
  },
)

export const ToggleSwitch = React.forwardRef<HTMLElement, AnyProps & { checked?: boolean; onClick?: () => void; onChange?: (on: boolean) => void; disabled?: boolean; 'aria-labelledby'?: string; size?: string; statusLabelPosition?: string }>(
  function ToggleSwitch({ checked, onClick, onChange, disabled, ...rest }, ref) {
    return (
      <Switch ref={ref as never} checked={!!checked} disabled={disabled || undefined} accessibleNameRef={rest['aria-labelledby']}
        accessibleName={rest['aria-label'] as string | undefined}
        onChange={(e: Event) => { onClick?.(); onChange?.((e.target as HTMLInputElement).checked) }} />
    )
  },
)

function fieldset({ children, ...rest }: AnyProps, role: string) {
  return <div role={role} {...ariaOf(rest)} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>{children}</div>
}
function GroupLabel({ children, visuallyHidden }: AnyProps & { visuallyHidden?: boolean }) {
  const l = <Ui5Label wrappingType="Normal">{children}</Ui5Label>
  return visuallyHidden ? <span className="sr-only">{l}</span> : l
}
export function CheckboxGroup(p: AnyProps & { required?: boolean; disabled?: boolean }) { return fieldset(p, 'group') }
CheckboxGroup.Label = GroupLabel
CheckboxGroup.Caption = FCCaption
CheckboxGroup.Validation = FCValidation
export function RadioGroup(p: AnyProps & { name?: string; required?: boolean; disabled?: boolean; onChange?: (value: string | null) => void }) { return fieldset(p, 'radiogroup') }
RadioGroup.Label = GroupLabel
RadioGroup.Caption = FCCaption
RadioGroup.Validation = FCValidation

function SelectOption({ children }: AnyProps & { value: string; disabled?: boolean }) { return <>{children}</> }

/** A ui5-select of its options. */
export const Select = Object.assign(React.forwardRef<HTMLElement, InputProps & { children?: React.ReactNode }>(function Select(
  { value, onChange, disabled, required, validationStatus, className, style, id, block: _b, children, placeholder, ...rest }, ref,
) {
  const f = useField()
  const options = childrenOfType(children, SelectOption)
  return (
    <Ui5Select
      ref={ref as never}
      id={id ?? f?.id}
      value={value === undefined ? undefined : String(value ?? '')}
      disabled={disabled || f?.disabled || undefined}
      required={required || f?.required || undefined}
      valueState={valueStateOf(f, validationStatus) as never}
      accessibleName={rest['aria-label'] as string | undefined}
      className={className}
      style={{ width: '100%', ...style }}
      onChange={(e: CustomEvent<{ selectedOption?: { value?: string } }>) => onChange?.(asChange(e.target, e.detail?.selectedOption?.value ?? ''))}
    >
      {placeholder !== undefined && !options.some((o) => String(o.props.value) === '') ? <Option value="">{placeholder}</Option> : null}
      {options.map((o, i) => (
        <Option key={i} value={String(o.props.value ?? '')} selected={String(o.props.value ?? '') === String(value ?? '') || undefined}>{textOf(o.props.children)}</Option>
      ))}
    </Ui5Select>
  )
}), { Option: SelectOption })

/** One choice of several, pressed in place: a ui5-segmented-button. */
export function SegmentedControl({ children, onChange, 'aria-label': label, size: _s, fullWidth }: AnyProps & { onChange?: (i: number) => void; 'aria-label'?: string; size?: string; fullWidth?: boolean }) {
  const items = childrenOfType(children, SegmentedButtonOption)
  return (
    <SegmentedButton accessibleName={label} style={fullWidth ? { width: '100%' } : undefined}
      onSelectionChange={(e: CustomEvent<{ selectedItems?: HTMLElement[] }>) => {
        const picked = e.detail?.selectedItems?.[0]
        const i = picked ? Number(picked.getAttribute('data-index')) : -1
        if (i >= 0) onChange?.(i)
      }}>
      {items.map((it, i) => (
        <SegmentedButtonItem key={i} data-index={i} selected={!!(it.props as Record<string, unknown>)['selected'] || undefined} icon={iconName((it.props as Record<string, unknown>)['leadingIcon'] ?? (it.props as Record<string, unknown>)['icon'])}
          accessibleName={it.props['aria-label'] as string | undefined} tooltip={it.props['aria-label'] as string | undefined}>
          {it.props.children}
        </SegmentedButtonItem>
      ))}
    </SegmentedButton>
  )
}
function SegmentedButtonOption({ children }: AnyProps & { selected?: boolean; leadingIcon?: unknown }) { return <>{children}</> }
SegmentedControl.Button = SegmentedButtonOption
SegmentedControl.IconButton = SegmentedButtonOption

// ── lists, menus ───────────────────────────────────────────────────────────────────────────────

function Description({ children }: AnyProps) { return <>{children}</> }
function LeadingVisual({ children }: AnyProps) { return <>{children}</> }
function TrailingVisual({ children }: AnyProps) { return <>{children}</> }
function Divider() { return null }

/** Where an action list is: in a menu (its items are ui5-menu-items) or on the page (a ui5-list). */
interface MenuCtx { register: (el: HTMLElement | null, run: () => void) => void; close: () => void; selection?: string }
const MenuContext = createContext<MenuCtx | null>(null)
const ListSelectionContext = createContext<string | undefined>(undefined)

const visualIcon = (children: React.ReactNode, type: unknown): string | undefined => {
  const v = childrenOfType(children, type)[0]
  if (!v) return undefined
  const kid = React.Children.toArray(v.props.children)[0]
  return React.isValidElement(kid) ? iconName(kid.type) : undefined
}

type ItemProps = AnyProps & {
  onSelect?: (e: React.SyntheticEvent | Event) => void; selected?: boolean; active?: boolean; disabled?: boolean; variant?: string
  href?: string; inactiveText?: string
}

function ActionListItem({ onSelect, selected, active, disabled, variant, href, children, ...rest }: ItemProps) {
  const menu = useContext(MenuContext)
  const selection = useContext(ListSelectionContext)
  const text = textOf(children)
  const desc = textOf(childrenOfType(children, Description)[0]?.props.children)
  const icon = visualIcon(children, LeadingVisual)
  const run = () => { if (href) window.location.assign(href); else onSelect?.(new Event('select')) }
  if (menu) {
    return (
      <MenuItem ref={(el: HTMLElement | null) => menu.register(el, run)} text={text} additionalText={desc || undefined} icon={icon ?? (selection && selected ? 'accept' : undefined)}
        disabled={disabled || undefined} checked={selection ? !!selected : undefined} accessibleName={rest['aria-label'] as string | undefined} />
    )
  }
  return (
    <ListItemStandard text={text} description={desc || undefined} icon={icon} selected={!!(selected || active) || undefined}
      type={disabled ? 'Inactive' : 'Active'} accessibleName={rest['aria-label'] as string | undefined} data-variant={variant}
      // a ui5-li fires click (pointer and Enter/Space)
      onClick={() => { if (!disabled) run() }} />
  )
}

function ActionListGroup({ children, title }: AnyProps & { title?: string; selectionVariant?: string }) {
  const menu = useContext(MenuContext)
  const heading = childrenOfType(children, ActionListGroupHeading)[0]
  const headerText = title ?? textOf(heading?.props.children)
  const items = React.Children.toArray(children).filter((c) => !(React.isValidElement(c) && c.type === ActionListGroupHeading))
  if (menu) return <>{headerText ? <MenuSeparator /> : null}{items}</>
  return <ListItemGroup headerText={headerText}>{items}</ListItemGroup>
}
function ActionListGroupHeading({ children }: AnyProps & { as?: string }) { return <>{children}</> }
function ActionListDivider() {
  const menu = useContext(MenuContext)
  return menu ? <MenuSeparator /> : null
}

/** Actions or choices: menu items inside an action menu, a ui5-list anywhere else. */
export function ActionList({ children, selectionVariant, 'aria-label': label, showDividers: _d, className, style, role: _r }: AnyProps & { selectionVariant?: string; 'aria-label'?: string; showDividers?: boolean; className?: string; style?: React.CSSProperties; role?: string }) {
  const menu = useContext(MenuContext)
  if (menu) return <ListSelectionContext.Provider value={selectionVariant}>{children}</ListSelectionContext.Provider>
  return (
    <ListSelectionContext.Provider value={selectionVariant}>
      <List accessibleName={label} separators="Inner" className={className} style={style}
        selectionMode={selectionVariant === 'single' ? 'Single' : selectionVariant === 'multiple' ? 'Multiple' : 'None'}>
        {children}
      </List>
    </ListSelectionContext.Provider>
  )
}
ActionList.Item = ActionListItem
ActionList.LinkItem = ActionListItem
ActionList.Description = Description
ActionList.LeadingVisual = LeadingVisual
ActionList.TrailingVisual = TrailingVisual
ActionList.Group = ActionListGroup
ActionList.GroupHeading = ActionListGroupHeading
ActionList.Divider = ActionListDivider

interface ActionMenuState { open: boolean; setOpen: (o: boolean) => void; openerId: string }
const ActionMenuContext = createContext<ActionMenuState | null>(null)

/** A menu on its opener: a ui5-button (or the element the view anchors it to) and a ui5-menu. */
export function ActionMenu({ children, open, onOpenChange }: AnyProps & { open?: boolean; onOpenChange?: (o: boolean) => void; anchorRef?: unknown }) {
  const [own, setOwn] = useState(false)
  const id = `m${useId().replace(/:/g, '')}`
  const isOpen = open ?? own
  const setOpen = (o: boolean) => { setOwn(o); onOpenChange?.(o) }
  return <ActionMenuContext.Provider value={{ open: isOpen, setOpen, openerId: id }}>{children}</ActionMenuContext.Provider>
}
ActionMenu.Button = React.forwardRef<HTMLElement, ButtonProps>(function ActionMenuButton(props, ref) {
  const m = useContext(ActionMenuContext)!
  return <Button ref={ref} {...props} id={m.openerId} trailingVisual={props.trailingVisual ?? MENU_ARROW} aria-haspopup="true" aria-expanded={m.open} onClick={() => m.setOpen(!m.open)} />
})
ActionMenu.Anchor = function ActionMenuAnchor({ children }: AnyProps) {
  const m = useContext(ActionMenuContext)!
  const only = React.Children.only(children) as React.ReactElement<Dict>
  return React.cloneElement(only, {
    id: m.openerId, 'aria-haspopup': 'true', 'aria-expanded': m.open,
    onClick: (e: React.MouseEvent) => { (only.props['onClick'] as ((e: React.MouseEvent) => void) | undefined)?.(e); m.setOpen(!m.open) },
  })
}
ActionMenu.Overlay = function ActionMenuOverlay({ children }: AnyProps & { width?: string; align?: string; side?: string }) {
  const m = useContext(ActionMenuContext)!
  const handlers = useRef(new Map<HTMLElement, () => void>())
  const ctx = useMemo<MenuCtx>(() => ({
    register: (el, run) => { if (el) handlers.current.set(el, run) },
    close: () => m.setOpen(false),
  }), [m])
  return (
    <MenuContext.Provider value={ctx}>
      <Menu opener={m.openerId} open={m.open} onClose={() => m.setOpen(false)}
        onItemClick={(e: CustomEvent<{ item: HTMLElement }>) => { const run = handlers.current.get(e.detail.item); m.setOpen(false); run?.() }}>
        {children}
      </Menu>
    </MenuContext.Provider>
  )
}
const MENU_ARROW = Object.assign(() => null, { ui5Name: 'slim-arrow-down' })

// ── overlays ───────────────────────────────────────────────────────────────────────────────────

/**
 * Content anchored to the control that opens it: a ui5-responsive-popover (a full-screen dialog on
 * a phone, Fiori's rule). `renderAnchor` receives the opener's props, `onOpen`/`onClose` follow it.
 */
export function AnchoredOverlay({ open, onOpen, onClose, renderAnchor, overlayProps, children, side }: AnyProps & {
  open: boolean; onOpen?: (gesture?: string) => void; onClose?: (gesture?: string) => void
  renderAnchor: ((props: Dict) => React.ReactNode) | null; overlayProps?: Dict; side?: string; anchorRef?: unknown; focusZoneSettings?: unknown; width?: string
}) {
  const id = `a${useId().replace(/:/g, '')}`
  const anchorProps: Dict = { id, 'aria-haspopup': 'true', 'aria-expanded': open, onClick: () => (open ? onClose?.('anchor-click') : onOpen?.('anchor-click')) }
  const width = overlayProps?.['width'] === 'large' ? '32rem' : overlayProps?.['width'] === 'small' ? '16rem' : overlayProps?.['width'] === 'medium' ? '24rem' : undefined
  return (
    <>
      {renderAnchor ? renderAnchor(anchorProps) : null}
      <ResponsivePopover opener={id} open={open} placement={side?.startsWith('outside-top') ? 'Top' : 'Bottom'} horizontalAlign="Start"
        accessibleName={overlayProps?.['aria-label'] as string | undefined} accessibleRole={overlayProps?.['role'] === 'dialog' ? 'Dialog' : undefined}
        onClose={() => onClose?.('escape')} style={{ maxWidth: '100vw', ...(width ? { width } : {}) }}>
        {open ? children : null}
      </ResponsivePopover>
    </>
  )
}

export interface SelectPanelItem { id?: string | number; text?: string; description?: string; disabled?: boolean; [k: string]: unknown }
export type SelectPanelItemInput = SelectPanelItem
export type ItemInput = SelectPanelItem

/**
 * Pick from a list that can be searched — Fiori's select dialog pattern on a responsive popover:
 * a search field over a ui5-list, single or multiple selection.
 */
export function SelectPanel({ title, open, onOpenChange, items, selected, onSelectedChange, filterValue, onFilterChange, renderAnchor, placeholder, inputLabel, loading, overlayProps }: AnyProps & {
  title?: React.ReactNode; open: boolean; onOpenChange: (open: boolean, gesture?: string) => void; items: SelectPanelItem[]
  selected: SelectPanelItem | SelectPanelItem[] | undefined; onSelectedChange: (s: never) => void; filterValue?: string; onFilterChange?: (v: string) => void
  renderAnchor?: (p: Dict) => React.ReactNode; placeholder?: string; inputLabel?: string; loading?: boolean; overlayProps?: Dict
  showSelectedOptionsFirst?: boolean; placeholderText?: string; message?: unknown; footer?: React.ReactNode
}) {
  const multiple = Array.isArray(selected)
  const [own, setOwn] = useState('')
  const filter = filterValue ?? own
  const isSelected = (it: SelectPanelItem) => (multiple ? (selected as SelectPanelItem[]).some((s) => s.id === it.id) : (selected as SelectPanelItem | undefined)?.id === it.id)
  const shown = onFilterChange ? items : items.filter((i) => !filter || String(i.text ?? '').toLowerCase().includes(filter.toLowerCase()))
  return (
    <AnchoredOverlay open={open} onOpen={() => onOpenChange(true)} onClose={(g) => onOpenChange(false, g)} renderAnchor={renderAnchor ? (p) => renderAnchor({ ...p, children: undefined }) : null}
      overlayProps={{ role: 'dialog', 'aria-label': typeof title === 'string' ? title : inputLabel, width: overlayProps?.['width'] ?? 'medium' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '16rem' }}>
        {title ? <Title level="H5">{title}</Title> : null}
        <Input value={filter} placeholder={placeholder} accessibleName={inputLabel} showClearIcon style={{ width: '100%' }}
          onInput={(e: Event) => { const v = (e.target as HTMLInputElement).value; setOwn(v); onFilterChange?.(v) }} />
        {loading ? <BusyIndicator active size="S" /> : null}
        <List selectionMode={multiple ? 'Multiple' : 'SingleSelect' as never} style={{ maxHeight: '20rem', overflow: 'auto' }}
          onSelectionChange={(e: CustomEvent<{ selectedItems: HTMLElement[] }>) => {
            const ids = new Set(e.detail.selectedItems.map((el) => el.getAttribute('data-id')))
            const picked = items.filter((it) => ids.has(String(it.id)))
            if (multiple) onSelectedChange(picked as never)
            else { onSelectedChange((picked[0] ?? undefined) as never); onOpenChange(false, 'selection') }
          }}>
          {shown.map((it) => (
            <ListItemStandard key={String(it.id)} data-id={String(it.id)} text={String(it.text ?? '')} description={it.description}
              selected={isSelected(it) || undefined} type={it.disabled ? 'Inactive' : 'Active'} />
          ))}
        </List>
      </div>
    </AnchoredOverlay>
  )
}
SelectPanel.ItemInput = undefined as unknown

export interface DialogButton { content: React.ReactNode; buttonType?: string; onClick?: () => void; disabled?: boolean; autoFocus?: boolean; ref?: React.Ref<HTMLElement> }

/** A ui5-dialog: its title in the header, its buttons in the footer bar (Fiori's dialog). */
export function Dialog({ title, subtitle, onClose, footerButtons, children, width, height, renderHeader, renderBody, renderFooter, className, style, role, position, initialFocusRef: _i, returnFocusRef: _r, ...rest }: AnyProps & {
  title?: React.ReactNode; subtitle?: React.ReactNode; onClose: (gesture?: string) => void; footerButtons?: DialogButton[]
  width?: string; height?: string; renderHeader?: (p: { dialogLabelId: string; dialogDescriptionId: string }) => React.ReactNode
  renderBody?: (p: Dict) => React.ReactNode; renderFooter?: (p: Dict) => React.ReactNode; className?: string; style?: React.CSSProperties; role?: string
  position?: unknown; initialFocusRef?: unknown; returnFocusRef?: unknown
}) {
  const id = `d${useId().replace(/:/g, '')}`
  const widths: Record<string, string> = { small: '20rem', medium: '30rem', large: '40rem', xlarge: '60rem' }
  const header = renderHeader ? renderHeader({ dialogLabelId: `${id}-title`, dialogDescriptionId: `${id}-subtitle` }) : null
  const footer = renderFooter
    ? renderFooter({})
    : footerButtons?.length
      ? (
        <Bar design="Footer" endContent={<>{footerButtons.map((b, i) => (
          <Ui5Button key={i} design={DESIGN[b.buttonType === 'primary' ? 'primary' : b.buttonType === 'danger' ? 'danger' : 'invisible'] ?? 'Transparent'} disabled={b.disabled || undefined} onClick={() => b.onClick?.()}>{b.content}</Ui5Button>
        ))}</>} />
      ) : undefined
  // `position`: a string, or the responsive form ({ narrow, regular }) — the regular one decides
  const edge = typeof position === 'string' ? position : (position as Dict | undefined)?.['regular'] as string | undefined
  const docked = edge && edge !== 'center' ? `mateu-dialog--${edge}` : ''
  // a MODELESS overlay (Drawer `modeless`): no scrim, the page stays usable — ui5-dialog is always
  // modal, so it is a panel docked at its edge, a non-modal dialog with Fiori's header and footer bars
  if (className?.split(' ').includes('mateu-overlay--modeless')) {
    return (
      <section role="dialog" aria-modal="false" aria-labelledby={header ? undefined : `${id}-title`} aria-label={header ? textOf(title) || undefined : undefined}
        className={['mateu-ui5-side-panel', docked || 'mateu-dialog--right', className].filter(Boolean).join(' ')}
        style={{ width: width ? widths[width] ?? width : undefined, ...style }}
        onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose('escape') } }}>
        {header ?? (
          <Bar design="Header" startContent={<Title level="H2" size="H5" id={`${id}-title`}>{title}</Title>}
            endContent={<Dialog.CloseButton onClose={() => onClose('close-button')} />} />
        )}
        <div className="mateu-ui5-side-panel__body">
          {subtitle && !header ? <Text as="p" style={{ marginTop: 0, color: 'var(--sapContent_LabelColor)' }} id={`${id}-subtitle`}>{subtitle}</Text> : null}
          {renderBody ? renderBody({}) : children}
        </div>
        {footer}
      </section>
    )
  }
  return (
    <Ui5Dialog open headerText={header ? undefined : textOf(title)} accessibleName={textOf(title) || undefined}
      accessibleRole={role === 'alertdialog' ? 'AlertDialog' : 'Dialog'}
      // a drawer (`position` left / right / bottom): the dialog docked at that edge, full height or width
      className={[className, docked].filter(Boolean).join(' ') || undefined}
      style={{ width: width ? widths[width] ?? width : undefined, height: height && widths[height] ? undefined : height, maxWidth: '100vw', ...style }}
      header={(header ?? undefined) as never} footer={footer as never}
      draggable={(rest as Dict)['draggable'] as boolean | undefined} resizable={(rest as Dict)['resizable'] as boolean | undefined}
      onClose={() => onClose('escape')}>
      {subtitle && !header ? <Text as="p" style={{ marginTop: 0, color: 'var(--sapContent_LabelColor)' }} id={`${id}-subtitle`}>{subtitle}</Text> : null}
      {renderBody ? renderBody({}) : children}
    </Ui5Dialog>
  )
}
Dialog.Header = function DialogHeader({ children }: AnyProps) {
  return <div slot="header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0' }}>{children}</div>
}
Dialog.Title = function DialogTitle({ children, id, className }: AnyProps & { id?: string; className?: string }) {
  return <Title level="H2" size="H5" id={id} className={className}>{children}</Title>
}
Dialog.Subtitle = function DialogSubtitle({ children, id }: AnyProps & { id?: string }) {
  return <Text size="small" id={id} style={{ color: 'var(--sapContent_LabelColor)' }}>{children}</Text>
}
Dialog.Body = function DialogBody({ children }: AnyProps) { return <>{children}</> }
Dialog.Footer = function DialogFooter({ children }: AnyProps) {
  return <Bar slot="footer" design="Footer" endContent={<>{children}</>} />
}
Dialog.CloseButton = function DialogCloseButton({ onClose }: { onClose: () => void }) {
  return <Ui5Button design="Transparent" icon="decline" tooltip={tx('close')} accessibleName={tx('close')} onClick={() => onClose()} />
}
Dialog.Buttons = function DialogButtons({ buttons }: { buttons: DialogButton[] }) {
  return <>{buttons.map((b, i) => <Ui5Button key={i} design={b.buttonType === 'primary' ? 'Emphasized' : 'Transparent'} disabled={b.disabled || undefined} onClick={() => b.onClick?.()}>{b.content}</Ui5Button>)}</>
}

/** A confirmation (Fiori's message box): resolves true when the user confirms. */
export function ConfirmDialog({ title, content, confirmButtonContent, cancelButtonContent, confirmButtonType, onClose }: {
  title: string; content: React.ReactNode; confirmButtonContent: string; cancelButtonContent: string; confirmButtonType?: string; onClose: (ok: boolean) => void
}) {
  return (
    <Ui5Dialog open headerText={title} state={confirmButtonType === 'danger' ? 'Critical' : 'None'} accessibleRole="AlertDialog"
      footer={<Bar design="Footer" endContent={<>
        <Ui5Button design={confirmButtonType === 'danger' ? 'Negative' : 'Emphasized'} onClick={() => onClose(true)}>{confirmButtonContent}</Ui5Button>
        <Ui5Button design="Transparent" onClick={() => onClose(false)}>{cancelButtonContent}</Ui5Button>
      </>} />}
      onClose={() => onClose(false)}>
      <Text as="p" style={{ margin: 0 }}>{content}</Text>
    </Ui5Dialog>
  )
}

// ── tabs, trees, crumbs ────────────────────────────────────────────────────────────────────────

function PanelTab({ children }: AnyProps & { 'aria-selected'?: boolean; counter?: string | number }) { return <>{children}</> }
function PanelContent({ children }: AnyProps) { return <>{children}</> }

/** Tabs and their panels: a ui5-tabcontainer (Fiori's icon tab bar). */
export function UnderlinePanels({ children, 'aria-label': label, onSelect, value, onChange }: AnyProps & { 'aria-label'?: string; onSelect?: (i: number) => void; value?: string; onChange?: (e: { value: string }) => void }) {
  const tabs = childrenOfType(children, PanelTab)
  const panels = childrenOfType(children, PanelContent)
  const panelOf = (t: React.ReactElement<AnyProps>, i: number) => (t.props.value !== undefined ? panels.find((p) => p.props.value === t.props.value) : panels[i])
  return (
    <TabContainer aria-label={label} style={{ width: '100%' }}
      onTabSelect={(e: CustomEvent<{ tabIndex: number }>) => {
        onSelect?.(e.detail.tabIndex)
        const v = tabs[e.detail.tabIndex]?.props.value
        if (v !== undefined) onChange?.({ value: String(v) })
      }}>
      {tabs.map((t, i) => (
        <Tab key={i} text={textOf(t.props.children)} selected={(value !== undefined ? t.props.value === value : !!t.props['aria-selected']) || undefined}
          additionalText={(t.props as Dict)['counter'] != null ? String((t.props as Dict)['counter']) : undefined}>
          {panelOf(t, i)?.props.children}
        </Tab>
      ))}
    </TabContainer>
  )
}
UnderlinePanels.Tab = PanelTab
UnderlinePanels.Panel = PanelContent

function NavTab({ children }: AnyProps & { 'aria-current'?: string | boolean; // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the view's own event type
  onSelect?: (e: any) => void; href?: string; counter?: unknown }) { return <>{children}</> }
/** Navigation tabs with no panels (the TABS shell): a ui5-tabcontainer of headers only. */
export function UnderlineNav({ children, 'aria-label': label }: AnyProps & { 'aria-label'?: string }) {
  const items = childrenOfType(children, NavTab)
  return (
    <TabContainer aria-label={label} collapsed noAutoSelection
      onTabSelect={(e: CustomEvent<{ tabIndex: number }>) => ((items[e.detail.tabIndex]?.props as Dict)['onSelect'] as ((e: unknown) => void) | undefined)?.(e)}>
      {items.map((t, i) => <Tab key={i} text={textOf(t.props.children)} selected={!!t.props['aria-current'] || undefined} />)}
    </TabContainer>
  )
}
UnderlineNav.Item = NavTab

function TreeItemNode({ children }: AnyProps & { expanded?: boolean; defaultExpanded?: boolean; onSelect?: () => void; current?: boolean; onExpandedChange?: (e: boolean) => void }) { return <>{children}</> }
function TreeSubTree({ children }: AnyProps) { return <>{children}</> }

const treeItems = (children: React.ReactNode, handlers: Map<string, () => void>, path = 't'): React.ReactNode[] =>
  childrenOfType(children, TreeItemNode).map((it, i) => {
    const key = `${path}-${i}`
    const onSelect = (it.props as Dict)['onSelect'] as (() => void) | undefined
    if (onSelect) handlers.set(key, onSelect)
    const sub = childrenOfType(it.props.children, TreeSubTree)[0]
    const trailing = textOf(childrenOfType(it.props.children, TrailingVisual)[0]?.props.children)
    return (
      <TreeItem key={key} data-key={key} text={textOf(it.props.children)} additionalText={trailing || undefined}
        expanded={((it.props as Dict)['expanded'] ?? (it.props as Dict)['defaultExpanded']) !== false || undefined} selected={!!(it.props as Dict)['current'] || undefined}>
        {sub ? treeItems(sub.props.children, handlers, key) : null}
      </TreeItem>
    )
  })

/** A hierarchy: a ui5-tree. */
export function TreeView({ children, 'aria-label': label }: AnyProps & { 'aria-label'?: string }) {
  const handlers = new Map<string, () => void>()
  const items = treeItems(children, handlers)
  return (
    <Tree accessibleName={label} onItemClick={(e: CustomEvent<{ item: HTMLElement }>) => handlers.get(e.detail.item.getAttribute('data-key') ?? '')?.()}>
      {items}
    </Tree>
  )
}
TreeView.Item = TreeItemNode
TreeView.SubTree = TreeSubTree
TreeView.TrailingVisual = TrailingVisual
TreeView.LeadingVisual = LeadingVisual

export { Divider as ActionListDivider }
export * from './structural'
