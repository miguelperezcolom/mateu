import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Notice from "@mateu/shared/apiClients/dtos/componentmetadata/Notice";
import { html, LitElement, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolateNested } from "@infra/ui/interpolation.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import "@infra/ui/mateu-notice.ts";

export const renderNotice = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as Notice
    // @Notice fields travel as ${state.<field>} templates — interpolate against the live state
    // (a blank result hides the notice; the element handles that, unless there is content)
    const text = interpolateNested(metadata.text ?? '', state, data, appState, appData) ?? ''
    const children = component.children ?? []
    return html`
        <mateu-notice
                text="${text}"
                theme="${metadata.theme ?? 'info'}"
                icon="${ifDefined(metadata.icon ?? undefined)}"
                ?noIcon="${metadata.noIcon ?? false}"
                actionLabel="${ifDefined(metadata.actionLabel ?? undefined)}"
                actionId="${ifDefined(metadata.actionId ?? undefined)}"
                status="${ifDefined(metadata.status ?? undefined)}"
                ?slim="${metadata.slim ?? false}"
                ?fullWidth="${metadata.fullWidth ?? false}"
                ?inlineContent="${metadata.inlineContent ?? false}"
                ?hasContent="${children.length > 0}"
                data-colspan="${metadata.fullWidth ? '99' : nothing}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        >${children.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}</mateu-notice>
    `
}
