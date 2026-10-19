package io.mateu.ijp.chat

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** The UI-event catalogue: what the panel does with each event the agent sends. */
class ChatEventsTest : TestCase() {
    private val mapper = ObjectMapper()
    private fun json(s: String) = mapper.readTree(s)
    private val nobody: (String) -> Boolean = { false }

    private val menu = json("""[{"label":"Sales","submenus":[{"label":"Orders","route":"/orders","consumedRoute":""}]}]""")

    fun testNavigationKeepsEveryFieldAndTakesTheMenuLabel() {
        val effect = ChatEvents.decide(
            "navigation-requested",
            json("""{"route":"/orders","consumedRoute":"","actionId":"","baseUrl":"http://h","serverSideType":"app.Orders","uriPrefix":"/p"}"""),
            nobody,
            menu,
        ) as ChatEvents.Effect.Navigate
        val e = effect.entry
        assertEquals("Orders", e.path("label").asText())
        for ((k, v) in mapOf("route" to "/orders", "baseUrl" to "http://h", "serverSideType" to "app.Orders", "uriPrefix" to "/p")) {
            assertEquals(v, e.path(k).asText())
        }
    }

    fun testNavigationWithoutAMenuMatchIsLabelledByItsRouteAndAnEmptyOneIsIgnored() {
        val e = (ChatEvents.navigation(json("""{"route":"/x/1"}"""), menu) as ChatEvents.Effect.Navigate).entry
        assertEquals("/x/1", e.path("label").asText())
        val byAction = (ChatEvents.navigation(json("""{"actionId":"go"}""")) as ChatEvents.Effect.Navigate).entry
        assertEquals("go", byAction.path("label").asText())
        val labelled = (ChatEvents.navigation(json("""{"route":"/orders","label":"Mine"}"""), menu) as ChatEvents.Effect.Navigate).entry
        assertEquals("Mine", labelled.path("label").asText())
        assertEquals(ChatEvents.Effect.Ignore, ChatEvents.navigation(json("{}")))
        assertEquals(ChatEvents.Effect.Ignore, ChatEvents.navigation(json("[]")))
    }

    fun testCloseRequested() {
        assertEquals(ChatEvents.Effect.Close, ChatEvents.decide("close-requested", json("{}"), nobody))
    }

    fun testRenderScreenGoesToASubscriberWhenThereIsOne() {
        val detail = json("""{"yaml":"type: Page"}""")
        val effect = ChatEvents.decide("render-screen", detail, { it == "render-screen" })
        assertEquals(ChatEvents.Effect.Bus("render-screen", detail), effect)
    }

    fun testOtherwiseTheShellRendersItThroughThePreviewAction() {
        assertEquals(
            ChatEvents.Effect.RenderScreen("type: Page", "content", null),
            ChatEvents.decide("render-screen", json("""{"yaml":"type: Page"}"""), nobody),
        )
        assertEquals(
            ChatEvents.Effect.RenderScreen("type: Page", "drawer", "Draft"),
            ChatEvents.decide("render-screen", json("""{"uidl":"type: Page","target":"drawer","title":"Draft"}"""), nobody),
        )
        val obj = ChatEvents.decide("render-screen", json("""{"uidl":{"type":"Page"},"target":"dialog"}"""), nobody) as ChatEvents.Effect.RenderScreen
        assertEquals("{\"type\":\"Page\"}", obj.yaml)
        assertEquals("dialog", obj.target)
        assertEquals("content", (ChatEvents.renderScreen(json("""{"yaml":"a","target":"elsewhere"}""")) as ChatEvents.Effect.RenderScreen).target)
        assertEquals(ChatEvents.Effect.Ignore, ChatEvents.decide("render-screen", json("""{"title":"x"}"""), nobody))
        assertEquals(mapOf("_yaml" to "a"), ChatEvents.previewParameters("a"))
    }

    fun testAnyOtherEventGoesToTheBus() {
        val d = json("""{"id":3}""")
        assertEquals(ChatEvents.Effect.Bus("order-picked", d), ChatEvents.decide("order-picked", d, nobody))
    }

    fun testLabelOfMatchesTheConsumedRouteWhenGiven() {
        assertEquals("Orders", ChatEvents.labelOf(menu, "/orders/", ""))
        assertNull(ChatEvents.labelOf(menu, "/orders", "/other"))
        assertNull(ChatEvents.labelOf(null, "/orders"))
    }
}
