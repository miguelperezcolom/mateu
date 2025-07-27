import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Dialog from "@mateu/shared/apiClients/dtos/componentmetadata/Dialog";
import { html } from "lit";
import { dialogHeaderRenderer, dialogRenderer } from "@vaadin/dialog/lit";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const renderDialog = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Dialog

    /*
                    @opened-changed="${(event: DialogOpenedChangedEvent) => {
                    this.dialogOpened = event.detail.value;
                }}"
     */
    return html`
        <vaadin-dialog
                header-title="User details"
                .opened="${true}"
                ${dialogHeaderRenderer(
        () => html`
      <vaadin-button theme="tertiary" @click="${(e: Event) => console.log(e)}">
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    `,
        []
    )}
                ${dialogRenderer(dialog => {
        console.log('dialog', dialog)
        return html`${renderComponent(metadata.content, baseUrl, state, data)}`
    }, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-dialog>
            `
}
