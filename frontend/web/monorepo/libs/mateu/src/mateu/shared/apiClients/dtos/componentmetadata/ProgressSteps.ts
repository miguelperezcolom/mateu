import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Step from "@mateu/shared/apiClients/dtos/componentmetadata/Step";

export default interface ProgressSteps extends ComponentMetadata {
    steps?: Step[]
    /** column layout: dots stacked vertically with the labels beside them (wizard RAIL mode) */
    vertical?: boolean
}
