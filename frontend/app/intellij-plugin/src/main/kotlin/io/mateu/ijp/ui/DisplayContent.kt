package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.intellij.ui.components.JBLabel
import com.intellij.util.ui.JBUI
import io.mateu.ijp.api.arr
import io.mateu.ijp.api.text
import java.awt.BorderLayout
import java.awt.Color
import java.awt.Dimension
import java.awt.FlowLayout
import java.awt.Font
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

/** Display components: content blocks (PricingTable, FeatureGrid, Testimonials, Faq, CalloutCard, CommentThread, FileList, Checklist) on Swing. */

/** PricingTable: a horizontal row of plan cards, the featured one ringed, with a CTA button. */
fun renderPricingTable(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val row = JPanel(FlowLayout(FlowLayout.LEFT, 12, 0))
    row.isOpaque = false
    for (plan in metadata.arr("plans")) {
        val featured = plan.path("featured").asBoolean(false)
        val card = verticalPanel(4)
        card.border =
            if (featured) JBUI.Borders.customLine(Color(0x1A, 0x73, 0xE8), 2)
            else JBUI.Borders.customLine(JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground(), 1)
        card.preferredSize = Dimension(190, card.preferredSize.height)
        if (featured) card.addStacked(JBLabel("RECOMMENDED").apply {
            foreground = Color(0x1A, 0x73, 0xE8)
            font = font.deriveFont(Font.BOLD, 10f)
        }, 2)
        card.addStacked(JBLabel(plan.text("name")).apply {
            foreground = ToneColors.secondaryText()
        }, 2)
        val price = plan.text("price") + plan.text("period").let { if (it.isNotBlank()) " $it" else "" }
        card.addStacked(JBLabel(price).apply { font = font.deriveFont(Font.BOLD, 22f) }, 4)
        for (feature in plan.arr("features")) {
            card.addStacked(JBLabel("✓ ${feature.asText()}"), 2)
        }
        val ctaLabel = plan.text("ctaLabel")
        val actionId = plan.text("actionId")
        if (ctaLabel.isNotBlank()) {
            card.addStacked(JButton(ctaLabel).apply {
                if (actionId.isNotBlank()) addActionListener { r.ctx.runAction(actionId, null) }
            }, 0)
        }
        row.add(card)
    }
    return row
}

/** FeatureGrid: a vertical list of feature cards (icon + title + description) on Swing. */
fun renderFeatureGrid(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(8)
    for (feature in metadata.arr("features")) {
        val card = verticalPanel(3)
        card.border = JBUI.Borders.compound(
            JBUI.Borders.customLine(JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground(), 1),
            JBUI.Borders.empty(10))
        val icon = feature.text("icon")
        val title = feature.text("title")
        card.addStacked(JBLabel((if (icon.isNotBlank() && !icon.contains(":")) "$icon " else "") + title).apply {
            font = font.deriveFont(Font.BOLD, 14f)
        }, 2)
        val desc = feature.text("description")
        if (desc.isNotBlank()) {
            card.addStacked(JBLabel(desc).apply { foreground = ToneColors.secondaryText() }, 0)
        }
        val actionId = feature.text("actionId")
        if (actionId.isNotBlank()) {
            card.activatable { r.ctx.runAction(actionId, null) }
        }
        panel.addStacked(card, 8)
    }
    return panel
}

/** Testimonials: a vertical list of quote cards (stars + quote + author) on Swing. */
fun renderTestimonials(metadata: JsonNode): JComponent {
    val panel = verticalPanel(8)
    for (item in metadata.arr("items")) {
        val card = verticalPanel(3)
        card.border = JBUI.Borders.compound(
            JBUI.Borders.customLine(JBUI.CurrentTheme.CustomFrameDecorations.separatorForeground(), 1),
            JBUI.Borders.empty(12))
        val rating = item.path("rating").asInt(0).coerceIn(0, 5)
        if (rating > 0) {
            card.addStacked(JBLabel("★".repeat(rating) + "☆".repeat(5 - rating)).apply {
                foreground = Color(0xF5, 0xA6, 0x23)
            }, 2)
        }
        card.addStacked(JBLabel("<html><i>“${item.text("quote")}”</i></html>"), 4)
        val avatar = item.text("avatar")
        val author = item.text("author") + item.text("role").let { if (it.isNotBlank()) " · $it" else "" }
        card.addStacked(JBLabel((if (avatar.isNotBlank() && !avatar.contains(":")) "$avatar " else "") + author).apply {
            foreground = ToneColors.secondaryText()
        }, 0)
        panel.addStacked(card, 8)
    }
    return panel
}

/** Faq: a list of question (bold) + answer rows on Swing. */
fun renderFaq(metadata: JsonNode): JComponent {
    val panel = verticalPanel(6)
    for (item in metadata.arr("items")) {
        val row = verticalPanel(2)
        row.border = JBUI.Borders.emptyBottom(6)
        row.addStacked(JBLabel(item.text("question")).apply { font = font.deriveFont(Font.BOLD) }, 2)
        row.addStacked(JBLabel("<html>${SafeHtml.sanitize(item.text("answer"))}</html>").apply {
            foreground = ToneColors.secondaryText()
        }, 0)
        panel.addStacked(row, 6)
    }
    return panel
}

/** CalloutCard: a themed call-to-action block (icon + title + description + CTA button) on Swing. */
fun renderCalloutCard(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val accent = when (metadata.text("theme")) {
        "success" -> Color(0x12, 0xB7, 0x6A)
        "warning" -> Color(0xF5, 0x9E, 0x0B)
        "danger" -> Color(0xE1, 0x1D, 0x48)
        else -> Color(0x1A, 0x73, 0xE8)
    }
    val body = verticalPanel(3)
    val icon = metadata.text("icon")
    val title = metadata.text("title")
    body.addStacked(JBLabel((if (icon.isNotBlank() && !icon.contains(":")) "$icon " else "") + title).apply {
        font = font.deriveFont(Font.BOLD, 15f)
    }, 2)
    val desc = metadata.text("description")
    if (desc.isNotBlank()) {
        body.addStacked(JBLabel("<html>${SafeHtml.sanitize(desc)}</html>").apply {
            foreground = ToneColors.secondaryText()
        }, 4)
    }
    val ctaLabel = metadata.text("ctaLabel")
    val actionId = metadata.text("actionId")
    if (ctaLabel.isNotBlank()) {
        body.addStacked(JButton(ctaLabel).apply {
            if (actionId.isNotBlank()) addActionListener { r.ctx.runAction(actionId, null) }
        }, 0)
    }
    val panel = JPanel(BorderLayout())
    panel.border = JBUI.Borders.compound(JBUI.Borders.customLine(accent, 0, 4, 0, 0), JBUI.Borders.empty(14))
    panel.background = Color(accent.red, accent.green, accent.blue, 24)
    panel.isOpaque = true
    panel.add(body, BorderLayout.CENTER)
    return panel
}

/** CommentThread: nested comments, replies indented under their parent, on Swing. */
fun renderCommentThread(metadata: JsonNode): JComponent {
    val panel = verticalPanel(6)
    for (comment in metadata.arr("comments")) commentNode(panel, comment, 0)
    return panel
}

private fun commentNode(panel: JPanel, comment: JsonNode, depth: Int) {
    val row = verticalPanel(2)
    row.border = JBUI.Borders.emptyLeft(depth * 16)
    val author = comment.text("author")
    val ts = comment.text("timestamp")
    row.addStacked(JBLabel(author + (if (ts.isNotBlank()) "  $ts" else "")).apply {
        font = font.deriveFont(Font.BOLD)
    }, 2)
    row.addStacked(JBLabel("<html>${SafeHtml.sanitize(comment.text("text"))}</html>"), 0)
    panel.addStacked(row, 6)
    for (reply in comment.arr("replies")) commentNode(panel, reply, depth + 1)
}

/** FileList: rows of type-icon + name + size on Swing. */
fun renderFileList(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val icons = mapOf(
        "pdf" to "📕", "image" to "🖼", "doc" to "📘", "docx" to "📘", "word" to "📘",
        "xls" to "📗", "xlsx" to "📗", "excel" to "📗", "zip" to "🗜", "video" to "🎬", "audio" to "🎵")
    val panel = verticalPanel(0)
    for (file in metadata.arr("files")) {
        val row = JPanel(BorderLayout(8, 0))
        row.border = JBUI.Borders.empty(6, 8)
        row.isOpaque = false
        val icon = icons[file.text("type").lowercase()] ?: "📄"
        row.add(JBLabel("$icon  ${file.text("name")}"), BorderLayout.WEST)
        val size = file.text("size")
        if (size.isNotBlank()) row.add(JBLabel(size).apply {
            foreground = ToneColors.secondaryText()
        }, BorderLayout.EAST)
        val actionId = file.text("actionId")
        if (actionId.isNotBlank()) {
            row.activatable { r.ctx.runAction(actionId, null) }
        }
        panel.addStacked(row, 0)
    }
    return panel
}

/** Checklist: a title + N/total count and a list of checkbox rows on Swing. */
fun renderChecklist(r: ComponentRenderer, metadata: JsonNode): JComponent {
    val panel = verticalPanel(3)
    val items = metadata.arr("items").toList()
    val done = items.count { it.path("done").asBoolean(false) }
    val title = metadata.text("title")
    panel.addStacked(JBLabel((if (title.isNotBlank()) "$title  " else "") + "($done / ${items.size})").apply {
        font = font.deriveFont(Font.BOLD)
    }, 6)
    for (item in items) {
        val isDone = item.path("done").asBoolean(false)
        val box = if (isDone) "☑" else "☐"
        val row = JBLabel("$box  ${item.text("label")}")
        if (isDone) row.foreground = ToneColors.secondaryText()
        val actionId = item.text("actionId")
        if (actionId.isNotBlank()) {
            row.activatable { r.ctx.runAction(actionId, null) }
        }
        panel.addStacked(row, 3)
    }
    return panel
}
