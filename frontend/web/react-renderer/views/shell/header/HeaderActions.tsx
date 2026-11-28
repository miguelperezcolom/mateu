import React from 'react'
import { ActionList, ActionMenu, Button, IconButton } from '@kit'
import { KebabHorizontalIcon } from '@kit/icons'
import type { MateuSession, NavTarget } from '@rn/core/MateuSession'
import { headerActionLeaves, type HeaderAction } from '@rn/core/embeddedAppExtras'
import { runAndApply, type AppTarget } from '@mr/shell/appLevel'
import { tx } from '@mr/i18n/texts'

/**
 * The app's header actions (AppActionsSupplier → AppDto.contextActions): buttons on the header, an
 * action with children a menu whose children dispatch. Run APP-LEVEL; the answer applies to the
 * screen on view; one that names a `route` (YAML `headerActions: {label, route}`) navigates there like
 * a menu entry. On a narrow header they all fold, on a wide one the plain ones beyond three fold into a "More" menu.
 */
type Routed = HeaderAction & { route?: string | null }
export function HeaderActions({ session, app, actions, narrow, onNavigate }: {
  session: MateuSession; app: AppTarget; actions: HeaderAction[]; narrow: boolean; onNavigate?: (t: NavTarget) => void
}) {
  const usable = (actions as Routed[]).filter((a) => a && (a.actionId || (a.route && onNavigate) || (a.children ?? []).length > 0))
  if (usable.length === 0) return null
  const press = (a: Routed) => {
    if (a.actionId) void runAndApply(session, app, a.actionId)
    else if (a.route && onNavigate) onNavigate({ label: a.label ?? '', route: a.route, consumedRoute: '', serverSideType: '' })
  }
  // wide: up to three plain actions and every menu on the bar, the rest under "More"; narrow: all under "More"
  // (the core's splitHeaderActions counts only actions with an actionId as plain; a routed one is plain too)
  const menus = usable.filter((a) => (a.children ?? []).length > 0)
  const plain = usable.filter((a) => !menus.includes(a))
  const inline = narrow ? [] : usable.filter((a) => plain.slice(0, 3).includes(a) || menus.includes(a))
  const more = narrow ? usable : plain.slice(3)

  return (
    <>
      {inline.map((a, i) => {
        const children = (a.children ?? []).filter(Boolean)
        if (children.length === 0) {
          return <Button key={`a${i}`} size="small" onClick={() => press(a)}>{a.label ?? a.actionId}</Button>
        }
        return (
          <ActionMenu key={`a${i}`}>
            <ActionMenu.Button size="small">{a.label}</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                {headerActionLeaves(a).map((leaf, j) => (
                  <ActionList.Item key={j} onSelect={() => press(leaf as Routed)}>{leaf.label ?? leaf.actionId}</ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )
      })}
      {more.length > 0 && (
        <ActionMenu>
          <ActionMenu.Anchor>
            <IconButton icon={KebabHorizontalIcon} size="small" aria-label={tx('moreActions')} />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              {more.map((a, i) => {
                const children = (a.children ?? []).filter(Boolean)
                if (children.length === 0) {
                  return <ActionList.Item key={i} onSelect={() => press(a)}>{a.label ?? a.actionId}</ActionList.Item>
                }
                return (
                  <ActionList.Group key={i}>
                    <ActionList.GroupHeading>{a.label}</ActionList.GroupHeading>
                    {headerActionLeaves(a).map((leaf, j) => (
                      <ActionList.Item key={j} onSelect={() => press(leaf as Routed)}>{leaf.label ?? leaf.actionId}</ActionList.Item>
                    ))}
                  </ActionList.Group>
                )
              })}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </>
  )
}
