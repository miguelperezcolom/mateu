import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ConfirmDialog from "@mateu/shared/apiClients/dtos/componentmetadata/ConfirmDialog";
import { html, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

export const renderConfirmDialog = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as ConfirmDialog
    let opened = false;
    if (metadata.openedCondition) {
        try {
            opened = eval(eval('`' + metadata.openedCondition + '`'))
            //console.log(metadata.openedCondition + ' evaluates to', opened, typeof opened)
        } catch (e) {
            console.error('when evaluating ' + metadata.openedCondition + ' :' +  e + ', where data is ' + data
                + ' and state is ' + state)
        }
    }
    return html`
        <vaadin-confirm-dialog
  header="${metadata.header}"
  ?cancel-button-visible="${metadata.canCancel}"
  ?reject-button-visible="${metadata.canReject}"
  reject-text="${metadata.rejectText}"
  confirm-text="${metadata.confirmText}"
  .opened="${opened}"
  style="${component.style}" class="${component.cssClasses}"
  slot="${component.slot??nothing}"
>
  ${component.children?.map(child => renderComponent(child, baseUrl, state, data))}
</vaadin-confirm-dialog>
            `
}
