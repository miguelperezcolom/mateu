import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Stat from "@mateu/shared/apiClients/dtos/componentmetadata/Stat";
import { html, nothing } from "lit";
import "@infra/ui/mateu-stat.ts";
import { interpolateFields } from "@infra/ui/interpolation.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

export const renderStat = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = interpolateFields(component.metadata as Stat, ['label', 'value', 'unit', 'delta'], state, data)
    return html`
        <mateu-stat
                label="${metadata.label ?? nothing}"
                value="${metadata.value ?? nothing}"
                unit="${metadata.unit ?? nothing}"
                delta="${metadata.delta ?? nothing}"
                trend="${metadata.trend ?? nothing}"
                actionId="${metadata.actionId ?? nothing}"
                .spark="${metadata.spark ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-stat>
    `
}
