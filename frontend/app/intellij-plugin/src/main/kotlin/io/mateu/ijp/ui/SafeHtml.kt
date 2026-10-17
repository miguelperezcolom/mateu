package io.mateu.ijp.ui

/**
 * What a DATA-derived HTML string (an html/richText field value, a FAQ answer, a result message…)
 * may carry into Swing's HTML renderer (`JEditorPane("text/html")`, an `<html>` JLabel), and which
 * urls a click may hand to the OS browser. Same intent as the web's `sanitizePolicy`: plain markup
 * stays, everything that runs, submits, fetches or escapes the IDE is dropped.
 *
 * Swing's HTML kit is not a browser, but it still does three dangerous things with markup it is
 * given: `<img src>` (and CSS `url(...)`) FETCH remote resources — a beacon reporting who opened a
 * record —, `<form>`/`<input>` render real controls that POST to the form's action, and an `<a href>`
 * a link handler opens. So: an allow-list of tags, no `style`/event/unknown attributes, images only
 * as `data:image/…`, links only http(s)/mailto, and the content of script/style/form controls gone.
 */
object SafeHtml {

    /** Tags kept (attributes filtered); every other tag is dropped, its text content kept. */
    private val ALLOWED_TAGS = setOf(
        "a", "b", "strong", "i", "em", "u", "s", "strike", "del", "ins", "mark", "small", "big", "sub", "sup",
        "br", "p", "div", "span", "hr", "blockquote", "pre", "code", "kbd", "samp", "tt",
        "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "dl", "dt", "dd",
        "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption", "center", "img",
    )

    /** Tags dropped WITH their content (their text is code, a value or a control, never prose). */
    private val DROPPED_WITH_CONTENT = setOf(
        "script", "style", "textarea", "select", "option", "title", "iframe", "frame", "frameset",
        "object", "embed", "applet", "noscript", "template", "head", "svg", "math", "button",
    )

    /** Attributes kept per tag (all others — style, on*, action, background… — are dropped). */
    private val ALLOWED_ATTRIBUTES = mapOf(
        "a" to setOf("href", "title"),
        "img" to setOf("src", "alt", "title", "width", "height"),
        "td" to setOf("colspan", "rowspan", "align", "valign"),
        "th" to setOf("colspan", "rowspan", "align", "valign"),
        "p" to setOf("align"), "div" to setOf("align"),
        "ol" to setOf("start"),
    )

    private val SAFE_BROWSE = Regex("^(https?:|mailto:)", RegexOption.IGNORE_CASE)
    private val SAFE_IMAGE = Regex("^data:image/(png|gif|jpe?g|webp|bmp);", RegexOption.IGNORE_CASE)
    private val TAG = Regex("^<(/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>\"']|\"[^\"]*\"|'[^']*')*)>")
    private val ATTRIBUTE = Regex("([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\\s*=\\s*(\"[^\"]*\"|'[^']*'|[^\\s\"'>]+))?")

    /** The url when a click may open it in the OS browser (http(s), mailto), else null. */
    fun browsableUrl(url: String?): String? {
        val decoded = decodeEntities(url ?: return null).trim()
        if (decoded.isEmpty() || decoded.any { it.code < 0x20 || it.code == 0x7f }) return null
        return if (SAFE_BROWSE.containsMatchIn(decoded)) decoded else null
    }

    /** Opens [url] in the OS browser only when [browsableUrl] accepts it; returns whether it did. */
    fun browse(url: String?, opener: (String) -> Unit = { com.intellij.ide.BrowserUtil.browse(it) }): Boolean {
        val safe = browsableUrl(url) ?: return false
        runCatching { opener(safe) }
        return true
    }

    /** Text as HTML text (nothing in it is markup). */
    fun escape(text: String): String =
        text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;")

    /** [html] with only the allowed markup left (see the class comment). */
    fun sanitize(html: String): String {
        val out = StringBuilder(html.length)
        var i = 0
        while (i < html.length) {
            val c = html[i]
            if (c != '<') {
                out.append(if (c == '>') "&gt;" else c.toString())
                i++
                continue
            }
            val rest = html.substring(i)
            when {
                rest.startsWith("<!--") -> {
                    val end = html.indexOf("-->", i + 4)
                    i = if (end < 0) html.length else end + 3
                }
                rest.startsWith("<!") || rest.startsWith("<?") -> {
                    val end = html.indexOf('>', i)
                    i = if (end < 0) html.length else end + 1
                }
                else -> {
                    val m = TAG.find(rest)
                    if (m == null) {
                        out.append("&lt;")
                        i++
                        continue
                    }
                    val closing = m.groupValues[1] == "/"
                    val name = m.groupValues[2].lowercase()
                    i += m.value.length
                    when {
                        name in DROPPED_WITH_CONTENT -> {
                            if (!closing && !m.groupValues[3].trimEnd().endsWith("/")) {
                                val close = Regex("</\\s*$name\\s*>", RegexOption.IGNORE_CASE).find(html, i)
                                i = close?.range?.last?.plus(1) ?: html.length
                            }
                        }
                        name !in ALLOWED_TAGS -> Unit
                        closing -> out.append("</").append(name).append('>')
                        else -> openTag(name, m.groupValues[3])?.let(out::append)
                    }
                }
            }
        }
        return out.toString()
    }

    private fun openTag(name: String, rawAttributes: String): String? {
        val allowed = ALLOWED_ATTRIBUTES[name].orEmpty()
        val kept = StringBuilder()
        for (a in ATTRIBUTE.findAll(rawAttributes)) {
            val attr = a.groupValues[1].lowercase()
            if (attr !in allowed) continue
            val value = decodeEntities(a.groupValues[2].removeSurrounding("\"").let {
                if (a.groupValues[2].startsWith("'")) a.groupValues[2].removeSurrounding("'") else it
            })
            val safe = when (attr) {
                "href" -> browsableUrl(value)
                "src" -> value.trim().takeIf { SAFE_IMAGE.containsMatchIn(it) }
                else -> value
            } ?: continue
            kept.append(' ').append(attr).append("=\"").append(escape(safe)).append('"')
        }
        // a remote (or missing) image is not an image here: drop the tag rather than fetch it
        if (name == "img" && !kept.contains(" src=")) return null
        return "<$name$kept>"
    }

    private val NAMED = mapOf("amp" to "&", "lt" to "<", "gt" to ">", "quot" to "\"", "apos" to "'", "colon" to ":", "tab" to "\t", "newline" to "\n")

    /** Numeric and the few named entities a scheme can be hidden behind (`jav&#x61;script:`). */
    private fun decodeEntities(s: String): String =
        Regex("&(#[xX][0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);?").replace(s) { m ->
            val body = m.groupValues[1]
            when {
                body.startsWith("#x") || body.startsWith("#X") ->
                    body.substring(2).toIntOrNull(16)?.takeIf { Character.isValidCodePoint(it) }?.let { String(Character.toChars(it)) } ?: ""
                body.startsWith("#") ->
                    body.substring(1).toIntOrNull()?.takeIf { Character.isValidCodePoint(it) }?.let { String(Character.toChars(it)) } ?: ""
                else -> NAMED[body.lowercase()] ?: m.value
            }
        }
}
