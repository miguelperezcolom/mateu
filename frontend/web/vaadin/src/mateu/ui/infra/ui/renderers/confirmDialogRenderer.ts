import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ConfirmDialog from "@mateu/shared/apiClients/dtos/componentmetadata/ConfirmDialog";
import { html } from "lit";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const renderConfirmDialog = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as ConfirmDialog
    /*
            <vaadin-confirm-dialog
  header="${metadata.title}"
  cancel-button-visible
  reject-button-visible
  reject-text="Discard"
  confirm-text="Save"
  .opened="${this.dialogOpened}"
  @opened-changed="${this.openedChanged}"
  @confirm="${() => {
        this.status = 'Saved';
    }}"
  @cancel="${() => {
        this.status = 'Canceled';
    }}"
  @reject="${() => {
        this.status = 'Discarded';
    }}"
>

     */
    return html`
        <vaadin-confirm-dialog
  header="${metadata.title}"
  cancel-button-visible
  reject-button-visible
  reject-text="Discard"
  confirm-text="Save"
  .opened="${true}"
  style="${component.style}" class="${component.cssClasses}"
>
  ${metadata.text}
            ${component.children?.map(child => renderComponent(child, baseUrl, data))}
</vaadin-confirm-dialog>
            `
}
