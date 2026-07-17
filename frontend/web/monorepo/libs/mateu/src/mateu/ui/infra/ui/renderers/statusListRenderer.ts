import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import StatusList from "@mateu/shared/apiClients/dtos/componentmetadata/StatusList";
import { html, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import "@infra/ui/mateu-status-list.ts";

export const renderStatusList = (component: ClientSideComponent) => {
    const metadata = component.metadata as StatusList
    return html`
        <mateu-status-list
                .items="${metadata.items ?? []}"
                ?compact="${metadata.compact ?? false}"
                ?frameless="${metadata.frameless ?? false}"
                rowActionId="${ifDefined(metadata.rowActionId ?? undefined)}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-status-list>
    `
}
