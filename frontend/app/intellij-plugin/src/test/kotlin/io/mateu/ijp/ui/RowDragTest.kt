package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** Unit tests for the listing-row drag payload and the drop-zone contract (mirrors the RN
 *  dragDrop tests and the backend DragAndDropSyncTest). */
class RowDragTest : TestCase() {

    private val mapper = ObjectMapper()
    private fun row(json: String) = mapper.readTree(json)

    fun testPayloadRoundTripsThroughItsEncoding() {
        val payload = RowDrag.Payload("charge", listOf("c1", "c2"))
        val encoded = RowDrag.encode(payload)
        assertTrue(encoded.startsWith("mateu-rows:"))
        assertEquals(payload, RowDrag.decode(encoded))
    }

    fun testDecodeRejectsAnythingElse() {
        assertNull(RowDrag.decode(null))
        assertNull(RowDrag.decode("c1,c2"))
        assertNull(RowDrag.decode("mateu-rows:not json"))
        assertNull(RowDrag.decode("mateu-rows:{\"ids\":[\"c1\"]}")) // no type
    }

    fun testPayloadOfTakesTheRowIdsAndNeedsADragType() {
        val rows = listOf(row("{\"id\":\"c1\"}"), row("{\"_id\":7}"), row("{\"name\":\"no id\"}"), row("{\"key\":\"k\"}"))
        assertEquals(RowDrag.Payload("charge", listOf("c1", "7", "k")), RowDrag.payloadOf("charge", rows))
        assertNull(RowDrag.payloadOf(null, rows))
        assertNull(RowDrag.payloadOf("", rows))
        assertNull(RowDrag.payloadOf("charge", listOf(row("{\"name\":\"x\"}"))))
    }

    fun testAZoneAcceptsOnlyItsOwnTypeAndOnlyWithAnAction() {
        val charge = RowDrag.Payload("charge", listOf("c1"))
        assertTrue(RowDrag.accepts("charge", "moveCharges", charge))
        assertFalse(RowDrag.accepts("room", "moveCharges", charge))
        assertFalse(RowDrag.accepts("charge", "", charge))
        assertFalse(RowDrag.accepts("", "moveCharges", charge))
        assertFalse(RowDrag.accepts("charge", "moveCharges", null))
    }

    fun testTheDropParametersAreTheZoneParametersPlusTheDraggedIdsAndType() {
        val params = RowDrag.dropParameters(mapOf("window" to 2), RowDrag.Payload("charge", listOf("c1", "c2")))
        assertEquals(mapOf("window" to 2, "_draggedIds" to listOf("c1", "c2"), "_dragType" to "charge"), params)
    }
}
