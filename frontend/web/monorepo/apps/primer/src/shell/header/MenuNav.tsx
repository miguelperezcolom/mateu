import React, { useMemo, useState } from 'react'
import { ActionList, ActionMenu, Button, Dialog, Heading, Link, NavList, Text, TextInput, UnderlineNav } from '@primer/react'
import { ChevronRightIcon, SearchIcon } from '@primer/octicons-react'
import { cardsOf, isCardsGroup } from '@rn/renderer/menuCards'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { filterMenu, firstLeaf, holdsCurrent, isGroup, subsOf, visibleItems, type MenuHandlers, type MenuItem } from '@mr/shell/menu'
import { isCurrentDestination } from '@rn/core/uxRules'
import { tx } from '@mr/i18n/texts'


// ---- side navigation (HAMBURGER_MENU, MENU_ON_LEFT, RAIL, AUTO) ----------------------------------

function SideItem({ item, h, depth }: { item: MenuItem; h: MenuHandlers; depth: number }): React.ReactElement {
  if (isCardsGroup(item)) {
    return (
      <NavList.Item href="#" aria-haspopup="dialog" onClick={(e: React.MouseEvent) => { e.preventDefault(); h.openCards(item) }}>
        {item.label}
        <NavList.TrailingVisual><ChevronRightIcon /></NavList.TrailingVisual>
      </NavList.Item>
    )
  }
  const subs = subsOf(item)
  if (subs.length > 0) {
    // the first level is a titled group; a deeper group expands in place
    if (depth === 0) {
      return (
        <NavList.Group title={item.label ?? ''}>
          {subs.map((s, i) => <SideEntry key={i} item={s} h={h} depth={depth + 1} />)}
        </NavList.Group>
      )
    }
    return (
      <NavList.Item defaultOpen={holdsCurrent(item, h.currentRoute)}>
        {item.label}
        <NavList.SubNav>{subs.map((s, i) => <SideEntry key={i} item={s} h={h} depth={depth + 1} />)}</NavList.SubNav>
      </NavList.Item>
    )
  }
  return (
    <NavList.Item
      href={'#'}
      aria-current={isCurrentDestination(item, h.currentRoute) ? 'page' : undefined}
      aria-disabled={item.disabled || undefined}
      onClick={(e: React.MouseEvent) => { e.preventDefault(); h.activate(item) }}
    >
      {item.label}
      {item.description ? <NavList.Description>{item.description}</NavList.Description> : null}
    </NavList.Item>
  )
}

function SideEntry({ item, h, depth }: { item: MenuItem; h: MenuHandlers; depth: number }) {
  if (item.separator) return <NavList.Divider />
  return <SideItem item={item} h={h} depth={depth} />
}

export function SideNav({ menu, h, label = tx('mainMenu'), searchable = false }: { menu: MenuItem[]; h: MenuHandlers; label?: string; searchable?: boolean }) {
  const [query, setQuery] = useState('')
  const shown = useMemo(() => (query.trim() ? filterMenu(menu, query) : menu), [menu, query])
  return (
    <>
      {/* a long menu (more than 10 entries — AppDto.totalMenuOptions) gets a filter on top, like the web drawer */}
      {searchable && (
        <div className="mateu-menu-search">
          <TextInput leadingVisual={SearchIcon} aria-label={tx('searchTheMenu')} placeholder={tx('searchTheMenu')} size="small" block
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      )}
      <NavList aria-label={label}>{shown.map((m, i) => <SideEntry key={i} item={m} h={h} depth={0} />)}</NavList>
      {searchable && query.trim() && shown.length === 0 && <p className="mateu-menu-search-empty">{tx('noMenuMatches')}</p>}
    </>
  )
}

// ---- top navigation (MENU_ON_TOP, TILES) --------------------------------------------------------

function MenuListItems({ items, h }: { items: MenuItem[]; h: MenuHandlers }): React.ReactElement {
  return (
    <>
      {items.map((s, i) => {
        if (s.separator) return <ActionList.Divider key={i} />
        if (isCardsGroup(s)) return <ActionList.Item key={i} onSelect={() => h.openCards(s)}>{s.label}…</ActionList.Item>
        if (isGroup(s)) {
          return (
            <ActionList.Group key={i}>
              <ActionList.GroupHeading>{s.label}</ActionList.GroupHeading>
              <MenuListItems items={subsOf(s)} h={h} />
            </ActionList.Group>
          )
        }
        return (
          <ActionList.Item key={i} active={isCurrentDestination(s, h.currentRoute)} disabled={s.disabled} onSelect={() => h.activate(s)}>
            {s.label}
            {s.description ? <ActionList.Description variant="block">{s.description}</ActionList.Description> : null}
          </ActionList.Item>
        )
      })}
    </>
  )
}

/**
 * The menu as a bar under the app name: a leaf is a link, a group a dropdown (MENU_ON_TOP) or the
 * page of its tiles (TILES, `onHub`). Scrolls sideways on a narrow screen rather than wrapping.
 */
export function TopNav({ menu, h, onHub, hub }: { menu: MenuItem[]; h: MenuHandlers; onHub?: (g: MenuItem) => void; hub?: MenuItem | null }) {
  return (
    <nav aria-label={tx('mainMenu')} className="mateu-topnav">
      <ul>
        {menu.filter((m) => !m.separator).map((m, i) => {
          const current = hub ? hub === m : holdsCurrent(m, h.currentRoute)
          if (isCardsGroup(m)) {
            return <li key={i}><Button variant="invisible" size="small" className={current ? 'is-current' : ''} aria-haspopup="dialog" onClick={() => h.openCards(m)}>{m.label}</Button></li>
          }
          if (isGroup(m)) {
            if (onHub) {
              return <li key={i}><Button variant="invisible" size="small" className={current ? 'is-current' : ''} aria-current={current ? 'page' : undefined} onClick={() => onHub(m)}>{m.label}</Button></li>
            }
            return (
              <li key={i}>
                <ActionMenu>
                  <ActionMenu.Button variant="invisible" size="small" className={current ? 'is-current' : ''}>{m.label}</ActionMenu.Button>
                  <ActionMenu.Overlay width="medium">
                    <ActionList><MenuListItems items={subsOf(m)} h={h} /></ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </li>
            )
          }
          return (
            <li key={i}>
              <Button variant="invisible" size="small" className={current ? 'is-current' : ''} aria-current={current ? 'page' : undefined}
                disabled={m.disabled} onClick={() => h.activate(m)}>{m.label}</Button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// ---- tabs (TABS; HAMBURGER_SECTIONS' band) -------------------------------------------------------

/** The entries as Primer's UnderlineNav (it folds what does not fit into "More"). A group: a dropdown in the band. */
export function TabsNav({ items, h, label = tx('mainMenu') }: { items: MenuItem[]; h: MenuHandlers; label?: string }) {
  const leaves = items.filter((m) => !m.separator)
  if (leaves.length === 0) return null
  return (
    <UnderlineNav aria-label={label} className="mateu-tabsnav">
      {leaves.map((m, i) => (
        <UnderlineNav.Item
          key={`${i}-${m.route ?? m.label}`}
          href="#"
          aria-current={holdsCurrent(m, h.currentRoute) ? 'page' : undefined}
          onSelect={(e: React.MouseEvent | React.KeyboardEvent) => {
            e.preventDefault()
            if (isCardsGroup(m)) h.openCards(m)
            else if (isGroup(m)) h.activate(firstLeaf(m) ?? m)
            else h.activate(m)
          }}
        >
          {m.label}
        </UnderlineNav.Item>
      ))}
    </UnderlineNav>
  )
}

// ---- tiles (TILES' hub, a group's page) ----------------------------------------------------------

export function TilesHub({ group, h }: { group: MenuItem; h: MenuHandlers }) {
  const sections = subsOf(group).filter((s) => !s.separator)
  // entries of the group: plain ones in one band, sub-groups each with its own heading
  const plain = sections.filter((s) => !isGroup(s))
  const nested = sections.filter((s) => isGroup(s))
  return (
    <div className="mateu-tiles">
      <Heading as="h2" variant="medium">{group.label}</Heading>
      {plain.length > 0 && <TileGrid items={plain} h={h} />}
      {nested.map((g, i) => (
        <section key={i} aria-label={g.label}>
          <Heading as="h3" variant="small" className="mateu-tiles-heading">{g.label}</Heading>
          <TileGrid items={subsOf(g).filter((s) => !s.separator)} h={h} />
        </section>
      ))}
    </div>
  )
}

function TileGrid({ items, h }: { items: MenuItem[]; h: MenuHandlers }) {
  return (
    <ul className="mateu-tile-grid">
      {items.map((m, i) => (
        <li key={i}>
          <button type="button" className="mateu-tile" disabled={m.disabled}
            onClick={() => (isGroup(m) ? h.openCards({ ...m, display: 'cards' }) : h.activate(m))}>
            <span className="mateu-tile-title">{m.label}</span>
            {m.description ? <span className="mateu-tile-text">{m.description}</span> : null}
          </button>
        </li>
      ))}
      {items.length === 0 && <Text className="mateu-header-muted">{tx('nothingHere')}</Text>}
    </ul>
  )
}

// ---- card menus (display: "cards") ---------------------------------------------------------------

/** A `display: "cards"` group: its entries as cards in a dialog; an entry with entries offers them as its actions. */
export function CardsDialog({ group, h, baseUrl, onClose }: { group: MenuItem; h: MenuHandlers; baseUrl: string; onClose: () => void }) {
  const cards = cardsOf(group as never, baseUrl) as ReturnType<typeof cardsOf<MenuItem & { label?: string }>>
  const pick = (item: MenuItem) => { onClose(); h.activate(item) }
  return (
    <Dialog title={group.label} onClose={onClose} width="xlarge">
      <ul className="mateu-card-menu">
        {cards.map((c, i) => {
          const img = c.imageUri ? safeHref(c.imageUri, { allowData: true }) : undefined
          const body = (
            <>
              {img ? <img src={img} alt="" className="mateu-card-menu-image" /> : c.glyph ? <span className="mateu-card-menu-glyph" aria-hidden="true">{c.glyph}</span> : null}
              <span className="mateu-card-menu-title">{c.title}</span>
              {c.description ? <span className="mateu-card-menu-text">{c.description}</span> : null}
            </>
          )
          return (
            <li key={i} className="mateu-card-menu-card">
              {c.target
                ? <button type="button" className="mateu-card-menu-main" onClick={() => pick(c.target as MenuItem)}>{body}</button>
                : <div className="mateu-card-menu-main">{body}</div>}
              {c.actions.length > 0 && (
                <ul className="mateu-card-menu-actions">
                  {c.actions.map((a, j) => (
                    <li key={j}><Link as="button" type="button" onClick={() => pick(a as MenuItem)}>{(a as MenuItem).label}</Link></li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </Dialog>
  )
}
