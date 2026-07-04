package io.mateu.compose.ui

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.layout
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.mateu.compose.state.AppState
import kotlinx.datetime.Clock
import kotlinx.datetime.DateTimeUnit
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.plus
import kotlinx.datetime.todayIn

/**
 * Compose port of the UX-pattern component renderers — the counterpart of the web renderers
 * `dashboardRenderer.ts`, `foldoutRenderer.ts`, `heroRenderer.ts`, `emptyStateRenderer.ts`,
 * `ganttRenderer.ts` and the `mateu-foldout` / `mateu-skeleton` / `mateu-gantt` LitElements:
 * MetricCard, Scoreboard, DashboardPanel, DashboardLayout, FoldoutLayout, HeroSection,
 * EmptyState, Skeleton, Gantt.
 *
 * All the logic is shared here in commonMain and drawn design-system-neutral (explicit colors,
 * no Material/Jewel widget chrome), so the same composables serve both the Material 3 dispatcher
 * (`ComponentRenderer`) and the Jewel desktop one (`ComponentRendererJewel`). Components with
 * arbitrary children take a [UxChildRenderer] so each dispatcher recurses through itself.
 */
typealias UxChildRenderer = @Composable (component: JsonNode, state: JsonNode, data: JsonNode, app: AppState) -> Unit

/** Default recursion: through the shared (Material 3) dispatcher. */
val defaultUxChildRenderer: UxChildRenderer = { c, s, d, a -> RenderComponent(c, s, d, a) }

private val uxShape = RoundedCornerShape(12.dp)
private val uxAccent = Color(0xFF1676F3)
private val uxSuccess = Color(0xFF1A7F37)
private val uxError = Color(0xFFC5221F)

/** Dark-mode-aware neutral palette (mirrors the Lumo var fallbacks the web renderers use). */
private data class UxPalette(
    val surface: Color,
    val border: Color,
    val text: Color,
    val secondary: Color,
    val tertiary: Color,
    val bone: Color,
    val strip: Color,
    val headerBg: Color,
)

@Composable
private fun uxPalette(): UxPalette = if (isSystemInDarkTheme()) {
    UxPalette(
        surface = Color(0xFF3C3F41),
        border = Color(0xFF515151),
        text = Color(0xFFEAEAEA),
        secondary = Color(0xFFB4B8BC),
        tertiary = Color(0xFF8C9196),
        bone = Color(0xFF4A4D4F),
        strip = Color(0xFF45484A),
        headerBg = Color(0xFF45484A),
    )
} else {
    UxPalette(
        surface = Color.White,
        border = Color(0xFFD9DCDF),
        text = Color(0xFF1F2933),
        secondary = Color(0xFF616E7C),
        tertiary = Color(0xFF9AA5B1),
        bone = Color(0xFFE4E7EB),
        strip = Color(0xFFF2F3F5),
        headerBg = Color(0xFFF5F6F7),
    )
}

private fun Modifier.uxCard(palette: UxPalette): Modifier =
    background(palette.surface, uxShape).border(1.dp, palette.border, uxShape).padding(16.dp)

// ── 1. MetricCard ──────────────────────────────────────────────────────────────

/**
 * KPI tile: small title, big bold value (+ unit), colored trend line, optional description.
 * When `actionId` is set the whole tile is clickable and dispatches the action exactly like a
 * button does ([AppState.runAction]).
 */
@Composable
fun RenderMetricCard(metadata: JsonNode, app: AppState, modifier: Modifier = Modifier) {
    val palette = uxPalette()
    val actionId = metadata.text("actionId")
    val clickable =
        if (actionId.isNotBlank()) Modifier.clip(uxShape).clickable { app.runAction(actionId, null) } else Modifier
    Column(
        modifier.then(clickable).uxCard(palette),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(metadata.text("title"), color = palette.secondary, fontSize = 13.sp)
            val icon = metadata.text("icon")
            // Icon ids like "vaadin:chart" have no glyph here; emoji/text icons render as-is.
            if (icon.isNotBlank() && !icon.contains(':')) {
                Text(icon, color = palette.tertiary, fontSize = 14.sp)
            }
        }
        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(
                metadata.text("value"),
                color = palette.text,
                fontSize = 30.sp,
                lineHeight = 33.sp,
                fontWeight = FontWeight.SemiBold,
            )
            val unit = metadata.text("unit")
            if (unit.isNotBlank()) {
                Text(unit, color = palette.secondary, fontSize = 15.sp, modifier = Modifier.padding(bottom = 3.dp))
            }
        }
        val trend = metadata.text("trend")
        val trendLabel = metadata.text("trendLabel")
        if (trend.isNotBlank() || trendLabel.isNotBlank()) {
            val trendColor = when (trend) {
                "up" -> uxSuccess
                "down" -> uxError
                else -> palette.secondary
            }
            val arrow = when (trend) {
                "up" -> "▲ "
                "down" -> "▼ "
                else -> ""
            }
            Text(arrow + trendLabel, color = trendColor, fontSize = 13.sp)
        }
        val description = metadata.text("description")
        if (description.isNotBlank()) Text(description, color = palette.tertiary, fontSize = 12.sp)
    }
}

// ── 2. Scoreboard ──────────────────────────────────────────────────────────────

/** Horizontal band of equal-width KPI tiles (children are MetricCards). */
@Composable
fun RenderScoreboard(
    component: JsonNode,
    state: JsonNode,
    data: JsonNode,
    app: AppState,
    renderChild: UxChildRenderer = defaultUxChildRenderer,
) {
    val children = component.arr("children")
    if (children.isEmpty()) return
    // Equal-height tiles only when every child is a MetricCard: IntrinsicSize must not be asked of
    // arbitrary children (a nested BoxWithConstraints — e.g. a FormLayout — doesn't support it).
    val allMetric = children.all { it.path("metadata").text("type") == "MetricCard" }
    val rowModifier = if (allMetric) Modifier.fillMaxWidth().height(IntrinsicSize.Min) else Modifier.fillMaxWidth()
    Row(rowModifier, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        children.forEach { child ->
            Box(Modifier.weight(1f).then(if (allMetric) Modifier.fillMaxHeight() else Modifier)) {
                if (child.path("metadata").text("type") == "MetricCard") {
                    RenderMetricCard(child.path("metadata"), app, Modifier.fillMaxSize())
                } else {
                    renderChild(child, state, data, app)
                }
            }
        }
    }
}

// ── 3. DashboardPanel ──────────────────────────────────────────────────────────

/** Titled card tile for the dashboard grid; colSpan/rowSpan are honoured by [RenderDashboardLayout]. */
@Composable
fun RenderDashboardPanel(
    component: JsonNode,
    metadata: JsonNode,
    state: JsonNode,
    data: JsonNode,
    app: AppState,
    modifier: Modifier = Modifier,
    renderChild: UxChildRenderer = defaultUxChildRenderer,
) {
    val palette = uxPalette()
    Column(modifier.fillMaxWidth().uxCard(palette), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        val title = metadata.text("title")
        if (title.isNotBlank()) {
            Column {
                Text(title, color = palette.text, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
                val subtitle = metadata.text("subtitle")
                if (subtitle.isNotBlank()) Text(subtitle, color = palette.secondary, fontSize = 13.sp)
            }
        }
        Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            component.arr("children").forEach { renderChild(it, state, data, app) }
        }
    }
}

// ── 4. DashboardLayout ─────────────────────────────────────────────────────────

private class UxTile(val node: JsonNode, val span: Int, val rowSpan: Int, val fullRow: Boolean)

/**
 * Grid of tiles. Scoreboards span the full row; DashboardPanel `colSpan` spans grid cells
 * (`rowSpan` is approximated with a proportional minimum height — Compose rows have no real
 * row-spanning). `columns == 0` picks a responsive column count from the available width.
 */
@Composable
fun RenderDashboardLayout(
    component: JsonNode,
    metadata: JsonNode,
    state: JsonNode,
    data: JsonNode,
    app: AppState,
    renderChild: UxChildRenderer = defaultUxChildRenderer,
) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        val declared = metadata.int("columns")
        // Mirrors the web's `repeat(auto-fit, minmax(20rem, 1fr))` when no explicit column count.
        val cols = if (declared > 0) declared else (maxWidth / 320.dp).toInt().coerceIn(1, 4)

        val tiles = component.arr("children").map { child ->
            val childMeta = child.path("metadata")
            when (childMeta.text("type")) {
                "Scoreboard" -> UxTile(child, cols, 1, true)
                "DashboardPanel" -> UxTile(
                    child,
                    childMeta.int("colSpan", 1).coerceIn(1, cols),
                    childMeta.int("rowSpan", 1).coerceAtLeast(1),
                    false,
                )
                else -> UxTile(child, 1, 1, false)
            }
        }

        // Greedily pack tiles into rows of at most `cols` spans (like chunkByColspan in Layouts.kt).
        val rows = ArrayList<MutableList<UxTile>>()
        var cur = ArrayList<UxTile>()
        var used = 0
        tiles.forEach { tile ->
            if (tile.fullRow) {
                if (cur.isNotEmpty()) { rows.add(cur); cur = ArrayList(); used = 0 }
                rows.add(arrayListOf(tile))
            } else {
                if (used + tile.span > cols) { rows.add(cur); cur = ArrayList(); used = 0 }
                cur.add(tile)
                used += tile.span
                if (used >= cols) { rows.add(cur); cur = ArrayList(); used = 0 }
            }
        }
        if (cur.isNotEmpty()) rows.add(cur)

        Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            rows.forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    var rowUsed = 0
                    row.forEach { tile ->
                        val tileModifier = Modifier.weight(tile.span.toFloat())
                            .let { if (tile.rowSpan > 1) it.heightIn(min = (150 * tile.rowSpan).dp) else it }
                        val tileMeta = tile.node.path("metadata")
                        if (tileMeta.text("type") == "DashboardPanel") {
                            RenderDashboardPanel(tile.node, tileMeta, state, data, app, tileModifier, renderChild)
                        } else {
                            Box(tileModifier) { renderChild(tile.node, state, data, app) }
                        }
                        rowUsed += tile.span
                    }
                    if (rowUsed < cols) Spacer(Modifier.weight((cols - rowUsed).toFloat()))
                }
            }
        }
    }
}

// ── 5. FoldoutLayout ───────────────────────────────────────────────────────────

/** Lays the content out rotated 90° clockwise (the closed foldout strips' vertical titles). */
private fun Modifier.verticalText(): Modifier = this
    .layout { measurable, constraints ->
        val placeable = measurable.measure(
            Constraints(maxWidth = constraints.maxHeight, maxHeight = constraints.maxWidth),
        )
        layout(placeable.height, placeable.width) {
            placeable.place(
                x = -(placeable.width - placeable.height) / 2,
                y = -(placeable.height - placeable.width) / 2,
            )
        }
    }
    .rotate(90f)

/**
 * Redwood-style foldout: fixed overview panel on the left (the child with slot == "overview") plus
 * lateral fold-out panels (child with slot == "panel-N" pairs with `metadata.panels[N]`). Closed
 * panels render as a narrow strip with the rotated title; clicking toggles them. The open/closed
 * state lives locally (`panels[N].open` is only the initial value), like `mateu-foldout.ts`.
 */
@Composable
fun RenderFoldoutLayout(
    component: JsonNode,
    metadata: JsonNode,
    state: JsonNode,
    data: JsonNode,
    app: AppState,
    renderChild: UxChildRenderer = defaultUxChildRenderer,
) {
    val palette = uxPalette()
    val panels = metadata.arr("panels")
    val children = component.arr("children")
    val overview = children.firstOrNull { it.text("slot") == "overview" }
    val open = remember(panels.size) {
        mutableStateListOf(*Array(panels.size) { i -> panels[i].bool("open") })
    }
    val minHeight = 400.dp

    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        // Fixed overview panel on the left.
        Column(Modifier.width(320.dp).heightIn(min = minHeight).uxCard(palette)) {
            if (overview != null) renderChild(overview, state, data, app)
        }
        // The rail of fold-out panels.
        Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            panels.forEachIndexed { index, panel ->
                if (open.getOrElse(index) { false }) {
                    Column(
                        Modifier.weight(1f).heightIn(min = minHeight).uxCard(palette),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top,
                        ) {
                            Column {
                                Text(
                                    panel.text("title"),
                                    color = palette.text,
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.SemiBold,
                                )
                                val subtitle = panel.text("subtitle")
                                if (subtitle.isNotBlank()) Text(subtitle, color = palette.secondary, fontSize = 13.sp)
                            }
                            Text(
                                "⟨",
                                color = palette.secondary,
                                fontSize = 16.sp,
                                modifier = Modifier.clickable { open[index] = false }.padding(horizontal = 4.dp),
                            )
                        }
                        val content = children.firstOrNull { it.text("slot") == "panel-$index" }
                        if (content != null) renderChild(content, state, data, app)
                    }
                } else {
                    Column(
                        Modifier.width(44.dp).height(minHeight)
                            .clip(uxShape)
                            .background(palette.strip)
                            .border(1.dp, palette.border, uxShape)
                            .clickable { open[index] = true }
                            .padding(vertical = 10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Text("⟩", color = palette.secondary, fontSize = 15.sp)
                        Text(
                            panel.text("title"),
                            color = palette.secondary,
                            fontSize = 13.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.verticalText(),
                        )
                    }
                }
            }
        }
    }
}

// ── 6. HeroSection ─────────────────────────────────────────────────────────────

/** Parses CSS-ish lengths ("16rem", "300px", "300") into Dp; 1rem = 16dp. */
private fun parseCssLength(value: String, default: Dp): Dp {
    val v = value.trim().lowercase()
    if (v.isBlank()) return default
    val n = v.takeWhile { it.isDigit() || it == '.' }.toFloatOrNull() ?: return default
    return if (v.endsWith("rem") || v.endsWith("em")) (n * 16).dp else n.dp
}

/**
 * Big hero header: display-size title, subtitle, children (CTAs) in a row below. There is no
 * remote-image loader in the shared code, so an `image` is gracefully replaced by a dark scrim
 * gradient — text contrast matches the web renderer's darkened background image.
 */
@Composable
fun RenderHeroSection(
    component: JsonNode,
    metadata: JsonNode,
    state: JsonNode,
    data: JsonNode,
    app: AppState,
    renderChild: UxChildRenderer = defaultUxChildRenderer,
) {
    val palette = uxPalette()
    val hasImage = metadata.text("image").isNotBlank()
    val centered = metadata.bool("centered", true)
    val minHeight = parseCssLength(metadata.text("height"), 192.dp)
    val background = if (hasImage) {
        Modifier.background(Brush.verticalGradient(listOf(Color(0xFF3E4C59), Color(0xFF1F2933))), uxShape)
    } else {
        Modifier.background(palette.strip, uxShape)
    }
    val titleColor = if (hasImage) Color.White else palette.text
    val subtitleColor = if (hasImage) Color(0xFFDDE3EA) else palette.secondary
    val textAlign = if (centered) TextAlign.Center else TextAlign.Start
    Column(
        Modifier.fillMaxWidth().heightIn(min = minHeight).then(background)
            .padding(horizontal = 24.dp, vertical = 40.dp),
        horizontalAlignment = if (centered) Alignment.CenterHorizontally else Alignment.Start,
        verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterVertically),
    ) {
        val title = metadata.text("title")
        if (title.isNotBlank()) {
            Text(
                title,
                color = titleColor,
                fontSize = 34.sp,
                lineHeight = 39.sp,
                fontWeight = FontWeight.Bold,
                textAlign = textAlign,
            )
        }
        val subtitle = metadata.text("subtitle")
        if (subtitle.isNotBlank()) {
            Text(
                subtitle,
                color = subtitleColor,
                fontSize = 17.sp,
                textAlign = textAlign,
                modifier = Modifier.widthIn(max = 640.dp),
            )
        }
        val children = component.arr("children")
        if (children.isNotEmpty()) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                children.forEach { renderChild(it, state, data, app) }
            }
        }
    }
}

// ── 7. EmptyState ──────────────────────────────────────────────────────────────

/** Centered friendly placeholder with an optional CTA dispatching `actionId` like a button. */
@Composable
fun RenderEmptyState(metadata: JsonNode, app: AppState) {
    val palette = uxPalette()
    Column(
        Modifier.fillMaxWidth().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(5.dp),
    ) {
        Text(metadata.text("icon").ifBlank { "🗂" }, fontSize = 28.sp, modifier = Modifier.alpha(.6f))
        val title = metadata.text("title")
        if (title.isNotBlank()) {
            Text(title, color = palette.text, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
        }
        Text(
            metadata.text("description").ifBlank { "Nothing here yet." },
            color = palette.secondary,
            fontSize = 13.sp,
            textAlign = TextAlign.Center,
        )
        val actionId = metadata.text("actionId")
        val actionLabel = metadata.text("actionLabel")
        if (actionId.isNotBlank() && actionLabel.isNotBlank()) {
            TextButton(
                onClick = { app.runAction(actionId, null) },
                colors = ButtonDefaults.textButtonColors(contentColor = uxAccent),
            ) {
                Text(actionLabel)
            }
        }
    }
}

// ── 8. Skeleton ────────────────────────────────────────────────────────────────

/** Loading placeholder blocks (variants text / card / grid / form), with a soft pulse shimmer. */
@Composable
fun RenderSkeleton(metadata: JsonNode) {
    val palette = uxPalette()
    val variant = metadata.text("variant").ifBlank { "text" }
    val count = metadata.int("count", 3).coerceAtLeast(1)
    val boneShape = RoundedCornerShape(6.dp)
    val pulse by rememberInfiniteTransition().animateFloat(
        initialValue = .55f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
    )
    Column(Modifier.fillMaxWidth().alpha(pulse), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        repeat(count) { i ->
            when (variant) {
                "card" -> Box(Modifier.fillMaxWidth().height(144.dp).background(palette.bone, boneShape))
                "grid" -> Box(Modifier.fillMaxWidth().height(36.dp).background(palette.bone, boneShape))
                "form" -> Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Box(Modifier.fillMaxWidth(.3f).height(12.dp).background(palette.bone, boneShape))
                    Box(Modifier.fillMaxWidth().height(36.dp).background(palette.bone, boneShape))
                }
                else -> {
                    val width = when (i % 3) {
                        0 -> .95f
                        1 -> .6f
                        else -> .8f
                    }
                    Box(Modifier.fillMaxWidth(width).height(14.dp).background(palette.bone, boneShape))
                }
            }
        }
    }
}

// ── 9. Gantt ───────────────────────────────────────────────────────────────────

private class UxGanttTask(
    val title: String,
    val startDay: Int,
    val endDay: Int,
    val progress: Float,
    val color: Color?,
)

/** Parses "#rgb" / "#rrggbb" / "#aarrggbb" CSS colors; anything else → null (default bar color). */
private fun parseCssColor(value: String): Color? {
    val v = value.trim()
    if (!v.startsWith("#")) return null
    val hex = v.removePrefix("#")
    return runCatching {
        when (hex.length) {
            3 -> {
                val full = hex.map { "$it$it" }.joinToString("")
                Color(0xFF000000 or full.toLong(16))
            }
            6 -> Color(0xFF000000 or hex.toLong(16))
            8 -> Color(hex.toLong(16))
            else -> null
        }
    }.getOrNull()
}

/** Month segments (label + visible day count) covering [minDay, maxDay) — mirrors mateu-gantt.ts. */
private fun ganttMonths(minDay: Int, maxDay: Int): List<Pair<String, Int>> {
    val segments = mutableListOf<Pair<String, Int>>()
    val first = LocalDate.fromEpochDays(minDay)
    var cursor = LocalDate(first.year, first.monthNumber, 1)
    while (cursor.toEpochDays() < maxDay) {
        val next = cursor.plus(1, DateTimeUnit.MONTH)
        val from = maxOf(cursor.toEpochDays(), minDay)
        val to = minOf(next.toEpochDays(), maxDay)
        if (to > from) {
            val label = cursor.month.name.take(3).lowercase().replaceFirstChar { it.uppercase() } +
                " " + (cursor.year % 100).toString().padStart(2, '0')
            segments.add(label to (to - from))
        }
        cursor = next
    }
    return segments
}

@Composable
private fun GanttCell(height: Dp, background: Color, borderColor: Color, content: @Composable BoxScope.() -> Unit) {
    Box(
        Modifier.fillMaxWidth().height(height).background(background).padding(horizontal = 10.dp),
        contentAlignment = Alignment.CenterStart,
    ) { content() }
    Box(Modifier.fillMaxWidth().height(1.dp).background(borderColor))
}

/**
 * Dependency-free Gantt/timeline: labels column + time axis with month headers, bars positioned
 * proportionally between the global min/max dates (with one padding day each side), per-task
 * progress fill and a vertical today marker. Read-only, like `mateu-gantt.ts`.
 */
@Composable
fun RenderGantt(metadata: JsonNode) {
    val palette = uxPalette()
    val tasks = metadata.arr("tasks").mapNotNull { t ->
        val start = runCatching { LocalDate.parse(t.text("start")) }.getOrNull() ?: return@mapNotNull null
        val end = runCatching { LocalDate.parse(t.text("end")) }.getOrNull() ?: start
        UxGanttTask(
            title = t.text("title", t.text("id")),
            startDay = minOf(start.toEpochDays(), end.toEpochDays()),
            endDay = maxOf(start.toEpochDays(), end.toEpochDays()),
            progress = (t.dbl("progress") / 100.0).toFloat().coerceIn(0f, 1f),
            color = parseCssColor(t.text("color")),
        )
    }
    if (tasks.isEmpty()) return

    // One day of padding at the start, two at the end, so bars never touch the frame edges.
    val minDay = tasks.minOf { it.startDay } - 1
    val maxDay = tasks.maxOf { it.endDay } + 2
    val span = (maxDay - minDay).coerceAtLeast(1)
    val today = Clock.System.todayIn(TimeZone.currentSystemDefault()).toEpochDays()
    val rowHeight = 34.dp

    Row(Modifier.fillMaxWidth().clip(uxShape).border(1.dp, palette.border, uxShape)) {
        // Labels column.
        Column(Modifier.width(170.dp)) {
            GanttCell(rowHeight, palette.headerBg, palette.border) {
                Text("Task", color = palette.secondary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
            tasks.forEach { task ->
                GanttCell(rowHeight, Color.Transparent, palette.border.copy(alpha = .6f)) {
                    Text(task.title, color = palette.text, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
        // Time axis.
        BoxWithConstraints(Modifier.weight(1f)) {
            val width = maxWidth
            Column(Modifier.fillMaxWidth()) {
                Row(Modifier.fillMaxWidth().height(rowHeight).background(palette.headerBg)) {
                    ganttMonths(minDay, maxDay).forEach { (label, days) ->
                        Box(Modifier.weight(days.toFloat()).fillMaxHeight()) {
                            Box(Modifier.width(1.dp).fillMaxHeight().background(palette.border.copy(alpha = .6f)))
                            Text(
                                label,
                                color = palette.secondary,
                                fontSize = 12.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Clip,
                                modifier = Modifier.align(Alignment.CenterStart).padding(start = 6.dp),
                            )
                        }
                    }
                }
                Box(Modifier.fillMaxWidth().height(1.dp).background(palette.border))
                tasks.forEach { task ->
                    Box(Modifier.fillMaxWidth().height(rowHeight)) {
                        if (today in minDay..maxDay) {
                            Box(
                                Modifier.padding(start = width * ((today - minDay).toFloat() / span))
                                    .width(2.dp)
                                    .fillMaxHeight()
                                    .background(uxError.copy(alpha = .55f)),
                            )
                        }
                        val startFrac = (task.startDay - minDay).toFloat() / span
                        val widthFrac = (task.endDay + 1 - task.startDay).toFloat() / span
                        Box(
                            Modifier.align(Alignment.CenterStart)
                                .padding(start = width * startFrac)
                                .width((width * widthFrac).coerceAtLeast(4.dp))
                                .height(18.dp)
                                .clip(RoundedCornerShape(9.dp))
                                .background(palette.bone),
                        ) {
                            Box(
                                Modifier.fillMaxHeight()
                                    .fillMaxWidth(task.progress)
                                    .background(task.color ?: uxAccent),
                            )
                        }
                    }
                    Box(Modifier.fillMaxWidth().height(1.dp).background(palette.border.copy(alpha = .6f)))
                }
            }
        }
    }
}
