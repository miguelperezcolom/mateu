package io.mateu.compose.ui.desktop

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState
import io.mateu.compose.ui.*

/** HorizontalLayout — Jewel port of `LayoutRenderer.renderHBox`. */
@Composable
fun RenderHBox(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val spacing = if (metadata.bool("spacing", true)) 12.dp else 0.dp
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(spacing)) {
        component.arr("children").forEach { RenderComponent(it, state, data, app) }
    }
}

/** VerticalLayout / Scroller / Container / Div — Jewel port of `LayoutRenderer.renderVBox`. */
@Composable
fun RenderVBox(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val spacing = if (metadata.bool("spacing", true)) 12.dp else 0.dp
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(spacing)) {
        component.arr("children").forEach { RenderComponent(it, state, data, app) }
    }
}

/**
 * FormLayout — a `maxColumns`-wide form grid. The backend groups fields into FormRow children; each
 * FormRow's fields are laid side by side, weighted by `colspan`, and the row is padded to maxColumns
 * so a short last row keeps the same column width instead of stretching full.
 */
@Composable
fun RenderFormLayout(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val maxCols = metadata.int("maxColumns", 2).coerceAtLeast(1)
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val minColWidth = 240.dp
        val fit = (maxWidth / minColWidth).toInt().coerceAtLeast(1)
        val cols = minOf(maxCols, fit)
        val fields = component.arr("children").flatMap { child ->
            if (child.path("metadata").text("type") == "FormRow") child.arr("children") else listOf(child)
        }
        Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            chunkByColspan(fields, cols).forEach { FormRowGrid(it, cols, state, data, app) }
        }
    }
}

/** Greedily packs fields into rows whose colspans sum to at most [cols]. */
private fun chunkByColspan(fields: List<JsonNode>, cols: Int): List<List<JsonNode>> {
    val rows = ArrayList<MutableList<JsonNode>>()
    var cur = ArrayList<JsonNode>()
    var used = 0
    for (f in fields) {
        val span = f.path("metadata").int("colspan", 1).coerceIn(1, cols)
        if (used + span > cols) { rows.add(cur); cur = ArrayList(); used = 0 }
        cur.add(f); used += span
        if (used >= cols) { rows.add(cur); cur = ArrayList(); used = 0 }
    }
    if (cur.isNotEmpty()) rows.add(cur)
    return rows
}

/** A standalone FormRow (not inside a FormLayout): distribute fields by colspan, no padding. */
@Composable
fun RenderFormRow(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val fields = component.arr("children")
    val totalSpan = fields.sumOf { it.path("metadata").int("colspan", 1).coerceAtLeast(1) }.coerceAtLeast(1)
    FormRowGrid(fields, totalSpan, state, data, app)
}

@Composable
private fun FormRowGrid(
    fields: List<JsonNode>,
    maxCols: Int,
    state: JsonNode,
    data: JsonNode,
    app: AppState,
) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        var used = 0
        fields.forEach { field ->
            val span = field.path("metadata").int("colspan", 1).coerceIn(1, maxCols)
            Cell(span.toFloat()) { RenderComponent(field, state, data, app) }
            used += span
        }
        if (used < maxCols) Box(Modifier.weight((maxCols - used).toFloat()))
    }
}

@Composable
private fun RowScope.Cell(weight: Float, content: @Composable () -> Unit) {
    Box(Modifier.weight(weight)) { content() }
}
