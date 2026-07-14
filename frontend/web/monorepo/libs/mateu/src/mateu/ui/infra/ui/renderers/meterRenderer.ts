import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Meter from "@mateu/shared/apiClients/dtos/componentmetadata/Meter";
import { html, nothing } from "lit";
import "@infra/ui/mateu-meter.ts";

export const renderMeter = (component: ClientSideComponent) => {
    const metadata = component.metadata as Meter
    return html`
        <mateu-meter
                .label="${metadata.label}"
                .value="${metadata.value ?? 0}"
                .max="${metadata.max ?? 0}"
                .unit="${metadata.unit}"
                .caption="${metadata.caption}"
                .warnAt="${metadata.warnAt}"
                .dangerAt="${metadata.dangerAt}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-meter>
    `
}
