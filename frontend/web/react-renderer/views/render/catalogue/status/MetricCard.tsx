import { Text } from '@kit'
import { useController } from '@mr/render/ViewHost'
import { type CatalogueProps, glyph, pressable, str, trendLook, useText } from './common'

// Split out of kpis.tsx: a design system with its own markup for it overrides only this file.

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
