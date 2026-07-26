import { html, nothing, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type Breadcrumbs from '@mateu/shared/apiClients/dtos/componentmetadata/Breadcrumbs'
import { ojElement } from '../oj/ojDriver'

/**
 * Mateu `Breadcrumbs` → the authentic Oracle Spectra `oj-sp-breadcrumb-container`.
 *
 * The component is data-driven: its `data` is a JET DataProvider whose ITEM shape is `{ id,
 * displayName }` (id = key attribute, displayName = the crumb label) — discovered by observing the
 * live Oracle component (the VB docs don't cover oj-sp components). Non-current crumbs render as
 * links; clicking one fires `spAction` with `detail.id`. It also renders its built-in "Ask Oracle"
 * search affordance (the `search` slot toggle) — inherent to this component, no prop to suppress it.
 *
 * Mateu Breadcrumbs DTO = { currentItemText, breadcrumbs: [{ text, link }] }. NB: this component
 * displays its data items REVERSED and treats data[0] as the current (non-link) crumb (observed
 * live). So to show the standard `Home › … › Current` trail we feed data = [current, ...crumbs
 * reversed]. We keep an id→link map and, on spAction, navigate via the standard SPA route events.
 */
export function renderRedwoodBreadcrumbs(component: ClientSideComponent): TemplateResult {
  const m = component.metadata as Breadcrumbs
  const crumbs = m.breadcrumbs ?? []
  const ADP = (window as unknown as { __mateuArrayDataProvider?: new (d: unknown[], o: unknown) => unknown })
    .__mateuArrayDataProvider

  // Fallback if OJET's ArrayDataProvider isn't ready (should not happen post-bootstrap): a plain link row.
  if (!ADP) {
    return html`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${component.slot ?? nothing}">
      ${crumbs.map((c) => html`<a href="${c.link ?? '#'}">${c.text}</a><span>/</span>`)}
      <span>${m.currentItemText}</span>
    </div>`
  }

  // Reversed + current-first: the container renders data in reverse and marks data[0] as current.
  const reversed = crumbs.slice().reverse()
  const items = [
    { id: '__current__', displayName: m.currentItemText },
    ...reversed.map((c, i) => ({ id: `c${i}`, displayName: c.text })),
  ]
  const linkById = new Map(reversed.map((c, i) => [`c${i}`, c.link]))
  const data = new ADP(items, { keyAttributes: 'id' })

  return ojElement('oj-sp-breadcrumb-container', {
    props: { data },
    attrs: {
      slot: component.slot || undefined,
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
    events: {
      spAction: (e: Event) => {
        const id = (e as CustomEvent).detail?.id as string | undefined
        const link = id ? linkById.get(id) : undefined
        if (!link) return
        const t = e.target as HTMLElement
        t.dispatchEvent(new CustomEvent('route-changed', { detail: { route: link }, bubbles: true, composed: true }))
        t.dispatchEvent(new CustomEvent('navigate-to-requested', { detail: { route: link }, bubbles: true, composed: true }))
      },
    },
  })
}
