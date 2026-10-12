package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import io.mateu.ijp.state.AppContext
import io.mateu.ijp.state.AppSession
import junit.framework.TestCase
import java.awt.Container
import javax.swing.JRadioButton

/** Compare and merge (wire `RecordMerge`): the same rules as the web's recordMerge.ts. */
class RecordMergesTest : TestCase() {

    private val mapper = ObjectMapper()

    private val metadata = mapper.readTree(
        """
        {"type":"RecordMerge","title":"Duplicate guests","mergeActionId":"mergeProfiles","parameters":{"survivor":"a"},
         "records":[{"id":"a","label":"Profile 1021","caption":"12 stays"},{"id":"b","label":"Profile 3388"}],
         "fields":[
           {"fieldId":"name","label":"Name","values":["Ana","Ana"],"chosen":"a","differs":false},
           {"fieldId":"email","label":"Email","values":[null,"ana@example.com"],"chosen":"b","differs":true},
           {"fieldId":"phone","label":"Phone","values":["+34 600","+34 611"],"editable":true,"differs":true}]}
        """,
    )

    private val records = RecordMerges.recordsOf(metadata)
    private val fields = RecordMerges.fieldsOf(metadata)

    fun testPicksStartFromTheServerElseTheFirstRecordWithAValue() {
        assertEquals(mapOf("name" to "a", "email" to "b", "phone" to "a"), RecordMerges.initialPicks(records, fields))
    }

    fun testTheMergeSendsTheParametersMergedAndChoices() {
        val picks = mapOf("name" to "a", "email" to "b", "phone" to RecordMerges.CUSTOM)
        val parameters = RecordMerges.mergeParameters(metadata, records, fields, picks, mapOf("phone" to "+34 622")) {
            mapper.convertValue(it, Any::class.java)
        }
        assertEquals("a", parameters["survivor"])
        assertEquals(mapOf("name" to "Ana", "email" to "ana@example.com", "phone" to "+34 622"), parameters["_merged"])
        assertEquals(mapOf("name" to "a", "email" to "b", "phone" to "custom"), parameters["_choices"])
    }

    fun testOnlyDifferencesAndSummary() {
        assertEquals(listOf("email", "phone"), RecordMerges.visibleFields(fields, true).map { it.fieldId })
        assertEquals("3 fields: 2 differ; 1 typed by hand", RecordMerges.summary(fields, mapOf("phone" to "custom")))
    }

    fun testTheRendererNamesEveryPickForAScreenReader() {
        val panel = renderRecordMerge(AppContext(AppSession("http://127.0.0.1:9")), metadata)
        val radios = ArrayList<JRadioButton>()
        fun walk(c: Container) {
            for (child in c.components) {
                if (child is JRadioButton) radios.add(child)
                if (child is Container) walk(child)
            }
        }
        walk(panel)
        val names = radios.map { it.accessibleContext.accessibleName }
        assertTrue(names.toString(), "Use value from Profile 3388 for Email" in names)
        assertTrue(names.toString(), "Custom value for Phone" in names)
        // the email row starts on the record that HAS a value
        assertTrue(radios.first { it.accessibleContext.accessibleName == "Use value from Profile 3388 for Email" }.isSelected)
    }
}
