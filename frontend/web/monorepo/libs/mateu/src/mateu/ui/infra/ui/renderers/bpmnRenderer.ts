import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, nothing } from "lit";
import Bpmn from "@mateu/shared/apiClients/dtos/componentmetadata/Bpmn.ts";

export const renderBpmn = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as Bpmn

    //console.log('metadata', metadata)

    return html`
        aaa
        <mateu-bpmn 
                style="${component.style}" 
                class="${component.cssClasses}"
                slot="${component.slot??nothing}" 
                xml="${metadata.xml}"
        >
        </mateu-bpmn>
        aaa
    `
}