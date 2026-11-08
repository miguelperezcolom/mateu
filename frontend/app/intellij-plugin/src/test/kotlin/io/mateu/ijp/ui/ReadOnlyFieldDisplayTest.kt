package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** A read-only field of a definition-only YAML page — same cases as React Native's readOnlyDisplay tests. */
class ReadOnlyFieldDisplayTest : TestCase() {

    private val json = ObjectMapper()
    private val status = json.readTree(
        """{"dataType": "status", "options": [{"value": "AVAILABLE", "label": "Available"}, {"value": "OUT_OF_STOCK", "label": "Out of stock"}]}""",
    )

    override fun tearDown() {
        MoneyValues.setAppLocale(null)
        super.tearDown()
    }

    fun testAReadOnlyAmountIsFormattedWhicheverChannelSaysMoney() {
        MoneyValues.setAppLocale("en")
        assertEquals("249.00", ReadOnlyFieldDisplay.text(json.readTree("""{"dataType": "money"}"""), json.readTree("249")))
        assertEquals("249.00", ReadOnlyFieldDisplay.text(json.readTree("""{"dataType": "number", "stereotype": "money"}"""), json.readTree("249")))
    }

    fun testAValueAmongTheOptionsShowsItsLabel() {
        assertEquals("Out of stock", ReadOnlyFieldDisplay.text(status, json.readTree("\"OUT_OF_STOCK\"")))
        assertEquals("GONE", ReadOnlyFieldDisplay.text(status, json.readTree("\"GONE\"")))
        assertEquals("", ReadOnlyFieldDisplay.text(status, json.readTree("null")))
    }

    fun testAStatusIsAToneChipLabelledByItsOptionOrItsWords() {
        assertEquals("Available" to "SUCCESS", ReadOnlyFieldDisplay.status(status, json.readTree("\"AVAILABLE\"")))
        assertEquals("In progress" to "WARNING", ReadOnlyFieldDisplay.status(json.readTree("{}"), json.readTree("\"InProgress\"")))
        assertEquals("Failed" to "DANGER", ReadOnlyFieldDisplay.status(json.readTree("{}"), json.readTree("\"FAILED\"")))
        assertEquals("Low" to "WARNING", ReadOnlyFieldDisplay.status(json.readTree("{}"), json.readTree("""{"type": "WARNING", "message": "Low"}""")))
        assertNull(ReadOnlyFieldDisplay.status(json.readTree("{}"), json.readTree("\"\"")))
    }
}
