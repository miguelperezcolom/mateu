import React from 'react'
import { ActionList } from '@kit'
import { type MenuOptionLike } from '@rn/renderer/wireWidgets'
import { type CatalogueProps, list } from '@mr/views/render/catalogue/status/common'
import { tx } from '@mr/i18n/texts'
import { useRunOption } from '@mr/views/render/catalogue/status/menus'

/** A directory of the app's places: a ui5-list, groups as titled groups of it. */
export function Directory({ metadata: m }: CatalogueProps) {
  const run = useRunOption()
  const item = (o: MenuOptionLike, i: number): React.ReactNode =>
    o.separator ? <ActionList.Divider key={i} />
      : o.submenus?.length ? (
        <ActionList.Group key={i} title={o.label}>{o.submenus.map((o, i) => item(o, i))}</ActionList.Group>
      ) : (
        <ActionList.Item key={i} disabled={o.disabled} onSelect={() => run(o)}>{o.label}</ActionList.Item>
      )
  return <ActionList aria-label={tx('directory')}>{list<MenuOptionLike>(m['menu']).map((o, i) => item(o, i))}</ActionList>
}
