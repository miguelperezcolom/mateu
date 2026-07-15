import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import BulletedList from "@mateu/shared/apiClients/dtos/componentmetadata/BulletedList";
import { html, nothing } from "lit";
import "@infra/ui/mateu-bulleted-list.ts";

export const renderBulletedList = (component: ClientSideComponent) => {
    const metadata = component.metadata as BulletedList
    return html`
        <mateu-bulleted-list
                .items="${metadata.items ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-bulleted-list>
    `
}
