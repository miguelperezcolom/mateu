import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

// The wrapped component travels as the component's single child
export default interface DashboardPanel extends ComponentMetadata {

    title?: string
    subtitle?: string
    colSpan?: number
    rowSpan?: number

}
