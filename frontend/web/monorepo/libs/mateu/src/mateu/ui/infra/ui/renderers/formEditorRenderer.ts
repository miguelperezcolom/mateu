import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import {html, nothing} from "lit";

interface FormEditorMetadata {
    value?: string;
}

export const renderFormEditor = (component: ClientSideComponent) => {
    const metadata = component.metadata as FormEditorMetadata;
    return html`
        <mateu-form-editor
                style="${component.style ?? nothing}"
                class="${component.cssClasses ?? nothing}"
                slot="${component.slot ?? nothing}"
                value="${metadata.value ?? '{"name":"New Form","fields":[]}'}"
        ></mateu-form-editor>
    `;
};
