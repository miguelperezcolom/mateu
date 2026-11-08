package io.mateu.ijp.ui

/**
 * The markdown a Mateu `Markdown` component carries → the HTML subset Swing's HTML kit paints.
 *
 * It used to know bullets, bold and italics only, so the foldout's payment and invoice tables came
 * out as raw `| Date | Concept |` pipes and the item overview's `### Ergonomic chair` kept its
 * hashes. Now: ATX headings, pipe tables (header row + `---` separator), bulleted and numbered
 * lists, `inline code`, `[links](url)` (http(s)/mailto only — anything else stays text), bold and
 * italics. Everything typed is escaped first: data can never inject markup.
 */
object MarkdownHtml {

    private val HEADING = Regex("""^(#{1,6})\s+(.*)$""")
    private val NUMBERED = Regex("""^\d+[.)]\s+(.*)$""")
    private val TABLE_SEPARATOR = Regex("""^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$""")
    private val LINK = Regex("""\[([^\]]+)]\(([^)\s]+)\)""")

    fun toHtml(md: String): String {
        val sb = StringBuilder("<html><body>")
        val lines = md.lines()
        var list: String? = null // "ul" | "ol" while one is open
        fun closeList() {
            list?.let { sb.append("</").append(it).append(">") }
            list = null
        }
        var i = 0
        while (i < lines.size) {
            val line = lines[i].trim()
            // a pipe table: a row, then the separator row
            if (line.startsWith("|") && i + 1 < lines.size && TABLE_SEPARATOR.matches(lines[i + 1].trim())) {
                closeList()
                sb.append("<table cellspacing='0' cellpadding='3'><tr>")
                for (cell in cells(line)) sb.append("<th align='left'>").append(inline(cell)).append("</th>")
                sb.append("</tr>")
                i += 2
                while (i < lines.size && lines[i].trim().startsWith("|")) {
                    sb.append("<tr>")
                    for (cell in cells(lines[i].trim())) sb.append("<td>").append(inline(cell)).append("</td>")
                    sb.append("</tr>")
                    i++
                }
                sb.append("</table>")
                continue
            }
            val heading = HEADING.matchEntire(line)
            val numbered = NUMBERED.matchEntire(line)
            when {
                heading != null -> {
                    closeList()
                    // Swing's own h1–h3 are enormous next to the IDE's 13px text: bold, one step up
                    val size = when (heading.groupValues[1].length) { 1 -> "+2"; 2 -> "+1"; else -> "+0" }
                    sb.append("<p><font size='").append(size).append("'><b>")
                        .append(inline(heading.groupValues[2])).append("</b></font></p>")
                }
                line.startsWith("- ") || line.startsWith("* ") -> {
                    if (list != "ul") { closeList(); sb.append("<ul>"); list = "ul" }
                    sb.append("<li>").append(inline(line.substring(2))).append("</li>")
                }
                numbered != null -> {
                    if (list != "ol") { closeList(); sb.append("<ol>"); list = "ol" }
                    sb.append("<li>").append(inline(numbered.groupValues[1])).append("</li>")
                }
                else -> {
                    closeList()
                    if (line.isNotBlank()) sb.append(inline(line)).append("<br>")
                }
            }
            i++
        }
        closeList()
        return sb.append("</body></html>").toString()
    }

    private fun cells(row: String): List<String> = row.trim().removePrefix("|").removeSuffix("|").split("|").map { it.trim() }

    private fun escape(s: String) = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;")

    /** Inline markup of one (already-split) line, over the ESCAPED text. */
    fun inline(text: String): String {
        var s = escape(text)
        s = s.replace(Regex("`([^`]+)`"), "<code>$1</code>")
        s = LINK.replace(s) { m ->
            val url = m.groupValues[2]
            val safe = url.startsWith("https://") || url.startsWith("http://") || url.startsWith("mailto:")
            if (safe) "<a href=\"$url\">${m.groupValues[1]}</a>" else m.groupValues[1]
        }
        s = s.replace(Regex("\\*\\*([^*]+)\\*\\*"), "<b>$1</b>")
        s = s.replace(Regex("(?<![*\\w])\\*([^*]+)\\*(?![*\\w])"), "<i>$1</i>")
        return s
    }
}
