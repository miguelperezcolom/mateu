package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text

/**
 * Street maps (wire type `Map`): centre (`position` = "lat, lon"), zoom, markers and the action a
 * marker click runs (`markerActionId`, with the marker id in `_markerId`).
 *
 * The plugin ships no map component, so the map is shown as a LIST of its points: one row per
 * marker (or one row for the bare position when there are no markers), each with an "Open in
 * browser" link to OpenStreetMap. Same rows as the RN `mapRows.ts`.
 *
 * Pure (no Swing) so it is unit-testable; `renderMap` (MapRenderer.kt) draws it.
 */
object MapRows {

    const val DEFAULT_COLOR = "#2763B1"

    data class Row(
        val key: String,
        /** The marker id — null for the position row, which runs no action. */
        val markerId: String?,
        val label: String,
        val description: String,
        val color: String,
        val latitude: Double,
        val longitude: Double,
        val url: String,
        /** Whether clicking the row runs `markerActionId`. */
        val actionable: Boolean,
    )

    /** OpenStreetMap URL with a pin on the point. */
    fun osmUrl(latitude: Double, longitude: Double, zoom: Int = 16): String {
        val lat = fmt(latitude)
        val lon = fmt(longitude)
        return "https://www.openstreetmap.org/?mlat=$lat&mlon=$lon#map=$zoom/$lat/$lon"
    }

    /** Formats like JS `String(number)`: no trailing `.0` on whole values. */
    fun fmt(value: Double): String =
        if (value == Math.rint(value) && !value.isInfinite() && Math.abs(value) < 1e15) value.toLong().toString()
        else value.toString()

    /** Parses "lat, lon" — null when it is missing or not two finite numbers. */
    fun parsePosition(position: String?): Pair<Double, Double>? {
        if (position.isNullOrBlank()) return null
        val parts = position.split(',').map { it.trim() }
        if (parts.size != 2 || parts.any { it.isEmpty() }) return null
        val lat = parts[0].toDoubleOrNull() ?: return null
        val lon = parts[1].toDoubleOrNull() ?: return null
        if (!lat.isFinite() || !lon.isFinite()) return null
        return lat to lon
    }

    /** The rows the map renders as: markers first; the bare position only when there are none. */
    fun rows(metadata: JsonNode): List<Row> {
        val action = metadata.text("markerActionId")
        val markers = metadata.arr("markers").filter {
            it.path("latitude").isNumber && it.path("longitude").isNumber
        }
        if (markers.isNotEmpty()) {
            return markers.mapIndexed { i, m ->
                val lat = m.path("latitude").asDouble()
                val lon = m.path("longitude").asDouble()
                val id = m.text("id").ifBlank { null }
                Row(
                    key = id ?: "m$i",
                    markerId = id,
                    label = m.text("label").ifBlank { "${fmt(lat)}, ${fmt(lon)}" },
                    description = m.text("description"),
                    color = m.text("color").ifBlank { DEFAULT_COLOR },
                    latitude = lat,
                    longitude = lon,
                    url = osmUrl(lat, lon),
                    actionable = action.isNotBlank() && id != null,
                )
            }
        }
        val (lat, lon) = parsePosition(metadata.text("position")) ?: return emptyList()
        return listOf(
            Row(
                key = "position", markerId = null, label = "${fmt(lat)}, ${fmt(lon)}", description = "",
                color = DEFAULT_COLOR, latitude = lat, longitude = lon, url = osmUrl(lat, lon), actionable = false,
            ),
        )
    }

    /** Parameters a marker click sends with `markerActionId`. */
    fun markerParameters(row: Row): Map<String, Any?> = mapOf("_markerId" to row.markerId)
}
