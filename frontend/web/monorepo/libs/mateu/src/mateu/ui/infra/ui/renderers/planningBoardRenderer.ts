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
                .from="${metadata.from}"
                .to="${metadata.to}"
                .moveActionId="${metadata.moveActionId}"
                .selectActionId="${metadata.selectActionId}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-planning-board>
    `
}
