import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Feature from "@mateu/shared/apiClients/dtos/componentmetadata/Feature";

export default interface FeatureGrid extends ComponentMetadata {
    features?: Feature[]
    columns?: number
}
