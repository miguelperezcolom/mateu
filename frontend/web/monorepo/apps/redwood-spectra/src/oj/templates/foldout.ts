import { html, nothing, type TemplateResult } from 'lit'
import type FoldoutLayout from '@mateu/shared/apiClients/dtos/componentmetadata/FoldoutLayout'
import type FoldoutPanelInfo from '@mateu/shared/apiClients/dtos/componentmetadata/FoldoutPanelInfo'
import type Component from '@mateu/shared/apiClients/dtos/Component'
import { ojElement } from '@/oj/ojDriver'
import type { SpectraRenderContext, SpectraTemplate } from '@/oj/types'

/**
 * Foldout page → Oracle Spectra `<oj-sp-foldout-layout>`.
 *
 * The Mateu wire carries only the chrome in `metadata` (panels title/subtitle/open + orientation);
 * the actual content travels as `component.children`, each tagged with a `slot`: exactly one
 * `"overview"` and one `"panel-i"` per panel index i (order-matched to `panels[]`). We drop the
 * overview into the layout's overview slot and each panel-i child inside the i-th
 * `<oj-sp-foldout-panel-summarizing>` (its subtitle becomes the summary shown while folded). The
 * content itself is rendered by the shared base renderer — we only wire the slots.
 *
 * Each Mateu child arrives pre-tagged with its `mateu-foldout` slot; wrapping it in a plain <div>
 * neutralises that (a <div> is not a shadow host) and the <div>'s own slot is what places it.
 */
export const foldoutTemplate: SpectraTemplate = {
  loaders: ['oj-sp/foldout-layout/loader', 'oj-sp/foldout-panel-summarizing/loader'],
  render(ctx) {
    const m = ctx.component.metadata as FoldoutLayout
    const children = ctx.component.children ?? []
    const overview = children.find((c) => c.slot === 'overview')
    const panels = m.panels ?? []

    return ojElement('oj-sp-foldout-layout', {
      props: {
        orientation: m.orientation === 'horizontal' ? 'horizontal' : 'vertical',
        selectedPanel: 0,
      },
      attrs: {
        class: ctx.component.cssClasses || undefined,
        style: ctx.component.style || undefined,
      },
      children: html`
        ${overview ? html`<div slot="overview">${ctx.renderChild(overview)}</div>` : nothing}
        ${panels.map((panel, i) =>
          renderPanel(ctx, panel, children.find((c) => c.slot === `panel-${i}`)),
        )}
      `,
    })
  },
}

/** One folded panel: title on the strip, content in the default slot, subtitle as the fold summary. */
function renderPanel(
  ctx: SpectraRenderContext,
  panel: FoldoutPanelInfo,
  content: Component | undefined,
): TemplateResult {
  return ojElement('oj-sp-foldout-panel-summarizing', {
    props: { panelTitle: panel.title ?? '' },
    children: html`
      <div>${content ? ctx.renderChild(content) : nothing}</div>
      ${panel.subtitle ? html`<div slot="summary">${panel.subtitle}</div>` : nothing}
    `,
  })
}
