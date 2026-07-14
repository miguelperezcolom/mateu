package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.panels.VerticalLayout
import io.mateu.ijp.api.text
import io.mateu.ijp.state.AppContext
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
        return when (component.text("type", "ClientSide")) {
            "ClientSide" -> renderClientSide(component, state, data)
            "ServerSide" -> ctx.loadServerSideComponent(component)
            else -> JBLabel("Unknown component type: ${component.text("type")}")
        }
    }

    private fun renderClientSide(component: JsonNode, state: JsonNode, data: JsonNode): JComponent {
        val metadata = component.path("metadata")
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
            "Text" -> JBLabel(metadata.text("text"))
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
            "Gantt" -> renderGantt(metadata)
            "Kanban" -> renderKanban(this, metadata)
            "Timeline" -> renderTimeline(this, metadata)
            "ProgressSteps" -> renderProgressSteps(metadata)
            "Stat" -> renderStat(this, metadata)
            "Calendar" -> renderCalendar(this, metadata)
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
            "EntityHeader" -> renderEntityHeader(metadata)
            "Meter" -> renderMeter(metadata)
            "TaskProgress" -> renderTaskProgress(this, metadata)
            "StatusList" -> renderStatusList(this, metadata)
            "TaskQueue" -> renderTaskQueue(this, metadata)
            "ResourceGrid" -> renderResourceGrid(this, metadata)
            "OfferCard" -> renderOfferCard(this, metadata)
            "AddOnPicker" -> renderAddOnPicker(this, metadata)
            "Ledger" -> renderLedger(metadata)
            "PaymentPicker" -> renderPaymentPicker(this, metadata)
            "ProcessMonitor" -> renderProcessMonitor(this, metadata)
            "Image" -> renderStandaloneImage(metadata)
            else -> {
                val t = metadata.text("type")
                if (t.isNotBlank()) JBLabel("Unsupported component: $t")
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
