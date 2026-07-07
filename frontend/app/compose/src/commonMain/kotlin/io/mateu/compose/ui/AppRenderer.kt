package io.mateu.compose.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.mateu.compose.state.AppState

/**
 * The app shell. Resolves the layout variant, draws the menu (collapsible groups + hamburger) and
 * loads the home route into the `ux_main` content slot. Responsive: on wide viewports the sidebar is
 * inline (pushes content); on narrow (phone) viewports it becomes an overlay drawer.
 */
@Composable
fun AppRenderer(component: JsonNode, appMetadata: JsonNode, app: AppState) {
    val title = appMetadata.text("title", "Mateu App")
    val homeRoute = appMetadata.text("homeRoute")
    val homeConsumed = appMetadata.text("homeConsumedRoute")
    val homeSst = appMetadata.text("homeServerSideType").ifBlank { appMetadata.text("serverSideType") }

    LaunchedEffect(Unit) {
        app.windowTitle.value = title
        if (homeRoute.isNotBlank() || homeSst.isNotBlank()) {
            app.navigate(homeRoute, homeConsumed, homeSst, "")
        }
    }

    val variant = appMetadata.text("variant", "NAVIGATION_LAYOUT")
    // TABS / MEDIATOR are content-only; MENU_ON_LEFT is sidebar-only; everything else gets header + sidebar.
    val contentOnly = variant == "TABS" || variant == "MEDIATOR"
    val showSidebar = !contentOnly
    val showHeader = !contentOnly && variant != "MENU_ON_LEFT"

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact = maxWidth < 600.dp // phone-width breakpoint
        // Open by default on desktop; closed (drawer) on phones. Re-keyed on `compact` so rotating /
        // resizing across the breakpoint resets to the sensible default.
        var menuOpen by remember(compact) { mutableStateOf(showSidebar && !compact) }
        val closeOnNavigate = { if (compact) menuOpen = false }

        Column(Modifier.fillMaxSize()) {
            when {
                showHeader -> Shellbar(title, homeRoute, homeConsumed, homeSst, app, appMetadata, showSidebar, { menuOpen = !menuOpen }, closeOnNavigate)
                showSidebar -> ToggleStrip { menuOpen = !menuOpen }
            }
            Box(Modifier.weight(1f).fillMaxWidth()) {
                Row(Modifier.fillMaxSize()) {
                    if (showSidebar && !compact && menuOpen) {
                        Sidebar(appMetadata, app, onNavigate = {})
                    }
                    Box(
                        Modifier.fillMaxSize().verticalScroll(rememberScrollState())
                            .padding(if (compact) 16.dp else 24.dp),
                    ) {
                        SlotView("ux_main", app)
                    }
                }
                // Phone: menu is an overlay drawer with a tap-to-dismiss scrim.
                if (showSidebar && compact && menuOpen) {
                    Box(
                        Modifier.fillMaxSize().background(Color(0x99000000)).clickable { menuOpen = false },
                    )
                    Sidebar(
                        appMetadata, app,
                        onNavigate = { menuOpen = false },
                        modifier = Modifier.fillMaxHeight().width(280.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun HamburgerButton(onToggle: () -> Unit) {
    Text(
        "☰", // ☰
        color = MateuColors.sidebarText,
        fontSize = 20.sp,
        modifier = Modifier.clickable { onToggle() }.padding(end = 14.dp),
    )
}

@Composable
private fun ToggleStrip(onToggle: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().background(MateuColors.sidebar).padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        HamburgerButton(onToggle)
    }
}

@Composable
private fun Shellbar(
    title: String,
    homeRoute: String,
    homeConsumed: String,
    homeSst: String,
    app: AppState,
    appMetadata: JsonNode,
    showToggle: Boolean,
    onToggleMenu: () -> Unit,
    onNavigate: () -> Unit,
) {
    Row(
        Modifier.fillMaxWidth().background(MateuColors.sidebar).padding(horizontal = 20.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (showToggle) HamburgerButton(onToggleMenu)
            Text(
                title,
                color = MateuColors.sidebarText,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                modifier = Modifier.clickable {
                    app.navigate(homeRoute, homeConsumed, homeSst, ""); onNavigate()
                },
            )
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            appMetadata.arr("contextSelectors").forEach { ContextSelector(it, app, appMetadata) }
        }
    }
}

/**
 * One application-level context selector (@AppContext field of the app class) on the shellbar:
 * label + current value opening a dropdown with the options. Picking a value persists it, updates
 * the appState sent with every request, and reloads the current route (AppState.setAppContext).
 */
// beyond this many options the dropdown gains a search field (like the web picker)
private const val CONTEXT_SEARCHABLE_THRESHOLD = 7

@Composable
private fun ContextSelector(selector: JsonNode, app: AppState, appMetadata: JsonNode) {
    val fieldName = selector.text("fieldName")
    if (fieldName.isBlank()) return
    var expanded by remember { mutableStateOf(false) }
    val options = selector.arr("options")
    val current = app.appState[fieldName]?.toString() ?: ""
    val currentLabel = options.firstOrNull { it.text("value") == current }?.text("label")
        ?: current.ifBlank { "—" }
    val searchable = options.size > CONTEXT_SEARCHABLE_THRESHOLD

    var searchText by remember { mutableStateOf("") }
    // server results replacing the loaded options while a remote search is active
    var searched by remember { mutableStateOf<List<Pair<String, String>>?>(null) }

    // debounced remote search: the loaded options may be a truncated first page
    LaunchedEffect(searchText) {
        if (!searchable || searchText.isBlank()) {
            searched = null
            return@LaunchedEffect
        }
        kotlinx.coroutines.delay(300)
        searched = remoteContextSearch(app, appMetadata, fieldName, searchText)
    }

    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(start = 16.dp)) {
        Text(selector.text("label", fieldName), color = MateuColors.sidebarGroup, fontSize = 13.sp)
        Box {
            Text(
                "$currentLabel ▾",
                color = MateuColors.sidebarText,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { searchText = ""; expanded = true }.padding(start = 6.dp),
            )
            androidx.compose.material3.DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                if (searchable) {
                    androidx.compose.material3.OutlinedTextField(
                        value = searchText,
                        onValueChange = { searchText = it },
                        placeholder = { Text("Search…") },
                        singleLine = true,
                        modifier = Modifier.padding(horizontal = 8.dp).width(220.dp),
                    )
                }
                androidx.compose.material3.DropdownMenuItem(
                    text = { Text("—") },
                    onClick = { expanded = false; app.setAppContext(fieldName, null) },
                )
                val loaded = options.map { it.text("value") to it.text("label") }
                val text = searchText.trim().lowercase()
                val visible =
                    if (text.isEmpty()) loaded
                    else (searched ?: loaded).filter { it.second.lowercase().contains(text) }
                visible.forEach { (value, label) ->
                    androidx.compose.material3.DropdownMenuItem(
                        text = { Text(label) },
                        onClick = { expanded = false; app.setAppContext(fieldName, value) },
                    )
                }
            }
        }
    }
}

/**
 * Asks the server for context options matching [text] via the standard
 * `_appcontext-search-<field>` action; null when unavailable (the client-side filter still applies).
 */
private suspend fun remoteContextSearch(
    app: AppState,
    appMetadata: JsonNode,
    fieldName: String,
    text: String,
): List<Pair<String, String>>? = try {
    val route = appMetadata.text("homeRoute")
    val increment = app.api.runAction(
        route,
        route,
        "_appcontext-search-$fieldName",
        appMetadata.text("serverSideType").ifBlank { null },
        "appcontext-$fieldName",
        emptyMap(),
        app.appState,
        mapOf("searchText" to text),
    )
    val results = mutableListOf<Pair<String, String>>()
    increment.arr("fragments").forEach { fragment ->
        fragment.path("data").path("_appcontext_$fieldName").path("content").toList().forEach { option ->
            results += option.text("value") to option.text("label", option.text("value"))
        }
    }
    results.ifEmpty { null }
} catch (e: Exception) {
    null
}

@Composable
private fun Sidebar(
    appMetadata: JsonNode,
    app: AppState,
    onNavigate: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier
            .width(260.dp)
            .fillMaxHeight()
            .background(MateuColors.sidebar)
            .verticalScroll(rememberScrollState())
            .padding(vertical = 8.dp),
    ) {
        appMetadata.arr("menu").forEach { MenuItem(it, 0, app, onNavigate) }
    }
}

@Composable
private fun MenuItem(item: JsonNode, depth: Int, app: AppState, onNavigate: () -> Unit) {
    if (item.bool("separator")) {
        HorizontalDivider(
            Modifier.padding(vertical = 4.dp, horizontal = 12.dp),
            color = Color(0xFF4A6070),
        )
        return
    }

    val label = item.text("label")
    val submenus = item.arr("submenus")

    if (submenus.isNotEmpty()) {
        // Collapsible group — collapsed by default; the whole row toggles expand/collapse.
        var expanded by remember { mutableStateOf(false) }
        Row(
            Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded }
                .padding(start = (20 + depth * 12).dp, end = 16.dp, top = 10.dp, bottom = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                if (depth == 0) label.uppercase() else label,
                color = if (depth == 0) MateuColors.sidebarGroup else MateuColors.sidebarText,
                fontSize = if (depth == 0) 11.sp else 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f),
            )
            Text(if (expanded) "▾" else "▸", color = MateuColors.sidebarGroup, fontSize = 12.sp)
        }
        if (expanded) submenus.forEach { MenuItem(it, depth + 1, app, onNavigate) }
    } else {
        val route = item.text("route")
        val consumedRoute = item.text("consumedRoute")
        val serverSideType = item.text("serverSideType")
        val actionId = item.text("actionId")
        Text(
            label,
            color = MateuColors.sidebarText,
            fontSize = 14.sp,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { app.navigate(route, consumedRoute, serverSideType, actionId); onNavigate() }
                .padding(start = (20 + depth * 12).dp, end = 20.dp, top = 10.dp, bottom = 10.dp),
        )
    }
}
