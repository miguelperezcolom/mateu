import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import {html, nothing} from "lit";
import { requireElement } from "@infra/ui/lazyElements.ts";

interface WorkflowMetadata {
    value?: string;
}

export const renderWorkflow = (component: ClientSideComponent) => {
    const metadata = component.metadata as WorkflowMetadata;
    requireElement('mateu-workflow')
    return html`
        <mateu-workflow
                style="${component.style ?? nothing}"
                class="${component.cssClasses ?? nothing}"
                slot="${component.slot ?? nothing}"
                value="${metadata.value ?? '{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow>
    `;
};
