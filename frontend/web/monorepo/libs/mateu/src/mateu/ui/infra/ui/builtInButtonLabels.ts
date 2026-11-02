import { chromeText, type ChromeTextKey } from '@infra/ui/chromeTexts.ts'

/**
 * The buttons Mateu's own archetypes put on a page (today: CalendarPage's toolbar) carry an English
 * label that the server passes through the app's Translator. An app whose Translator does not know
 * those words (most only translate their own texts) used to show "Today · Month · Week" in a
 * Spanish UI. When the label comes back EXACTLY as Mateu wrote it — untranslated — the renderer
 * draws the chrome catalogue's word in the UI's language instead; a label the app did translate
 * (or a button of the app's own with the same action id and another label) is left alone.
 *
 * Keyed by the button's action id (and, for the view switcher, its `_view` parameter).
 */
interface BuiltIn { english: string, key: ChromeTextKey }

const BY_ACTION: Record<string, BuiltIn> = {
    goCalendarToday: { english: 'Today', key: 'calendarToday' },
    createCalendarEvent: { english: '+ Create', key: 'calendarCreate' },
}

const BY_VIEW: Record<string, BuiltIn> = {
    month: { english: 'Month', key: 'calendarMonth' },
    week: { english: 'Week', key: 'calendarWeek' },
    day: { english: 'Day', key: 'calendarDay' },
    list: { english: 'List', key: 'calendarList' },
}

export interface LabelledButton {
    actionId?: string | null
    label?: string | null
    parameters?: Record<string, unknown> | null
}

/** The label to draw for `button`: the chrome word when its label is Mateu's untranslated English. */
export const builtInButtonLabel = (button: LabelledButton, label: string | undefined = button.label ?? undefined, lang?: string): string | undefined => {
    const id = button.actionId || ''
    const builtIn = id === 'switchCalendarView'
        ? BY_VIEW[String(button.parameters?._view ?? '')]
        : BY_ACTION[id]
    return builtIn && label === builtIn.english ? chromeText(builtIn.key, lang) : label
}
