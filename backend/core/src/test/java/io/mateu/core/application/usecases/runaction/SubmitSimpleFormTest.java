package io.mateu.core.application.usecases.runaction;

import io.mateu.core.application.usecases.CreateJourneyUseCase;
import io.mateu.core.application.usecases.RunStepUseCase;
import io.mateu.core.application.usecases.createjourney.CreateSimpleFormHomeJourneyTest;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.demo.SimpleForm;
import io.mateu.dtos.Journey;
import io.mateu.dtos.JourneyCreationRq;
import io.mateu.dtos.RunActionRq;
import io.mateu.dtos.Step;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

@SpringBootTest
public class SubmitSimpleFormTest {

    @Autowired
    RunStepUseCase runStepUseCase;
    @Autowired
    Serializer serializer;


    @Test
    void journeyIsCreated() throws Throwable {
        // given
        var uiId = SimpleForm.class.getName();
        var journeyTypeId = "____home____";
        var journeyId = UUID.randomUUID().toString();
        var actionId = "submit";
        var journey = createJourney(journeyId);
        var runActionRq = new RunActionRq(Map.of("name", "Antonia", "age", 47), journey, Map.of());
        var serverHttpRequest = mock(ServerHttpRequest.class);
        var mono = runStepUseCase.runStep(
                journeyTypeId,
                journeyId,
                "form",
                actionId,
                runActionRq,
                serverHttpRequest
        );

        // when
        var stepWrapper = mono.block();

        // then
        assertNotNull(stepWrapper);
        assertFalse(stepWrapper.modalMustBeClosed());
        assertJourney(stepWrapper.journey());
        assertStore(stepWrapper.store(), journeyId);
        assertStep(stepWrapper.step());
    }

    @SneakyThrows
    private Map<String, Object> createJourney(String journeyId) {
        var viewJson = new String(CreateSimpleFormHomeJourneyTest.class.getResourceAsStream("simpleform-view.json").readAllBytes(),
                StandardCharsets.UTF_8);
        var json = new String(CreateSimpleFormHomeJourneyTest.class.getResourceAsStream("simpleform.json").readAllBytes(),
                StandardCharsets.UTF_8)
                .replaceAll("----herethejourneyid----", journeyId)
                .replaceAll("\"----heretheview----\"", viewJson);
        return serializer.fromJson(json);
    }

    private void assertJourney(Journey journey) {
        assertNotNull(journey);
        assertEquals(SimpleForm.class.getName(), journey.type());
        assertEquals("Please fill the form", journey.statusMessage());
        assertEquals(SimpleForm.class.getName(), journey.currentStepDefinitionId());
        assertEquals("form", journey.currentStepId());
    }

    @SneakyThrows
    private void assertStore(Map<String, Object> store, String journeyId) {
        assertNotNull(store);
        var viewJson = new String(getClass().getResourceAsStream("simpleform-view.json").readAllBytes(),
                StandardCharsets.UTF_8);
        var json = new String(getClass().getResourceAsStream("simpleform.json").readAllBytes(),
                StandardCharsets.UTF_8)
                .replaceAll("\"----herethejourneyid----\"", journeyId)
                .replaceAll("\"----heretheview----\"", viewJson);
        JSONAssert.
                assertEquals(
                json, serializer.toJson(store), JSONCompareMode.STRICT);
    }

    @SneakyThrows
    private void assertStep(Step step) {
        assertNotNull(step);
        assertEquals("form", step.id());
        assertEquals(SimpleForm.class.getName(), step.type());
        assertNull(step.previousStepId());
        assertEquals("Simple form", step.name());
        assertNull(step.target());
        var viewJson = new String(getClass().getResourceAsStream("simpleform-view.json").readAllBytes(),
                StandardCharsets.UTF_8);
        JSONAssert.assertEquals(
                viewJson, serializer.toJson(step.view()), JSONCompareMode.STRICT);
    }

}
