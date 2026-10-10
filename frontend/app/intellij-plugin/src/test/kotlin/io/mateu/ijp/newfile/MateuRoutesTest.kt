package io.mateu.ijp.newfile

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.newfile.MateuRoutes.NewRoute
import io.mateu.ijp.newfile.MateuRoutes.SpecKind
import junit.framework.TestCase
import org.yaml.snakeyaml.Yaml

/** The routes wizards' pure logic: classification, the empty routes file and the minimal text edits. */
class MateuRoutesTest : TestCase() {

    private val mapper = ObjectMapper()
    private val schema: JsonNode by lazy { mapper.readTree(javaClass.getResourceAsStream("/schema/specs-schema.json")) }
    private fun parse(yaml: String): JsonNode = mapper.valueToTree(Yaml().load<Any>(yaml))

    private fun assertValidRoutes(yaml: String): JsonNode {
        val node = parse(yaml)
        val errors = MiniSchemaValidator(schema).validate(node)
        assertTrue("not valid against specs-schema.json:\n${errors.joinToString("\n")}\n---\n$yaml", errors.isEmpty())
        return node
    }

    fun testClassify() {
        assertEquals(SpecKind.MOUNT, MateuRoutes.classify("type: UI\nbasePath: /\n"))
        assertEquals(SpecKind.ROUTES, MateuRoutes.classify("type: Routes\nroutes: []\n"))
        assertEquals(SpecKind.SOURCES, MateuRoutes.classify("type: Sources\nsources: []\n"))
        assertEquals(SpecKind.ACTIONS, MateuRoutes.classify("type: Actions\nactions: []\n"))
        assertEquals(SpecKind.APP_SHELL, MateuRoutes.classify("type: AppShell\ntitle: x\n"))
        assertEquals(SpecKind.PAGE, MateuRoutes.classify("type: Form\ntitle: x\n"))
        assertEquals(SpecKind.PAGE, MateuRoutes.classify("title: no type\n"))
        assertNull("does not parse", MateuRoutes.classify("type: [unclosed\n  - : :"))
        assertNull("not a mapping", MateuRoutes.classify("- a\n- b\n"))
    }

    fun testNamesAndPaths() {
        assertEquals("customer-orders", MateuRoutes.routeNameOf("customerOrders.yaml"))
        assertEquals("sales/order-list", MateuRoutes.routeNameOf("sales/order_list.yml"))
        assertEquals("home", MateuRoutes.routeNameOf("home.yaml"))
        assertEquals("routes.yaml", MateuRoutes.relativePath("", "routes.yaml"))
        assertEquals("../routes.yaml", MateuRoutes.relativePath("apps", "routes.yaml"))
        assertEquals("shop/routes.yaml", MateuRoutes.relativePath("", "shop/routes.yaml"))
        assertEquals("/p/src/main/resources/specs/ui", MateuRoutes.specsRoot("/p/src/main/resources/specs/ui/sales"))
        assertEquals("/p/src/main/resources/specs/ui", MateuRoutes.specsRoot("/p/src/main/resources/specs/ui"))
    }

    fun testANewRoutesFileIsEmptyAndValid() {
        val text = MateuRoutes.routesFileText()
        val node = assertValidRoutes(text)
        assertEquals("Routes", node.path("type").asText())
        assertEquals(0, node.path("routes").size())
        assertTrue(text.contains(MateuRoutes.DOCS_URL))
        assertFalse("no fake example routes", text.contains(".yaml"))
        val withBase = MateuRoutes.routesFileText("/shop")
        assertEquals("/shop", parse(withBase).path("basePath").asText())
        // `basePath:` on a routes file is read by the loader (a class-declared @UI mount's header) but
        // the generated schema's Routes branch does not declare it, so only the rest is validated.
        assertValidRoutes(withBase.replace(Regex("(?m)^basePath:.*\n"), ""))
        assertEquals("the bundled template IS the empty routes file", MateuNewFiles.bundledTemplateText("Mateu Routes"), text)
    }

    fun testAddRouteTurnsAnEmptyFlowListIntoABlockList() {
        val text = MateuRoutes.appendRoute(MateuRoutes.routesFileText(), NewRoute("orders", "orders.yaml", "com.acme.Orders"))
        assertTrue(text, text.endsWith("routes:\n  - route: orders\n    layout: orders.yaml\n    viewModel: com.acme.Orders\n"))
        val node = assertValidRoutes(text)
        assertEquals("orders.yaml", node.path("routes")[0].path("layout").asText())
        // The generated keys are all RouteEntry properties of routes-schema.json.
        val props = schema.path("\$defs").path("RouteEntry").path("properties").fieldNames().asSequence().toSet()
        node.path("routes")[0].fieldNames().forEach { assertTrue("$it not a RouteEntry key", it in props) }
    }

    fun testAddRouteAppendsToABlockListKeepingTheRestOfTheFile() {
        val original = "# my routes\ntype: Routes\nroutes:\n- route: \"\"\n  layout: app.yaml # shell\n\n# trailing note\n"
        val text = MateuRoutes.appendRoute(original, NewRoute("about", "about.yaml"))
        assertEquals(
            "# my routes\ntype: Routes\nroutes:\n- route: \"\"\n  layout: app.yaml # shell\n- route: about\n  layout: about.yaml\n\n# trailing note\n",
            text,
        )
        assertValidRoutes(text)
        assertEquals(listOf("", "about"), MateuRoutes.existingRoutes(text))
    }

    fun testAddRouteEmitsParentAndRootRoute() {
        var text = MateuRoutes.appendRoute(MateuRoutes.routesFileText(), NewRoute("", "app.yaml"))
        text = MateuRoutes.appendRoute(text, NewRoute("customers/:id", "customer.yaml"))
        text = MateuRoutes.appendRoute(text, NewRoute("customers/:id/profile", "profile.yaml", parent = "customers/:id"))
        val node = assertValidRoutes(text)
        assertEquals("", node.path("routes")[0].path("route").asText())
        assertEquals("customers/:id", node.path("routes")[2].path("parent").asText())
        assertFalse(node.path("routes")[1].has("viewModel"))
    }

    fun testDuplicateRouteIsRejected() {
        val text = "type: Routes\nroutes:\n  - route: orders\n    children:\n      - route: archived\n"
        assertEquals(listOf("orders", "orders/archived"), MateuRoutes.existingRoutes(text))
        for (r in listOf("orders", "orders/archived", "/orders")) {
            try {
                MateuRoutes.appendRoute(text, NewRoute(r, "x.yaml"))
                fail("duplicate $r accepted")
            } catch (expected: IllegalArgumentException) {
            }
        }
    }

    fun testAddRouteToANonEmptyFlowList() {
        val text = MateuRoutes.appendRoute("type: Routes\nroutes: [{route: a}]\n", NewRoute("b", "b.yaml"))
        assertEquals("type: Routes\nroutes: [{route: a}, {route: b, layout: b.yaml}]\n", text)
        assertValidRoutes(text)
    }

    fun testRegisterInMount() {
        val listed = "type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n"
        assertEquals("already listed → unchanged", listed, MateuRoutes.registerInMount(listed, "routes.yaml"))
        assertEquals(listed, MateuRoutes.registerInMount(listed, "./routes.yaml"))
        assertEquals(
            "type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n  - admin-routes.yaml\n",
            MateuRoutes.registerInMount(listed, "admin-routes.yaml"),
        )
        assertEquals(
            "type: UI\nbasePath: /shop\nroutes:\n  - routes.yaml\n",
            MateuRoutes.registerInMount("type: UI\nbasePath: /shop\n", "routes.yaml"),
        )
        assertEquals(
            "type: UI\nroutes:\n  - routes.yaml\n",
            MateuRoutes.registerInMount("type: UI\nroutes: []\n", "routes.yaml"),
        )
        val mount = MateuRoutes.registerInMount("type: UI\nbasePath: /\n", "routes.yaml")
        assertTrue(MiniSchemaValidator(schema).validate(parse(mount)).isEmpty())
    }

    fun testSetHome() {
        assertEquals("type: UI\nbasePath: /\nhome: dashboard\nroutes:\n  - routes.yaml\n",
            MateuRoutes.setHome("type: UI\nbasePath: /\nroutes:\n  - routes.yaml\n", "dashboard"))
        assertEquals("type: UI\nbasePath: /\nhome: orders\nroutes: []\n",
            MateuRoutes.setHome("type: UI\nbasePath: /\nhome: dashboard\nroutes: []\n", "orders"))
        assertEquals("# mount\ntype: UI\nhome: orders\nroutes: []\n",
            MateuRoutes.setHome("# mount\ntype: UI\nroutes: []\n", "orders"))
        assertEquals("home: orders\nroutes: []\n", MateuRoutes.setHome("routes: []\n", "orders"))
        assertEquals("orders", MateuRoutes.homeOf(MateuRoutes.setHome("type: UI\n", "orders")))
        assertEquals("type: UI\nhome: \"\"\n", MateuRoutes.setHome("type: UI\n", ""))
    }

    fun testMountListing() {
        val mounts = mapOf(
            "app.ui.yaml" to "type: UI\nroutes:\n  - routes.yaml\n",
            "shop/shop.ui.yaml" to "type: UI\nroutes:\n  - routes.yaml\n  - ../extra.yaml\n",
        )
        assertEquals("app.ui.yaml", MateuRoutes.mountListing(mounts, "routes.yaml"))
        assertEquals("shop/shop.ui.yaml", MateuRoutes.mountListing(mounts, "shop/routes.yaml"))
        assertEquals("shop/shop.ui.yaml", MateuRoutes.mountListing(mounts, "extra.yaml"))
        assertNull(MateuRoutes.mountListing(mounts, "other.yaml"))
    }
}
