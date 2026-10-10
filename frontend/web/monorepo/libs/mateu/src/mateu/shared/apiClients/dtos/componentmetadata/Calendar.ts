import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import CalendarEvent from "@mateu/shared/apiClients/dtos/componentmetadata/CalendarEvent";

export type CalendarViewName = 'month' | 'week' | 'day' | 'list'

export interface CalendarDay {
    date: string
    label?: string | null
    tone?: string | null
}

export default interface Calendar extends ComponentMetadata {
    /** the anchor date: a day of the month (month/list), of the week, or the day itself */
    month?: string
    events?: CalendarEvent[]
    view?: CalendarViewName
    views?: CalendarViewName[]
    days?: CalendarDay[]
    dayActionId?: string | null
}
