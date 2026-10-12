package io.mateu.ijp.newfile

import junit.framework.TestCase
import org.yaml.snakeyaml.Yaml

/**
 * The rules the New | Mateu dialogs validate INLINE — next to the field, re-checked as it changes —
 * so a clash ("already exists", "already declared") never has to be escaped by closing the dialog
 * and starting over. Platform-free: the dialogs only wire these into DialogWrapper.doValidate.
 */
class NewMateuFileValidationTest : TestCase() {

    private val onDisk = setOf("/s/ui/form.yaml", "/s/ui/form-2.yaml", "/s/ui/orders.yaml")
    private val exists = { p: String -> p in onDisk }

    fun testFileNameProblems() {
        assertEquals("Enter a file name", MateuNewFiles.fileNameProblem("  ", "/s/ui", exists))
        assertEquals("Use letters, digits, '.', '-' or '_'", MateuNewFiles.fileNameProblem("my page", "/s/ui", exists))
        assertEquals("orders.yaml already exists there — choose another name", MateuNewFiles.fileNameProblem("orders", "/s/ui", exists))
        // an explicit extension is the same file
        assertNotNull(MateuNewFiles.fileNameProblem("orders.yaml", "/s/ui/", exists))
        // changing the name is all it takes to clear it
        assertNull(MateuNewFiles.fileNameProblem("orders-archive", "/s/ui", exists))
    }

    fun testATemplateProposesAFreeName() {
        assertEquals("form-3", MateuNewFiles.uniqueBaseName("form", "/s/ui", exists))
        assertEquals("dashboard", MateuNewFiles.uniqueBaseName("dashboard", "/s/ui/", exists))
    }

    fun testRouteProblems() {
        val routes = "type: Routes\nroutes:\n  - route: orders\n    layout: orders.yaml\n"
        assertEquals("A route cannot contain spaces", MateuRoutes.routeProblem("my orders", "routes.yaml", routes))
        assertEquals("Route \"orders\" is already declared in routes.yaml", MateuRoutes.routeProblem("/orders/", "routes.yaml", routes))
        assertNull(MateuRoutes.routeProblem("orders/archive", "routes.yaml", routes))
    }

    fun testAProblemLearntOnWriteStaysUntilItsInputChanges() {
        val sticky = MateuNewFiles.StickyProblem<Pair<String, String?>>()
        assertNull(sticky.currentFor("orders" to null))
        sticky.remember("orders" to null, "orders.yaml already exists there")
        assertEquals("orders.yaml already exists there", sticky.currentFor("orders" to null))
        assertEquals("orders.yaml already exists there", sticky.currentFor("orders" to null))
        // the user edits the name: gone, and gone for good even if the old name comes back
        assertNull(sticky.currentFor("orders2" to null))
        assertNull(sticky.currentFor("orders" to null))
    }

    fun testEveryPageTemplateDeclaresThePageTypeOfItsFamily() {
        for (t in MateuNewFiles.catalogue.pageTemplates) {
            val text = MateuNewFiles.render(MateuNewFiles.bundledTemplateText(t.template), "my-page")
            val root = Yaml().load<Map<String, Any?>>(text)
            // a blank layout is not a form: it states no type and leaves it to inference
            val expected = if (t.id == "blank") null else t.family
            assertEquals("${t.id} pageType", expected, root["pageType"])
        }
    }
}
