import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import CalendarEvent from "@mateu/shared/apiClients/dtos/componentmetadata/CalendarEvent";

export default interface Calendar extends ComponentMetadata {
    month?: string
    events?: CalendarEvent[]
}
