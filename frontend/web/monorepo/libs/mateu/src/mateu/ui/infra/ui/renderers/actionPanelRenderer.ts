import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ActionPanel from "@mateu/shared/apiClients/dtos/componentmetadata/ActionPanel";
import { html, nothing } from "lit";
import "@infra/ui/mateu-action-panel.ts";

export const renderActionPanel = (component: ClientSideComponent) => html`
    <mateu-action-panel
            .panel="${component.metadata as ActionPanel}"
            style="${component.style??nothing}"
            class="${component.cssClasses??nothing}"
            slot="${component.slot??nothing}"
    ></mateu-action-panel>
`
