package io.mateu.compose.ui.desktop

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import org.jetbrains.jewel.foundation.theme.JewelTheme
import org.jetbrains.jewel.ui.component.Typography

/** Shared, theme-aware colours and text styles used across the Jewel desktop renderers. */
internal object JewelStyle {
    val error = Color(0xFFC9190B)
    val muted = Color(0xFF8C8C8C)
    val accent = Color(0xFF3574F0) // IntelliJ blue, used for links / primary emphasis

    @Composable fun pageTitle(): TextStyle = Typography.h1TextStyle()

    @Composable fun sectionTitle(): TextStyle = Typography.h3TextStyle()

    @Composable fun subSectionTitle(): TextStyle = Typography.h4TextStyle()

    @Composable fun body(): TextStyle = JewelTheme.defaultTextStyle

    /** A muted, slightly smaller style for field labels / captions. */
    @Composable fun label(): TextStyle = JewelTheme.defaultTextStyle

    /** Background for table header rows / subtle surfaces. */
    @Composable fun subtleSurface(): Color = if (JewelTheme.isDark) Color(0xFF3C3F41) else Color(0xFFEDEFF2)
}
