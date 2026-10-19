package io.mateu.ijp.chat

import junit.framework.TestCase

/** The answer's markdown as safe Swing HTML. */
class ChatMarkdownTest : TestCase() {

    fun testNewlinesHeadingsAndListsSurvive() {
        val html = ChatMarkdown.toHtml("# Title\nline one\nline two\n\n- a\n- b\n1. x\n2) y")
        assertTrue(html, html.contains("<h2>Title</h2>"))
        assertTrue(html, html.contains("line one<br>line two<br>"))
        assertTrue(html, html.contains("<ul><li>a</li><li>b</li></ul>"))
        assertTrue(html, html.contains("<ol><li>x</li><li>y</li></ol>"))
    }

    fun testEverythingIsEscapedAndOnlySafeLinksBecomeAnchors() {
        val html = ChatMarkdown.toHtml("<img src=x> [ok](https://e.com) [bad](javascript:alert(1)) [order](/orders/4)")
        assertFalse(html.contains("<img"))
        assertTrue(html.contains("&lt;img"))
        assertTrue(html.contains("<a href=\"https://e.com\">ok</a>"))
        assertFalse(html.contains("javascript"))
        assertTrue(html.contains("<a href=\"/orders/4\">order</a>"))
    }

    fun testInlineStylesAndCode() {
        assertEquals("<b>bold</b> and <i>it</i> and <code>a*b*c &lt;x&gt;</code>", ChatMarkdown.inline("**bold** and *it* and `a*b*c <x>`"))
    }

    fun testFencedCodeKeepsItsLinesAndIndentation() {
        val html = ChatMarkdown.toHtml("```\n  if (a < b)\n```\n  indented")
        assertTrue(html, html.contains("<pre>  if (a &lt; b)\n</pre>"))
        assertTrue(html, html.contains("&nbsp;&nbsp;indented<br>"))
        assertTrue(ChatMarkdown.toHtml("```\nopen").endsWith("</pre>"))
    }

    fun testRoutesAndUrls() {
        assertTrue(ChatMarkdown.isAppRoute("/a"))
        assertFalse(ChatMarkdown.isAppRoute("//evil.com"))
        assertTrue(ChatMarkdown.linkable("mailto:x@y.z"))
        assertFalse(ChatMarkdown.linkable("file:///etc/passwd"))
    }
}
