package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase
import javax.swing.table.DefaultTableModel

/** A Collection Detail page's list is the COLLECTION's: it does not read the selected record. */
class CollectionListTest : TestCase() {
    private val mapper = ObjectMapper()

    fun testTheListReadsItsOwnInputsNotTheRecord() {
        // artists/:id — the record's `name` must not reach the artists source as its name filter
        val state = mapOf("id" to "1", "name" to "Hans Baldung", "searchText" to "dur", "page" to 2,
            "size" to 12, "nationality" to "German", "birthYear_from" to 1400)
        val filters = listOf(mapper.readTree("""{"fieldId":"nationality"}"""), mapper.readTree("""{"fieldId":"birthYear"}"""))
        assertEquals(
            mapOf("searchText" to "dur", "page" to 2, "size" to 12, "nationality" to "German", "birthYear_from" to 1400),
            collectionListState(state, filters),
        )
    }

    fun testACardIsTitledByItsFirstTextColumnNotItsImage() {
        val model = DefaultTableModel(arrayOf<Any>("Image", "Title", "Date"), 0)
        model.addRow(arrayOf<Any>("https://images.example/1.jpg", "Saint John on Patmos", "ca. 1511"))
        val (title, lines) = ListingCards.cardOf(model, 0, setOf(0))
        assertEquals("Saint John on Patmos", title)
        assertEquals(listOf("Date" to "ca. 1511"), lines)
        assertEquals("https://images.example/1.jpg", ListingCards.imageOf(model, 0, setOf(0)))
    }
}
