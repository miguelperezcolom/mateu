import React from 'react'
import { NavList } from '@kit'
import { type MenuOptionLike } from '@rn/renderer/wireWidgets'
import { type CatalogueProps, list } from './common'
import { tx } from '@mr/i18n/texts'
import { useRunOption } from './menus'

// Split out of menus.tsx: a design system with its own markup for it overrides only this file.

/** A directory of the app's places: Primer's NavList, groups as sub-lists. */
export function Directory({ metadata: m }: CatalogueProps) {
  const run = useRunOption()
  const item = (o: MenuOptionLike, i: number): React.ReactNode =>
    o.separator ? <NavList.Divider key={i} />
      : o.submenus?.length ? (
        <NavList.Group key={i} title={o.label}>{o.submenus.map((o, i) => item(o, i))}</NavList.Group>
      ) : (
        <NavList.Item key={i} href="#" aria-disabled={o.disabled || undefined} onClick={(e: React.MouseEvent) => { e.preventDefault(); if (!o.disabled) run(o) }}>{o.label}</NavList.Item>
      )
  return <NavList aria-label={tx('directory')}>{list<MenuOptionLike>(m['menu']).map((o, i) => item(o, i))}</NavList>
}
