package io.mateu.ijp.ui

import junit.framework.TestCase
import javax.swing.JEditorPane
import javax.swing.JLabel

/** MINOR 6 of the GA review: data-derived HTML and urls on the IntelliJ renderer. */
class SafeHtmlTest : TestCase() {

    fun testPlainMarkupIsKept() {
        assertEquals("<p><b>Bold</b> and <i>it</i><br></p><ul><li>one</li></ul>",
            SafeHtml.sanitize("<p><b>Bold</b> and <i>it</i><br></p><ul><li>one</li></ul>"))
        assertEquals("""<a href="https://example.com/a?b=1&amp;c=2">x</a>""",
            SafeHtml.sanitize("<a href='https://example.com/a?b=1&amp;c=2' onclick='x()'>x</a>"))
        assertEquals("a &amp; b &gt; c", SafeHtml.sanitize("a &amp; b > c"))
    }

    fun testRemoteImagesFormsAndScriptsAreDropped() {
        val html = """
            <img src="https://tracker.example/pixel.gif?u=1">
            <form action="https://evil.example/collect" method="post"><input name="x" value="y"><button>Go</button></form>
            <script>alert(1)</script><style>body{background:url(https://evil.example/b.png)}</style>
            <p style="background-image:url(https://evil.example/c.png)" onmouseover="x()">text</p>
            <iframe src="https://evil.example"></iframe><textarea>secret</textarea>
        """.trimIndent()
        val clean = SafeHtml.sanitize(html)
        assertFalse(clean, clean.contains("evil.example"))
        assertFalse(clean, clean.contains("tracker.example"))
        listOf("<img", "<form", "<input", "<button", "<script", "<style", "<iframe", "<textarea", "style=", "onmouseover", "alert", "secret")
            .forEach { assertFalse("$it in $clean", clean.contains(it, ignoreCase = true)) }
        assertTrue(clean, clean.contains("<p>text</p>"))
    }

    fun testInlineDataImagesStay() {
        val img = """<img src="data:image/png;base64,iVBORw0KGgo=" alt="logo">"""
        assertEquals("""<img src="data:image/png;base64,iVBORw0KGgo=" alt="logo">""", SafeHtml.sanitize(img))
        assertEquals("", SafeHtml.sanitize("""<img src="data:text/html;base64,PGI+">"""))
    }

    fun testDangerousLinkSchemesLoseTheirHref() {
        listOf("javascript:alert(1)", "JaVaScRiPt:alert(1)", "jav&#x61;script:alert(1)", "jav&#97;script:x",
            "java&Tab;script:x", "file:///etc/passwd", "data:text/html,<b>", "vbscript:x").forEach { url ->
            assertEquals(url, "<a>x</a>", SafeHtml.sanitize("<a href=\"$url\">x</a>"))
        }
    }

    fun testCommentsDoctypeAndBrokenTagsAreHarmless() {
        assertEquals("ab", SafeHtml.sanitize("a<!-- <img src=https://x/y> -->b"))
        assertEquals("x", SafeHtml.sanitize("<!DOCTYPE html>x"))
        assertEquals("1 &lt; 2", SafeHtml.sanitize("1 < 2"))
        assertEquals("", SafeHtml.sanitize("<script>never closed"))
        assertEquals("<b>t</b>", SafeHtml.sanitize("<b title=\">\">t</b>"))
    }

    fun testOnlyHttpAndMailtoAreBrowsable() {
        assertEquals("https://example.com", SafeHtml.browsableUrl(" https://example.com "))
        assertEquals("http://example.com", SafeHtml.browsableUrl("http://example.com"))
        assertEquals("mailto:a@example.com", SafeHtml.browsableUrl("mailto:a@example.com"))
        listOf("file:///etc/passwd", "javascript:x", "smb://host/share", "jar:file:/x!/y", "ftp://x", "/products",
            "", "java\tscript:x", "https://exa\nmple.com", null).forEach { assertNull("$it", SafeHtml.browsableUrl(it)) }
    }

    fun testBrowseHandsOnlySafeUrlsToTheOpener() {
        val opened = mutableListOf<String>()
        assertTrue(SafeHtml.browse("https://example.com/x") { opened += it })
        assertFalse(SafeHtml.browse("file:///Users/me/.ssh/id_rsa") { opened += it })
        assertFalse(SafeHtml.browse("javascript:alert(1)") { opened += it })
        assertEquals(listOf("https://example.com/x"), opened)
    }

    fun testEscapeLeavesNoMarkup() {
        assertEquals("&lt;img src=&#39;x&#39;&gt; &amp; &quot;", SafeHtml.escape("<img src='x'> & \""))
    }

    fun testTheRichTextFieldRendersTheSanitisedValue() {
        val pane = richTextField("<p>Hi</p><img src='https://tracker.example/p.gif'><form action='https://evil.example'><input></form>", "html") as JEditorPane
        assertFalse(pane.text, pane.text.contains("tracker.example"))
        assertFalse(pane.text, pane.text.contains("evil.example"))
        assertTrue(pane.text, pane.text.contains("Hi"))
        val md = richTextField("# Title\n<img src='https://tracker.example/p.gif'>", "markdown") as JEditorPane
        assertFalse(md.text, md.text.contains("<img"))
    }

    fun testTheLinkFieldEscapesItsTextAndIsPlainForAnUnsafeScheme() {
        val link = linkField("https://example.com/<b>x</b>") as JLabel
        assertTrue(link.text, link.text.contains("&lt;b&gt;"))
        val file = linkField("file:///etc/passwd") as JLabel
        assertEquals("file:///etc/passwd", file.text)
        assertEquals(0, file.mouseListeners.count { it.javaClass.name.contains("linkField") })
    }
}
