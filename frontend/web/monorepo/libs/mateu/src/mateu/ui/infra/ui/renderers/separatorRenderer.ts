import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Separator from "@mateu/shared/apiClients/dtos/componentmetadata/Separator";
import { html, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

// A horizontal divider line (<hr>) separating contents inside a section, form or layout.
// data-colspan (set by the backend to the form's column count) makes it span the full row
// inside a vaadin-form-layout.
export const renderSeparator = (component: ClientSideComponent) => {
    const metadata = component.metadata as Separator
    const colspan = metadata.attributes?.['data-colspan']
    return html`
        <hr style="border: none; border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); width: 100%; margin: var(--lumo-space-s, .5rem) 0; ${component.style??''}"
            class="${component.cssClasses??nothing}"
            id="${ifDefined(component.id??undefined)}"
            data-colspan="${ifDefined(colspan)}"
            slot="${component.slot??nothing}"/>
    `
}
