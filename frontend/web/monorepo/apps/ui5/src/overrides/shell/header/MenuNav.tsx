import React, { useMemo, useState } from 'react'
import {
  Card, CardHeader, Dialog as Ui5Dialog, Bar, Button as Ui5Button, Input, Link as Ui5Link, SideNavigation, SideNavigationGroup,
  SideNavigationItem, SideNavigationSubItem, Tab, TabContainer, Title,
} from '@ui5/webcomponents-react'
import { cardsOf, isCardsGroup } from '@rn/renderer/menuCards'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { filterMenu, firstLeaf, holdsCurrent, isGroup, subsOf, type MenuHandlers, type MenuItem } from '@mr/shell/menu'
import { isCurrentDestination } from '@rn/core/uxRules'
import { tx } from '@mr/i18n/texts'
import { octiconOf } from '@mr/views/render/catalogue/display/shared'
import { iconName } from '@kit'

const iconOf = (m: MenuItem) => iconName(octiconOf((m as { icon?: unknown }).icon))

/** Every menu entry the side navigation draws, keyed so a click finds its entry back. */
function keyed(menu: MenuItem[]): Map<string, MenuItem> {
  const map = new Map<string, MenuItem>()
  const walk = (items: MenuItem[], path: string) => items.forEach((m, i) => {
    const k = `${path}.${i}`
    map.set(k, m)
    walk(subsOf(m), k)
  })
  walk(menu, 'm')
  return map
}

// ---- side navigation (HAMBURGER_MENU, MENU_ON_LEFT, RAIL, AUTO) ----------------------------------

/**
 * Fiori's side navigation: a top-level group is a titled group, an entry with entries expands in
 * place (two levels — a deeper one is reached through its parent's first leaf), the current
 * destination is selected. `collapsed` is the RAIL (icons only).
 */
export function SideNav({ menu, h, label = tx('mainMenu'), searchable = false, collapsed = false }: { menu: MenuItem[]; h: MenuHandlers; label?: string; searchable?: boolean; collapsed?: boolean }) {
  const [query, setQuery] = useState('')
  const shown = useMemo(() => (query.trim() ? filterMenu(menu, query) : menu), [menu, query])
  const byKey = useMemo(() => keyed(shown), [shown])

  const leaf = (m: MenuItem, k: string, Sub: boolean) => {
    const props = {
      'data-key': k, text: m.label ?? '', icon: iconOf(m), disabled: m.disabled || undefined,
      selected: isCurrentDestination(m, h.currentRoute) || undefined, tooltip: m.description ?? undefined,
    }
    return Sub ? <SideNavigationSubItem key={k} {...props} /> : <SideNavigationItem key={k} {...props} />
  }
  const item = (m: MenuItem, k: string): React.ReactNode => {
    const subs = subsOf(m)
    if (subs.length === 0 || isCardsGroup(m)) return leaf(m, k, false)
    return (
      <SideNavigationItem key={k} data-key={k} text={m.label ?? ''} icon={iconOf(m)} expanded={holdsCurrent(m, h.currentRoute) || undefined} unselectable>
        {subs.filter((s) => !s.separator).map((s, i) => leaf(s, `${k}.${subs.indexOf(s) >= 0 ? subs.indexOf(s) : i}`, true))}
      </SideNavigationItem>
    )
  }

  return (
    <SideNavigation accessibleName={label} collapsed={collapsed || undefined}
      header={searchable ? (
        <div slot="header" className="mateu-menu-search">
          <Input placeholder={tx('searchTheMenu')} accessibleName={tx('searchTheMenu')} showClearIcon value={query} style={{ width: '100%' }}
            onInput={(e: Event) => setQuery((e.target as HTMLInputElement).value)} />
        </div>
      ) : undefined}
      onItemClick={(e: CustomEvent<{ item: HTMLElement }>) => {
        const m = byKey.get(e.detail.item.getAttribute('data-key') ?? '')
        if (!m) return
        if (isCardsGroup(m)) h.openCards(m)
        else if (!isGroup(m)) h.activate(m)
      }}>
      {shown.map((m, i) => {
        if (m.separator) return null
        const k = `m.${i}`
        const subs = subsOf(m)
        // the first level of a grouped menu: Fiori's titled navigation group
        if (subs.length > 0 && !isCardsGroup(m) && shown.length > 1) {
          return (
            <SideNavigationGroup key={k} text={m.label ?? ''} expanded>
              {subs.map((s, j) => (s.separator ? null : item(s, `${k}.${j}`)))}
            </SideNavigationGroup>
          )
        }
        return item(m, k)
      })}
    </SideNavigation>
  )
}

// ---- tabs (MENU_ON_TOP, TABS, TILES; HAMBURGER_SECTIONS' band) -----------------------------------

/**
 * The menu as Fiori's icon tab bar under the shell bar: a leaf is a tab, a group a tab whose
 * entries open from it (MENU_ON_TOP), or — with `onHub` (TILES) — the page of its tiles.
 */
export function TabsNav({ items, h, label = tx('mainMenu'), onHub, hub }: { items: MenuItem[]; h: MenuHandlers; label?: string; onHub?: (g: MenuItem) => void; hub?: MenuItem | null }) {
  const entries = items.filter((m) => !m.separator)
  const byKey = useMemo(() => keyed(entries), [entries])
  if (entries.length === 0) return null
  const tab = (m: MenuItem, k: string, nested: boolean): React.ReactNode => {
    const subs = subsOf(m)
    const current = hub ? hub === m : holdsCurrent(m, h.currentRoute)
    const showSubs = subs.length > 0 && !onHub && !isCardsGroup(m) && !nested
    return (
      <Tab key={k} data-key={k} text={m.label ?? ''} icon={iconOf(m)} selected={current || undefined} disabled={m.disabled || undefined}
        items={showSubs ? <>{subs.filter((s) => !s.separator).map((s, j) => tab(s, `${k}.${subs.indexOf(s) >= 0 ? subs.indexOf(s) : j}`, true))}</> : undefined} />
    )
  }
  return (
    <TabContainer className="mateu-tabsnav" collapsed noAutoSelection tabLayout="Inline" aria-label={label} overflowMode="End"
      onTabSelect={(e: CustomEvent<{ tab: HTMLElement }>) => {
        const m = byKey.get(e.detail.tab.getAttribute('data-key') ?? '')
        if (!m) return
        if (isCardsGroup(m)) h.openCards(m)
        else if (isGroup(m)) { if (onHub) onHub(m); else if (!e.detail.tab.querySelector('[slot="items"]')) h.activate(firstLeaf(m) ?? m) }
        else h.activate(m)
      }}>
      {entries.map((m, i) => tab(m, `m.${i}`, false))}
    </TabContainer>
  )
}

// ---- tiles (TILES' hub, a group's page) ----------------------------------------------------------

/** A group's page of tiles: Fiori cards, one per entry, each opening its destination. */
export function TilesHub({ group, h }: { group: MenuItem; h: MenuHandlers }) {
  const sections = subsOf(group).filter((s) => !s.separator)
  const plain = sections.filter((s) => !isGroup(s))
  const nested = sections.filter((s) => isGroup(s))
  return (
    <div className="mateu-tiles">
      <Title level="H2" size="H3">{group.label}</Title>
      {plain.length > 0 && <TileGrid items={plain} h={h} />}
      {nested.map((g, i) => (
        <section key={i} aria-label={g.label}>
          <Title level="H3" size="H5" className="mateu-tiles-heading">{g.label}</Title>
          <TileGrid items={subsOf(g).filter((s) => !s.separator)} h={h} />
        </section>
      ))}
    </div>
  )
}

function TileGrid({ items, h }: { items: MenuItem[]; h: MenuHandlers }) {
  if (items.length === 0) return <p className="mateu-header-muted">{tx('nothingHere')}</p>
  return (
    <ul className="mateu-tile-grid">
      {items.map((m, i) => (
        <li key={i}>
          <Card header={<CardHeader slot="header" titleText={m.label ?? ''} subtitleText={m.description ?? undefined} interactive={!m.disabled || undefined}
            onClick={() => (isGroup(m) ? h.openCards({ ...m, display: 'cards' }) : h.activate(m))} />} />
        </li>
      ))}
    </ul>
  )
}

// ---- card menus (display: "cards") ---------------------------------------------------------------

/** A `display: "cards"` group: its entries as cards in a dialog; an entry with entries offers them as its actions. */
export function CardsDialog({ group, h, baseUrl, onClose }: { group: MenuItem; h: MenuHandlers; baseUrl: string; onClose: () => void }) {
  const cards = cardsOf(group as never, baseUrl) as ReturnType<typeof cardsOf<MenuItem & { label?: string }>>
  const pick = (item: MenuItem) => { onClose(); h.activate(item) }
  return (
    <Ui5Dialog open headerText={group.label} onClose={onClose} style={{ width: 'min(60rem, 100vw)' }}
      footer={<Bar design="Footer" endContent={<Ui5Button design="Transparent" onClick={onClose}>{tx('close')}</Ui5Button>} />}>
      <ul className="mateu-card-menu">
        {cards.map((c, i) => {
          const img = c.imageUri ? safeHref(c.imageUri, { allowData: true }) : undefined
          return (
            <li key={i}>
              <Card header={(
                <CardHeader slot="header" titleText={c.title} subtitleText={c.description ?? undefined} interactive={!!c.target || undefined}
                  onClick={() => { if (c.target) pick(c.target as MenuItem) }}
                  avatar={img ? <img slot="avatar" src={img} alt="" className="mateu-card-menu-image" /> : c.glyph ? <span slot="avatar" aria-hidden="true">{c.glyph}</span> : undefined} />
              )}>
                {c.actions.length > 0 && (
                  <ul className="mateu-card-menu-actions">
                    {c.actions.map((a, j) => <li key={j}><Ui5Link onClick={() => pick(a as MenuItem)}>{(a as MenuItem).label}</Ui5Link></li>)}
                  </ul>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
    </Ui5Dialog>
  )
}

/** MENU_ON_TOP: Fiori has no separate top bar — the icon tab bar under the shell bar (TabsNav). */
export function TopNav({ menu, h, onHub, hub }: { menu: MenuItem[]; h: MenuHandlers; onHub?: (g: MenuItem) => void; hub?: MenuItem | null }) {
  return <TabsNav items={menu} h={h} onHub={onHub} hub={hub} />
}

// the shared menu's list items (a renderer's own shell may draw its menu with them)
export { MenuListItems } from '@mr/views/shell/header/MenuNav'
