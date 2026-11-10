package io.mateu.ijp.ui

import io.mateu.ijp.api.Urls
import io.mateu.ijp.hub.HubManifest
import io.mateu.ijp.state.AppSession
import io.mateu.ijp.state.EmbeddedChrome
import io.mateu.ijp.state.Expressions
import java.awt.Dimension
import java.awt.image.BufferedImage
import java.io.File
import javax.swing.JButton
import javax.swing.JEditorPane
import javax.swing.JLabel
import javax.swing.JPanel

/**
 * The desktop's layout and plumbing, from the Explorer review on the desktop renderer (stream D1):
 * content that arrives after it was stacked, code samples, root-relative urls, links to other
 * mounts, micro-frontend chrome, page header/footer components, the matrix grid's paint.
 */
class DesktopCoreTest : RenderTestCase() {

    // ── live heights ───────────────────────────────────────────────────────────────────────────

    fun testAStackedChildFilledLaterGrowsTheStack() {
        val page = verticalPanel()
        val island = JPanel(java.awt.BorderLayout())
        page.addStacked(JLabel("Title"), 8)
        page.addStacked(island, 0) // empty when stacked: an island whose content is still loading
        island.add(JPanel().apply { preferredSize = Dimension(400, 300) })
        page.size = Dimension(800, page.preferredSize.height)
        page.doLayout()
        assertTrue("the stack asks for the island's new height", page.preferredSize.height >= 300)
        assertEquals("the island is laid out at its content's height", 300, island.height)
        assertFalse("no frozen cap", island.isMaximumSizeSet)
    }

    fun testABoxLayoutPanelBecomesAStackWhenSomethingIsStackedOnIt() {
        val panel = JPanel().apply { layout = javax.swing.BoxLayout(this, javax.swing.BoxLayout.Y_AXIS) }
        panel.addStacked(JLabel("a"))
        assertTrue(panel.layout is StackLayout)
    }

    fun testAStackedButtonKeepsItsOwnWidth() {
        val page = verticalPanel()
        val button = JButton("Go to the Explorer home")
        val field = javax.swing.JTextField()
        page.addStacked(button)
        page.addStacked(field)
        page.size = Dimension(900, page.preferredSize.height)
        page.doLayout()
        assertEquals(button.preferredSize.width, button.width)
        assertEquals("a field still fills the row", 900, field.width)
    }

    fun testStackHeightsShrinkToTheMinimumAndGiveSlackToGlue() {
        // too little room: each child gives up its share down to its minimum, as BoxLayout did
        val shrunk = StackLayout.stackHeights(intArrayOf(100, 100), intArrayOf(100, 0), booleanArrayOf(false, false), 150)
        assertEquals(listOf(100, 50), shrunk.toList())
        // room to spare: glue takes it, everything else keeps its height
        val slack = StackLayout.stackHeights(intArrayOf(10, 0, 10), intArrayOf(0, 0, 0), booleanArrayOf(false, true, false), 100)
        assertEquals(listOf(10, 80, 10), slack.toList())
    }

    fun testAMultiLineFieldKeepsItsLines() {
        val pane = TextAreaScrollPane(javax.swing.JTextArea(4, 40))
        assertEquals(pane.preferredSize.height, pane.minimumSize.height)
        assertTrue(pane.minimumSize.height > 40)
    }

    fun testATabbedPaneIsAsTallAsItsSelectedTab() {
        val tabs = SelectedHeightTabbedPane()
        tabs.addTab("short", JPanel().apply { preferredSize = Dimension(100, 50) })
        tabs.addTab("long", JPanel().apply { preferredSize = Dimension(100, 900) })
        val short = tabs.preferredSize.height
        tabs.selectedIndex = 1
        assertTrue("short tab $short, long ${tabs.preferredSize.height}", tabs.preferredSize.height - short >= 800)
    }

    // ── code samples (Markdown) ────────────────────────────────────────────────────────────────

    private fun md(s: String) = MarkdownHtml.toHtml(s)

    fun testAFencedBlockIsCodeAsWritten() {
        val html = md("Intro\n\n```yaml\n# a comment\ncontent:\n  - type: Text\n    text: \"*a* b\"\n```\n\n```java\n/**\n * Javadoc line\n */\nclass A {}\n```")
        assertTrue(html, html.contains("<pre"))
        assertTrue("indentation kept", html.contains("\n    text: &quot;*a* b&quot;"))
        assertFalse("a YAML comment is no heading", html.contains("<b>a comment</b>"))
        assertFalse("javadoc is no bullet list", html.contains("<li>Javadoc"))
        assertFalse("no italics inside code", html.contains("<i>a</i>"))
        assertFalse("no fence shown", html.contains("```"))
    }

    fun testParagraphLinesJoinAndListItemsContinue() {
        val html = md("one line\nthe same paragraph\n\n- a bullet\n  that wraps\n- next\n\n> a quote")
        assertTrue(html, html.contains("one line the same paragraph"))
        assertTrue(html, html.contains("<li>a bullet that wraps</li><li>next</li>"))
        assertTrue(html, html.contains("<blockquote") && html.contains("a quote"))
    }

    fun testMarkdownIsNotInterpolated() {
        val pane = all(render(context(), """{"type":"Markdown","markdown":"```java\nnew Text(\"Tips today: ${'$'}{state.tips} €\");\n```"}""",
            state = """{"tips":3}""")).filterIsInstance<JEditorPane>().single()
        assertTrue(pane.text, pane.text.contains("${'$'}{state.tips}"))
    }

    fun testTheLiteralEscapesOfAShownText() {
        val ctx = mapOf<String, Any?>("state" to mapOf("x" to "v"))
        assertEquals("A page with ${'$'}{i18n.x}", Expressions.interpolate("A page with \\${'$'}{i18n.x}", ctx))
        assertEquals("v and \\", Expressions.interpolate("${'$'}{state.x} and \\\\", ctx))
        // a JSON body keeps its own backslashes
        assertEquals("{\"a\":\"\\\\n v\"}", Expressions.interpolateBody("{\"a\":\"\\\\n ${'$'}{state.x}\"}", mapOf("Content-Type" to "application/json"), ctx))
    }

    // ── urls and links ─────────────────────────────────────────────────────────────────────────

    fun testRootRelativeUrlsAreTheBackendOrigins() {
        assertEquals("http://h:8650/explorer-api/items", Urls.resolve("http://h:8650", "/explorer-api/items"))
        assertEquals("http://h:8650/fed", Urls.resolve("http://h:8650/x/app", "/fed"))
        assertEquals("http://h:8650/x/app/rel", Urls.resolve("http://h:8650/x/app", "rel"))
        assertEquals("https://other/a", Urls.resolve("http://h:8650", "https://other/a"))
        assertEquals("", Urls.resolve("http://h:8650", ""))
        assertEquals("/x", Urls.resolve("not a url", "/x"))
    }

    fun testAPathMicroFrontendRunsAgainstTheHostOrigin() {
        val host = AppSession("http://h:8650")
        assertEquals("http://h:8650/apps/x", remoteSession(host, "/apps/x").baseUrl)
        assertSame(host, remoteSession(host, ""))
    }

    fun testWhereALinkGoes() {
        val host = "http://h:8650"
        assertEquals(MountLinks.Target.Browse("https://mateu.io/ux/"), MountLinks.immediate(host, "https://mateu.io/ux/"))
        assertEquals(MountLinks.Target.Browse("http://h:8643/site/"), MountLinks.immediate(host, "http://h:8643/site/"))
        assertEquals(MountLinks.Target.None, MountLinks.immediate(host, ""))
        assertNull("a path needs its mount", MountLinks.immediate(host, "/x/behaviour/access-keys"))
        val ok = HubManifest.Fetch.Ok(HubManifest.Manifest("x"))
        assertEquals(MountLinks.Target.App("http://h:8650/x/behaviour/access-keys", ""),
            MountLinks.fromMount(host, "/x/behaviour/access-keys", HubManifest.Mount("http://h:8650/x/behaviour/access-keys", null, ok)))
        assertEquals(MountLinks.Target.Navigate("/orders/7"),
            MountLinks.fromMount(host, "/orders/7", HubManifest.Mount("http://h:8650", "orders/7", ok)))
        assertEquals(MountLinks.Target.Browse("http://h:8650/doc.pdf"),
            MountLinks.fromMount(host, "/doc.pdf", HubManifest.Mount("http://h:8650/doc.pdf", null, HubManifest.Fetch.Failed("no"))))
    }

    fun testAnAbsoluteAnchorIsClickable() {
        val link = all(render(context(), """{"type":"Anchor","text":"docs","url":"https://mateu.io/"}"""))
            .filterIsInstance<com.intellij.ui.components.ActionLink>().toList()
        assertEquals(1, link.size)
    }

    // ── micro frontends ────────────────────────────────────────────────────────────────────────

    fun testEmbeddedChromeKeepsWhatItSays() {
        assertEquals(EmbeddedChrome.Header(texts = false, actions = false), EmbeddedChrome.header("NONE"))
        assertEquals(EmbeddedChrome.Header(texts = false, actions = true), EmbeddedChrome.header("compact"))
        assertEquals(EmbeddedChrome.Header(texts = true, actions = true), EmbeddedChrome.header("PAGE"))
        assertEquals(EmbeddedChrome.Header(texts = true, actions = true), EmbeddedChrome.header(null))
    }

    private val page = """{"type":"Page","title":"Shipments","subtitle":"A remote page",
        "toolbar":[{"type":"Button","label":"Refresh","actionId":"refresh"}]}"""

    fun testAnEmbeddedPageHeaderFollowsItsChrome() {
        val none = context().apply { embeddedChrome = "NONE" }
        val shownNone = render(none, page)
        assertFalse(texts(shownNone).contains("Shipments"))
        assertTrue(buttons(shownNone).none { it.text == "Refresh" })
        val compact = context().apply { embeddedChrome = "COMPACT" }
        val shownCompact = render(compact, page)
        assertFalse(texts(shownCompact).contains("Shipments"))
        assertTrue(buttons(shownCompact).any { it.text == "Refresh" })
        assertTrue(texts(render(context(), page)).contains("Shipments"))
    }

    fun testAnEmbeddedRequestCarriesItsChrome() {
        val ctx = context()
        ctx.embeddedChrome = "COMPACT"
        ctx.navigate("/mf-page", null, null, "")
        awaitRequests(1)
        assertEquals("COMPACT", server.requests.last().path("embeddedChrome").asText())
    }

    fun testAFailingIslandSaysSo() {
        val slot = JPanel()
        showIslandFailure(slot, "http://h:8644", "Connection refused")
        assertTrue(texts(slot).single().contains("http://h:8644"))
        assertTrue(islandFailureText("x", "").contains("no answer"))
    }

    // ── page header / footer components ────────────────────────────────────────────────────────

    fun testAPagesHeaderAndFooterComponentsAreDrawn() {
        val shown = render(context(), """{"type":"Page","title":"Orders",
            "header":[{"type":"ClientSide","metadata":{"type":"Text","text":"Drop zones here"},"children":[]}],
            "footer":[{"type":"ClientSide","metadata":{"type":"Text","text":"Page footer"},"children":[]}]}""")
        assertTrue(texts(shown).contains("Drop zones here"))
        assertTrue(texts(shown).contains("Page footer"))
    }

    // ── element ───────────────────────────────────────────────────────────────────────────────

    fun testAnElementsStyleAndARawButton() {
        val style = ElementStyles.parse("padding: 1rem; background: linear-gradient(90deg, #1e3a8a, #7c3aed); color: white;")
        assertEquals(java.awt.Color(0x1e3a8a), style.background)
        assertEquals(java.awt.Color.WHITE, style.foreground)
        assertEquals(java.awt.Insets(16, 16, 16, 16), style.padding)
        val quote = ElementStyles.parse("border-left: 4px solid #f59e0b; margin: 0; padding: .5rem 1rem;")
        assertEquals(java.awt.Insets(0, 4, 0, 0), quote.border)
        assertEquals(java.awt.Color(0xf59e0b), quote.borderColor)
        val ctx = context()
        val button = render(ctx, """{"type":"Element","name":"button","content":"A raw <button>","on":{"click":"elementClicked"}}""")
        assertTrue(button is JButton)
        (button as JButton).doClick()
        awaitRequests(1)
        assertEquals("elementClicked", server.actionIds().last())
    }

    // ── locale ────────────────────────────────────────────────────────────────────────────────

    fun testAmountsFollowTheAppLocale() {
        MoneyValues.setAppLocale("en")
        try {
            assertEquals("1,140.00", MoneyValues.numberText(1140.0))
        } finally {
            MoneyValues.setAppLocale(null)
        }
    }

    // ── the matrix grid paints ────────────────────────────────────────────────────────────────

    fun testAMatrixGridPaints() {
        val grid = render(context(), """{"type":"MatrixGrid","rowHeaderLabel":"Guided tours",
            "columns":[{"id":"d1","label":"30","group":"November"},{"id":"d2","label":"1","group":"December","tone":"warning"}],
            "sections":[{"id":"s","title":"By language","collapsed":false,"rows":[{"id":"en","label":"English",
              "cells":[{"value":"4"},{"value":"0","tone":"danger"}]}]},
              {"id":"t","title":"Totals","collapsed":true,"rows":[{"id":"all","label":"All","cells":[{"value":"4"},{"value":"0"}]}]}]}""")
        grid.size = Dimension(800, 400)
        layoutAll(grid)
        val img = BufferedImage(800, 400, BufferedImage.TYPE_INT_RGB)
        val g = img.createGraphics()
        grid.paint(g) // threw a NullPointerException in every cell renderer (the protected accessibleContext FIELD)
        g.dispose()
    }

    private fun layoutAll(c: java.awt.Container) {
        c.doLayout()
        for (child in c.components) if (child is java.awt.Container) layoutAll(child)
    }

    /** CLAUDE.md gotcha: inside a Swing subclass `accessibleContext` is the protected FIELD (null). */
    fun testNoSourceReadsTheAccessibleContextField() {
        val bare = Regex("(?<![.\\w])accessibleContext\\??\\.")
        val sources = File("src/main/kotlin")
        assertTrue("run from the plugin's folder: ${sources.absolutePath}", sources.isDirectory)
        val offenders = sources.walkTopDown().filter { it.extension == "kt" }
            .flatMap { f -> f.readLines().mapIndexedNotNull { i, line -> if (bare.containsMatchIn(line)) "${f.name}:${i + 1}" else null } }
            .toList()
        assertTrue("use getAccessibleContext(): $offenders", offenders.isEmpty())
    }
}
