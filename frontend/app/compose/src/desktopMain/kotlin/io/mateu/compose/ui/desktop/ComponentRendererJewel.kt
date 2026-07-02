package io.mateu.compose.ui.desktop

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState
import io.mateu.compose.state.SlotContent
import io.mateu.compose.ui.*
import kotlinx.coroutines.delay
import org.jetbrains.jewel.foundation.theme.JewelTheme
import org.jetbrains.jewel.ui.component.Text

/**
 * The whole Mateu desktop UI, rendered with Jewel (IntelliJ Int UI). This is the desktop counterpart
 * of the Material 3 `io.mateu.compose.ui.MateuApp` used by Android/iOS. The renderers under
 * `io.mateu.compose.ui.desktop` mirror the shared ones one-for-one, swapping Material 3 widgets for
 * Jewel widgets while reusing the framework-agnostic state layer and JSON helpers from commonMain.
 */
@Composable
fun MateuAppJewel(app: AppState, route: String) {
    // Fill the window with the theme's panel background so dark mode doesn't show white edges.
    val bg = if (JewelTheme.isDark) Color(0xFF2B2D30) else Color(0xFFF7F8FA)
    Box(Modifier.fillMaxSize().background(bg)) {
        val root = app.root.value
        if (root != null) {
            RenderComponent(root.component, root.state, root.data, app)
        }

        // Snackbar replacement: a transient toast at the bottom, auto-cleared after a few seconds.
        val message by app.message
        message?.let {
            Box(
                Modifier.align(Alignment.BottomCenter).padding(24.dp)
                    .background(Color(0xFF323232), RoundedCornerShape(6.dp))
                    .padding(horizontal = 16.dp, vertical = 12.dp),
            ) {
                Text(it.text, color = Color.White)
            }
        }
        LaunchedEffect(message) {
            if (message != null) {
                delay(4000)
                app.message.value = null
            }
        }
    }

    LaunchedEffect(Unit) { app.initialLoad(route) }
}

/**
 * Central component dispatcher — Jewel port of the shared `RenderComponent`.
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
        "TabLayout" -> RenderTabs(component, state, data, app)
        "AccordionLayout" -> RenderAccordion(component, state, data, app)
        "SplitLayout" -> RenderSplit(component, state, data, app)
        "Badge" -> RenderBadge(metadata)
        "Anchor" -> RenderAnchor(metadata, app)
        "ProgressBar" -> RenderProgressBar(metadata, state)
        "Dialog" -> RenderDialog(component, metadata, state, data, app)
        "ConfirmDialog" -> RenderConfirmDialog(metadata, state, data, app)
        else -> {
            val t = metadata.text("type")
            if (t.isNotBlank()) {
                Text("Unsupported component: $t")
            } else {
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
 * ServerSide component boundary. Mirrors the shared renderer: inline children are seeded directly
 * into the component's slot (and OnLoad triggers fired); otherwise the component is fetched lazily.
 */
@Composable
fun ServerSideComponent(node: JsonNode, app: AppState) {
    val id = node.text("id")
    val route = node.text("route")
    val serverSideType = node.text("serverSideType")
    val children = node.arr("children")
    val slotId = if (id.isNotBlank()) id else remember { "ssc:${node.text("serverSideType")}:${node.text("route")}" }

    LaunchedEffect(slotId, route, serverSideType, app.currentRoute) {
        if (id.isNotBlank()) app.currentComponentId = id
        if (serverSideType.isNotBlank()) app.currentServerSideType = serverSideType

        val firstChild = children.firstOrNull()
        val firstIsApp = firstChild != null &&
            firstChild.text("type") == "ClientSide" &&
            firstChild.path("metadata").text("type") == "App"

        when {
            firstChild != null && firstIsApp -> {
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
