import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface KPI extends ComponentMetadata {

    title: string
    text: string
    style: string

}
