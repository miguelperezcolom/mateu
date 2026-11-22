import React, { useMemo, useState } from 'react'
import { ActionList, ActionMenu, Button, SelectPanel, type SelectPanelItemInput as ItemInput } from '@kit'
import { TriangleDownIcon } from '@kit/icons'
import type { MateuSession } from '@rn/core/MateuSession'
import type { AppTarget } from '@mr/shell/appLevel'
import {
  contextOptionLabel as labelOf, useAppContextPicker, useAppContextSearch, useAppContextSelectors,
  type ContextOption as Option, type ContextSelector as Selector,
} from '@mr/shell/appContext'
import { tx } from '@mr/i18n/texts'

/** The app's @AppContext pickers in the header, as Primer menus (the rules are shared: appContext.ts). */
export function ContextPickers({ session, app, selectors }: { session: MateuSession; app: AppTarget; selectors: Selector[] }) {
  useAppContextSelectors(session, selectors)
  if (selectors.length === 0) return null
  return <>{selectors.map((s) => <ContextPicker key={s.fieldName} session={session} app={app} selector={s} />)}</>
}

function ContextPicker({ session, app, selector }: { session: MateuSession; app: AppTarget; selector: Selector }) {
  const { options, current, currentLabel, name, searchable, choose } = useAppContextPicker(session, app, selector)
  const describedBy = `mateu-ctx-hint-${selector.fieldName}`
  const hint = <span id={describedBy} className="sr-only">{tx('appContextReloads')}</span>

  if (!searchable) {
    return (
      <>
        {hint}
        <ActionMenu>
          <ActionMenu.Button size="small" aria-describedby={describedBy}>
            <span className="mateu-header-muted">{name}:</span> {currentLabel}
          </ActionMenu.Button>
          <ActionMenu.Overlay width="small">
            <ActionList selectionVariant="single" aria-label={name}>
              <ActionList.Item selected={current === ''} onSelect={() => choose(null)}>{tx('none')}</ActionList.Item>
              {options.map((o) => (
                <ActionList.Item key={String(o.value)} selected={String(o.value) === current} onSelect={() => choose(o)}>
                  {labelOf(o)}
                </ActionList.Item>
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </>
    )
  }
  return <SearchablePicker session={session} app={app} selector={selector} options={options} current={current}
    currentLabel={currentLabel} name={name} hint={hint} describedBy={describedBy} choose={choose} />
}

function SearchablePicker({ session, app, selector, options, current, currentLabel, name, hint, describedBy, choose }: {
  session: MateuSession; app: AppTarget; selector: Selector; options: Option[]; current: string; currentLabel: string
  name: string; hint: React.ReactNode; describedBy: string; choose: (o: Option | null) => void
}) {
  const [open, setOpen] = useState(false)
  const { filter, onFilter, visible, reset } = useAppContextSearch(session, app, selector, options)

  const items: (ItemInput & { option: Option })[] = useMemo(
    () => visible.map((o) => ({ id: String(o.value), text: labelOf(o), option: o })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible.map((o) => String(o.value)).join('|')],
  )
  const selected = items.find((i) => i.id === current)

  return (
    <>
      {hint}
      <SelectPanel
        title={name}
        placeholder={tx('searchNamed', { name: name.toLowerCase() })}
        inputLabel={tx('searchNamed', { name: name.toLowerCase() })}
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) reset() }}
        items={items}
        selected={selected}
        onSelectedChange={(item: ItemInput | undefined) => {
          setOpen(false)
          choose((item as { option?: Option } | undefined)?.option ?? null)
        }}
        filterValue={filter}
        onFilterChange={onFilter}
        renderAnchor={({ children: _placeholder, ...anchorProps }) => (
          <Button size="small" trailingVisual={TriangleDownIcon} aria-describedby={describedBy} {...anchorProps}>
            <span className="mateu-header-muted">{name}:</span> {currentLabel}
          </Button>
        )}
        overlayProps={{ width: 'medium', height: 'medium' }}
      />
    </>
  )
}
