package io.mateu.compose.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.runtime.toMutableStateList
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState

/**
 * Compose port of the JavaFX `CrudRenderer`: header + toolbar, optional search bar, a data table
 * driven by `columns`, and a pagination bar. Search responses arrive as data-only fragments routed
 * through a registered data handler (keyed `"crud"`), which updates the row list in place.
 */
@Composable
fun CrudRenderer(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val title = metadata.text("title")
    val subtitle = metadata.text("subtitle")
    val canEdit = metadata.bool("canEdit")
    val searchable = metadata.bool("searchable")
    val detailPath = metadata.text("detailPath")
    val columns = metadata.arr("columns")

    // Keyed on the route, not currentComponentId (which is "crud" for every Crud): otherwise Compose
    // reuses this composable when navigating between two same-shaped Crud screens, keeping a stale
    // rows list and never re-registering the data handler (→ the new screen's table stays empty).
    val rows = remember(app.currentRoute) { extractRows(data).toMutableStateList() }
    var totalElements by remember(app.currentRoute) { mutableLongStateOf(data.long("totalElements", rows.size.toLong())) }
    var pageSize by remember(app.currentRoute) { mutableIntStateOf(data.int("pageSize", rows.size)) }
    var pageNumber by remember(app.currentRoute) { mutableIntStateOf(data.int("pageNumber", 0)) }

    LaunchedEffect(app.currentRoute) {
        app.registerDataHandler("crud") { searchData ->
            var page = searchData.path("crud").path("page")
            if (page.isMissingNode || page.isNull) page = searchData
            rows.clear(); rows.addAll(extractRows(page))
            totalElements = page.long("totalElements")
            pageSize = page.int("pageSize")
            pageNumber = page.int("pageNumber")
        }
    }

    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Header
        if (title.isNotBlank()) Text(title, style = MaterialTheme.typography.headlineSmall)
        if (subtitle.isNotBlank()) Text(subtitle, style = MaterialTheme.typography.bodyMedium)
        val toolbar = metadata.arr("toolbar")
        if (toolbar.isNotEmpty()) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                toolbar.forEach { MateuButton(it, app) }
            }
        }

        if (searchable) SearchBar(app)

        // Responsive: a wide table on desktop, stacked cards on phone-width viewports.
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            if (maxWidth < 600.dp) {
                CardList(columns, rows, detailPath, canEdit, app)
            } else {
                DataTable(columns, rows, detailPath, canEdit, app)
            }
        }

        if (totalElements > pageSize && pageSize > 0) {
            PaginationBar(pageNumber, pageSize, totalElements, app)
        }
    }
}

@Composable
private fun SearchBar(app: AppState) {
    var query by remember { mutableStateOf(app.currentComponentState["searchText"]?.toString() ?: "") }
    val doSearch = {
        app.currentComponentState["searchText"] = query
        app.currentComponentState["page"] = 0
        app.currentComponentState.getOrPut("size") { 10 }
        app.currentComponentState.getOrPut("sort") { emptyList<Any>() }
        app.runAction("search", null)
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            placeholder = { Text("Search…") },
            singleLine = true,
            modifier = Modifier.weight(1f),
        )
        Button(onClick = { doSearch() }) { Text("Search") }
    }
}

@Composable
private fun DataTable(
    columns: List<JsonNode>,
    rows: SnapshotStateList<JsonNode>,
    detailPath: String,
    canEdit: Boolean,
    app: AppState,
) {
    val showActions = detailPath.isNotBlank() || canEdit
    // A per-row "actions" column carries its own buttons; when absent, the first column links to the
    // row's detail view ({route}/{id}) — mirrors the web renderer.
    val hasActionsColumn = columns.any { colId(it) == "actions" }
    Column(Modifier.fillMaxWidth()) {
        // Header row
        Row(
            Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceVariant).padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            columns.forEach { col ->
                val meta = col.path("metadata")
                val label = meta.text("label", meta.text("id", col.text("id")))
                Text(label, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            }
            if (showActions) Box(Modifier.weight(0.6f))
        }
        HorizontalDivider()

        // A plain Column (not LazyColumn) so it composes inside the page's vertical scroll. Pages are
        // paginated (~10 rows), so virtualization isn't needed.
        rows.forEach { row ->
            Row(
                Modifier.fillMaxWidth().padding(8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                columns.forEachIndexed { idx, col ->
                    val fieldId = colId(col)
                    val cell = row.path(fieldId)
                    when {
                        fieldId == "actions" && cell.path("actions").isArray ->
                            RowActions(cell.path("actions").toList(), row, app, Modifier.weight(1f))

                        idx == 0 && !hasActionsColumn && extractRowId(row).isNotBlank() ->
                            Text(
                                cell.asDisplayString(),
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.weight(1f).clickable {
                                    val route = "${app.currentRoute}/${extractRowId(row)}"
                                    app.navigate(route, app.currentConsumedRoute, app.currentServerSideType, "")
                                },
                            )

                        else ->
                            Text(cell.asDisplayString(), modifier = Modifier.weight(1f))
                    }
                }
                if (showActions) {
                    Box(Modifier.weight(0.6f)) {
                        OutlinedButton(onClick = {
                            val rowId = extractRowId(row)
                            val route = if (detailPath.isBlank()) "${app.currentRoute}/$rowId" else "$detailPath/$rowId"
                            app.navigate(route, app.currentConsumedRoute, app.currentServerSideType, "")
                        }) { Text(if (canEdit) "Edit" else "View") }
                    }
                }
            }
            HorizontalDivider()
        }
    }
}

/** Phone-friendly listing: each row as a card with label→value pairs (the first column is the title). */
@Composable
private fun CardList(
    columns: List<JsonNode>,
    rows: SnapshotStateList<JsonNode>,
    detailPath: String,
    canEdit: Boolean,
    app: AppState,
) {
    val hasActionsColumn = columns.any { colId(it) == "actions" }
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        rows.forEach { row ->
            val rowId = extractRowId(row)
            val openable = !hasActionsColumn && (detailPath.isNotBlank() || canEdit || rowId.isNotBlank())
            var cardMod = Modifier.fillMaxWidth().border(1.dp, MateuColors.cardBorder, RoundedCornerShape(8.dp))
            if (openable) {
                cardMod = cardMod.clickable {
                    val route = if (detailPath.isBlank()) "${app.currentRoute}/$rowId" else "$detailPath/$rowId"
                    app.navigate(route, app.currentConsumedRoute, app.currentServerSideType, "")
                }
            }
            Column(cardMod.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                columns.forEachIndexed { idx, col ->
                    val fieldId = colId(col)
                    val cell = row.path(fieldId)
                    when {
                        fieldId == "actions" && cell.path("actions").isArray ->
                            RowActions(cell.path("actions").toList(), row, app, Modifier.fillMaxWidth())

                        idx == 0 ->
                            Text(
                                cell.asDisplayString(),
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleMedium,
                                color = if (openable) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                            )

                        else ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(
                                    col.path("metadata").text("label", fieldId),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    style = MaterialTheme.typography.bodySmall,
                                )
                                Text(cell.asDisplayString(), style = MaterialTheme.typography.bodyMedium)
                            }
                    }
                }
            }
        }
    }
}

private fun colId(col: JsonNode): String = col.path("metadata").text("id", col.text("id"))

/** Renders a row's "actions" column: one button per `{methodNameInCrud, label, disabled}` entry. */
@Composable
private fun RowActions(actions: List<JsonNode>, row: JsonNode, app: AppState, modifier: Modifier) {
    Row(modifier, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        actions.forEach { a ->
            val method = a.text("methodNameInCrud")
            val label = a.text("label", method)
            TextButton(
                onClick = { app.runAction(method, mapOf("_clickedRow" to row)) },
                enabled = !a.bool("disabled"),
            ) { Text(label) }
        }
    }
}

@Composable
private fun PaginationBar(pageNumber: Int, pageSize: Int, totalElements: Long, app: AppState) {
    val totalPages = (totalElements + pageSize - 1) / pageSize
    Row(
        Modifier.fillMaxWidth().padding(8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        OutlinedButton(
            onClick = { app.runAction("prevPage", null) },
            enabled = pageNumber > 0,
        ) { Text("← Previous") }
        Text("Page ${pageNumber + 1} of $totalPages ($totalElements total)")
        OutlinedButton(
            onClick = { app.runAction("nextPage", null) },
            enabled = (pageNumber + 1).toLong() * pageSize < totalElements,
        ) { Text("Next →") }
    }
}

private fun extractRows(data: JsonNode?): List<JsonNode> {
    if (data == null || data.isNull || data.isMissingNode) return emptyList()
    val content = if (data.has("content")) data.path("content") else data
    return if (content.isArray) content.toList() else emptyList()
}

private fun extractRowId(row: JsonNode): String {
    for (idField in listOf("id", "_id", "key", "uuid")) {
        val v = row.path(idField)
        if (!v.isMissingNode && !v.isNull) return v.asText()
    }
    return ""
}
