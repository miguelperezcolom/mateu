import { html, nothing, type TemplateResult } from 'lit'
import type Component from '@mateu/shared/apiClients/dtos/Component'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { resolveSpectraTemplate } from '@/oj/spectraTemplates'
import type { ComponentState, ComponentData } from '@/oj/types'
import '@/rw/rw-host'

/**
 * The native render tree (clean-room renderComponent — NO Vaadin, no shared BasicComponentRenderer).
 * A ClientSide node is a leaf rendered by its Spectra template (registry); a ServerSide node becomes
 * its own stateful <rw-host>. An uncovered ClientSide type renders nothing and logs once (there is
 * no Vaadin fallback — that is the whole point).
 */
export function renderComponent(
  host: HTMLElement,
  component: Component | undefined,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  if (!component) return html``

  if (component.type === ComponentType.ClientSide) {
    const cs = component as ClientSideComponent
    const type = (cs.metadata as { type?: string } | undefined)?.type
    const template = resolveSpectraTemplate(type)
    if (!template) {
      warnMissing(type)
      return html``
    }
    return template.render({
      host,
      component: cs,
      baseUrl,
      state,
      data,
      appState,
      appData,
      renderChild: (child) => renderComponent(host, child, baseUrl, state, data, appState, appData),
    })
  }

  // ServerSide → its own stateful host (holds state, fires triggers, runs actions/commands)
  return html`<rw-host
    id=${component.id ?? nothing}
    .component=${component}
    .baseUrl=${baseUrl ?? ''}
    .seedState=${{ ...((component.initialData as Record<string, unknown>) ?? {}), ...state }}
    .seedData=${{ ...data }}
    .appState=${appState}
    .appData=${appData}
    slot=${component.slot || nothing}
  ></rw-host>`
}

const warned = new Set<string>()
function warnMissing(type: string | undefined): void {
  const key = type ?? '(no type)'
  if (warned.has(key)) return
  warned.add(key)
  // eslint-disable-next-line no-console
  console.warn(`[redwood-spectra] no Spectra template for wire type "${key}" — nothing rendered.`)
}
