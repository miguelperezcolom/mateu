package io.mateu.compose.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val MateuBlue = Color(0xFF1676F3)
private val MateuSidebar = Color(0xFF354A5E)

private val Light = lightColorScheme(
    primary = MateuBlue,
    surface = Color(0xFFF6F7F9),
    background = Color(0xFFF6F7F9),
)

private val Dark = darkColorScheme(
    primary = MateuBlue,
)

object MateuColors {
    val sidebar = MateuSidebar
    val sidebarText = Color(0xFFE6EBF0)
    val sidebarGroup = Color(0xFF93A4B5)
    val cardBorder = Color(0xFFD2D2D2)
    val cardBackground = Color.White
}

@Composable
fun MateuTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) Dark else Light,
        content = content,
    )
}

fun badgeColor(color: String): Color = when (color) {
    "success" -> Color(0xFF3E8635)
    "error", "danger" -> Color(0xFFC9190B)
    "warning" -> Color(0xFFF0AB00)
    "info" -> Color(0xFF2B9AF3)
    else -> Color(0xFF6A6E73)
}
