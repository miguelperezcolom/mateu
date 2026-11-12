package io.mateu.ijp.ui

import com.fasterxml.jackson.databind.ObjectMapper
import junit.framework.TestCase

/** The Workflow / FormEditor edits: the web's mateu-workflow.ts and mateu-form-editor.ts operations. */
class DefinitionModelsTest : TestCase() {

    private val mapper = ObjectMapper()

    fun testAnUnreadableOrEmptyValueStartsANewDefinition() {
        assertEquals("New Workflow", DefinitionModels.parseWorkflow(null).path("name").asText())
        assertTrue(DefinitionModels.parseWorkflow("{not json").path("steps").isArray)
        assertEquals("New Form", DefinitionModels.parseForm("").path("name").asText())
        assertEquals(0, DefinitionModels.fields(DefinitionModels.parseForm("""{"name":"x"}""")).size)
    }

    fun testWorkflowStepsAreAddedEditedAndDeletedWithoutTouchingTheInput() {
        val start = DefinitionModels.parseWorkflow("""{"name":"Onboard","owner":"ops","steps":[]}""")
        val one = DefinitionModels.addStep(start, "step-a")
        assertEquals(0, DefinitionModels.steps(start).size)
        val step = DefinitionModels.steps(one).single()
        assertEquals("ACTION", step.path("type").asText())
        assertEquals("New Step", step.path("name").asText())
        val two = DefinitionModels.updateStep(DefinitionModels.addStep(one, "step-b"), "step-b", "preconditionStepId", "step-a")
        assertEquals("step-a", DefinitionModels.steps(two)[1].path("preconditionStepId").asText())
        // unknown keys survive, a null removes the key
        assertEquals("ops", two.path("owner").asText())
        val cleared = DefinitionModels.updateStep(two, "step-b", "preconditionStepId", null)
        assertFalse(DefinitionModels.steps(cleared)[1].has("preconditionStepId"))
    }

    fun testDeletingAStepClearsThePreconditionAndCompensationPointingAtIt() {
        val def = DefinitionModels.parseWorkflow("""{"name":"w","steps":[
            {"id":"a","type":"ACTION","name":"A"},
            {"id":"b","type":"ACTION","name":"B","preconditionStepId":"a","compensationStepId":"a","rollbackable":true}]}""")
        val after = DefinitionModels.deleteStep(def, "a")
        val b = DefinitionModels.steps(after).single()
        assertEquals("b", b.path("id").asText())
        assertFalse(b.has("preconditionStepId"))
        assertFalse(b.has("compensationStepId"))
        assertTrue(b.path("rollbackable").asBoolean())
    }

    fun testWorkflowSettings() {
        val def = DefinitionModels.setWorkflow(DefinitionModels.parseWorkflow(null), "limitConcurrentExecutions", true)
        val max = DefinitionModels.setWorkflow(def, "maxConcurrentExecutions", 3)
        assertTrue(max.path("limitConcurrentExecutions").asBoolean())
        assertEquals(3, max.path("maxConcurrentExecutions").asInt())
        assertEquals("ACTIVE", DefinitionModels.setWorkflow(max, "status", "ACTIVE").path("status").asText())
    }

    fun testFormFieldsAddDuplicateMoveAndDelete() {
        var def = DefinitionModels.parseForm("""{"name":"Customer","fields":[]}""")
        def = DefinitionModels.addField(def, "f1")
        def = DefinitionModels.updateField(def, "f1", "label", "Email")
        def = DefinitionModels.updateField(def, "f1", "required", true)
        def = DefinitionModels.addField(def, "f2")
        def = DefinitionModels.duplicateField(def, "f1", "f1c")
        assertEquals(listOf("f1", "f1c", "f2"), DefinitionModels.fields(def).map { it.path("id").asText() })
        val copy = DefinitionModels.fields(def)[1]
        assertEquals("Email (copy)", copy.path("label").asText())
        assertTrue(copy.path("required").asBoolean())
        def = DefinitionModels.moveField(def, "f2", -1)
        assertEquals(listOf("f1", "f2", "f1c"), DefinitionModels.fields(def).map { it.path("id").asText() })
        // at an end it stays
        assertEquals(listOf("f1", "f2", "f1c"), DefinitionModels.fields(DefinitionModels.moveField(def, "f1", -1)).map { it.path("id").asText() })
        def = DefinitionModels.deleteField(def, "f1")
        assertEquals(listOf("f2", "f1c"), DefinitionModels.fields(def).map { it.path("id").asText() })
        assertEquals("string", DefinitionModels.fields(def)[0].path("dataType").asText())
    }

    fun testSerializedDefinitionRoundTrips() {
        val def = DefinitionModels.addStep(DefinitionModels.parseWorkflow(null), "step-x")
        val json = DefinitionModels.serialize(def)
        assertEquals(def, mapper.readTree(json))
        assertTrue(json.contains("\n"))
        assertTrue(DefinitionModels.newId("step").matches(Regex("step-[a-z0-9]{6}")))
    }

    fun testTheAppContextSearchContract() {
        assertFalse(AppContextSearch.searchable(7))
        assertTrue(AppContextSearch.searchable(8))
        assertEquals("_appcontext-search-hotel", AppContextSearch.actionId("hotel"))
        val answer = mapper.readTree("""{"fragments":[{"data":{}},{"data":{"_appcontext_hotel":{"content":[{"value":"h9","label":"Menorca"},{"value":"h10"}]}}}]}""")
        assertEquals(listOf("h9" to "Menorca", "h10" to "h10"), AppContextSearch.optionsOf(answer, "hotel"))
        assertNull(AppContextSearch.optionsOf(mapper.readTree("""{"fragments":[]}"""), "hotel"))
        val loaded = listOf("h1" to "Palma", "h2" to "Ibiza")
        assertEquals(loaded, AppContextSearch.visible(loaded, listOf("h9" to "Menorca"), " "))
        assertEquals(listOf("h2" to "Ibiza"), AppContextSearch.visible(loaded, null, "ib"))
        assertEquals(listOf("h9" to "Menorca"), AppContextSearch.visible(loaded, listOf("h9" to "Menorca"), "men"))
    }
}
