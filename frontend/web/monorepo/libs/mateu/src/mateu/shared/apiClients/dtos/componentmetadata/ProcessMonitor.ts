import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import ProcessItem from "@mateu/shared/apiClients/dtos/componentmetadata/ProcessItem";

export default interface ProcessMonitor extends ComponentMetadata {
    items?: ProcessItem[]
}
