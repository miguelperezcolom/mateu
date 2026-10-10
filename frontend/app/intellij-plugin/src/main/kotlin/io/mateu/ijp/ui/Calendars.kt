package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.TextStyle
import java.util.Locale

/**
 * Calendars (wire type `Calendar`): the pure half of the renderer. Same contract as the web ones:
 *
 *  - `month` is the ANCHOR date; `view` (month | week | day | list, default month) picks the period:
 *    month and list = the anchor's month (list = the agenda: only the dates with events, in order),
 *    week = Monday..Sunday around the anchor, day = the anchor itself;
 *  - `views` with more than one entry = a client-side switcher (no server round trip);
 *  - an event spans `date`..`endDate` (inclusive) and shows on every day of that span; within a day
 *    the all-day events come first, then by `startTime`;
 *  - `days` put a `label` and a `tone` (info, success, warning, danger, neutral) in a date's cell;
 *  - `dayActionId` makes the date cells actionable: they dispatch it with `{ _date: "YYYY-MM-DD" }`.
 *
 * Pure (no Swing) so it is unit-testable; `renderCalendar` (CalendarRenderer.kt) draws it.
 * Mirrors `calendar.ts` in the React Native renderer.
 */
object Calendars {

    val VIEWS = listOf("month", "week", "day", "list")
    private val TONES = setOf("info", "success", "warning", "danger", "neutral")

    data class Event(
        val id: String,
        val title: String,
        val date: LocalDate,
        val endDate: LocalDate,
        val startTime: String,
        val endTime: String,
        val color: String,
        val actionId: String,
    )

    data class Day(val label: String, val tone: String?)

    data class Model(
        val anchor: LocalDate,
        val view: String,
        val views: List<String>,
        val events: List<Event>,
        val days: Map<LocalDate, Day>,
        val dayActionId: String,
    ) {
        val dayActionable get() = dayActionId.isNotBlank()
        /** The switcher shows only when it offers a choice. */
        val showSwitcher get() = views.size > 1
    }

    data class AgendaGroup(val date: LocalDate, val events: List<Event>)

    private fun date(raw: String): LocalDate? =
        runCatching { LocalDate.parse(raw.trim().take(10)) }.getOrNull()

    private fun view(raw: String): String? = raw.trim().lowercase().takeIf { it in VIEWS }

    fun tone(raw: String?): String? = raw?.trim()?.lowercase()?.takeIf { it in TONES }

    fun parse(metadata: JsonNode, today: LocalDate = LocalDate.now()): Model = Model(
        anchor = date(metadata.text("month")) ?: today,
        view = view(metadata.text("view")) ?: "month",
        views = metadata.arr("views").mapNotNull { view(it.asText()) }.distinct(),
        events = metadata.arr("events").mapNotNull { e ->
            val start = date(e.text("date")) ?: return@mapNotNull null
            val end = date(e.text("endDate"))?.takeIf { !it.isBefore(start) } ?: start
            Event(
                id = e.text("id"),
                title = e.text("title"),
                date = start,
                endDate = end,
                startTime = e.text("startTime").trim(),
                endTime = e.text("endTime").trim(),
                color = e.text("color"),
                actionId = e.text("actionId"),
            )
        },
        days = metadata.arr("days").mapNotNull { d ->
            val at = date(d.text("date")) ?: return@mapNotNull null
            at to Day(d.text("label").trim(), tone(d.text("tone")))
        }.toMap(),
        dayActionId = metadata.text("dayActionId").trim(),
    )

    /** The dates a view covers, in order: the anchor's month (month, list), its Monday-to-Sunday week, or the anchor. */
    fun periodDates(view: String, anchor: LocalDate): List<LocalDate> = when (view) {
        "day" -> listOf(anchor)
        "week" -> {
            val monday = anchor.minusDays((anchor.dayOfWeek.value - 1).toLong())
            (0L until 7L).map { monday.plusDays(it) }
        }
        else -> {
            val first = anchor.withDayOfMonth(1)
            (0 until anchor.lengthOfMonth()).map { first.plusDays(it.toLong()) }
        }
    }

    /** The month grid: weeks of 7 Monday-first slots, `null` for the padding before day 1 and after the last day. */
    fun monthWeeks(anchor: LocalDate): List<List<LocalDate?>> {
        val dates = periodDates("month", anchor)
        val slots = MutableList<LocalDate?>(dates.first().dayOfWeek.value - 1) { null }
        slots += dates
        while (slots.size % 7 != 0) slots += null
        return slots.chunked(7)
    }

    /** The events on a date — multi-day ones on every day of their span —, all-day first, then by start time. */
    fun eventsOn(model: Model, date: LocalDate): List<Event> =
        model.events
            .filter { !date.isBefore(it.date) && !date.isAfter(it.endDate) }
            .sortedBy { it.startTime } // stable: '' (all-day) first, ties keep wire order

    /** The list view: the dates of the anchor's month that have events, in order, each with its events. */
    fun agenda(model: Model): List<AgendaGroup> =
        periodDates("list", model.anchor)
            .map { AgendaGroup(it, eventsOn(model, it)) }
            .filter { it.events.isNotEmpty() }

    fun dayInfo(model: Model, date: LocalDate): Day = model.days[date] ?: Day("", null)

    /** The parameters a date cell dispatches `dayActionId` with. */
    fun dayParameters(date: LocalDate): Map<String, Any?> = mapOf("_date" to date.toString())

    /** "09:00–10:30", "09:00", or '' for an all-day event. */
    fun timeRange(e: Event): String =
        if (e.startTime.isNotBlank() && e.endTime.isNotBlank()) "${e.startTime}–${e.endTime}"
        else e.startTime.ifBlank { e.endTime }

    fun weekdayShort(date: LocalDate): String = date.dayOfWeek.getDisplayName(TextStyle.SHORT, Locale.ENGLISH)

    private fun monthName(date: LocalDate) = date.month.getDisplayName(TextStyle.FULL, Locale.ENGLISH)

    /** "Thu 29 October". */
    fun dateLabel(date: LocalDate): String = "${weekdayShort(date)} ${date.dayOfMonth} ${monthName(date)}"

    val WEEKDAY_HEADERS: List<String> = DayOfWeek.entries.map { it.getDisplayName(TextStyle.SHORT, Locale.ENGLISH) }

    /** The heading of the period a view shows: "October 2026", "26 Oct – 1 Nov 2026", "Thu 29 October 2026". */
    fun periodTitle(view: String, anchor: LocalDate): String = when (view) {
        "day" -> "${dateLabel(anchor)} ${anchor.year}"
        "week" -> {
            val dates = periodDates("week", anchor)
            fun short(d: LocalDate) = "${d.dayOfMonth} ${monthName(d).take(3)}"
            "${short(dates.first())} – ${short(dates.last())} ${dates.last().year}"
        }
        else -> "${monthName(anchor)} ${anchor.year}"
    }

    fun viewLabel(view: String): String = view.replaceFirstChar { it.uppercase() }

    /** What a screen reader says for a date cell: "Thu 29 October, Avail 12, 1 event". */
    fun dayA11yName(model: Model, date: LocalDate): String {
        val parts = mutableListOf(dateLabel(date))
        dayInfo(model, date).label.takeIf { it.isNotBlank() }?.let { parts += it }
        val n = eventsOn(model, date).size
        if (n > 0) parts += if (n == 1) "1 event" else "$n events"
        return parts.joinToString(", ")
    }

    /** What a screen reader says for an event: "Board meeting, 09:00–10:30". */
    fun eventA11yName(e: Event): String = listOf(e.title.trim(), timeRange(e)).filter { it.isNotBlank() }.joinToString(", ")
}
