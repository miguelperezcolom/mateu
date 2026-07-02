package io.mateu.compose.ui.desktop

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState
import io.mateu.compose.ui.*
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.jetbrains.jewel.foundation.theme.JewelTheme
import org.jetbrains.jewel.ui.Orientation
import org.jetbrains.jewel.ui.component.Divider
import org.jetbrains.jewel.ui.component.HorizontalProgressBar
import org.jetbrains.jewel.ui.component.Link
import org.jetbrains.jewel.ui.component.OutlinedButton
import org.jetbrains.jewel.ui.component.Text

private val cardShape = RoundedCornerShape(6.dp)

@Composable
private fun cardBackground(): Color = if (JewelTheme.isDark) Color(0xFF3C3F41) else MateuColors.cardBackground

@Composable
private fun Card(title: String?, content: @Composable () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .background(cardBackground(), cardShape)
            .border(1.dp, MateuColors.cardBorder, cardShape)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        if (!title.isNullOrBlank()) {
            Text(title, fontWeight = FontWeight.Bold, style = JewelStyle.sectionTitle())
        }
        content()
    }
}

@Composable
private fun childrenColumn(component: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        component.arr("children").forEach { RenderComponent(it, state, data, app) }
    }
}

@Composable
fun RenderSection(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Card(metadata.text("title").ifBlank { null }) {
        component.arr("children").forEach { RenderComponent(it, state, data, app) }
    }
}

@Composable
fun RenderSubSection(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(6.dp)) {
        val title = metadata.text("title")
        if (title.isNotBlank()) Text(title, fontWeight = FontWeight.Bold)
        component.arr("children").forEach { RenderComponent(it, state, data, app) }
    }
}

@Composable
fun RenderCard(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val titleNode = metadata.path("title")
    Card(if (titleNode.isTextual) titleNode.asText() else null) {
        if (titleNode.isObject) RenderComponent(titleNode, state, data, app)
        if (metadata.isObj("content")) RenderComponent(metadata.path("content"), state, data, app)
        component.arr("children").forEach { RenderComponent(it, state, data, app) }
        if (metadata.isObj("footer")) RenderComponent(metadata.path("footer"), state, data, app)
    }
}

@Composable
fun RenderTabs(component: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    val tabs = component.arr("children")
    if (tabs.isEmpty()) return
    var selected by remember { mutableStateOf(0) }
    Column(Modifier.fillMaxWidth()) {
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            tabs.forEachIndexed { i, tab ->
                val label = tab.path("metadata").text("label")
                val isSelected = selected == i
                Column(
                    Modifier.clickable { selected = i }.padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Text(
                        label,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSelected) JewelStyle.accent else Color.Unspecified,
                    )
                    Divider(
                        orientation = Orientation.Horizontal,
                        modifier = Modifier.fillMaxWidth().height(2.dp),
                        color = if (isSelected) JewelStyle.accent else Color.Transparent,
                        thickness = 2.dp,
                    )
                }
            }
        }
        Divider(orientation = Orientation.Horizontal, modifier = Modifier.fillMaxWidth())
        Column(Modifier.fillMaxWidth().padding(top = 12.dp)) {
            childrenColumn(tabs[selected], state, data, app)
        }
    }
}

@Composable
fun RenderAccordion(component: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        component.arr("children").forEach { panel ->
            val label = panel.path("metadata").text("label")
            val active = panel.path("metadata").bool("active")
            var expanded by remember { mutableStateOf(active) }
            Column(Modifier.fillMaxWidth().border(1.dp, MateuColors.cardBorder, cardShape).padding(12.dp)) {
                Row(
                    Modifier.fillMaxWidth().clickable { expanded = !expanded },
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(label, fontWeight = FontWeight.Bold)
                    Text(if (expanded) "▾" else "▸")
                }
                if (expanded) {
                    Column(Modifier.padding(top = 8.dp)) { childrenColumn(panel, state, data, app) }
                }
            }
        }
    }
}

@Composable
fun RenderSplit(component: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        component.arr("children").forEach { child ->
            Column(Modifier.weight(1f)) { RenderComponent(child, state, data, app) }
        }
    }
}

@Composable
fun RenderBadge(metadata: JsonNode) {
    Text(
        metadata.text("text"),
        color = Color.White,
        modifier = Modifier
            .background(badgeColor(metadata.text("color")), RoundedCornerShape(10.dp))
            .padding(horizontal = 8.dp, vertical = 2.dp),
    )
}

@Composable
fun RenderAnchor(metadata: JsonNode, app: AppState) {
    val text = metadata.text("text", metadata.text("url"))
    val url = metadata.text("url")
    if (url.startsWith("/")) {
        Link(text = text, onClick = { app.navigate(url, "", "", null) })
    } else {
        Text(text, color = JewelStyle.accent)
    }
}

@Composable
fun RenderProgressBar(metadata: JsonNode, state: JsonNode) {
    val min = metadata.dbl("min", 0.0)
    val max = metadata.dbl("max", 1.0)
    val key = metadata.text("valueKey")
    val raw = if (key.isNotBlank() && state.has(key)) state.dbl(key) else metadata.dbl("value")
    val frac = if (max - min == 0.0) 0f else ((raw - min) / (max - min)).toFloat().coerceIn(0f, 1f)
    HorizontalProgressBar(progress = frac, modifier = Modifier.fillMaxWidth())
}

@Composable
fun RenderDialog(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Card(metadata.text("headerTitle").ifBlank { null }) {
        if (metadata.isObj("content")) RenderComponent(metadata.path("content"), state, data, app)
        component.arr("children").forEach { RenderComponent(it, state, data, app) }
        if (metadata.isObj("footer")) RenderComponent(metadata.path("footer"), state, data, app)
    }
}

@Composable
fun RenderConfirmDialog(metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Card(metadata.text("header").ifBlank { null }) {
        if (metadata.isObj("content")) RenderComponent(metadata.path("content"), state, data, app)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MateuButton(
                buildJsonObject {
                    put("label", metadata.text("confirmText", "OK"))
                    put("actionId", metadata.text("confirmActionId"))
                    put("buttonStyle", "Primary")
                },
                app,
            )
            if (metadata.bool("canReject")) {
                OutlinedButton(onClick = { app.runAction(metadata.text("rejectActionId"), null) }) {
                    Text(metadata.text("rejectText", "No"))
                }
            }
            if (metadata.bool("canCancel")) {
                OutlinedButton(onClick = { app.runAction(metadata.text("cancelActionId"), null) }) {
                    Text(metadata.text("cancelText", "Cancel"))
                }
            }
        }
    }
}
