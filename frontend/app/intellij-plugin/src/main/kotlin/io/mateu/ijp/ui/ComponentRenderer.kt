package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.panels.VerticalLayout
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
import java.awt.Font
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Central component dispatcher — Swing/IntelliJ-Platform port of the JavaFX `ComponentRenderer`.
 * Renders a node by `type` (ClientSide / ServerSide) and, for ClientSide, by `metadata.type`,
 * returning a [JComponent]. Recursion goes back through [render].
 */
class ComponentRenderer(val ctx: AppContext) {

    fun render(component: JsonNode?, state: JsonNode, data: JsonNode): JComponent {
        if (component == null || component.isNull || component.isMissingNode) return JPanel()
        val widget = when (component.text("type", "ClientSide")) {
            "ClientSide" -> renderClientSide(component, state, data)
            "ServerSide" -> ctx.loadServerSideComponent(component)
            else -> JBLabel(plain("Unknown component type: ${component.text("type")}"))
        }
        // Tag the widget with the wire component it rendered, so the visual-builder preview can map a
        // drop back to its YAML source (see DropTargeting). Unused/harmless outside the builder.
        widget.putClientProperty(io.mateu.ijp.contract.DropTargeting.WIRE_KEY, component)
        return widget
    }

    private fun renderClientSide(component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
        val raw = component.path("metadata")
        // `${state.x}` in a component's texts (a record page's "Image: ${state.imageCredit}", an
        // avatar's `${state.image}`) reached the screen as typed: only the Page and field labels
        // were interpolated. The web interpolates these same keys.
        val metadata = INTERPOLATED_KEYS[raw.text("type")]
            ?.let { keys -> PageChrome.interpolated(raw, keys, PageChrome.exprContext(ctx, state, data)) }
            ?: raw
        return when (metadata.text("type")) {
            "App" -> renderApp(this, component, metadata)
            "Page" -> renderPage(this, component, metadata, state, data)
            "Form" -> { updateContext(component); renderForm(this, component, metadata, state, data) }
            "Crud" -> { updateContext(component); renderCrud(this, component, metadata, state, data) }
            "FormField" -> renderFormField(ctx, metadata, state, data)
            "CustomField" -> renderCustomField(this, component, metadata, state, data)
            "FormLayout" -> renderFormLayout(this, component, metadata, state, data)
            "VerticalLayout", "Scroller", "FullWidth", "Container", "Div" ->
                renderVBox(this, component, metadata, state, data)
            "FormRow" -> renderFormRow(this, component, metadata, state, data)
            "HorizontalLayout" -> renderHBox(this, component, metadata, state, data)
            "Button" -> renderButton(ctx, metadata)
            "ActionPanel" -> renderActionPanel(ctx, metadata)
            "RecordMerge" -> renderRecordMerge(ctx, metadata)
            "MatrixGrid" -> renderMatrixGrid(ctx, metadata)
            "Map" -> renderMap(ctx, metadata)
            // A long paragraph WRAPS to its column (a one-line label cut "…link the museum's own image
            // URLs — never" mid-sentence at the card's edge); headings and short texts stay labels.
            "Text" -> if (wrapsAsParagraph(metadata)) paragraph(metadata.text("text"), metadata.text("size")) else
                JBLabel(plain(metadata.text("text"))).also { label ->
                // IJ-11: a Text in an h1–h6 container is a HEADING (a wizard's title arrives as an
                // h2) — it rendered as body text. Bold and sized on the platform's title scale.
                headingScale(metadata.text("container"))?.let { scale ->
                    label.font = label.font.deriveFont(Font.BOLD, label.font.size2D * scale)
                }
                // Text size: xl/l/s/xs enlarge or reduce the font; m (or absent) applies nothing.
                when (metadata.text("size")) {
                    "xl" -> label.font = label.font.deriveFont(label.font.size2D * 1.5f)
                    "l" -> label.font = label.font.deriveFont(label.font.size2D * 1.25f)
                    "s" -> label.font = label.font.deriveFont(label.font.size2D * 0.875f)
                    "xs" -> label.font = label.font.deriveFont(label.font.size2D * 0.78f)
                }
                // variants: b = bold, i = italic (on top of a heading's own bold)
                val emphasis = textEmphasis(metadata.get("variants"))
                if (emphasis != Font.PLAIN) label.font = label.font.deriveFont(label.font.style or emphasis)
            }
            // A horizontal divider line (<hr>) separating contents inside a section or form.
            "Separator" -> javax.swing.JSeparator()
            "FormSection" -> renderSection(this, component, metadata, state, data)
            "FormSubSection" -> renderSubSection(this, component, metadata, state, data)
            "Card" -> renderCard(this, component, metadata, state, data)
            "TabLayout" -> renderTabs(this, component, state, data)
            "AccordionLayout" -> renderAccordion(this, component, state, data)
            "SplitLayout" -> renderSplit(this, component, state, data)
            "Badge" -> renderBadge(metadata)
            "Anchor" -> renderAnchor(ctx, metadata)
            "ProgressBar" -> renderProgressBar(metadata, state)
            "DashboardLayout" -> renderDashboardLayout(this, component, metadata, state, data)
            "Scoreboard" -> renderScoreboard(this, component, state, data)
            "MetricCard" -> renderMetricCard(this, metadata)
            "DashboardPanel" -> renderDashboardPanel(this, component, metadata, state, data)
            "Chart" -> renderChart(metadata)
            "Markdown" -> renderMarkdown(metadata)
            "HeroSection" -> renderHeroSection(this, component, metadata, state, data)
            "EmptyState" -> renderEmptyState(this, metadata)
            "Skeleton" -> renderSkeleton(metadata)
            "FoldoutLayout" -> renderFoldout(this, component, metadata, state, data)
            "Gantt" -> renderGantt(metadata, ctx)
            "PlanningBoard" -> renderPlanningBoard(this, metadata)
            "Kanban" -> renderKanban(this, metadata, component.text("id"))
            "Timeline" -> renderTimeline(this, metadata)
            "ProgressSteps" -> renderProgressSteps(metadata)
            "Stat" -> renderStat(this, metadata)
            "Calendar" -> renderCalendar(ctx, metadata)
            "PricingTable" -> renderPricingTable(this, metadata)
            "OrgChart" -> renderOrgChart(this, metadata)
            "Heatmap" -> renderHeatmap(metadata)
            "Funnel" -> renderFunnel(metadata)
            "TrendChart" -> renderTrendChart(metadata)
            "FeatureGrid" -> renderFeatureGrid(this, metadata)
            "Testimonials" -> renderTestimonials(metadata)
            "Faq" -> renderFaq(metadata)
            "CalloutCard" -> renderCalloutCard(this, metadata)
            "CommentThread" -> renderCommentThread(metadata)
            "FileList" -> renderFileList(this, metadata)
            "Checklist" -> renderChecklist(this, metadata)
            "ComparisonCard" -> renderComparisonCard(metadata)
            "EntityHeader" -> renderEntityHeader(this, metadata)
            "Meter" -> renderMeter(metadata)
            "TaskProgress" -> renderTaskProgress(this, metadata)
            "StatusList" -> renderStatusList(this, metadata)
            "BulletedList" -> renderBulletedList(metadata)
            "Notice" -> renderNotice(this, component, metadata, state, data)
            // DropZone: a titled panel accepting drops of dragged listing rows of its type.
            "DropZone" -> renderDropZone(this, component, metadata, state, data)
            // Popover: click (default) or hover/focus opens the content under the wrapped component.
            "Popover" -> renderPopover(this, metadata, state, data)
            "TaskQueue" -> renderTaskQueue(this, metadata)
            "ResourceGrid" -> renderResourceGrid(this, metadata)
            "OfferCard" -> renderOfferCard(this, metadata)
            "AddOnPicker" -> renderAddOnPicker(this, metadata)
            "Ledger" -> renderLedger(metadata)
            "PaymentPicker" -> renderPaymentPicker(this, metadata)
            "ProcessMonitor" -> renderProcessMonitor(this, metadata)
            "Image" -> renderStandaloneImage(metadata)
            // ── layouts ──
            "MasterDetailLayout" -> renderMasterDetail(this, component, state, data)
            "CarouselLayout" -> renderCarousel(this, component, metadata, state, data)
            "BoardLayout", "BoardLayoutRow", "BoardLayoutItem" -> renderBoard(this, component, metadata, state, data)
            "ContentLayout" -> renderContentLayout(this, component, metadata, state, data)
            "ResponsiveGrid" -> renderResponsiveGrid(this, component, metadata, state, data)
            "FormItem" -> renderFormItem(this, component, state, data)
            // A Tab / AccordionPanel outside its TabLayout / AccordionLayout; a bare Stepper groups its children.
            "Tab", "AccordionPanel" -> renderTitledChildren(this, component, metadata, state, data)
            "Stepper" -> renderChildren(component, state, data)
            // ── navigation ──
            "Breadcrumbs", "Breadcrumb" -> renderBreadcrumbs(ctx, metadata)
            "MenuBar" -> renderMenuBar(ctx, metadata)
            "ContextMenu" -> renderContextMenu(this, metadata, state, data)
            "Directory" -> renderDirectory(ctx, metadata)
            // ── display ──
            "Grid" -> renderGrid(this, component, metadata, state, data)
            // A GridColumn outside its Grid: just its header text.
            "GridColumn" -> JBLabel(plain(metadata.text("label", metadata.text("id"))))
            // A column group outside its Grid/Crud: its header text (inside one it is flattened).
            "GridGroupColumn" -> JBLabel(plain(metadata.text("label", metadata.text("id"))))
            "VirtualList" -> renderVirtualList(component, metadata, state, data)
            "Avatar" -> renderAvatar(metadata)
            "AvatarGroup" -> renderAvatarGroup(metadata)
            "Icon" -> renderIcon(metadata)
            "Details" -> renderDetails(this, metadata, state, data)
            "Tooltip" -> renderTooltip(this, metadata, state, data)
            "Notification" -> renderNotification(metadata)
            "Result" -> renderResult(ctx, metadata)
            "NotFound" -> renderNotFound(ctx, metadata)
            "CookieConsent" -> renderCookieConsent(metadata)
            "Element" -> renderElement(ctx, metadata)
            "Bpmn" -> renderBpmn(metadata)
            "Workflow" -> renderSourceView("Workflow", metadata.text("value"))
            "FormEditor" -> renderSourceView("Form definition", metadata.text("value"))
            // ── conversation ──
            "Chat" -> renderChat(ctx, metadata)
            "MessageList" -> renderMessageList(metadata)
            "MessageInput" -> renderMessageInput(ctx, metadata)
            // ── overlays met inline, islands ──
            "Dialog", "Drawer" -> renderInlineOverlay(ctx, component, state, data)
            "ConfirmDialog" -> renderConfirmDialog(this, component, metadata, state, data)
            "MicroFrontend" -> renderMicroFrontend(ctx, metadata)
            "CustomComponent" -> {
                // The per-renderer escape hatch (#14): a registered renderer paints it; otherwise
                // degrade to a visible placeholder that still shows the slotted children.
                val name = metadata.text("name")
                val kids = renderChildren(component, state, data)
                CustomComponentRegistry.resolve(name)?.invoke(metadata, kids)
                    ?: JPanel(VerticalLayout(JBGap)).also { panel ->
                        panel.add(JBLabel(plain("Custom component \"$name\" is not registered on this renderer")))
                        panel.add(kids)
                    }
            }
            else -> {
                val t = metadata.text("type")
                if (t.isNotBlank()) JBLabel(plain("Unsupported component: $t"))
                else renderChildren(component, state, data)
            }
        }
    }

    private fun updateContext(component: JsonNode) {
        val id = component.text("id")
        if (id.isNotBlank()) ctx.currentComponentId = id
    }

    /** Render the `children` array as a vertical stack (fallback / generic container). */
    fun renderChildren(component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
        val panel = JPanel(VerticalLayout(JBGap))
        val children = component.path("children")
        if (children.isArray) for (child in children) panel.add(render(child, state, data))
        return panel
    }
}

/** Past this many characters a body Text wraps instead of running past its column. */
internal const val PARAGRAPH_CHARS = 90

/** Whether a Text is a body paragraph long enough to wrap (never a heading). */
internal fun wrapsAsParagraph(metadata: JsonNode): Boolean =
    headingScale(metadata.text("container")) == null && metadata.text("text").length > PARAGRAPH_CHARS

/** Read-only text that wraps at its container's width, in the label's font and colour. */
/** Before a wrapping text has a width of its own, it is measured for a column this wide. */
internal const val ASSUMED_COLUMN_PX = 360

/**
 * The preferred size of a text that wraps: at most its current width (an assumed column while it has
 * none yet), with the height its text needs there. A stacked panel freezes a child's height when the
 * child is added — before any width exists — so measuring the UNWRAPPED line there left one line of
 * room and the rest of the paragraph was cut; measured for a column, it stays visible.
 */
internal fun wrappedPreferredSize(c: JComponent, natural: () -> java.awt.Dimension): java.awt.Dimension {
    val unwrapped = natural()
    val w = if (c.width > 0) c.width else com.intellij.util.ui.JBUI.scale(ASSUMED_COLUMN_PX)
    if (unwrapped.width <= w) return unwrapped
    val keep = c.size
    c.setSize(w, Short.MAX_VALUE.toInt())
    val wrapped = natural()
    if (keep.width > 0) c.size = keep
    return java.awt.Dimension(w, wrapped.height)
}

internal fun paragraph(text: String, size: String = ""): JComponent = object : com.intellij.ui.components.JBTextArea(text) {
    override fun getPreferredSize(): java.awt.Dimension = wrappedPreferredSize(this) { super.getPreferredSize() }
}.apply {
    isEditable = false
    isOpaque = false
    lineWrap = true
    wrapStyleWord = true
    border = com.intellij.util.ui.JBUI.Borders.empty()
    font = com.intellij.util.ui.JBUI.Fonts.label().let { f ->
        when (size) {
            "xl" -> f.deriveFont(f.size2D * 1.5f)
            "l" -> f.deriveFont(f.size2D * 1.25f)
            "s" -> f.deriveFont(f.size2D * 0.875f)
            "xs" -> f.deriveFont(f.size2D * 0.78f)
            else -> f
        }
    }
    foreground = com.intellij.util.ui.UIUtil.getLabelForeground()
    accessibleContext.accessibleName = text
}

/** Per component type, the metadata texts that may carry `${…}` and are interpolated before rendering. */
internal val INTERPOLATED_KEYS: Map<String, List<String>> = mapOf(
    "Text" to listOf("text"),
    "Image" to listOf("src", "alt"),
    "Avatar" to listOf("name", "image"),
    "Markdown" to listOf("markdown"),
    "Badge" to listOf("text"),
    "Anchor" to listOf("text", "url"),
    "Notice" to listOf("text"),
)

/** Font scale of a heading container (h1 → 1.6 … h6 → 1.0), or null when it is not a heading. */
internal fun headingScale(container: String): Float? = when (container.trim().lowercase()) {
    "h1" -> 1.6f
    "h2" -> 1.4f
    "h3" -> 1.25f
    "h4" -> 1.15f
    "h5" -> 1.05f
    "h6" -> 1.0f
    else -> null
}

/** A Text's wire `variants` as a font style mask: b → BOLD, i → ITALIC, none → PLAIN. */
internal fun textEmphasis(variants: com.fasterxml.jackson.databind.JsonNode?): Int {
    val names = variants?.takeIf { it.isArray }?.map { it.asText() }.orEmpty()
    return (if ("b" in names) Font.BOLD else 0) or (if ("i" in names) Font.ITALIC else 0)
}
