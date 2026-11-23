import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './core'
import { useFieldContext } from './forms'
import { useDismiss, usePlacement } from './overlays'
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, CalendarIcon } from './icons'
import { chromeLanguage } from '@infra/ui/chromeTexts.ts'
import { st } from '../i18n/st'

/**
 * SLDS's **Datepicker** (an Input with its calendar button, the calendar a `slds-datepicker`
 * dropdown: month navigation, a year select, the month as a grid — arrows ±1 day / ±1 week,
 * PageUp / PageDown ±1 month, Home / End the week's ends, Enter picks, Esc closes), its
 * **Timepicker** (a combobox over the day's half hours) and the **Datetime Picker** (both side by
 * side). The value is ISO (`2026-11-23`, `09:30`, `2026-11-23T09:30`) — what the wire carries; the
 * input shows the date in the page's language and accepts ISO typed in.
 */

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseIso = (v: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v ?? '')
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}
const lang = () => chromeLanguage()
const shown = (v: string) => {
  const d = parseIso(v)
  return d ? d.toLocaleDateString(lang(), { year: 'numeric', month: 'short', day: 'numeric' }) : v
}

interface PickerProps {
  value: string
  onChange: (value: string) => void
  id?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  placeholder?: string
  validationStatus?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-labelledby'?: string
  inputRef?: React.Ref<HTMLInputElement>
}

/** Blueprint: Datepicker. */
export function Datepicker({ value, onChange, id: givenId, disabled, readOnly, required, placeholder, validationStatus, inputRef, ...aria }: PickerProps) {
  const f = useFieldContext()
  const auto = useId()
  const id = givenId ?? f?.id ?? `dp${auto}`
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const anchor = useRef<HTMLElement | null>(null)
  const layer = useRef<HTMLElement | null>(null)
  const pos = usePlacement(open, anchor, layer)
  const close = useCallback((refocus: boolean) => {
    setOpen(false)
    if (refocus) requestAnimationFrame(() => (anchor.current?.querySelector('input') as HTMLInputElement | null)?.focus())
  }, [])
  const onKey = useDismiss(open, close, anchor, layer)
  const describedBy = [aria['aria-describedby'], f?.describedBy].filter(Boolean).join(' ') || undefined
  return (
    <div ref={anchor as never} className={cx('slds-form-element__control', 'slds-input-has-icon', 'slds-input-has-icon_right', 'mateu-control_block')}>
      <input ref={inputRef} id={id} type="text" className="slds-input" autoComplete="off"
        value={editing ? value : shown(value)} placeholder={placeholder} disabled={disabled ?? f?.disabled} readOnly={readOnly} required={required ?? f?.required}
        aria-label={aria['aria-label']} aria-labelledby={aria['aria-labelledby']} aria-describedby={describedBy}
        aria-invalid={f?.invalid || validationStatus === 'error' ? true : undefined}
        onFocus={() => setEditing(true)} onBlur={() => setEditing(false)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); setOpen(true) } }} />
      <button type="button" className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" title={st('pickADate')}
        disabled={disabled ?? f?.disabled ?? readOnly} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <CalendarIcon size={14} className="slds-button__icon" />
        <span className="slds-assistive-text">{st('pickADate')}</span>
      </button>
      {open && createPortal(
        <div ref={layer as never} data-mateu-layer="" role="dialog" aria-modal="false" aria-label={st('pickADate')}
          className="slds-datepicker slds-dropdown slds-dropdown_left mateu-layer" style={{ ...pos }} onKeyDown={onKey}>
          <Calendar value={value} onPick={(v) => { onChange(v); close(true) }} />
        </div>,
        document.body,
      )}
    </div>
  )
}

function Calendar({ value, onPick }: { value: string; onPick: (v: string) => void }) {
  const selected = parseIso(value)
  const [focus, setFocus] = useState<Date>(() => selected ?? new Date())
  const grid = useRef<HTMLTableElement>(null)
  const headingId = useId()
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(lang(), { month: 'long' })), [])
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i)), [])
  const year = focus.getFullYear()
  const month = focus.getMonth()
  const first = new Date(year, month, 1)
  const start = new Date(year, month, 1 - first.getDay())
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7))
  const today = iso(new Date())
  // the focus follows the focused day (a frame later: the layer is placed — and visible — after its first paint)
  useEffect(() => {
    const id = requestAnimationFrame(() => grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus())
    return () => cancelAnimationFrame(id)
  }, [focus])
  const move = (d: number) => setFocus((f) => new Date(f.getFullYear(), f.getMonth(), f.getDate() + d))
  const moveMonth = (d: number) => setFocus((f) => new Date(f.getFullYear(), f.getMonth() + d, Math.min(f.getDate(), 28)))
  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, () => void> = {
      ArrowLeft: () => move(-1), ArrowRight: () => move(1), ArrowUp: () => move(-7), ArrowDown: () => move(7),
      PageUp: () => moveMonth(-1), PageDown: () => moveMonth(1),
      Home: () => move(-focus.getDay()), End: () => move(6 - focus.getDay()),
      Enter: () => onPick(iso(focus)), ' ': () => onPick(iso(focus)),
    }
    const run = map[e.key]
    if (!run) return
    e.preventDefault()
    run()
  }
  const years = Array.from({ length: 201 }, (_, i) => year - 100 + i)
  return (
    <>
      <div className="slds-datepicker__filter slds-grid">
        <div className="slds-datepicker__filter_month slds-grid slds-grid_align-spread slds-grow">
          <div className="slds-align-middle">
            <button type="button" className="slds-button slds-button_icon-container" title={st('previousMonth')} onClick={() => moveMonth(-1)}>
              <ChevronLeftIcon size={14} className="slds-button__icon" /><span className="slds-assistive-text">{st('previousMonth')}</span>
            </button>
          </div>
          <h2 id={headingId} className="slds-align-middle" aria-live="assertive" aria-atomic="true">{months[month]}</h2>
          <div className="slds-align-middle">
            <button type="button" className="slds-button slds-button_icon-container" title={st('nextMonth')} onClick={() => moveMonth(1)}>
              <ChevronRightIcon size={14} className="slds-button__icon" /><span className="slds-assistive-text">{st('nextMonth')}</span>
            </button>
          </div>
        </div>
        <div className="slds-shrink-none">
          <label className="slds-assistive-text" htmlFor={`${headingId}-y`}>{st('year')}</label>
          <div className="slds-select_container">
            <select className="slds-select" id={`${headingId}-y`} value={year} onChange={(e) => setFocus(new Date(Number(e.target.value), month, Math.min(focus.getDate(), 28)))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>
      <table ref={grid} className="slds-datepicker__month" role="grid" aria-labelledby={headingId} onKeyDown={onKey}>
        <thead>
          <tr>
            {weekdays.map((d, i) => (
              <th key={i} scope="col">
                <abbr title={d.toLocaleDateString(lang(), { weekday: 'long' })}>{d.toLocaleDateString(lang(), { weekday: 'short' })}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, wi) => (
            <tr key={wi}>
              {w.map((d) => {
                const key = iso(d)
                const inMonth = d.getMonth() === month
                const isSelected = !!selected && key === iso(selected)
                const isFocus = key === iso(focus)
                return (
                  <td key={key} role="gridcell" aria-selected={isSelected} tabIndex={isFocus ? 0 : -1}
                    aria-current={key === today ? 'date' : undefined}
                    className={cx(!inMonth && 'slds-day_adjacent-month', isSelected && 'slds-is-selected', key === today && 'slds-is-today')}
                    onClick={() => onPick(key)} aria-label={d.toLocaleDateString(lang(), { dateStyle: 'full' } as Intl.DateTimeFormatOptions)}>
                    <span className="slds-day">{d.getDate()}</span>
                  </td>
                )
              })}
            </tr>
          ))}
          <tr>
            <td colSpan={7} role="gridcell">
              <button type="button" className="slds-button slds-align_absolute-center slds-text-link" onClick={() => onPick(today)}>{st('today')}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

/** Blueprint: Timepicker — a combobox over the day in half hours; any HH:mm may be typed. */
export function Timepicker({ value, onChange, id: givenId, disabled, readOnly, required, placeholder, validationStatus, inputRef, ...aria }: PickerProps) {
  const f = useFieldContext()
  const auto = useId()
  const id = givenId ?? f?.id ?? `tp${auto}`
  const listId = `${id}-list`
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const anchor = useRef<HTMLElement | null>(null)
  const layer = useRef<HTMLElement | null>(null)
  const pos = usePlacement(open, anchor, layer)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, close, anchor, layer)
  const slots = useMemo(() => Array.from({ length: 48 }, (_, i) => `${pad(Math.floor(i / 2))}:${i % 2 ? '30' : '00'}`), [])
  const label = (t: string) => new Date(2000, 0, 1, Number(t.slice(0, 2)), Number(t.slice(3, 5))).toLocaleTimeString(lang(), { hour: 'numeric', minute: '2-digit' })
  useEffect(() => {
    if (!open) return
    const at = Math.max(0, slots.findIndex((s) => s >= (value || '08:00').slice(0, 5)))
    setActive(at)
    requestAnimationFrame(() => document.getElementById(`${listId}-${at}`)?.scrollIntoView({ block: 'nearest' }))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (t: string) => { onChange(t); setOpen(false) }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      const next = Math.max(0, Math.min(slots.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)))
      setActive(next)
      document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'Enter' && open && active >= 0) {
      e.preventDefault()
      pick(slots[active])
    } else if (e.key === 'Escape' && open) {
      e.preventDefault()
      e.stopPropagation()
      setOpen(false)
    }
  }
  const describedBy = [aria['aria-describedby'], f?.describedBy].filter(Boolean).join(' ') || undefined
  return (
    <div ref={anchor as never} className="slds-combobox_container mateu-control_block">
      <div className={cx('slds-combobox', 'slds-dropdown-trigger', 'slds-dropdown-trigger_click', open && 'slds-is-open')}>
        <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
          <input ref={inputRef} id={id} type="text" className="slds-input slds-combobox__input" role="combobox" autoComplete="off"
            aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-haspopup="listbox"
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            value={value} placeholder={placeholder ?? 'HH:mm'} disabled={disabled ?? f?.disabled} readOnly={readOnly} required={required ?? f?.required}
            aria-label={aria['aria-label']} aria-labelledby={aria['aria-labelledby']} aria-describedby={describedBy}
            aria-invalid={f?.invalid || validationStatus === 'error' ? true : undefined}
            onClick={() => !readOnly && setOpen(true)} onChange={(e) => onChange(e.target.value)} onKeyDown={onKey} />
          <span className="slds-icon_container slds-icon-utility-clock slds-input__icon slds-input__icon_right">
            <ClockIcon size={14} className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" />
          </span>
        </div>
      </div>
      {open && createPortal(
        <div ref={layer as never} data-mateu-layer="" className="slds-dropdown slds-dropdown_length-5 slds-dropdown_fluid mateu-layer" style={{ ...pos, width: anchor.current?.offsetWidth }}>
          <ul id={listId} className="slds-listbox slds-listbox_vertical" role="listbox" aria-label={st('pickATime')}>
            {slots.map((t, i) => (
              <li key={t} role="presentation" className="slds-listbox__item">
                <div id={`${listId}-${i}`} role="option" aria-selected={t === value}
                  className={cx('slds-media', 'slds-listbox__option', 'slds-listbox__option_plain', 'slds-media_small', t === value && 'slds-is-selected', i === active && 'slds-has-focus')}
                  onMouseDown={(e) => e.preventDefault()} onClick={() => pick(t)}>
                  <span className="slds-media__body"><span className="slds-truncate">{label(t)}</span></span>
                </div>
              </li>
            ))}
          </ul>
        </div>,
        document.body,
      )}
    </div>
  )
}

/** Blueprint: Datetime Picker — the date and the time side by side; the value `YYYY-MM-DDTHH:mm`. */
export function DatetimePicker({ value, onChange, ...rest }: PickerProps) {
  const f = useFieldContext()
  const auto = useId()
  const base = rest.id ?? f?.id ?? `dt${auto}`
  const [d, t] = (value ?? '').split('T')
  const date = d ?? ''
  const time = (t ?? '').slice(0, 5)
  const join = (nd: string, nt: string) => onChange(nd ? `${nd}T${nt || '00:00'}` : '')
  return (
    <div className="mateu-datetime">
      <Datepicker {...rest} id={base} value={date} onChange={(nd) => join(nd, time)} />
      <Timepicker {...rest} id={`${base}-time`} inputRef={undefined} value={time} onChange={(nt) => join(date, nt)} aria-labelledby={undefined} aria-label={st('pickATime')} />
    </div>
  )
}
