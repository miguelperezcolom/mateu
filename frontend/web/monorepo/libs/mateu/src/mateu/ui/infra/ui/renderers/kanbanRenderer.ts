import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Kanban from "@mateu/shared/apiClients/dtos/componentmetadata/Kanban";
import { html, nothing } from "lit";
import "@infra/ui/mateu-kanban.ts";

export const renderKanban = (component: ClientSideComponent, state?: Record<string, unknown>, data?: Record<string, unknown>) => {
    const metadata = component.metadata as Kanban
    return html`
        <mateu-kanban
                .columns="${metadata.columns ?? []}"
                .boardId="${component.id}"
                .moveActionId="${metadata.moveActionId ?? undefined}"
                .rowsSource="${metadata.rowsSource ?? undefined}"
                .columnField="${metadata.columnField ?? undefined}"
                .card="${metadata.card ?? undefined}"
                .cardColors="${metadata.cardColors ?? undefined}"
                .cardRoute="${metadata.cardRoute ?? undefined}"
                .state="${state ?? {}}"
                .data="${data ?? {}}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-kanban>
    `
}
