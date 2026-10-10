export default interface CalendarEvent {
    id?: string
    title?: string
    date?: string
    /** inclusive last day of a multi-day event */
    endDate?: string | null
    startTime?: string | null
    endTime?: string | null
    color?: string
    actionId?: string
}
