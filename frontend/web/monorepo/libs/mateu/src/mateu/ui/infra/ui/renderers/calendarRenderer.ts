import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Calendar from "@mateu/shared/apiClients/dtos/componentmetadata/Calendar";
import { html, nothing } from "lit";
import "@infra/ui/mateu-calendar.ts";

export const renderCalendar = (component: ClientSideComponent) => {
    const metadata = component.metadata as Calendar
    return html`
        <mateu-calendar
                month="${metadata.month ?? nothing}"
                .events="${metadata.events ?? []}"
                view="${metadata.view ?? nothing}"
                .views="${metadata.views ?? []}"
                .days="${metadata.days ?? []}"
                dayActionId="${metadata.dayActionId ?? nothing}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-calendar>
    `
}
