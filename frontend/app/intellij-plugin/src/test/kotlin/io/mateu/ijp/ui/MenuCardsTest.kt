package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Unit tests for the card-menu model (mirrors the RN menuCards tests). */
class MenuCardsTest : TestCase() {

    private val group = ObjectMapper().readTree(
        """
        {"label": "Products", "display": "cards", "submenus": [
          {"label": "Orders", "description": "Manage orders", "icon": "vaadin:cart",
           "image": "images/orders.png", "route": "/orders", "submenus": []},
          {"separator": true},
          {"label": "Billing", "description": null, "image": null, "submenus": [
            {"label": "Invoices", "route": "/invoices"},
            {"label": "Payments", "route": "/payments"}
          ]}
        ]}
        """.trimIndent(),
    )

    fun testOnlyADisplayCardsGroupWithEntriesIsACardsGroup() {
        assertTrue(MenuCards.isCardsGroup(group))
        assertFalse(MenuCards.isCardsGroup(ObjectMapper().readTree("""{"label":"Plain","submenus":[{"label":"x"}]}""")))
        assertFalse(MenuCards.isCardsGroup(ObjectMapper().readTree("""{"label":"Empty","display":"cards","submenus":[]}""")))
    }

    fun testEachNonSeparatorEntryIsACard() {
        val cards = MenuCards.cardsOf(group, "http://host:8080/app/")
        assertEquals(2, cards.size)
        val orders = cards[0]
        assertEquals("Orders", orders.title)
        assertEquals("Manage orders", orders.description)
        assertEquals("http://host:8080/app/images/orders.png", orders.imageUri)
        assertEquals("vaadin:cart", orders.icon)
        assertEquals("/orders", orders.target?.path("route")?.asText())
        assertTrue(orders.actions.isEmpty())
    }

    fun testAnEntryWithSubmenusIsNotNavigableAndItsSubmenusAreTheActions() {
        val billing = MenuCards.cardsOf(group, "")[1]
        assertNull(billing.target)
        assertNull(billing.description)
        assertNull(billing.imageUri)
        assertEquals(listOf("/invoices", "/payments"), billing.actions.map { it.path("route").asText() })
    }

    fun testImageUrisResolveAgainstTheBackendBase() {
        assertEquals("data:image/png;base64,AAA", MenuCards.resolveImageUri("data:image/png;base64,AAA", "http://h"))
        assertEquals("https://cdn/x.png", MenuCards.resolveImageUri("https://cdn/x.png", "http://h"))
        assertEquals("http://h/base/x.png", MenuCards.resolveImageUri("/x.png", "http://h/base/"))
        assertNull(MenuCards.resolveImageUri("", "http://h"))
        assertNull(MenuCards.resolveImageUri(null, "http://h"))
    }
}
