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

    private val FENCE = Regex("""^(`{3,}|~{3,})\s*([\w+#.-]*)\s*$""")

    fun toHtml(md: String): String {
        val sb = StringBuilder("<html><body>")
        val lines = md.lines()
        var list: String? = null // "ul" | "ol" while one is open
        // consecutive text lines are ONE paragraph, as in markdown (each line used to end in a <br>,
        // so a description wrapped where its source did, not where the page does)
        val paragraph = mutableListOf<String>()
        fun closeParagraph() {
            if (paragraph.isEmpty()) return
            sb.append("<p style='margin-top:0;margin-bottom:6px'>")
            paragraph.forEachIndexed { n, text ->
                if (n > 0) sb.append(if (paragraph[n - 1].endsWith("  ")) "<br>" else " ")
                sb.append(inline(text.trim()))
            }
            sb.append("</p>")
            paragraph.clear()
        }
        fun closeList() {
            closeParagraph()
            list?.let { sb.append("</").append(it).append(">") }
            list = null
        }
        var i = 0
        while (i < lines.size) {
            val line = lines[i].trim()
            // a fenced code block: as written — monospace, indentation and blank lines kept, nothing
            // inside read as markdown (a YAML `# comment` is not a heading, a javadoc ` * ` is not a
            // bullet, `*` is not italics) and no line trimmed
            val fence = FENCE.matchEntire(line)
            if (fence != null) {
                closeList()
                val marker = fence.groupValues[1]
                val code = mutableListOf<String>()
                i++
                while (i < lines.size && !lines[i].trim().let { it.startsWith(marker) && it.trim(marker[0]).isBlank() }) {
                    code += lines[i]
                    i++
                }
                i++ // the closing fence (or the end of the text)
                sb.append(codeBlock(code))
                continue
            }
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
                line.isBlank() -> closeList()
                // an indented line under a list item CONTINUES it (a wrapped bullet used to close the
                // list and become a paragraph of its own)
                list != null && lines[i].first().isWhitespace() && sb.endsWith("</li>") -> {
                    sb.setLength(sb.length - "</li>".length)
                    sb.append(' ').append(inline(line)).append("</li>")
                }
                // a quote: `> text` lines, as one indented paragraph
                line.startsWith(">") -> {
                    closeList()
                    val quote = mutableListOf<String>()
                    while (i < lines.size && lines[i].trim().startsWith(">")) {
                        quote += lines[i].trim().removePrefix(">").trim()
                        i++
                    }
                    sb.append("<blockquote style='margin-top:0;margin-bottom:6px'>")
                        .append(quote.filter { it.isNotBlank() }.joinToString(" ") { inline(it) })
                        .append("</blockquote>")
                    continue
                }
                else -> {
                    if (list != null) closeList()
                    paragraph += lines[i]
                }
            }
            i++
        }
        closeList()
        return sb.append("</body></html>").toString()
    }

    /**
     * A code block as Swing's HTML kit keeps it: `<pre>` is monospace and keeps spaces; tabs become
     * four spaces (the kit draws a tab as one), and every line is escaped — nothing is markup.
     */
    internal fun codeBlock(code: List<String>): String {
        val body = code.joinToString("\n") { escape(it.replace("\t", "    ")) }
        return "<pre style='margin-top:0;margin-bottom:6px'>$body</pre>"
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
