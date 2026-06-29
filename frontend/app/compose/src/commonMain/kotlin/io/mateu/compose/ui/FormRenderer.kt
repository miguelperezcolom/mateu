package io.mateu.compose.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState

/**
 * Compose port of the JavaFX `FormRenderer`. Lays fields out in a `formColumns`-wide grid,
 * honouring per-field `colspan`, with a header (title/subtitle/actions) and bottom buttons.
 */
@Composable
fun FormRenderer(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val title = metadata.text("title")
    val subtitle = metadata.text("subtitle")
    val readOnly = metadata.bool("readOnly")

    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (title.isNotBlank() || subtitle.isNotBlank()) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                if (title.isNotBlank()) Text(title, style = MaterialTheme.typography.headlineSmall)
                if (subtitle.isNotBlank()) Text(subtitle, style = MaterialTheme.typography.bodyMedium)
                val actions = metadata.arr("actions")
                if (actions.isNotEmpty() && !readOnly) {
                    Row(
                        Modifier.padding(top = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        actions.forEach { MateuButton(it, app, forcePrimary = true) }
                    }
                }
            }
        }

        val totalColumns = metadata.int("formColumns", 2).coerceAtLeast(1)
        GridFields(component.arr("children"), totalColumns, state, data, app)

        val buttons = metadata.arr("buttons")
        if (buttons.isNotEmpty() && !readOnly) {
            Row(
                Modifier.fillMaxWidth().padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                buttons.forEach { MateuButton(it, app) }
            }
        }
    }
}

private data class Cell(val node: JsonNode, val span: Int)

/** Flow [children] into rows of [totalColumns] respecting each child's `colspan`. */
@Composable
private fun GridFields(
    children: List<JsonNode>,
    totalColumns: Int,
    state: JsonNode,
    data: JsonNode,
    app: AppState,
) {
    val rows = ArrayList<MutableList<Cell>>()
    var current = ArrayList<Cell>()
    var col = 0
    for (child in children) {
        val span = child.path("metadata").int("colspan", 1).coerceIn(1, totalColumns)
        if (col + span > totalColumns) {
            rows.add(current); current = ArrayList(); col = 0
        }
        current.add(Cell(child, span))
        col += span
        if (col >= totalColumns) {
            rows.add(current); current = ArrayList(); col = 0
        }
    }
    if (current.isNotEmpty()) rows.add(current)

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        for (row in rows) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                var used = 0
                for (cell in row) {
                    GridCell(cell.span.toFloat()) {
                        RenderComponent(cell.node, state, data, app)
                    }
                    used += cell.span
                }
                if (used < totalColumns) {
                    // Fill the trailing gap so cells keep their proportional width.
                    Box(Modifier.weight((totalColumns - used).toFloat()))
                }
            }
        }
    }
}

@Composable
private fun RowScope.GridCell(weight: Float, content: @Composable () -> Unit) {
    Box(Modifier.weight(weight)) { content() }
}
