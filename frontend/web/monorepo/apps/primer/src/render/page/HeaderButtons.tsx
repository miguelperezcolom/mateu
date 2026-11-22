import React from 'react'
import { ActionList, ActionMenu, Button, ButtonGroup, IconButton } from '@primer/react'
import { TriangleDownIcon } from '@primer/octicons-react'
import { interpolate } from '@rn/core/expressions'
import { buttonGroupMembers, splitButtonParts } from '@rn/core/buttonGroup'
import { isBackButton, isNavButton } from '@infra/ui/toolbarButtonKinds.ts'
import { withSelectionGate } from '@infra/ui/selectionGate.ts'
import { useController } from '../ViewHost'
import { useButtonPress } from '../useButtonPress'
import { usePending } from '../usePending'
import { buttonVariantOf } from '../looks'

type Dict = Record<string, unknown>
type Ctx = { state: Dict; data?: unknown }

const idOf = (b: Dict): string => String(b['actionId'] ?? b['id'] ?? '')

/**
 * A page header's toolbar, the web header's layout: the way back (back / backToList / cancel-view)
 * is the chevron before the title, Cancel-like buttons sit apart on the left of the actions with a
 * divider, the actions follow; a button with children is a split button when it says `split`
 * (checked first), else a dropdown of them.
 */
export function splitToolbar(toolbar: Dict[], backAsChevron: boolean): { back: Dict | undefined; nav: Dict[]; actions: Dict[] } {
  const back = backAsChevron ? toolbar.find((b) => isBackButton(idOf(b))) : undefined
  const nav = toolbar.filter((b) => b !== back && isNavButton(idOf(b)))
  const actions = toolbar.filter((b) => b !== back && !isNavButton(idOf(b)))
  return { back, nav, actions }
}

/** Runs a header button: a `route` navigates, anything else is the page's own action. */
export function useHeaderPress(ctx: Ctx) {
  const controller = useController()
  const press = useButtonPress()
  return (b: Dict, label = '') => press(b, ctx, () => {
    const id = idOf(b)
    if (id) void controller.runAction(id, (b['parameters'] as Dict | undefined) ?? undefined)
  }, label || String(b['label'] ?? ''))
}

/**
 * What the page's data says about a header button: `<actionId>.hidden` drops it (the web header's
 * rule), and one that needs selected rows is disabled while the page's listing has none.
 */
export function shownButtons(buttons: Dict[], ctx: Ctx): Dict[] {
  const data = (ctx.data ?? {}) as Dict
  const selection = ctx.state['crud_selected_items']
  return buttons
    .filter((b) => !data[`${idOf(b)}.hidden`])
    .map((b) => (b['rowsSelectedRequired'] === true ? withSelectionGate(b as never, selection) as Dict : b))
}

export function HeaderButtons({ nav: allNav, actions: allActions, ctx }: { nav: Dict[]; actions: Dict[]; ctx: Ctx }) {
  const nav = shownButtons(allNav, ctx)
  const actions = shownButtons(allActions, ctx)
  return (
    <>
      {nav.map((b, i) => <HeaderButton key={`n${i}`} button={b} ctx={ctx} />)}
      {nav.length > 0 && actions.length > 0 && <span className="mateu-page-toolbar-divider" aria-hidden="true" />}
      {actions.map((b, i) => <HeaderButton key={`a${i}`} button={b} ctx={ctx} />)}
    </>
  )
}

export function HeaderButton({ button, ctx }: { button: Dict; ctx: Ctx }) {
  const label = interpolate(String(button['label'] ?? ''), ctx)
  const split = splitButtonParts(button)
  if (split) {
    return (
      <ButtonGroup>
        <SingleButton button={split.primary} ctx={ctx} />
        <ActionMenu>
          <ActionMenu.Anchor>
            <IconButton icon={TriangleDownIcon} aria-label={`More: ${label}`.trim()} variant={buttonVariantOf(button) === 'primary' ? 'primary' : 'default'} />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay><GroupItems members={split.more} ctx={ctx} /></ActionMenu.Overlay>
        </ActionMenu>
      </ButtonGroup>
    )
  }
  const members = buttonGroupMembers(button)
  if (members) {
    return (
      <ActionMenu>
        <ActionMenu.Button variant={buttonVariantOf(button)}>{label || 'Actions'}</ActionMenu.Button>
        <ActionMenu.Overlay><GroupItems members={members} ctx={ctx} /></ActionMenu.Overlay>
      </ActionMenu>
    )
  }
  return <SingleButton button={button} ctx={ctx} />
}

function GroupItems({ members, ctx }: { members: Dict[]; ctx: Ctx }) {
  const run = useHeaderPress(ctx)
  return (
    <ActionList>
      {members.map((m, i) => {
        const label = interpolate(String(m['label'] ?? ''), ctx)
        const { onPress, disabled } = run(m, label)
        return <ActionList.Item key={i} disabled={disabled || m['disabled'] === true} onSelect={onPress}>{label}</ActionList.Item>
      })}
    </ActionList>
  )
}

const SIZE: Record<string, 'small' | 'medium' | 'large'> = { small: 'small', large: 'large' }

function SingleButton({ button, ctx }: { button: Dict; ctx: Ctx }) {
  const run = useHeaderPress(ctx)
  const label = interpolate(String(button['label'] ?? ''), ctx)
  const pending = usePending(idOf(button))
  const { onPress, disabled } = run(button, label)
  return (
    <Button
      variant={buttonVariantOf(button)}
      disabled={disabled || button['disabled'] === true}
      loading={pending}
      onClick={onPress}
      size={SIZE[String(button['size'] ?? '').toLowerCase()]}
      title={button['shortcut'] ? String(button['shortcut']) : undefined}
      aria-keyshortcuts={button['shortcut'] ? String(button['shortcut']) : undefined}
    >
      {label}
    </Button>
  )
}

/** A bottom-bar or header button outside a group (kept for callers of the old export). */
export function ActionButton({ button, onPress, disabled, label }: { button: Dict; onPress: () => void; disabled: boolean; label: string }) {
  const pending = usePending(idOf(button))
  return (
    <Button variant={buttonVariantOf(button)} disabled={disabled || button['disabled'] === true} loading={pending} onClick={onPress}>
      {label}
    </Button>
  )
}

