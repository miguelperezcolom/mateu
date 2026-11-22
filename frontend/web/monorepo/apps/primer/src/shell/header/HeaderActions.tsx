import React from 'react'
import { ActionList, ActionMenu, Button, IconButton } from '@primer/react'
import { KebabHorizontalIcon } from '@primer/octicons-react'
import type { MateuSession } from '@rn/core/MateuSession'
import { headerActionLeaves, splitHeaderActions, type HeaderAction } from '@rn/core/embeddedAppExtras'
import { runAndApply, type AppTarget } from '@mr/shell/appLevel'
import { tx } from '@mr/i18n/texts'

/**
 * The app's header actions (AppActionsSupplier → AppDto.contextActions): buttons on the header, an
 * action with children a menu whose children dispatch. Run APP-LEVEL; the answer applies to the
 * screen on view. On a narrow header they all fold, on a wide one the plain ones beyond three fold into a "More" menu.
 */
export function HeaderActions({ session, app, actions, narrow }: { session: MateuSession; app: AppTarget; actions: HeaderAction[]; narrow: boolean }) {
  const usable = actions.filter((a) => a && (a.actionId || (a.children ?? []).length > 0))
  if (usable.length === 0) return null
  const run = (actionId?: string | null) => { if (actionId) void runAndApply(session, app, actionId) }
  // wide: up to three plain actions and every menu on the bar, the rest under "More"; narrow: all under "More"
  const split = splitHeaderActions(usable, 3)
  const menus = usable.filter((a) => (a.children ?? []).length > 0)
  const inline = narrow ? [] : usable.filter((a) => split.inline.includes(a) || menus.includes(a))
  const more = narrow ? usable : split.more.filter((a) => !menus.includes(a))

  return (
    <>
      {inline.map((a, i) => {
        const children = (a.children ?? []).filter(Boolean)
        if (children.length === 0) {
          return <Button key={`a${i}`} size="small" onClick={() => run(a.actionId)}>{a.label ?? a.actionId}</Button>
        }
        return (
          <ActionMenu key={`a${i}`}>
            <ActionMenu.Button size="small">{a.label}</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                {headerActionLeaves(a).map((leaf, j) => (
                  <ActionList.Item key={j} onSelect={() => run(leaf.actionId)}>{leaf.label ?? leaf.actionId}</ActionList.Item>
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
                  return <ActionList.Item key={i} onSelect={() => run(a.actionId)}>{a.label ?? a.actionId}</ActionList.Item>
                }
                return (
                  <ActionList.Group key={i}>
                    <ActionList.GroupHeading>{a.label}</ActionList.GroupHeading>
                    {headerActionLeaves(a).map((leaf, j) => (
                      <ActionList.Item key={j} onSelect={() => run(leaf.actionId)}>{leaf.label ?? leaf.actionId}</ActionList.Item>
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
