import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import RecordMerge from "@mateu/shared/apiClients/dtos/componentmetadata/RecordMerge";
import { html, nothing } from "lit";
import "@infra/ui/mateu-record-merge.ts";

export const renderRecordMerge = (component: ClientSideComponent) => html`
    <mateu-record-merge
            .merge="${component.metadata as RecordMerge}"
            style="${component.style??nothing}"
            class="${component.cssClasses??nothing}"
            slot="${component.slot??nothing}"
    ></mateu-record-merge>
`
