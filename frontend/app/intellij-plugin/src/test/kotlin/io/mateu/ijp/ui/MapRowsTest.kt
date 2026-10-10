package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Unit tests for the map rows model (mirrors the RN mapRows tests). */
class MapRowsTest : TestCase() {

    private fun json(s: String) = ObjectMapper().readTree(s)

    fun testOsmUrlPinsAndCentresThePoint() {
        assertEquals(
            "https://www.openstreetmap.org/?mlat=39.57&mlon=2.65#map=16/39.57/2.65",
            MapRows.osmUrl(39.57, 2.65),
        )
        assertEquals("https://www.openstreetmap.org/?mlat=40&mlon=-3#map=16/40/-3", MapRows.osmUrl(40.0, -3.0))
    }

    fun testParsePosition() {
        assertEquals(39.57 to 2.65, MapRows.parsePosition("39.57, 2.65"))
        assertEquals(-1.5 to 3.0, MapRows.parsePosition(" -1.5 ,3 "))
        assertNull(MapRows.parsePosition(null))
        assertNull(MapRows.parsePosition(""))
        assertNull(MapRows.parsePosition("39.57"))
        assertNull(MapRows.parsePosition("a, b"))
    }

    fun testOneRowPerMarkerActionableOnlyWithAnAction() {
        val rows = MapRows.rows(
            json(
                """
                {"type": "Map", "position": "0, 0", "markerActionId": "openHotel", "markers": [
                  {"id": "h1", "latitude": 39.57, "longitude": 2.65, "label": "Palma", "description": "HQ", "color": "#f00"},
                  {"id": "h2", "latitude": 40.4, "longitude": -3.7, "label": null, "description": null, "color": null}
                ]}
                """.trimIndent(),
            ),
        )
        assertEquals(2, rows.size)
        assertEquals(
            MapRows.Row("h1", "h1", "Palma", "HQ", "#f00", 39.57, 2.65, MapRows.osmUrl(39.57, 2.65), true),
            rows[0],
        )
        assertEquals("40.4, -3.7", rows[1].label)
        assertEquals(MapRows.DEFAULT_COLOR, rows[1].color)
        assertEquals(mapOf("_markerId" to "h1"), MapRows.markerParameters(rows[0]))

        val passive = MapRows.rows(json("""{"markers": [{"id": "h1", "latitude": 1, "longitude": 2}]}"""))
        assertFalse(passive[0].actionable)
    }

    fun testNoMarkersFallsBackToThePositionOrNothing() {
        val rows = MapRows.rows(json("""{"position": "39.57, 2.65", "markerActionId": "x", "markers": []}"""))
        assertEquals(1, rows.size)
        assertNull(rows[0].markerId)
        assertFalse(rows[0].actionable)
        assertEquals(MapRows.osmUrl(39.57, 2.65), rows[0].url)
        assertTrue(MapRows.rows(json("""{"position": null, "markers": null}""")).isEmpty())
    }

    fun testMarkerColourParsing() {
        assertEquals(java.awt.Color(0xFF, 0, 0), parseMarkerColor("#f00"))
        assertEquals(java.awt.Color.decode(MapRows.DEFAULT_COLOR), parseMarkerColor("red"))
    }
}
