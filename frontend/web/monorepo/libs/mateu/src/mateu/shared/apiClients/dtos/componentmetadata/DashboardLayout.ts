import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

// Tiles travel as the component's children
export default interface DashboardLayout extends ComponentMetadata {

    columns?: number

}
