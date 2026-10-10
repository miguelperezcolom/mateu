import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, nothing } from "lit";
import Breadcrumbs from "@mateu/shared/apiClients/dtos/componentmetadata/Breadcrumbs";
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { ifDefined } from 'lit/directives/if-defined.js'

// DS-neutral breadcrumbs — a native flex row of links (no `@vaadin`). A plain flex container is
// equivalent to the vaadin-horizontal-layout it replaced, so no adapter override is needed.
export const renderBreadcrumbs = (component: ClientSideComponent) => {
    const metadata = component.metadata as Breadcrumbs
    return html`<div style="display:flex; align-items:center; gap:0.5rem;" slot="${component.slot??nothing}">
        ${metadata.breadcrumbs.map(breadcrumb => html`
            <a href="${ifDefined(safeHref(breadcrumb.link))}">${breadcrumb.text}</a>
            <span>/</span>
        `)}
        <span style="${component.style}" class="${component.cssClasses}">${metadata.currentItemText}</span>
    </div>`
}