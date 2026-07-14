import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import FileList from "@mateu/shared/apiClients/dtos/componentmetadata/FileList";
import { html, nothing } from "lit";
import "@infra/ui/mateu-file-list.ts";

export const renderFileList = (component: ClientSideComponent) => {
    const metadata = component.metadata as FileList
    return html`
        <mateu-file-list
                .files="${metadata.files ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-file-list>
    `
}
