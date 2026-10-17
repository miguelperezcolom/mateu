package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** In-memory sort of REST rows (mirrors libs/mateu restRowFilters.test.ts): blanks last BOTH ways. */
class RestListingSortTest : TestCase() {

    private val rows = ObjectMapper().readTree(
        """[{"id":1,"n":30},{"id":2,"n":null},{"id":3,"n":45},{"id":4,"n":""}]""",
    ).toList()

    private fun ids(direction: String) =
        RestListing.sort(rows, listOf(mapOf("fieldId" to "n", "direction" to direction))).map { it.get("id").asInt() }

    fun testBlanksGoLastAscending() = assertEquals(listOf(1, 3, 2, 4), ids("ascending"))

    fun testBlanksGoLastDescendingToo() = assertEquals(listOf(3, 1, 2, 4), ids("descending"))
}
