import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ContentLayout from "@mateu/shared/apiClients/dtos/componentmetadata/ContentLayout";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/**
 * Redwood-style content page layout. Renders the uniform slot grammar (main / aside / footer) that
 * every page archetype composes, design-system-neutrally: main + aside are a wrapping flex row
 * (aside fixed-basis, optionally sticky, side by asidePosition; both drop to a single column on
 * narrow viewports), footer spans full width below. Children are partitioned by their slot prefix
 * (main-N / aside-N / footer-N).
 */
export const renderContentLayout = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData
) => {
    const metadata = component.metadata as ContentLayout
    const children = component.children ?? []
    const inSlot = (prefix: string) => children.filter(c => (c.slot ?? '').startsWith(prefix))
    const main = inSlot('main-')
    const aside = inSlot('aside-')
    const footer = inSlot('footer-')

    const asideWidth = metadata.asideWidth && metadata.asideWidth.trim() ? metadata.asideWidth : '32%'
    const asideStart = metadata.asidePosition === 'start'
    const asideSticky = metadata.asideSticky !== false

    const kids = (list: typeof children) =>
        list.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))

    const mainCol = html`
        <div class="mateu-content-main"
             style="flex: 1 1 0; min-width: min(20rem, 100%); box-sizing: border-box;">
            ${kids(main)}
        </div>`

    const asideCol = aside.length ? html`
        <div class="mateu-content-aside"
             style="flex: 0 1 calc(${asideWidth} - var(--lumo-space-m, 1rem)); min-width: min(18rem, 100%); box-sizing: border-box; ${asideSticky ? 'position: sticky; top: 1rem; align-self: flex-start;' : ''}">
            ${kids(aside)}
        </div>` : nothing

    return html`
        <div class="mateu-content-layout ${component.cssClasses ?? ''}"
             style="${component.style ?? ''}"
             slot="${component.slot ?? nothing}">
            <div style="display: flex; flex-wrap: wrap; gap: var(--lumo-space-m, 1rem); align-items: flex-start;">
                ${asideStart ? [asideCol, mainCol] : [mainCol, asideCol]}
            </div>
            ${footer.length ? html`
                <div class="mateu-content-footer"
                     style="flex-basis: 100%; margin-top: var(--lumo-space-m, 1rem);">
                    ${kids(footer)}
                </div>` : nothing}
        </div>
    `
}
