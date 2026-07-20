import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import GanttTask from "@mateu/shared/apiClients/dtos/componentmetadata/GanttTask";

export default interface Gantt extends ComponentMetadata {

    tasks?: GanttTask[]
    onTaskSelectionActionId?: string

}
