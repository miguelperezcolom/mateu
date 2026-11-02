package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** The OrgChart's focus presentation (OrgChartModel): mirrors RN orgChart.test.ts. */
class OrgChartModelTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)

    private val root = json("""{"id":"ceo","title":"Ada Lovelace","children":[
        {"id":"cto","title":"Grace","children":[{"id":7,"title":"Linus"},{"title":"No id"}]},
        {"id":"cfo","title":"Joan"}]}""")

    private fun titles(path: List<com.fasterxml.jackson.databind.JsonNode>?) = path?.map { it.path("title").asText() }

    fun testOnlyFocusFocusesNullUnknownAndTreeDrawTheTree() {
        assertTrue(OrgChartModel.isFocus(json("""{"display":"focus"}""")))
        assertTrue(OrgChartModel.isFocus(json("""{"display":" FOCUS "}""")))
        assertFalse(OrgChartModel.isFocus(json("""{"display":"tree"}""")))
        assertFalse(OrgChartModel.isFocus(json("""{"display":null}""")))
        assertFalse(OrgChartModel.isFocus(json("""{}""")))
        assertFalse(OrgChartModel.isFocus(json("""{"display":"radial"}""")))
    }

    fun testThePathToANodeByIdComparedAsStrings() {
        assertEquals(listOf("Ada Lovelace", "Grace"), titles(OrgChartModel.pathTo(root, "cto")))
        assertEquals(listOf("Ada Lovelace", "Grace", "Linus"), titles(OrgChartModel.pathTo(root, "7")))
        assertEquals(listOf("Ada Lovelace"), titles(OrgChartModel.pathTo(root, "ceo")))
        assertNull(OrgChartModel.pathTo(root, "nobody"))
        assertNull(OrgChartModel.pathTo(root, null))
        assertNull(OrgChartModel.pathTo(root, ""))
    }

    fun testAFocusedChartOpensOnTheNamedNodeElseTheRoot() {
        assertEquals(listOf("Ada Lovelace", "Grace"), titles(OrgChartModel.initialPath(json("""{"root":$root,"focus":"cto"}"""))))
        assertEquals(listOf("Ada Lovelace", "Grace", "Linus"), titles(OrgChartModel.initialPath(json("""{"root":$root,"focus":7}"""))))
        assertEquals(listOf("Ada Lovelace"), titles(OrgChartModel.initialPath(json("""{"root":$root,"focus":"x"}"""))))
        assertEquals(listOf("Ada Lovelace"), titles(OrgChartModel.initialPath(json("""{"root":$root,"focus":null}"""))))
        assertEquals(emptyList<String>(), titles(OrgChartModel.initialPath(json("""{}"""))))
    }

    fun testAncestorsChildrenAndLabels() {
        val path = OrgChartModel.initialPath(json("""{"root":$root,"focus":"7"}"""))
        assertEquals(listOf("Ada Lovelace", "Grace"), titles(OrgChartModel.ancestors(path)))
        assertEquals(emptyList<String>(), OrgChartModel.ancestors(listOf("root")))
        assertEquals(2, OrgChartModel.children(root).size)
        assertEquals(0, OrgChartModel.children(json("""{"title":"leaf"}""")).size)
        assertEquals("Reports (2)", OrgChartModel.reportsLabel(2))
        assertEquals("Ada, CEO", OrgChartModel.label("Ada", "CEO"))
        assertEquals("Ada", OrgChartModel.label("Ada", ""))
    }

    fun testInitialsFromTheAvatarGlyphElseTheTitle() {
        assertEquals("AL", OrgChartModel.initials("Ada Lovelace", ""))
        assertEquals("GB", OrgChartModel.initials("grace brewster murray hopper", ""))
        assertEquals("👩", OrgChartModel.initials("Ada", "👩"))
        assertEquals("AL", OrgChartModel.initials("Ada Lovelace", "https://x/a.png"))
        assertEquals("AL", OrgChartModel.initials("Ada Lovelace", "vaadin:user"))
        assertEquals("ÁÑ", OrgChartModel.initials("Ángel Ñúñez", ""))
        assertEquals("?", OrgChartModel.initials("", ""))
    }
}
