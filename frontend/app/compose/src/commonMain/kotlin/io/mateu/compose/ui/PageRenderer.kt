package io.mateu.compose.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import io.mateu.compose.state.AppState

/** Compose port of the JavaFX `PageRenderer`: header (title/subtitle/toolbar), children, bottom buttons. */
@Composable
fun PageRenderer(component: JsonNode, metadata: JsonNode, state: JsonNode, data: JsonNode, app: AppState) {
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        val headerText = metadata.text("title").ifBlank { metadata.text("pageTitle") }
        val subtitle = metadata.text("subtitle")
        val toolbar = metadata.arr("toolbar")

        if (headerText.isNotBlank() || subtitle.isNotBlank() || toolbar.isNotEmpty()) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                if (headerText.isNotBlank()) {
                    Text(headerText, style = MaterialTheme.typography.headlineSmall)
                }
                if (subtitle.isNotBlank()) {
                    Text(subtitle, style = MaterialTheme.typography.bodyMedium)
                }
                if (toolbar.isNotEmpty()) {
                    Row(
                        Modifier.padding(top = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        toolbar.forEach { MateuButton(it, app) }
                    }
                }
            }
        }

        metadata.arr("banners").forEach { Banner(it) }

        component.arr("children").forEach { RenderComponent(it, state, data, app) }

        val buttons = metadata.arr("buttons")
        if (buttons.isNotEmpty()) {
            Row(
                Modifier.fillMaxWidth().padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                buttons.forEach { MateuButton(it, app) }
            }
        }
    }
}

/** A page banner (INFO/SUCCESS/WARNING/DANGER) rendered as a soft-tinted card. */
@Composable
private fun Banner(banner: JsonNode) {
    val (bg, fg) = when (banner.text("theme").uppercase()) {
        "SUCCESS" -> Color(0xFFE3F4E4) to Color(0xFF1E4620)
        "WARNING" -> Color(0xFFFCF3D6) to Color(0xFF6B5000)
        "DANGER", "ERROR" -> Color(0xFFFBE3E0) to Color(0xFF7A1D12)
        else -> Color(0xFFE3EEFB) to Color(0xFF0B3D74) // INFO
    }
    Column(
        Modifier.fillMaxWidth().background(bg, RoundedCornerShape(6.dp)).padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        banner.text("title").takeIf { it.isNotBlank() }?.let {
            Text(it, color = fg, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleSmall)
        }
        banner.text("description").takeIf { it.isNotBlank() }?.let {
            Text(it, color = fg, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
