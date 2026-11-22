import React from 'react'
import { Button, Heading, Label, ProgressBar, Text } from '@primer/react'
import { CheckIcon } from '@primer/octicons-react'
import { offerFooterOf } from '@rn/renderer/displayFigures'
import { useController } from '@mr/render/ViewHost'
import { ComponentRenderer } from '../../ComponentRenderer'
import { BOX_STYLE, styleOf } from '@mr/render/styleOf'
import { type CatalogueProps, type Dict, childrenOf, glyph, labelVariant, list, pressable, str, trendLook, useText } from './common'
import { tx } from '@mr/i18n/texts'

/** A KPI tile: title, the value (+ unit), its trend and period; a tile with an action drills in. */
export function MetricCard({ metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const trend = trendLook(m['trend'])
  const actionId = str(m['actionId'])
  const title = t(m['title'])
  const value = t(m['value'])
  const unit = t(m['unit'])
  const timeframe = t(m['timeframe'])
  const icon = glyph(m['icon'])
  const run = actionId ? () => void controller.runAction(actionId) : null
  return (
    <div {...pressable(run, [title, value, unit, timeframe].filter(Boolean).join(' '), 'mateu-st-card mateu-st-metric')}>
      <div className="mateu-st-row mateu-st-between">
        <Text size="small" className="mateu-st-muted">{title}</Text>
        {icon && <span aria-hidden="true">{icon}</span>}
      </div>
      <div className="mateu-st-value">
        {value}{unit && <span className="mateu-st-unit"> {unit}</span>}
      </div>
      {(trend.mark || m['trendLabel']) ? (
        <Text size="small" style={{ color: trend.color }}>{trend.mark} {t(m['trendLabel'])}</Text>
      ) : null}
      {timeframe && <Text size="small" className="mateu-st-muted">{timeframe}</Text>}
      {m['description'] ? <Text size="small" className="mateu-st-muted">{t(m['description'])}</Text> : null}
    </div>
  )
}

/** The KPI band: its tiles side by side, wrapping. */
export function Scoreboard({ component, state, data }: CatalogueProps) {
  return (
    <div className="mateu-st-band" style={styleOf(component)}>
      {childrenOf(component).map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)}
    </div>
  )
}

/** A figure with its delta and a sparkline. */
export function Stat({ metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const trend = trendLook(m['trend'] ?? 'up')
  const spark = list<number>(m['spark']).filter((n) => typeof n === 'number')
  const actionId = str(m['actionId'])
  return (
    <div {...pressable(actionId ? () => void controller.runAction(actionId) : null, t(m['label']), 'mateu-st-card')}>
      <Text size="small" className="mateu-st-muted">{t(m['label'])}</Text>
      <div className="mateu-st-row mateu-st-between" style={{ alignItems: 'flex-end' }}>
        <div className="mateu-st-value">{t(m['value'])}{m['unit'] ? <span className="mateu-st-unit"> {t(m['unit'])}</span> : null}</div>
        {spark.length > 1 && <Sparkline values={spark} color={trend.color} />}
      </div>
      {m['delta'] ? <Text size="small" style={{ color: trend.color }}>{trend.mark} {t(m['delta'])}</Text> : null}
    </div>
  )
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 96, h = 28
  const min = Math.min(...values), max = Math.max(...values)
  const span = max - min || 1
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * (h - 4) - 2}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/** A gauge: value of max, tinted by its warning / danger thresholds. */
export function Meter({ metadata: m, state, data }: CatalogueProps) {
  const t = useText(state, data)
  const value = Number(m['value'] ?? 0)
  const max = Number(m['max'] ?? 0)
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0
  const dangerAt = m['dangerAt'] as number | null | undefined
  const warnAt = m['warnAt'] as number | null | undefined
  const bg = dangerAt != null && value >= dangerAt ? 'danger.emphasis'
    : warnAt != null && value >= warnAt ? 'attention.emphasis'
    : warnAt != null || dangerAt != null ? 'success.emphasis' : 'accent.emphasis'
  const caption = str(m['caption']) ? t(m['caption']) : `${Math.round(ratio * 100)}%`
  const label = t(m['label'])
  return (
    <div className="mateu-st-stack-sm">
      <div className="mateu-st-row mateu-st-between">
        <Text size="small" weight="semibold">{label}</Text>
        <Text size="small" className="mateu-st-muted">{value}{m['unit'] ? ` ${t(m['unit'])}` : ''}{max > 0 ? ` / ${max}` : ''}</Text>
      </div>
      <ProgressBar progress={ratio * 100} bg={bg} aria-label={label || tx('progress')} aria-valuetext={caption} />
      <Text size="small" className="mateu-st-muted">{caption}</Text>
    </div>
  )
}

/** Two figures side by side with the change between them. */
export function ComparisonCard({ metadata: m, state, data }: CatalogueProps) {
  const t = useText(state, data)
  const trend = str(m['trend']) || 'flat'
  const look = trendLook(trend)
  return (
    <div className="mateu-st-card">
      <div className="mateu-st-row mateu-st-between">
        <Text weight="semibold">{t(m['title'])}</Text>
        {m['delta'] ? <Label variant={trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'secondary'}>{look.mark} {t(m['delta'])}</Label> : null}
      </div>
      <div className="mateu-st-split">
        <div><Text size="small" className="mateu-st-muted">{t(m['leftLabel'])}</Text><div className="mateu-st-value">{t(m['leftValue'])}</div></div>
        <div><Text size="small" className="mateu-st-muted">{t(m['rightLabel'])}</Text><div className="mateu-st-value">{t(m['rightValue'])}</div></div>
      </div>
    </div>
  )
}

/** An offer: image, tag, features and its footer (current / price / CTA — inert without an action). */
export function OfferCard({ component, metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const footer = offerFooterOf(m as never)
  const actionId = str(m['actionId'])
  const image = str(m['image'])
  return (
    <div className={`mateu-st-card mateu-st-offer${m['current'] === true ? ' mateu-st-featured' : ''}`} style={styleOf(component, BOX_STYLE)}>
      {image && /^(https?:|\/|data:image\/)/i.test(image) && <img src={image} alt="" className="mateu-st-offer-img" />}
      <div className="mateu-st-row mateu-st-between">
        <Heading as="h3" className="mateu-st-h">{t(m['title'])}</Heading>
        {m['tag'] ? <Label variant="accent">{t(m['tag'])}</Label> : null}
      </div>
      {m['subtitle'] ? <Text size="small" className="mateu-st-muted">{t(m['subtitle'])}</Text> : null}
      {list<string>(m['features']).length > 0 && (
        <ul className="mateu-st-features">
          {list<string>(m['features']).map((f, i) => <li key={i}><CheckIcon size={16} className="mateu-st-ok" /> {t(f)}</li>)}
        </ul>
      )}
      {footer?.kind === 'current' && <div><Label variant="success">{footer.label ?? tx('current')}</Label></div>}
      {footer?.kind === 'price' && <div className="mateu-st-value">{footer.price}</div>}
      {footer?.kind === 'cta' && (
        <Button variant={footer.added ? 'default' : 'primary'} block disabled={!footer.enabled}
          onClick={() => actionId && void controller.runAction(actionId)}>
          {footer.label}{footer.price ? ` · ${footer.price}` : ''}
        </Button>
      )}
    </div>
  )
}

/** Plans side by side; the featured one stands out and its CTA is the primary. */
export function PricingTable({ metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const plans = list<Dict>(m['plans'])
  return (
    <div className="mateu-st-grid" role="list">
      {plans.map((p, i) => (
        <div role="listitem" key={str(p['id']) || i} className={`mateu-st-card mateu-st-plan${p['featured'] === true ? ' mateu-st-featured' : ''}`}>
          <div className="mateu-st-row mateu-st-between">
            <Heading as="h3" className="mateu-st-h">{t(p['name'])}</Heading>
            {p['featured'] === true && <Label variant="accent">{tx('recommended')}</Label>}
          </div>
          <div><span className="mateu-st-value">{t(p['price'])}</span>{p['period'] ? <Text size="small" className="mateu-st-muted"> {t(p['period'])}</Text> : null}</div>
          <ul className="mateu-st-features">
            {list<string>(p['features']).map((f, j) => <li key={j}><CheckIcon size={16} className="mateu-st-ok" /> {t(f)}</li>)}
          </ul>
          {p['ctaLabel'] ? (
            <Button block variant={p['featured'] === true ? 'primary' : 'default'} disabled={!p['actionId']}
              onClick={() => p['actionId'] && void controller.runAction(str(p['actionId']))}>{t(p['ctaLabel'])}</Button>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/** Money lines and their total (lines marked included do not add to it). */
export function Ledger({ metadata: m, state, data }: CatalogueProps) {
  const t = useText(state, data)
  const currency = str(m['currency'])
  const lines = list<Dict>(m['lines'])
  const total = typeof m['total'] === 'number' ? (m['total'] as number)
    : lines.filter((l) => l['included'] !== true).reduce((s, l) => s + (Number(l['amount']) || 0), 0)
  const money = (n: number) => {
    try { return currency ? new Intl.NumberFormat(document.documentElement.lang || undefined, { style: 'currency', currency }).format(n) : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) } catch { return `${n.toFixed(2)} ${currency}` }
  }
  return (
    <table className="mateu-st-ledger">
      <tbody>
        {lines.map((l, i) => (
          <tr key={i}>
            <td>{t(l['concept'])}</td>
            <td className={`mateu-st-num${Number(l['amount']) < 0 && l['included'] !== true ? ' mateu-st-negative' : ''}`}>{l['included'] === true ? <Label variant="secondary">{t(l['includedLabel']) || tx('included')}</Label> : money(Number(l['amount']) || 0)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr><th scope="row">{t(m['totalLabel']) || tx('total')}</th><td className="mateu-st-num"><strong>{money(total)}</strong></td></tr>
      </tfoot>
    </table>
  )
}
