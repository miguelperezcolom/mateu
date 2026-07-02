package io.mateu.compose.ui.desktop

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
import io.mateu.compose.ui.*
import org.jetbrains.jewel.ui.Orientation
import org.jetbrains.jewel.ui.component.Divider
import org.jetbrains.jewel.ui.component.Text

/**
 * The app shell (Jewel port). Resolves the layout variant, draws the menu (collapsible groups +
 * hamburger) and loads the home route into the `ux_main` content slot. Responsive: on wide viewports
 * the sidebar is inline (pushes content); on narrow (phone) viewports it becomes an overlay drawer.
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
    val contentOnly = variant == "TABS" || variant == "MEDIATOR"
    val showSidebar = !contentOnly
    val showHeader = !contentOnly && variant != "MENU_ON_LEFT"

    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact = maxWidth < 600.dp
        var menuOpen by remember(compact) { mutableStateOf(showSidebar && !compact) }
        val closeOnNavigate = { if (compact) menuOpen = false }

        Column(Modifier.fillMaxSize()) {
            when {
                showHeader -> Shellbar(title, homeRoute, homeConsumed, homeSst, app, showSidebar, { menuOpen = !menuOpen }, closeOnNavigate)
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
        "☰",
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
    }
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
        Divider(
            orientation = Orientation.Horizontal,
            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp, horizontal = 12.dp),
            color = Color(0xFF4A6070),
        )
        return
    }

    val label = item.text("label")
    val submenus = item.arr("submenus")

    if (submenus.isNotEmpty()) {
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
