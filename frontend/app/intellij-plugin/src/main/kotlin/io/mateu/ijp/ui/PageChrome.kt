package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.bool
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.Expressions
import java.awt.FlowLayout
import java.awt.Font
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * What every page shares on the desktop — the header (overline, title, subtitle, badges, KPIs,
 * toolbar, banners), the gutter around a page's content, the type scale and the `${…}` context.
 *
 * Before this, the header existed only in the Page renderer: a YAML `Form` (every Star Wars and
 * museum record page) showed its title as the raw template `${state.name}` and dropped its toolbar,
 * so a record could not be edited nor left from the page.
 */
object PageChrome {

    /** The page gutter, in unscaled px (the IntelliJ guidelines' dialog/content inset). */
    const val GUTTER = 16

    /** The platform label size the design sizes below are written against (13px on every OS). */
    private const val BASE_LABEL_PX = 13f

    /**
     * A font size written for a 13px label, scaled like the IDE's own label: it follows the IDE zoom
     * AND the user's font size. A bare `deriveFont(20f)` is unscaled — at 200% (HiDPI without the
     * system scale) or with a bigger UI font, every title came out smaller than the body text.
     */
    fun fontSize(px: Float, labelSize: Float = JBUI.Fonts.label().size2D): Float = px * labelSize / BASE_LABEL_PX

    fun sized(font: Font, px: Float, style: Int = font.style): Font = font.deriveFont(style, fontSize(px))

    /** The title of a page (h1 of the content area). */
    fun titleFont(base: Font): Font = sized(base, 20f, Font.BOLD)

    /**
     * Whether a server-side component is a whole PAGE whose root brings no gutter of its own: a
     * composed archetype (wizard, dashboard, welcome, item overview…) whose root is a plain layout.
     * The server stamps `pageType` on a page's envelope only (an island inside a page has none); a
     * Page, a Crud, an App (mediator) and a Form pad themselves.
     */
    fun padsAsPage(serverSide: JsonNode): Boolean {
        if (serverSide.text("pageType").isBlank()) return false
        val first = serverSide.path("children").path(0)
        if (first.isMissingNode || first.text("type") != "ClientSide") return false
        return first.path("metadata").text("type") !in setOf("Page", "App", "Crud", "Form")
    }

    /**
     * The `${…}` context a component's texts are interpolated against: the component's own state
     * when it carries one, else the screen's live state, plus its data and the app state.
     */
    fun exprContext(ctx: AppContext, state: JsonNode?, data: JsonNode? = null): Map<String, Any?> = mapOf(
        "state" to (if (state != null && state.isObject && state.size() > 0) state else ctx.currentComponentState),
        "data" to (data ?: ctx.mapper.createObjectNode()),
        "appState" to ctx.appState,
    )

    /** [metadata] with the text [keys] interpolated (a copy; the wire node is left untouched). */
    fun interpolated(metadata: JsonNode, keys: Collection<String>, exprCtx: Map<String, Any?>): JsonNode {
        if (metadata !is ObjectNode || keys.none { metadata.path(it).isTextual && metadata.path(it).asText().contains("\${") }) {
            return metadata
        }
        val copy = metadata.deepCopy()
        for (k in keys) {
            val v = copy.path(k)
            if (v.isTextual && v.asText().contains("\${")) copy.put(k, Expressions.interpolate(v.asText(), exprCtx))
        }
        return copy
    }

    /**
     * The page header: overline, title (+ record switcher), subtitle, timestamp, peer navigation,
     * header badges, KPIs, toolbar (published to the host's native toolbar when there is one), FABs
     * and banners. Null when the metadata declares none of them.
     */
    fun header(r: ComponentRenderer, metadata: JsonNode, exprCtx: Map<String, Any?>): JComponent? {
        val header = verticalPanel(4)
        val title = Expressions.interpolate(metadata.text("title", metadata.text("pageTitle")), exprCtx)
        val switcher = PageSlots.switcherOf(metadata)
        val overline = Expressions.interpolate(metadata.text("overline"), exprCtx)
        if (overline.isNotBlank()) {
            header.addStacked(JBLabel(plain(overline.uppercase())).apply {
                foreground = ToneColors.secondaryText()
                font = font.deriveFont(font.size2D * 0.85f)
            }, 2)
        }
        // While there is no title yet, the placeholder stands in its place, dimmed (PageDto.titlePlaceholder).
        val placeholder = metadata.text("titlePlaceholder")
        if (title.isBlank() && placeholder.isNotBlank()) {
            header.addStacked(JBLabel(plain(placeholder)).apply {
                font = titleFont(font)
                foreground = ToneColors.secondaryText()
            }, 4)
        }
        if (title.isNotBlank() || switcher != null) {
            val titleRow = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(12), 0))
            titleRow.isOpaque = false
            if (title.isNotBlank()) {
                val l = JBLabel(plain(title))
                l.font = titleFont(l.font)
                // the page's heading: a screen reader's heading navigation lands on it
                l.accessibleContext.accessibleName = title
                titleRow.add(l)
            }
            if (switcher != null) titleRow.add(renderRecordSwitcher(r, switcher))
            header.addStacked(titleRow, 4)
        }
        val subtitle = Expressions.interpolate(metadata.text("subtitle"), exprCtx)
        if (subtitle.isNotBlank()) {
            header.addStacked(JBLabel(plain(subtitle)).apply { foreground = ToneColors.secondaryText() }, 8)
        }
        // "Last updated …" under the subtitle (PageDto.timestamp).
        val timestamp = metadata.text("timestamp")
        if (timestamp.isNotBlank()) {
            header.addStacked(JBLabel(plain(timestamp)).apply { foreground = ToneColors.secondaryText() }, 6)
        }
        // Previous / next record (PageDto.peerNav): a side without a route is disabled.
        val peerNav = metadata.path("peerNav")
        if (peerNav.isObject) {
            val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(8), 0))
            row.isOpaque = false
            for ((labelKey, routeKey, previous) in listOf(Triple("prevLabel", "prevRoute", true), Triple("nextLabel", "nextRoute", false))) {
                val label = peerNav.text(labelKey)
                val route = peerNav.text(routeKey)
                if (label.isBlank() && route.isBlank()) continue
                val button = javax.swing.JButton(plain(if (previous) "‹ $label" else "$label ›"))
                button.isEnabled = route.isNotBlank()
                button.accessibleContext.accessibleName = (if (previous) "Previous: " else "Next: ") + label
                button.addActionListener { r.ctx.openRoute(route) }
                row.add(button)
            }
            if (row.componentCount > 0) header.addStacked(row, 8)
        }
        // @BadgeInHeader chips + KPI band under the title.
        val badges = metadata.arr("badges")
        if (badges.isNotEmpty()) {
            val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(6), 0))
            row.isOpaque = false
            for (b in badges) row.add(headerBadge(b, exprCtx))
            header.addStacked(row, 6)
        }
        val kpis = metadata.arr("kpis")
        if (kpis.isNotEmpty()) {
            val row = JPanel(FlowLayout(FlowLayout.LEFT, JBUI.scale(18), 0))
            row.isOpaque = false
            for (k in kpis) {
                val cell = verticalPanel(0)
                val value = JBLabel(plain(Expressions.interpolate(k.text("text"), exprCtx)))
                value.font = sized(value.font, 18f, Font.BOLD)
                cell.addStacked(value, 0)
                cell.addStacked(JBLabel(plain(Expressions.interpolate(k.text("title"), exprCtx))).apply {
                    foreground = ToneColors.secondaryText()
                }, 0)
                row.add(cell)
            }
            header.addStacked(row, 8)
        }
        // Toolbar actions go to the native host toolbar (editor header / tool window title) when the
        // host provides one — the IntelliJ-idiomatic spot; otherwise the inline button row.
        val toolbar = metadata.arr("toolbar")
        if (toolbar.isNotEmpty() && !r.ctx.publishToolbar(toolbar)) header.addStacked(buttonRow(r, toolbar), 8)
        // @Fab actions surface as header buttons — the desktop has no floating layer over the editor.
        val fabs = metadata.arr("fabs")
        if (fabs.isNotEmpty()) header.addStacked(buttonRow(r, fabs), 8)
        for (banner in metadata.arr("banners")) header.addStacked(renderBanner(banner), 8)
        // Action-returned banners (UIIncrementDto.banners) render after the static ones.
        for (banner in r.ctx.actionBanners) header.addStacked(renderBanner(banner), 8)
        return if (header.componentCount > 0) header else null
    }

    /** Whether a page template owns the header (Form.noHeader — the Welcome page's hero, …). */
    fun ownsNoHeader(metadata: JsonNode) = metadata.bool("noHeader")
}
