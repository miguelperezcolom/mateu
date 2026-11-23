import { Timeline as Ui5Timeline, TimelineItem } from '@ui5/webcomponents-react'
import { iconName } from '@kit'
import { octiconOf } from '@mr/views/render/catalogue/display/shared'
import { CatalogueProps } from '@mr/views/render/catalogue/types'
import { list, str, useRun, useText } from '@mr/views/render/catalogue/display/shared'

/** Timeline: Fiori's — an item per event (its icon, its state), title, when, text; an event with an action names it clickably. */
export function Timeline({ metadata, state, data }: CatalogueProps) {
  const text = useText(state, data)
  const run = useRun()
  const items = list(metadata['items'])
  return (
    <Ui5Timeline accessibleName={str(metadata['title']) || undefined}>
      {items.map((it, i) => {
        const tone = str(it['tone'] ?? it['state']).toLowerCase()
        return (
          <TimelineItem key={str(it['id']) || i} titleText={text(it['title'])} subtitleText={it['timestamp'] ? text(it['timestamp']) : undefined}
            icon={iconName(octiconOf(it['icon'])) ?? 'circle-task-2'}
            state={tone === 'success' ? 'Positive' : tone === 'danger' || tone === 'error' ? 'Negative' : tone === 'warning' ? 'Critical' : tone === 'info' ? 'Information' : 'None'}
            name={it['actionId'] ? text(it['title']) : undefined} nameClickable={!!it['actionId'] || undefined}
            onNameClick={() => run(it['actionId'], { _itemId: it['id'] })}>
            {it['description'] ? text(it['description']) : null}
          </TimelineItem>
        )
      })}
    </Ui5Timeline>
  )
}
