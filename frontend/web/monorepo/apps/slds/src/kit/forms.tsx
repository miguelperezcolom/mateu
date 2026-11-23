/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useId } from 'react'
import { cx, type P } from './core'
import type { Icon } from './icons'
import { st } from '../i18n/st'

/** The blueprint's required marker: the asterisk, titled for a pointer user (the control itself carries `required`). */
const Required = () => <abbr className="slds-required" title={st('required')}>* </abbr>

/**
 * Blueprint: Form Element — `slds-form-element` with its `__label` (the `slds-required` asterisk),
 * `__control` and `__help`; `slds-has-error` while a validation message shows. The message travels
 * ON the control (`aria-describedby` + `aria-invalid`), never as a detached list.
 * Inputs: Input, Textarea, Select, Checkbox, Radio Group, Checkbox Toggle, Button Group (segmented).
 */

type Visual = unknown
interface Extra { validationStatus?: string; block?: boolean; [data: `data-${string}`]: unknown }
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, Extra {
  size?: string; leadingVisual?: Visual; trailingVisual?: Visual; trailingAction?: React.ReactNode; monospace?: boolean; loading?: boolean; contrast?: boolean
}
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, Extra { resize?: React.CSSProperties['resize'] }
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>, Extra { size?: string }
export interface ChoiceProps extends React.InputHTMLAttributes<HTMLInputElement> { indeterminate?: boolean; __label?: React.ReactNode; __labelHidden?: boolean }
export interface ToggleSwitchProps {
  checked?: boolean; defaultChecked?: boolean; disabled?: boolean; size?: string; statusLabelPosition?: string; className?: string
  onClick?: (e: React.SyntheticEvent) => void; onChange?: (on: boolean) => void
  'aria-labelledby'?: string; 'aria-label'?: string; 'aria-describedby'?: string; id?: string
}
export interface ChoiceGroupProps {
  name?: string; disabled?: boolean; required?: boolean; id?: string; className?: string; children?: React.ReactNode; 'aria-labelledby'?: string
  onChange?: (value: string | null, e?: React.ChangeEvent<HTMLInputElement>) => void
}

interface FieldCtx {
  id: string
  required?: boolean
  disabled?: boolean
  describedBy?: string
  invalid?: boolean
  captionId: string
  validationId: string
}

const FieldContext = createContext<FieldCtx | null>(null)
export const useFieldContext = () => useContext(FieldContext)

const isType = (el: React.ReactNode, type: unknown): boolean => React.isValidElement(el) && el.type === type

function FormControlRoot({ id: givenId, required, disabled, children, className, style, layout }: P) {
  const auto = useId()
  const id = givenId ?? `fc${auto}`
  const kids = React.Children.toArray(children)
  const hasCaption = kids.some((k) => isType(k, Caption))
  const validation = kids.find((k) => isType(k, Validation)) as React.ReactElement<P> | undefined
  const invalid = !!validation && (validation.props.variant ?? 'error') === 'error'
  const captionId = `${id}-caption`
  const validationId = `${id}-validation`
  const describedBy = [validation ? validationId : '', hasCaption ? captionId : ''].filter(Boolean).join(' ') || undefined
  const choice = kids.some((k) => isType(k, Checkbox) || isType(k, Radio))
  const ctx: FieldCtx = { id, required, disabled, describedBy, invalid, captionId, validationId }
  if (choice) {
    // a checkbox / radio: the box, then its label (the blueprint's order), then help and error
    const box = kids.find((k) => isType(k, Checkbox) || isType(k, Radio))
    const label = kids.find((k) => isType(k, FormLabel)) as React.ReactElement<P> | undefined
    const rest = kids.filter((k) => k !== box && k !== label)
    return (
      <FieldContext.Provider value={ctx}>
        <div className={cx('slds-form-element', invalid && 'slds-has-error', className)} style={style}>
          <div className="slds-form-element__control">
            {React.isValidElement(box) ? React.cloneElement(box as React.ReactElement<P>, { __label: label?.props.children, __labelHidden: label?.props.visuallyHidden }) : box}
          </div>
          {rest}
        </div>
      </FieldContext.Provider>
    )
  }
  return (
    <FieldContext.Provider value={ctx}>
      <div className={cx('slds-form-element', layout === 'horizontal' && 'slds-form-element_horizontal', invalid && 'slds-has-error', className)} style={style}>
        {children}
      </div>
    </FieldContext.Provider>
  )
}

function FormLabel({ visuallyHidden, children, id, htmlFor }: P) {
  const f = useFieldContext()
  return (
    <label className={cx('slds-form-element__label', visuallyHidden && 'slds-assistive-text')} htmlFor={htmlFor ?? f?.id} id={id ?? (f ? `${f.id}-label` : undefined)}>
      {f?.required && <Required />}
      {children}
    </label>
  )
}

function Caption({ children, id }: P) {
  const f = useFieldContext()
  return <div className="slds-form-element__help mateu-form-caption" id={id ?? f?.captionId}>{children}</div>
}

function Validation({ children, variant = 'error', id }: P) {
  const f = useFieldContext()
  return <div className={cx('slds-form-element__help', variant === 'success' && 'mateu-form-success')} id={id ?? f?.validationId} role={variant === 'error' ? 'alert' : undefined}>{children}</div>
}

export const FormControl = Object.assign(FormControlRoot, { Label: FormLabel, Caption, Validation, LeadingVisual: ({ children }: P) => <>{children}</> })

/** The a11y + state attributes a control takes from the FormControl around it. */
function fieldProps(f: FieldCtx | null, rest: P) {
  const describedBy = [rest['aria-describedby'], f?.describedBy].filter(Boolean).join(' ') || undefined
  return {
    id: rest.id ?? f?.id,
    required: rest.required ?? f?.required,
    disabled: rest.disabled ?? f?.disabled,
    'aria-describedby': describedBy,
    'aria-invalid': rest['aria-invalid'] ?? (f?.invalid || rest.validationStatus === 'error' ? true : undefined),
  }
}

const renderIcon = (I: unknown, className: string): React.ReactNode => {
  if (!I) return null
  if (React.isValidElement(I)) return I
  const C = I as Icon
  return <C size={14} className={className} />
}

/** Blueprint: Input (with a left icon / a trailing action when given). */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { block, size, leadingVisual, trailingVisual, trailingAction, validationStatus, monospace, loading, contrast, className, style, ...rest },
  ref,
) {
  const f = useFieldContext()
  const a = fieldProps(f, { ...(rest as P), validationStatus })
  const icons = cx(leadingVisual && 'slds-input-has-icon slds-input-has-icon_left', (trailingVisual || trailingAction) && (leadingVisual ? 'slds-input-has-icon_left-right' : 'slds-input-has-icon slds-input-has-icon_right'))
  return (
    <div className={cx('slds-form-element__control', icons, block !== false && 'mateu-control_block', className)} style={style}>
      {leadingVisual ? renderIcon(leadingVisual, 'slds-icon slds-input__icon slds-input__icon_left slds-icon-text-default') : null}
      <input ref={ref} className={cx('slds-input', size === 'small' && 'mateu-input_small', monospace && 'mateu-monospace')} {...rest} {...a} />
      {trailingVisual ? renderIcon(trailingVisual, 'slds-icon slds-input__icon slds-input__icon_right slds-icon-text-default') : null}
      {trailingAction && <span className="mateu-input-trailing">{trailingAction}</span>}
    </div>
  )
})

/** Blueprint: Textarea. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ block, resize, validationStatus, className, style, ...rest }, ref) {
  const f = useFieldContext()
  const a = fieldProps(f, { ...(rest as P), validationStatus })
  return (
    <div className={cx('slds-form-element__control', className)}>
      <textarea ref={ref} className="slds-textarea" style={{ resize: resize ?? 'vertical', ...style }} {...rest} {...a} />
    </div>
  )
})

function SelectRoot({ block, size, validationStatus, className, children, ...rest }: SelectProps & { ref?: React.Ref<HTMLSelectElement> }) {
  const f = useFieldContext()
  const a = fieldProps(f, { ...(rest as P), validationStatus })
  return (
    <div className={cx('slds-form-element__control', className)}>
      <div className="slds-select_container">
        <select className="slds-select" {...rest} {...a}>{children}</select>
      </div>
    </div>
  )
}
const SelectBase = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => <SelectRoot {...props} ref={ref} />)
SelectBase.displayName = 'Select' // i18n-ok: a component name, not chrome
const SelectOption = ({ children, ...rest }: P) => <option {...rest}>{children}</option>
/** Blueprint: Select. */
export const Select = Object.assign(SelectBase, { Option: SelectOption, OptGroup: ({ children, label }: P) => <optgroup label={label}>{children}</optgroup> })

// ── checkbox / radio ──────────────────────────────────────────────────────────────────────────

interface GroupCtx { name?: string; onChange?: (value: string | null, e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; required?: boolean }
const RadioGroupContext = createContext<GroupCtx | null>(null)

/** Blueprint: Checkbox (the faux box, its label inside). */
export const Checkbox = React.forwardRef<HTMLInputElement, ChoiceProps>(function Checkbox({ __label, __labelHidden, indeterminate, className, ...rest }, ref) {
  const f = useFieldContext()
  const auto = useId()
  const a = fieldProps(f, rest as P)
  const id = a.id ?? `cb${auto}`
  const setRef = (el: HTMLInputElement | null) => {
    if (el) el.indeterminate = !!indeterminate
    if (typeof ref === 'function') ref(el)
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
  }
  return (
    <span className={cx('slds-checkbox', className)}>
      <input ref={setRef} type="checkbox" {...rest} {...a} id={id} />
      <label className="slds-checkbox__label" htmlFor={id}>
        <span className="slds-checkbox_faux" />
        {__label !== undefined
          ? <span className={cx('slds-form-element__label', __labelHidden && 'slds-assistive-text')}>{f?.required && <Required />}{__label}</span>
          : rest['aria-label'] ? <span className="slds-assistive-text">{rest['aria-label']}</span> : null}
      </label>
    </span>
  )
})

/** Blueprint: Radio Group (one radio). */
export const Radio = React.forwardRef<HTMLInputElement, ChoiceProps>(function Radio({ __label, __labelHidden, value, name, onChange, className, ...rest }, ref) {
  const f = useFieldContext()
  const g = useContext(RadioGroupContext)
  const auto = useId()
  const a = fieldProps(f, rest as P)
  const id = a.id ?? `rd${auto}`
  return (
    <span className={cx('slds-radio', className)}>
      <input ref={ref} type="radio" value={value} name={name ?? g?.name} {...rest} {...a} id={id} disabled={a.disabled ?? g?.disabled}
        onChange={(e) => { onChange?.(e); g?.onChange?.(e.target.checked ? String(value) : null, e) }} />
      <label className="slds-radio__label" htmlFor={id}>
        <span className="slds-radio_faux" />
        {__label !== undefined
          ? <span className={cx('slds-form-element__label', __labelHidden && 'slds-assistive-text')}>{__label}</span>
          : rest['aria-label'] ? <span className="slds-assistive-text">{rest['aria-label']}</span> : null}
      </label>
    </span>
  )
})

function groupParts(children: React.ReactNode, Label: unknown, Cap: unknown, Val: unknown) {
  const kids = React.Children.toArray(children)
  const label = kids.find((k) => isType(k, Label)) as React.ReactElement<P> | undefined
  const caption = kids.find((k) => isType(k, Cap))
  const validation = kids.find((k) => isType(k, Val)) as React.ReactElement<P> | undefined
  const rest = kids.filter((k) => k !== label && k !== caption && k !== validation)
  return { label, caption, validation, rest }
}

const GroupLabel = ({ children, visuallyHidden }: P) => <>{children}{visuallyHidden ? null : null}</>
const GroupCaption = ({ children, id }: P) => <div className="slds-form-element__help mateu-form-caption" id={id}>{children}</div>
const GroupValidation = ({ children, id }: P) => <div className="slds-form-element__help" id={id} role="alert">{children}</div>

/** Blueprint: Checkbox Group / Radio Group — a fieldset with its legend. */
function ChoiceGroup({ kind, name, onChange, disabled, required, children, id: givenId, 'aria-labelledby': labelledBy, className }: ChoiceGroupProps & { kind: 'checkbox' | 'radio' }) {
  const auto = useId()
  const id = givenId ?? `cg${auto}`
  const { label, caption, validation, rest } = groupParts(children, kind === 'radio' ? RadioGroupLabel : CheckboxGroupLabel, kind === 'radio' ? RadioGroupCaption : CheckboxGroupCaption, kind === 'radio' ? RadioGroupValidation : CheckboxGroupValidation)
  const helpIds = [validation ? `${id}-validation` : '', caption ? `${id}-caption` : ''].filter(Boolean).join(' ') || undefined
  const body = (
    <fieldset className={cx('slds-form-element', validation && 'slds-has-error', className)} aria-describedby={helpIds} disabled={disabled} aria-labelledby={labelledBy}>
      {label && (
        <legend className={cx('slds-form-element__legend', 'slds-form-element__label', label.props.visuallyHidden && 'slds-assistive-text')}>
          {required && <Required />}
          {label.props.children}
        </legend>
      )}
      <div className="slds-form-element__control">{rest}</div>
      {caption && React.cloneElement(caption as React.ReactElement<P>, { id: `${id}-caption` })}
      {validation && React.cloneElement(validation, { id: `${id}-validation` })}
    </fieldset>
  )
  if (kind === 'radio') return <RadioGroupContext.Provider value={{ name: name ?? id, onChange, disabled, required }}>{body}</RadioGroupContext.Provider>
  return body
}

const CheckboxGroupLabel = (p: P) => <GroupLabel {...p} />
const CheckboxGroupCaption = (p: P) => <GroupCaption {...p} />
const CheckboxGroupValidation = (p: P) => <GroupValidation {...p} />
const RadioGroupLabel = (p: P) => <GroupLabel {...p} />
const RadioGroupCaption = (p: P) => <GroupCaption {...p} />
const RadioGroupValidation = (p: P) => <GroupValidation {...p} />

export const CheckboxGroup = Object.assign((p: ChoiceGroupProps) => <ChoiceGroup kind="checkbox" {...p} />, { Label: CheckboxGroupLabel, Caption: CheckboxGroupCaption, Validation: CheckboxGroupValidation })
export const RadioGroup = Object.assign((p: ChoiceGroupProps) => <ChoiceGroup kind="radio" {...p} />, { Label: RadioGroupLabel, Caption: RadioGroupCaption, Validation: RadioGroupValidation })

/** Blueprint: Checkbox Toggle — a switch (role="switch"), its on/off words in the design system's faux. */
export const ToggleSwitch = React.forwardRef<HTMLInputElement, ToggleSwitchProps>(function ToggleSwitch(
  { checked, defaultChecked, onClick, onChange, disabled, size, statusLabelPosition, 'aria-labelledby': labelledBy, 'aria-label': ariaLabel, className, ...rest },
  ref,
) {
  const on = !!(checked ?? defaultChecked)
  return (
    <label className={cx('slds-checkbox_toggle', 'slds-grid', className)}>
      <input ref={ref} type="checkbox" role="switch" checked={on} disabled={disabled} aria-labelledby={labelledBy} aria-label={ariaLabel}
        onChange={(e) => { onClick?.(e); onChange?.(!on) }} {...rest} />
      <span className="slds-checkbox_faux_container">
        <span className="slds-checkbox_faux" />
        <span className="slds-checkbox_on" aria-hidden="true">{st('toggleOn')}</span>
        <span className="slds-checkbox_off" aria-hidden="true">{st('toggleOff')}</span>
      </span>
    </label>
  )
})

/** Blueprint: Button Groups (a segmented choice: the selected one is the brand button, aria-pressed). */
function SegmentedRoot({ children, onChange, 'aria-label': ariaLabel, className }: { children?: React.ReactNode; onChange?: (index: number) => void; 'aria-label'?: string; className?: string; size?: string; fullWidth?: boolean }) {
  const kids = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<P>[]
  return (
    <div className={cx('slds-button-group', className)} role="group" aria-label={ariaLabel}>
      {kids.map((k, i) => (
        <button key={k.key ?? i} type="button" className={cx('slds-button', k.props.selected ? 'slds-button_brand' : 'slds-button_neutral')}
          aria-pressed={!!k.props.selected} onClick={() => onChange?.(i)}>
          {k.props.children}
        </button>
      ))}
    </div>
  )
}
export const SegmentedControl = Object.assign(SegmentedRoot, {
  Button: ({ children }: P) => <>{children}</>,
  IconButton: ({ 'aria-label': l }: P) => <>{l}</>,
})
