import Component from "@mateu/shared/apiClients/dtos/Component";
import FormLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FormLayout";
import { FormLayoutResponsiveStep } from "@vaadin/form-layout";
import { html } from "lit";

export const renderFormLayout = (component: Component, renderComponent: Function) => {
    const metadata = component.metadata as FormLayout

    const responsiveSteps: FormLayoutResponsiveStep[] = [
        // Use one column by default
        { minWidth: 0, columns: 1 },
        // Use two columns, if layout's width exceeds 500px
        { minWidth: '500px', columns: metadata?.columns??2 },
    ];

    return html`
               <vaadin-form-layout .responsiveSteps="${responsiveSteps}">
                   ${component.children?.map(child => renderComponent(child))}
               </vaadin-form-layout>
            `
}

export const renderHorizontalLayout = (component: Component, renderComponent: Function) => {
    return html`
               <vaadin-horizontal-layout>
                   ${component.children?.map(child => renderComponent(child))}
               </vaadin-horizontal-layout>
            `
}

export const renderVerticalLayout = (component: Component, renderComponent: Function) => {
    return html`
               <vaadin-vertical-layout>
                   ${component.children?.map(child => renderComponent(child))}
               </vaadin-vertical-layout>
            `
}
