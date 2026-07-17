import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import PlanningBoard from "@mateu/shared/apiClients/dtos/componentmetadata/PlanningBoard";
import { html, nothing } from "lit";
import "@infra/ui/mateu-planning-board.ts";

export const renderPlanningBoard = (component: ClientSideComponent) => {
    const metadata = component.metadata as PlanningBoard
    return html`
        <mateu-planning-board
                .resources="${metadata.resources ?? []}"
                .blocks="${metadata.blocks ?? []}"
                from="${metadata.from ?? nothing}"
                to="${metadata.to ?? nothing}"
                moveActionId="${metadata.moveActionId ?? nothing}"
                selectActionId="${metadata.selectActionId ?? nothing}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-planning-board>
    `
}
