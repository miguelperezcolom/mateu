import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MatrixGrid from "@mateu/shared/apiClients/dtos/componentmetadata/MatrixGrid";
import { html, nothing } from "lit";
import "@infra/ui/mateu-matrix-grid.ts";

export const renderMatrixGrid = (component: ClientSideComponent) => html`
    <mateu-matrix-grid
            .grid="${component.metadata as MatrixGrid}"
            style="${component.style??nothing}"
            class="${component.cssClasses??nothing}"
            slot="${component.slot??nothing}"
    ></mateu-matrix-grid>
`
