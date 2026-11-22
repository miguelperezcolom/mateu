import { Wizard, WizardStep } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/accept.js'
import React, { useState } from 'react'
import { ActionList, Avatar, Button, Checkbox, CounterLabel, Heading, IconButton, Label, ProgressBar, Text } from '@kit'
import { CheckCircleFillIcon, CircleIcon, DotFillIcon, AlertFillIcon, XCircleFillIcon, CheckIcon } from '@kit'
import { useController } from '@mr/render/ViewHost'
import { type CatalogueProps, type Dict, glyph, labelVariant, list, pressable, str, useText } from '@mr/views/render/catalogue/status/common'
import { tx } from '@mr/i18n/texts'

/** A running task: done of total, a pill per subtask, and its action once it is complete. */
export function TaskProgress({ metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const total = Math.max(0, Number(m['total'] ?? 0))
  const done = Math.max(0, Number(m['done'] ?? 0))
  const complete = total > 0 && done >= total
  const actionId = str(m['actionId'])
  return (
    <div className={`mateu-st-card${complete ? ' mateu-st-complete' : ''}`}>
      <div className="mateu-st-row mateu-st-between">
        <Text weight="semibold">{t(m['label'])}</Text>
        <Text size="small" className="mateu-st-muted">{done}/{total}</Text>
      </div>
      <ProgressBar progress={total > 0 ? Math.min(100, (done / total) * 100) : 0} bg={complete ? 'success.emphasis' : 'accent.emphasis'} aria-label={t(m['label']) || tx('progress')} />
      {total > 1 && total <= 12 && (
        <div className="mateu-st-row mateu-st-wrap">
          {Array.from({ length: total }, (_, i) => (
            <Label key={i} variant={i < done ? 'success' : 'secondary'}>{i + 1}/{total}</Label>
          ))}
        </div>
      )}
      {m['actionLabel'] && actionId ? (
        <div><Button size="small" variant={complete ? 'primary' : 'default'} onClick={() => void controller.runAction(actionId)}>{t(m['actionLabel'])}</Button></div>
      ) : null}
    </div>
  )
}

/** Items to tick: ticking one tells its action ({_item, _done}); the bar follows. */
export function Checklist({ metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const items = list<Dict>(m['items'])
  const [done, setDone] = useState<Record<number, boolean>>(() => Object.fromEntries(items.map((it, i) => [i, it['done'] === true])))
  const count = Object.values(done).filter(Boolean).length
  const title = t(m['title'])
  return (
    <div className="mateu-st-card">
      <div className="mateu-st-row mateu-st-between">
        {title ? <Heading as="h3" className="mateu-st-h">{title}</Heading> : <span />}
        <Text size="small" className="mateu-st-muted">{count}/{items.length}</Text>
      </div>
      <ProgressBar progress={items.length ? (count / items.length) * 100 : 0} bg="success.emphasis" aria-label={title || tx('progress')} />
      <ul className="mateu-st-plain">
        {items.map((it, i) => {
          const id = `chk-${str(it['id']) || i}-${title}`
          return (
            <li key={i} className="mateu-st-row">
              <Checkbox id={id} checked={!!done[i]} onChange={() => {
                const next = !done[i]
                setDone({ ...done, [i]: next })
                if (it['actionId']) void controller.runAction(str(it['actionId']), { _item: it, _done: next })
              }} />
              <label htmlFor={id} className={done[i] ? 'mateu-st-done' : undefined}>{t(it['label'])}</label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Rows with a status: avatar or icon, title, lines, status label, up to three actions; the row opens with rowActionId. */
export function StatusList({ component, metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const items = list<Dict>(m['items'])
  const rowActionId = str(m['rowActionId'])
  const columns = Math.max(1, Number(m['columns'] ?? 1) || 1)
  const level = Math.min(6, Math.max(2, Number(m['itemHeadingLevel'] ?? 0) || 0)) || null
  const frameless = m['frameless'] === true
  return (
    <ul className={`mateu-st-statuslist${frameless ? '' : ' mateu-st-boxed'}${m['compact'] === true ? ' mateu-st-compact' : ''}`}
      style={{ gridTemplateColumns: columns > 1 ? `repeat(auto-fit, minmax(max(14rem, calc(100% / ${columns} - 1px)), 1fr))` : undefined }}>
      {items.map((it, i) => {
        const id = str(it['id'])
        const actions = ([['actionId', 'actionLabel', 'actionIcon'], ['actionId2', 'actionLabel2', 'actionIcon2'], ['actionId3', 'actionLabel3', 'actionIcon3']] as const)
          .map(([a, l, ic]) => ({ actionId: str(it[a]), label: t(it[l]), icon: glyph(it[ic]) }))
          .filter((a) => a.actionId)
        const avatar = str(it['avatar'])
        const icon = glyph(it['icon'])
        const title = t(it['title'])
        return (
          <li key={id || i} className="mateu-st-statusrow">
            <div {...pressable(rowActionId ? () => void controller.runAction(rowActionId, { _item: id }) : null, title, 'mateu-st-row mateu-st-grow')}>
              {avatar && /^(https?:|\/|data:image\/)/i.test(avatar) ? <Avatar src={avatar} size={32} alt="" />
                : avatar ? <span className="mateu-st-initials" aria-hidden="true">{avatar.slice(0, 3)}</span>
                : icon ? <span className="mateu-st-icon" aria-hidden="true">{icon}</span> : null}
              <div className="mateu-st-stack-xs mateu-st-grow">
                {level ? React.createElement(`h${level}`, { className: 'mateu-st-itemtitle' }, title) : <Text weight="semibold">{title}</Text>}
                {it['description'] ? <Text size="small" className="mateu-st-muted">{t(it['description'])}</Text> : null}
                {list<string>(it['lines']).map((l, j) => <Text key={j} size="small" className="mateu-st-muted">{t(l)}</Text>)}
              </div>
              {it['status'] ? <Label variant={labelVariant(it['statusColor'])}>{t(it['status'])}</Label> : null}
            </div>
            {actions.length > 0 && (
              <div className="mateu-st-row">
                {actions.map((a, k) => a.label
                  ? <Button key={k} size="small" onClick={() => void controller.runAction(a.actionId, { _item: id })}>{a.icon ? `${a.icon} ` : ''}{a.label}</Button>
                  : <IconButton key={k} size="small" aria-label={a.actionId} icon={() => <span>{a.icon || '…'}</span>} onClick={() => void controller.runAction(a.actionId, { _item: id })} />)}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Integrations / jobs: health dot, the systems it touches, ok / warning / error counts. */
export function ProcessMonitor({ metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  return (
    <ul className="mateu-st-statuslist mateu-st-boxed">
      {list<Dict>(m['items']).map((it, i) => {
        const s = str(it['status'])
        const Dot = s === 'error' ? XCircleFillIcon : s === 'warning' ? AlertFillIcon : CheckCircleFillIcon
        const color = s === 'error' ? 'var(--sapNegativeTextColor)' : s === 'warning' ? 'var(--sapCriticalTextColor)' : 'var(--sapPositiveTextColor)'
        return (
          <li key={str(it['id']) || i} className="mateu-st-statusrow">
            <div className="mateu-st-row mateu-st-grow">
              <span style={{ color }} aria-label={s || 'ok'}><Dot size={16} /></span>
              <div className="mateu-st-stack-xs mateu-st-grow">
                <Text weight="semibold">{t(it['name'])}</Text>
                <div className="mateu-st-row mateu-st-wrap">{list<string>(it['systems']).map((sy, j) => <Label key={j} variant="secondary">{t(sy)}</Label>)}</div>
              </div>
              <span className="mateu-st-row" aria-label={`${Number(it['ok'] ?? 0)} ok, ${Number(it['warnings'] ?? 0)} warnings, ${Number(it['errors'] ?? 0)} errors`}>
                <CounterLabel>{Number(it['ok'] ?? 0)}</CounterLabel>
                {Number(it['warnings'] ?? 0) > 0 && <Label variant="attention">{Number(it['warnings'])}</Label>}
                {Number(it['errors'] ?? 0) > 0 && <Label variant="danger">{Number(it['errors'])}</Label>}
              </span>
            </div>
            {it['actionId'] ? <Button size="small" onClick={() => void controller.runAction(str(it['actionId']))}>{t(it['actionLabel']) || tx('open')}</Button> : null}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Wizard progress (STEPS): Fiori's wizard navigation — ui5-wizard's step bar, the current step
 * selected, the ones done reachable, the upcoming ones disabled. The step's content is the page
 * under it (the server's), so the wizard shows its navigation only. RAIL (`vertical`) keeps the
 * list of steps with their descriptions.
 */
export function ProgressSteps({ metadata: m, state, data }: CatalogueProps) {
  const t = useText(state, data)
  const steps = list<Dict>(m['steps'])
  const vertical = m['vertical'] === true
  const allDone = steps.length > 0 && steps.every((s) => str(s['status']) === 'done')
  if (!vertical) {
    return (
      <div className="mateu-st-stack-sm">
        <Wizard className="mateu-wizard-nav" accessibleName={tx('progress')}>
          {steps.map((s, i) => {
            const status = str(s['status']) || 'upcoming'
            return (
              <WizardStep key={str(s['id']) || i} titleText={t(s['title'])} subtitleText={s['description'] ? t(s['description']) : undefined}
                icon={status === 'done' ? 'accept' : undefined} selected={status === 'current' || (allDone && i === steps.length - 1) || undefined}
                disabled={status === 'upcoming' || undefined} />
            )
          })}
        </Wizard>
        {allDone && m['resultTitle'] ? <Text size="small" className="mateu-st-ok"><CheckIcon size={16} /> {t(m['resultTitle'])}</Text> : null}
      </div>
    )
  }
  return (
    <div className="mateu-st-stack-sm">
      <ol className="mateu-st-steps-v">
        {steps.map((s, i) => {
          const status = str(s['status']) || 'upcoming'
          const Icon = status === 'done' ? CheckCircleFillIcon : status === 'current' ? DotFillIcon : CircleIcon
          return (
            <li key={str(s['id']) || i} className={`mateu-st-step mateu-st-step-${status}`} aria-current={status === 'current' ? 'step' : undefined}>
              <span className="mateu-st-step-dot"><Icon size={16} /></span>
              <span className="mateu-st-stack-xs">
                <Text size="small" weight={status === 'current' ? 'semibold' : 'normal'}>{t(s['title'])}</Text>
                {s['description'] ? <Text size="small" className="mateu-st-muted">{t(s['description'])}</Text> : null}
              </span>
            </li>
          )
        })}
      </ol>
      {allDone && m['resultTitle'] ? <Text size="small" className="mateu-st-ok"><CheckIcon size={16} /> {t(m['resultTitle'])}</Text> : null}
    </div>
  )
}

/** A work queue: groups of selectable cards; picking one runs the queue's action with {_item: id}. */
export function TaskQueue({ metadata: m, state, data }: CatalogueProps) {
  const controller = useController()
  const t = useText(state, data)
  const groups = list<Dict>(m['groups'])
  const actionId = str(m['actionId'])
  const [selected, setSelected] = useState<string | undefined>(() =>
    groups.flatMap((g) => list<Dict>(g['items'])).find((it) => it['selected'] === true)?.['id'] as string | undefined)
  return (
    <div className="mateu-st-queue">
      {groups.map((g, gi) => (
        <ActionList key={gi} selectionVariant="single" role="listbox" aria-label={t(g['label']) || tx('queue')}>
          {g['label'] ? <ActionList.GroupHeading>{t(g['label'])}</ActionList.GroupHeading> : null}
          {list<Dict>(g['items']).map((it, i) => {
            const id = str(it['id'])
            return (
              <ActionList.Item key={id || i} role="option" selected={id === selected} onSelect={() => {
                setSelected(id)
                // the queue's action (what every renderer runs), else the card's own
                const run = actionId || str(it['actionId'])
                if (run) void controller.runAction(run, { _item: id })
              }}>
                {t(it['title'])}
                {it['caption'] ? <ActionList.Description variant="block">{t(it['caption'])}</ActionList.Description> : null}
                {list<Dict>(it['badges']).length > 0 && (
                  <ActionList.TrailingVisual>
                    <span className="mateu-st-row">{list<Dict>(it['badges']).map((b, k) => <Label key={k} variant={labelVariant(b['color'])}>{t(b['label'])}</Label>)}</span>
                  </ActionList.TrailingVisual>
                )}
              </ActionList.Item>
            )
          })}
        </ActionList>
      ))}
    </div>
  )
}
