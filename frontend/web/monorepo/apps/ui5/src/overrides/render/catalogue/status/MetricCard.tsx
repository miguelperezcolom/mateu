import { AnalyticalCardHeader, Card } from '@ui5/webcomponents-react'
import { Text } from '@kit'
import { useController } from '@mr/render/ViewHost'
import { type CatalogueProps, glyph, str, useText } from '@mr/views/render/catalogue/status/common'

/**
 * A KPI tile: Fiori's analytical card — its header carries the title, the period (subtitle), the
 * value with its unit, the trend arrow and its label; a tile with an action drills in.
 */
export function MetricCard({ metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const actionId = str(m['actionId'])
  const title = t(m['title'])
  const value = t(m['value'])
  const unit = t(m['unit'])
  const timeframe = t(m['timeframe'])
  const icon = glyph(m['icon'])
  const trend = str(m['trend']).toLowerCase()
  const run = actionId ? () => void controller.runAction(actionId) : undefined
  return (
    <Card className="mateu-st-metric" accessibleName={[title, value, unit, timeframe].filter(Boolean).join(' ')}
      header={(
        <AnalyticalCardHeader slot="header" titleText={title + (icon ? ` ${icon}` : '')} subtitleText={timeframe || undefined} value={value} unitOfMeasurement={unit || undefined}
          trend={trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'None'}
          state={trend === 'up' ? 'Good' : trend === 'down' ? 'Error' : 'Neutral'}
          description={m['trendLabel'] ? t(m['trendLabel']) : undefined}
          onClick={run as never} />
      )}>
      {m['description'] ? <Text as="p" size="small" className="mateu-st-muted" style={{ margin: '0 1rem 1rem' }}>{t(m['description'])}</Text> : null}
    </Card>
  )
}
