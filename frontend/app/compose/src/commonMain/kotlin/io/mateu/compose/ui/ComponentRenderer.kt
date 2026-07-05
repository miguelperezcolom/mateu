package io.mateu.compose.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState
import io.mateu.compose.state.SlotContent

/**
 * Central component dispatcher — Compose port of the JavaFX `ComponentRenderer`.
 * Renders a node by `type` (ClientSide / ServerSide) and, for ClientSide, by `metadata.type`.
 */
@Composable
fun RenderComponent(component: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    if (component.isNull || component.isMissingNode) return

    when (component.text("type", "ClientSide")) {
        "ClientSide" -> RenderClientSide(component, state, data, app)
        "ServerSide" -> ServerSideComponent(component, app)
        else -> Text("Unknown component type: ${component.text("type")}")
    }
}

@Composable
private fun RenderClientSide(component: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val metadata = component.path("metadata")
    when (metadata.text("type")) {
        "App" -> AppRenderer(component, metadata, app)
        "Page" -> PageRenderer(component, metadata, state, data, app)
        "Form" -> {
            updateContext(component, app)
            FormRenderer(component, metadata, state, data, app)
        }
        "Crud" -> {
            updateContext(component, app)
            CrudRenderer(component, metadata, state, data, app)
        }
        "FormField" -> FormFieldRenderer(metadata, state, data, app)
        "FormLayout" -> RenderFormLayout(component, metadata, state, data, app)
        "VerticalLayout", "Scroller", "FullWidth", "Container", "Div" ->
            RenderVBox(component, metadata, state, data, app)
        "FormRow" -> RenderFormRow(component, metadata, state, data, app)
        "HorizontalLayout" -> RenderHBox(component, metadata, state, data, app)
        "Button" -> MateuClientButton(metadata, app)
        "Text" -> Text(metadata.text("text"))
        "FormSection" -> RenderSection(component, metadata, state, data, app)
        "FormSubSection" -> RenderSubSection(component, metadata, state, data, app)
        "Card" -> RenderCard(component, metadata, state, data, app)
        "TabLayout" -> RenderTabs(component, metadata, state, data, app)
        "AccordionLayout" -> RenderAccordion(component, state, data, app)
        "SplitLayout" -> RenderSplit(component, state, data, app)
        "Badge" -> RenderBadge(metadata)
        "Anchor" -> RenderAnchor(metadata, app)
        "ProgressBar" -> RenderProgressBar(metadata, state)
        "Dialog" -> RenderDialog(component, metadata, state, data, app)
        "ConfirmDialog" -> RenderConfirmDialog(metadata, state, data, app)
        "MetricCard" -> RenderMetricCard(metadata, app)
        "Scoreboard" -> RenderScoreboard(component, state, data, app)
        "DashboardPanel" -> RenderDashboardPanel(component, metadata, state, data, app)
        "DashboardLayout" -> RenderDashboardLayout(component, metadata, state, data, app)
        "FoldoutLayout" -> RenderFoldoutLayout(component, metadata, state, data, app)
        "HeroSection" -> RenderHeroSection(component, metadata, state, data, app)
        "EmptyState" -> RenderEmptyState(metadata, app)
        "Skeleton" -> RenderSkeleton(metadata)
        "Gantt" -> RenderGantt(metadata)
        else -> {
            val t = metadata.text("type")
            if (t.isNotBlank()) {
                Text("Unsupported component: $t")
            } else {
                // No metadata type → try to render children
                RenderChildren(component, state, data, app)
            }
        }
    }
}

private fun updateContext(component: JsonNode, app: AppState) {
    val id = component.text("id")
    if (id.isNotBlank()) app.currentComponentId = id
}

/** Renders every [SlotContent] currently assigned to [id]; recomposes when the slot changes. */
@Composable
fun SlotView(id: String, app: AppState) {
    val items = app.slotFor(id)
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items.forEach { RenderComponent(it.component, it.state, it.data, app) }
    }
}

/**
 * ServerSide component boundary. Ported from `AppContext.loadServerSideComponent`:
 * inline children are seeded directly into the component's slot (and OnLoad triggers fired);
 * otherwise the component is fetched lazily.
 */
@Composable
fun ServerSideComponent(node: JsonNode, app: AppState) {
    val id = node.text("id")
    val route = node.text("route")
    val serverSideType = node.text("serverSideType")
    val children = node.arr("children")
    // Never collapse a nested SSC onto the shell's "ux_main" content slot — that risks a slot
    // rendering itself. Blank-id SSCs get a slot keyed by their server-side type + route.
    val slotId = if (id.isNotBlank()) id else remember { "ssc:${node.text("serverSideType")}:${node.text("route")}" }

    // app.currentRoute is part of the key so a MEDIATOR (always id=ux_main_app, same route/sst)
    // re-resolves its content when the active route changes (e.g. list → /reservations/new).
    LaunchedEffect(slotId, route, serverSideType, app.currentRoute) {
        if (id.isNotBlank()) app.currentComponentId = id
        if (serverSideType.isNotBlank()) app.currentServerSideType = serverSideType

        val firstChild = children.firstOrNull()
        val firstIsApp = firstChild != null &&
            firstChild.text("type") == "ClientSide" &&
            firstChild.path("metadata").text("type") == "App"

        when {
            firstChild != null && firstIsApp -> {
                // Mediator: an App nested inside the SSC. We do NOT draw the nested App shell (that
                // would re-render SlotView("ux_main") and recurse); we load its content into ux_main.
                // The mediator must render the route it was actually loaded for (app.currentRoute,
                // e.g. /reservations/new or /reservations/7) — NOT homeRoute, which is usually empty.
                // Passing rootRoute as consumedRoute + the home sst makes the backend resolve to the
                // content (list/new/detail) instead of re-wrapping in another mediator.
                val meta = firstChild.path("metadata")
                val homeRoute = meta.text("homeRoute")
                val homeConsumed = meta.text("homeConsumedRoute")
                val homeSst = meta.text("homeServerSideType", meta.text("serverSideType"))
                val rootRoute = meta.text("rootRoute")
                val targetRoute = app.currentRoute.ifBlank { homeRoute }
                val consumed = rootRoute.ifBlank { homeConsumed }
                app.slotFor(slotId).clear()
                if (targetRoute.isNotBlank() || homeSst.isNotBlank()) {
                    app.navigate(targetRoute, consumed, homeSst, "")
                }
            }

            firstChild != null -> {
                // Inline children (Page / Form / Crud …) — render directly and fire OnLoad triggers.
                val initialData = node.path("initialData")
                if (initialData.isObject) {
                    app.currentComponentState = HashMap()
                    initialData.fields().forEach { (k, v) -> app.currentComponentState[k] = v }
                }
                val slot = app.slotFor(slotId)
                slot.clear()
                children.forEach { slot.add(SlotContent(it, initialData, initialData)) }
                fireOnLoadTriggers(node, app)
            }

            else -> {
                // No inline children — fetch the component.
                app.currentRoute = route
                app.currentServerSideType = serverSideType
                if (id.isNotBlank()) app.currentComponentId = id
                val content = runCatching { app.loadServerSide(route, serverSideType, id) }.getOrNull()
                val slot = app.slotFor(slotId)
                slot.clear()
                if (content != null) slot.add(content)
            }
        }
    }

    SlotView(slotId, app)
}

private fun fireOnLoadTriggers(node: JsonNode, app: AppState) {
    node.arr("triggers").forEach { trigger ->
        if (trigger.text("type").equals("OnLoad", ignoreCase = true)) {
            val actionId = trigger.text("actionId")
            if (actionId.isNotBlank()) {
                if (actionId == "search") {
                    app.currentComponentState.getOrPut("page") { 0 }
                    app.currentComponentState.getOrPut("size") { 10 }
                    app.currentComponentState.getOrPut("sort") { emptyList<Any>() }
                    app.currentComponentState.getOrPut("searchText") { "" }
                }
                app.runAction(actionId, null)
            }
        }
    }
}

/** Render the `children` array of a component as a vertical stack (fallback). */
@Composable
fun RenderChildren(component: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        component.arr("children").forEach { RenderComponent(it, state, data, app) }
    }
}
