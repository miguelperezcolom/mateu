package io.mateu.ijp.chat

import io.mateu.ijp.ui.SafeHtml

/**
 * The agent's answer (markdown) as the small HTML a Swing JEditorPane renders: headings, bullet and
 * numbered lists, fenced code, inline code, bold/italic and links. Everything is ESCAPED first — an
 * answer must not fetch images, render forms or run anything — and only links the browser may open
 * (http(s)/mailto) or app routes ("/orders/4") become anchors.
 */
object ChatMarkdown {
    fun toHtml(md: String): String {
        val sb = StringBuilder()
        var list: String? = null
        var inCode = false
        fun closeList() {
            list?.let { sb.append("</").append(it).append(">") }
            list = null
        }
        for (raw in md.replace("\r\n", "\n").split("\n")) {
            if (raw.trimStart().startsWith("```")) {
                if (inCode) {
                    sb.append("</pre>")
                    inCode = false
                } else {
                    closeList()
                    sb.append("<pre>")
                    inCode = true
                }
                continue
            }
            if (inCode) {
                sb.append(SafeHtml.escape(raw)).append("\n")
                continue
            }
            val heading = Regex("^(#{1,6})\\s+(.*)$").find(raw)
            val bullet = Regex("^\\s*[-*•]\\s+(.*)$").find(raw)
            val numbered = Regex("^\\s*\\d+[.)]\\s+(.*)$").find(raw)
            when {
                heading != null -> {
                    closeList()
                    val level = (heading.groupValues[1].length + 1).coerceAtMost(6)
                    sb.append("<h$level>").append(inline(heading.groupValues[2])).append("</h$level>")
                }
                bullet != null -> {
                    if (list != "ul") { closeList(); sb.append("<ul>"); list = "ul" }
                    sb.append("<li>").append(inline(bullet.groupValues[1])).append("</li>")
                }
                numbered != null -> {
                    if (list != "ol") { closeList(); sb.append("<ol>"); list = "ol" }
                    sb.append("<li>").append(inline(numbered.groupValues[1])).append("</li>")
                }
                raw.isBlank() -> {
                    closeList()
                    sb.append("<br>")
                }
                else -> {
                    closeList()
                    // indentation survives (a pasted table, an aligned listing)
                    val indent = raw.length - raw.trimStart().length
                    sb.append("&nbsp;".repeat(indent)).append(inline(raw.trimStart())).append("<br>")
                }
            }
        }
        closeList()
        if (inCode) sb.append("</pre>")
        return sb.toString()
    }

    /** Bold, italics, inline code and links inside one (already split) line. */
    fun inline(text: String): String {
        val codes = ArrayList<String>()
        // inline code first, kept out of the other rules
        var s = Regex("`([^`]+)`").replace(text) { m ->
            codes.add("<code>" + SafeHtml.escape(m.groupValues[1]) + "</code>")
            "\u0000${codes.size - 1}\u0000"
        }
        s = SafeHtml.escape(s)
        s = Regex("\\[([^\\]]+)]\\(([^)\\s]+)\\)").replace(s) { m ->
            val href = m.groupValues[2]
            if (linkable(href)) "<a href=\"$href\">${m.groupValues[1]}</a>" else m.groupValues[1]
        }
        s = s.replace(Regex("\\*\\*([^*]+)\\*\\*"), "<b>$1</b>")
        s = s.replace(Regex("(?<![*\\w])\\*([^*]+)\\*(?![*\\w])"), "<i>$1</i>")
        s = s.replace(Regex("\u0000(\\d+)\u0000")) { codes[it.groupValues[1].toInt()] }
        return s
    }

    /** An app route ("/orders/4") or a url the browser may open. */
    fun linkable(href: String): Boolean {
        val decoded = href.replace("&amp;", "&")
        return isAppRoute(decoded) || SafeHtml.browsableUrl(decoded) != null
    }

    fun isAppRoute(href: String): Boolean = href.startsWith("/") && !href.startsWith("//")
}
