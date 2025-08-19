import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Chart extends ComponentMetadata {

    chartType: string
    chartData: unknown
    chartOptions: unknown

}