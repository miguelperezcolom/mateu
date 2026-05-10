import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import {html, nothing} from "lit";

interface WorkflowElkMetadata {
    value?: string;
}

export const renderWorkflowElk = (component: ClientSideComponent) => {
    const metadata = component.metadata as WorkflowElkMetadata;
    return html`
        <mateu-workflow-elk
                style="${component.style ?? nothing}"
                class="${component.cssClasses ?? nothing}"
                slot="${component.slot ?? nothing}"
                value="${metadata.value ?? '{"name":"New Workflow","steps":[]}'}"
        ></mateu-workflow-elk>
    `;
};
