/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useId, useState } from 'react'
import { cx, type P } from './core'
import { ArrowDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from './icons'
import { tx } from '@mr/i18n/texts'
import { st } from '../i18n/st'

/**
 * Blueprint: Data Tables — `slds-table slds-table_cell-buffer slds-table_bordered`, sortable headers
 * (`slds-is-sortable`, `aria-sort`, the header a button), the selection column (the Checkbox
 * blueprint, `slds-is-selected` rows), the row header (`th scope="row"`). Paging: SLDS has no
 * paginator blueprint, so the pages are a Button Group (Previous, numbers, Next) under the table.
 */

const ALIGN: Record<string, string> = { start: 'slds-text-align_left', center: 'slds-text-align_center', end: 'slds-text-align_right' }

export function DataTable({ data = [], columns = [], getRowId, cellPadding, initialSortColumn, initialSortDirection, onToggleSort, externalSorting,
  rowSelection, isRowSelectable, onSelectionChange, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy }: P) {
  const id = useId()
  const [sort, setSort] = useState<{ column?: string; direction?: 'ASC' | 'DESC' }>({ column: initialSortColumn, direction: initialSortDirection })
  const [selected, setSelected] = useState<Set<string | number>>(new Set())
  const rowId = (r: any, i: number) => (getRowId ? getRowId(r) : String(r?.id ?? i))
  useEffect(() => {
    // rows that went away are no longer selected
    setSelected((s) => {
      const ids = new Set((data as any[]).map(rowId))
      const next = new Set([...s].filter((x) => ids.has(x)))
      return next.size === s.size ? s : next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const selectable = (r: any) => (isRowSelectable ? isRowSelectable(r) : true)
  const change = (next: Set<string | number>) => {
    setSelected(next)
    onSelectionChange?.({ selectedRows: next })
  }
  const all = (data as any[]).filter(selectable).map(rowId)
  const allOn = all.length > 0 && all.every((x) => selected.has(x))
  const someOn = !allOn && all.some((x) => selected.has(x))
  const toggleSort = (col: P) => {
    const direction = sort.column === col.id && sort.direction === 'ASC' ? 'DESC' : 'ASC'
    setSort({ column: col.id, direction })
    onToggleSort?.(col.id, direction)
  }
  let rows = data as any[]
  if (!externalSorting && sort.column) {
    const col = (columns as P[]).find((c) => c.id === sort.column)
    const f = col?.field ?? col?.id
    rows = [...rows].sort((a, b) => String(a?.[f] ?? '').localeCompare(String(b?.[f] ?? ''), undefined, { numeric: true }) * (sort.direction === 'DESC' ? -1 : 1))
  }
  return (
    <div className="mateu-table-wrap">
      <table className={cx('slds-table', 'slds-table_cell-buffer', 'slds-table_bordered', cellPadding === 'condensed' && 'mateu-table_condensed')} aria-labelledby={labelledBy} aria-describedby={describedBy}>
        <thead>
          <tr className="slds-line-height_reset">
            {rowSelection && (
              <th scope="col" className="slds-text-align_right" style={{ width: '3.25rem' }}>
                <div className="slds-th__action slds-th__action_form">
                  <span className="slds-checkbox">
                    <input type="checkbox" id={`${id}-all`} checked={allOn} ref={(el) => { if (el) el.indeterminate = someOn }}
                      onChange={(e) => change(e.target.checked ? new Set(all) : new Set())} />
                    <label className="slds-checkbox__label" htmlFor={`${id}-all`}>
                      <span className="slds-checkbox_faux" />
                      <span className="slds-form-element__label slds-assistive-text">{st('selectAll')}</span>
                    </label>
                  </span>
                </div>
              </th>
            )}
            {(columns as P[]).map((col) => {
              const sorted = sort.column === col.id ? sort.direction : undefined
              const header = typeof col.header === 'function' ? col.header() : col.header
              const style = { width: col.width && col.width !== 'auto' && col.width !== 'grow' ? col.width : undefined, minWidth: col.minWidth }
              if (!col.sortBy) {
                return (
                  <th key={col.id} scope="col" className={ALIGN[col.align ?? 'start']} style={style}>
                    <div className="slds-truncate" title={typeof header === 'string' ? header : undefined}>{header}</div>
                  </th>
                )
              }
              return (
                <th key={col.id} scope="col" className={cx('slds-is-sortable', sorted && 'slds-is-sorted', sorted === 'ASC' ? 'slds-is-sorted_asc' : '', ALIGN[col.align ?? 'start'])} style={style}
                  aria-sort={sorted === 'ASC' ? 'ascending' : sorted === 'DESC' ? 'descending' : 'none'}>
                  <button type="button" className="slds-th__action slds-text-link_reset mateu-th-button" onClick={() => toggleSort(col)}>
                    <span className="slds-assistive-text">{st('sortBy')} </span>
                    <span className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                      <span className="slds-truncate" title={typeof header === 'string' ? header : undefined}>{header}</span>
                      <span className="slds-icon_container">
                        {sorted === 'DESC'
                          ? <ArrowDownIcon size={12} className="slds-icon slds-icon-text-default slds-is-sortable__icon" />
                          : <ArrowUpIcon size={12} className="slds-icon slds-icon-text-default slds-is-sortable__icon" />}
                      </span>
                    </span>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const key = rowId(r, i)
            const on = selected.has(key)
            const canSelect = selectable(r)
            return (
              <tr key={String(key)} className={cx('slds-hint-parent', on && 'slds-is-selected', !canSelect && 'mateu-row_group')}>
                {rowSelection && (
                  <td className="slds-text-align_right">
                    {canSelect && (
                      <span className="slds-checkbox">
                        <input type="checkbox" id={`${id}-r${i}`} checked={on}
                          onChange={(e) => { const next = new Set(selected); if (e.target.checked) next.add(key); else next.delete(key); change(next) }} />
                        <label className="slds-checkbox__label" htmlFor={`${id}-r${i}`}>
                          <span className="slds-checkbox_faux" />
                          <span className="slds-form-element__label slds-assistive-text">{st('selectRow', { n: String(i + 1) })}</span>
                        </label>
                      </span>
                    )}
                  </td>
                )}
                {(columns as P[]).map((col) => {
                  const content = col.renderCell ? col.renderCell(r) : String(r?.[col.field ?? col.id] ?? '')
                  return col.rowHeader
                    ? <th key={col.id} scope="row" className={ALIGN[col.align ?? 'start']}><div className="mateu-cell">{content}</div></th>
                    : <td key={col.id} className={ALIGN[col.align ?? 'start']}><div className="mateu-cell">{content}</div></td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── the plain table parts (a table the view lays out itself) ─────────────────────────────────────

function TableRoot({ children, 'aria-labelledby': labelledBy, className }: P) {
  return (
    <div className="mateu-table-wrap">
      <table className={cx('slds-table', 'slds-table_cell-buffer', 'slds-table_bordered', className)} aria-labelledby={labelledBy}>{children}</table>
    </div>
  )
}
const Head = ({ children }: P) => <thead>{children}</thead>
const Body = ({ children }: P) => <tbody>{children}</tbody>
const Row = ({ children, className }: P) => <tr className={cx('slds-hint-parent', className)}>{children}</tr>
const Header = ({ children, align, style }: P) => <th scope="col" className={ALIGN[align ?? 'start']} style={style}><div className="slds-truncate">{children}</div></th>
const Cell = ({ children, align, scope, style }: P) => {
  const span = style?.gridColumn ? 999 : undefined
  const s = style ? { ...style, gridColumn: undefined } : undefined
  return scope === 'row'
    ? <th scope="row" className={ALIGN[align ?? 'start']} style={s} colSpan={span}>{children}</th>
    : <td className={ALIGN[align ?? 'start']} style={s} colSpan={span}>{children}</td>
}
const Container = ({ children }: P) => <div className="mateu-table-container">{children}</div>
const Title = ({ children, as = 'h2', id }: P) => { const Tag = as as 'h2'; return <Tag id={id} className="slds-text-heading_small">{children}</Tag> }
const Subtitle = ({ children, as = 'p', id }: P) => { const Tag = as as 'p'; return <Tag id={id} className="slds-text-body_small slds-text-color_weak">{children}</Tag> }
const Actions = ({ children }: P) => <div className="mateu-table-actions">{children}</div>
const Divider = () => <hr className="slds-m-vertical_small" />

/** The pages of a listing: Previous, the page numbers (a window around the current one), Next. */
function Pagination({ pageSize, totalCount, defaultPageIndex = 0, pageIndex: controlled, onChange, 'aria-label': ariaLabel }: P) {
  const pages = Math.max(1, Math.ceil(Number(totalCount) / Math.max(1, Number(pageSize))))
  const [own, setOwn] = useState(Number(defaultPageIndex) || 0)
  const current = controlled ?? own
  const go = (i: number) => {
    if (i < 0 || i >= pages || i === current) return
    setOwn(i)
    onChange?.({ pageIndex: i })
  }
  const window = pageWindow(current, pages)
  const from = current * pageSize + 1
  const to = Math.min(totalCount, (current + 1) * pageSize)
  return (
    <nav aria-label={ariaLabel} className="mateu-pagination">
      <span className="slds-text-body_small slds-text-color_weak mateu-pagination__range">{st('rowsRange', { from: String(from), to: String(to), total: String(totalCount) })}</span>
      <div className="slds-button-group" role="group">
        <button type="button" className="slds-button slds-button_icon slds-button_icon-border-filled" disabled={current === 0} onClick={() => go(current - 1)} title={tx('previous')}>
          <ChevronLeftIcon size={14} className="slds-button__icon" /><span className="slds-assistive-text">{tx('previous')}</span>
        </button>
        {window.map((p, i) => p < 0
          ? <span key={`gap${i}`} className="slds-button slds-button_neutral mateu-pagination__gap" aria-hidden="true">…</span>
          : (
            <button key={p} type="button" className={cx('slds-button', p === current ? 'slds-button_brand' : 'slds-button_neutral')} aria-current={p === current ? 'page' : undefined}
              aria-label={st('pageN', { n: String(p + 1) })} onClick={() => go(p)}>{p + 1}</button>
          ))}
        <button type="button" className="slds-button slds-button_icon slds-button_icon-border-filled" disabled={current >= pages - 1} onClick={() => go(current + 1)} title={tx('next')}>
          <ChevronRightIcon size={14} className="slds-button__icon" /><span className="slds-assistive-text">{tx('next')}</span>
        </button>
      </div>
    </nav>
  )
}

/** First, last, and two either side of the current page; -1 marks a gap. */
export function pageWindow(current: number, pages: number): number[] {
  const out: number[] = []
  for (let p = 0; p < pages; p++) {
    if (p === 0 || p === pages - 1 || Math.abs(p - current) <= 2) out.push(p)
    else if (out[out.length - 1] !== -1) out.push(-1)
  }
  return out
}

export const Table = Object.assign(TableRoot, { Head, Body, Row, Header, Cell, Container, Title, Subtitle, Actions, Divider, Pagination, SortHeader: Header, Skeleton: () => null, ErrorDialog: () => null })
