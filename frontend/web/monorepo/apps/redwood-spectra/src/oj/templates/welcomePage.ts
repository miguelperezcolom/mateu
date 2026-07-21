import { html, nothing } from 'lit'
import type HeroSection from '@mateu/shared/apiClients/dtos/componentmetadata/HeroSection'
import { ojElement } from '@/oj/ojDriver'
import type { SpectraTemplate } from '@/oj/types'

/**
 * Welcome / HeroSection → Oracle Spectra `<oj-sp-welcome-page>`.
 *
 * Title + subtitle are bound by PROPERTY (`pageTitle` / `descriptionText` — the latter is what the
 * inner welcome banner actually renders, not `description`). Responsive padding is a dotted
 * `display-options.*` attribute. Any CTAs are slotted into the default content region.
 */
export const welcomePageTemplate: SpectraTemplate = {
  loaders: ['oj-sp/welcome-page/loader'],
  render(ctx) {
    const m = ctx.component.metadata as HeroSection
    return ojElement('oj-sp-welcome-page', {
      props: {
        pageTitle: m.title ?? '',
        descriptionText: m.subtitle ?? '',
        illustrationBackground: m.image ?? undefined,
      },
      attrs: {
        'display-options.responsive-padding': 'on',
        class: ctx.component.cssClasses || undefined,
        style: ctx.component.style || undefined,
      },
      children: ctx.component.children?.length
        ? html`
            <div class="oj-flex oj-sm-flex-wrap oj-sm-align-items-center" style="gap: 0.75rem;">
              ${ctx.component.children.map((child) => ctx.renderChild(child))}
            </div>
          `
        : nothing,
    })
  },
}
