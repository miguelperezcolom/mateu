package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import java.time.LocalDate
import junit.framework.TestCase

/** Unit tests for the calendar model (mirrors the RN calendar tests). */
class CalendarsTest : TestCase() {

    private val model = Calendars.parse(
        ObjectMapper().readTree(
            """
            {"type": "Calendar", "month": "2026-10-29", "view": "week",
             "views": ["month", "week", "week", "bogus", "list"],
             "dayActionId": "openDay",
             "days": [
               {"date": "2026-10-29", "label": "Avail 12", "tone": "success"},
               {"date": "2026-10-30", "label": "Closed", "tone": "DANGER"},
               {"date": "2026-10-31", "label": "x", "tone": "purple"}
             ],
             "events": [
               {"id": "conf", "title": "Conference", "date": "2026-10-28", "endDate": "2026-10-30"},
               {"id": "late", "title": "Dinner", "date": "2026-10-29", "startTime": "20:00"},
               {"id": "early", "title": "Standup", "date": "2026-10-29", "startTime": "09:00", "endTime": "09:15"},
               {"id": "nov", "title": "Next month", "date": "2026-11-02"},
               {"id": "bad", "title": "No date", "date": null},
               {"id": "inverted", "title": "Inverted", "date": "2026-10-05", "endDate": "2026-10-01"}
             ]}
            """.trimIndent(),
        ),
    )

    private fun d(s: String) = LocalDate.parse(s)
    private fun ids(date: String) = Calendars.eventsOn(model, d(date)).map { it.id }

    fun testViews() {
        assertEquals("week", model.view)
        assertEquals(listOf("month", "week", "list"), model.views)
        assertTrue(model.showSwitcher)
        val bare = Calendars.parse(ObjectMapper().readTree("""{"view": "nonsense"}"""), today = d("2026-01-15"))
        assertEquals("month", bare.view)
        assertFalse(bare.showSwitcher)
        assertEquals(d("2026-01-15"), bare.anchor)
    }

    fun testPeriods() {
        val month = Calendars.periodDates("month", model.anchor)
        assertEquals(31, month.size)
        assertEquals(d("2026-10-01"), month.first())
        assertEquals(month, Calendars.periodDates("list", model.anchor))
        assertEquals(
            listOf("2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"),
            Calendars.periodDates("week", model.anchor).map { it.toString() },
        )
        assertEquals(d("2026-10-26"), Calendars.periodDates("week", d("2026-11-01")).first())
        assertEquals(listOf(d("2026-10-29")), Calendars.periodDates("day", model.anchor))
    }

    fun testMonthGrid() {
        val weeks = Calendars.monthWeeks(model.anchor)
        assertTrue(weeks.all { it.size == 7 })
        assertEquals(listOf(null, null, null, "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"), weeks.first().map { it?.toString() })
        assertEquals("2026-10-31", weeks.last()[5].toString())
        assertNull(weeks.last()[6])
    }

    fun testEventsPerDate() {
        assertEquals(listOf("conf", "early", "late"), ids("2026-10-29"))
        assertEquals(listOf("conf"), ids("2026-10-28"))
        assertEquals(listOf("conf"), ids("2026-10-30"))
        assertEquals(emptyList<String>(), ids("2026-10-31"))
        assertEquals(listOf("inverted"), ids("2026-10-05"))
        assertEquals(emptyList<String>(), ids("2026-10-02"))
    }

    fun testAgenda() {
        val groups = Calendars.agenda(model)
        assertEquals(listOf("2026-10-05", "2026-10-28", "2026-10-29", "2026-10-30"), groups.map { it.date.toString() })
        assertEquals(3, groups[2].events.size)
    }

    fun testDays() {
        assertEquals(Calendars.Day("Avail 12", "success"), Calendars.dayInfo(model, d("2026-10-29")))
        assertEquals(Calendars.Day("Closed", "danger"), Calendars.dayInfo(model, d("2026-10-30")))
        assertEquals(Calendars.Day("x", null), Calendars.dayInfo(model, d("2026-10-31")))
        assertEquals(Calendars.Day("", null), Calendars.dayInfo(model, d("2026-10-01")))
    }

    fun testDayAction() {
        assertTrue(model.dayActionable)
        assertEquals(mapOf("_date" to "2026-10-29"), Calendars.dayParameters(d("2026-10-29")))
        assertFalse(Calendars.parse(ObjectMapper().readTree("""{"dayActionId": "  "}""")).dayActionable)
    }

    fun testLabels() {
        val early = model.events.first { it.id == "early" }
        assertEquals("09:00–09:15", Calendars.timeRange(early))
        assertEquals("20:00", Calendars.timeRange(model.events.first { it.id == "late" }))
        assertEquals("", Calendars.timeRange(model.events.first { it.id == "conf" }))
        assertEquals("October 2026", Calendars.periodTitle("month", model.anchor))
        assertEquals("26 Oct – 1 Nov 2026", Calendars.periodTitle("week", model.anchor))
        assertEquals("Thu 29 October 2026", Calendars.periodTitle("day", model.anchor))
        assertEquals("Thu 29 October, Avail 12, 3 events", Calendars.dayA11yName(model, d("2026-10-29")))
        assertEquals("Wed 28 October, 1 event", Calendars.dayA11yName(model, d("2026-10-28")))
        assertEquals("Fri 2 October", Calendars.dayA11yName(model, d("2026-10-02")))
        assertEquals("Standup, 09:00–09:15", Calendars.eventA11yName(early))
    }
}
