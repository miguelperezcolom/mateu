package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper

/**
 * How a `richText` field's stored value is read — a port of libs/mateu's `richTextValue.ts` (and
 * React Native's). The value is HTML; values written by the old web editor are Quill Delta JSON
 * (`[{"insert":"…"}]` or `{"ops":[…]}`), recognised and turned into the equivalent HTML so existing
 * data opens as text instead of raw JSON (and is saved as HTML on the next edit). Pure.
 */
object RichTextValue {
    private val mapper = ObjectMapper()

    private fun deltaOps(value: String?): List<JsonNode>? {
        val raw = value?.trim().orEmpty()
        if (!raw.startsWith("[") && !raw.startsWith("{")) return null
        val parsed = runCatching { mapper.readTree(raw) }.getOrNull() ?: return null
        val ops = when {
            parsed.isArray -> parsed
            parsed.path("ops").isArray -> parsed.path("ops")
            else -> return null
        }
        val list = ops.toList()
        return if (list.isNotEmpty() && list.all { it.isObject && it.has("insert") }) list else null
    }

    private fun escape(t: String) = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")

    private fun safeHref(link: JsonNode): String? {
        if (!link.isTextual || link.asText().isBlank()) return null
        val l = link.asText().trim()
        if (Regex("^(https?:|mailto:)", RegexOption.IGNORE_CASE).containsMatchIn(l)) return l
        return if (Regex("^[a-z][a-z0-9+.-]*:", RegexOption.IGNORE_CASE).containsMatchIn(l)) null else l
    }

    private fun inline(text: String, a: JsonNode): String {
        var out = escape(text)
        if (a.path("code").asBoolean(false)) out = "<code>$out</code>"
        if (a.path("bold").asBoolean(false)) out = "<strong>$out</strong>"
        if (a.path("italic").asBoolean(false)) out = "<em>$out</em>"
        if (a.path("underline").asBoolean(false)) out = "<u>$out</u>"
        if (a.path("strike").asBoolean(false)) out = "<s>$out</s>"
        safeHref(a.path("link"))?.let { out = "<a href=\"${escape(it)}\">$out</a>" }
        return out
    }

    private fun deltaToHtml(ops: List<JsonNode>): String {
        data class Line(val html: String, val attrs: JsonNode)
        val lines = ArrayList<Line>()
        var current = StringBuilder()
        for (op in ops) {
            val insert = op.path("insert")
            if (!insert.isTextual) continue // embeds are not carried over
            val attrs = op.path("attributes")
            val parts = insert.asText().split("\n")
            parts.forEachIndexed { i, part ->
                if (part.isNotEmpty()) current.append(inline(part, attrs))
                if (i < parts.size - 1) {
                    lines.add(Line(current.toString(), attrs))
                    current = StringBuilder()
                }
            }
        }
        if (current.isNotEmpty()) lines.add(Line(current.toString(), mapper.createObjectNode()))
        val out = StringBuilder()
        var listTag: String? = null
        val items = ArrayList<String>()
        fun flush() {
            if (listTag != null) out.append("<$listTag>").append(items.joinToString("") { "<li>$it</li>" }).append("</$listTag>")
            listTag = null
            items.clear()
        }
        for (line in lines) {
            val a = line.attrs
            val tag = when (a.path("list").asText("")) { "ordered" -> "ol"; "bullet" -> "ul"; else -> null }
            if (tag != null) {
                if (listTag != tag) { flush(); listTag = tag }
                items.add(line.html)
                continue
            }
            flush()
            val level = a.path("header").asInt(0)
            when {
                level in 1..6 -> out.append("<h$level>${line.html}</h$level>")
                a.path("blockquote").asBoolean(false) -> out.append("<blockquote>${line.html}</blockquote>")
                a.path("code-block").asBoolean(false) -> out.append("<pre><code>${line.html}</code></pre>")
                else -> out.append("<p>${line.html}</p>")
            }
        }
        flush()
        return out.toString()
    }

    /** The HTML to open a stored value with: the value itself, or its Delta converted. */
    fun html(value: String?): String = deltaOps(value)?.let { deltaToHtml(it) } ?: (value ?: "")
}
