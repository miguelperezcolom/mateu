package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** The Java SUT's /nullable-numbers `price` (an Amount) — same cases as React Native's uxRules tests. */
class MoneyValuesTest : TestCase() {

    private val json = ObjectMapper()
    private val price = json.readTree("""{"currency": "EUR", "value": 25.5, "locale": "de-DE"}""")

    fun testAnAmountShowsItsValueNotNothing() {
        assertTrue(MoneyValues.isAmount(price))
        assertFalse(MoneyValues.isAmount(json.readTree("25.5")))
        assertEquals("25.5", MoneyValues.inputText(price))
    }

    fun testEditingKeepsCurrencyAndLocaleAndAClearedAmountIsZero() {
        val edited = MoneyValues.commit(price, "12,5")
        assertEquals(12.5, edited.path("value").asDouble())
        assertEquals("EUR", edited.path("currency").asText())
        assertEquals("de-DE", edited.path("locale").asText())
        assertEquals(0.0, MoneyValues.commit(price, "").path("value").asDouble())
        assertEquals(25.5, price.path("value").asDouble()) // the original is not mutated
    }

    fun testReadOnlyTextUsesTheAmountsOwnLocaleAndCurrency() {
        assertEquals("25,50 €", MoneyValues.text(price).replace(' ', ' '))
    }
}
