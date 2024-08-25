package io.mateu.core.application.usecases.createjourney;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

import io.mateu.core.application.usecases.CreateJourneyUseCase;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.demo.complexview.ComplexView;
import io.mateu.dtos.Journey;
import io.mateu.dtos.JourneyCreationRq;
import io.mateu.dtos.Step;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.server.reactive.ServerHttpRequest;

@SpringBootTest
@Slf4j
public class CreateComplexViewHomeJourneyTest {

  @Autowired CreateJourneyUseCase createJourneyUseCase;
  @Autowired Serializer serializer;

  @Test
  void journeyIsCreated() throws Throwable {
    // given
    var uiId = ComplexView.class.getName();
    var journeyTypeId = "____home____";
    var journeyId = UUID.randomUUID().toString();
    var journeyCreationRq = new JourneyCreationRq(Map.of());
    var serverHttpRequest = mock(ServerHttpRequest.class);
    var mono =
        createJourneyUseCase.createJourney(
            uiId, journeyTypeId, journeyId, journeyCreationRq, serverHttpRequest);

    // when
    var stepWrapper = mono.block();

    // then
    assertNotNull(stepWrapper);
    assertFalse(stepWrapper.modalMustBeClosed());
    assertJourney(stepWrapper.journey());
    assertStore(stepWrapper.store(), journeyId);
    assertStep(stepWrapper.step());
  }

  private void assertJourney(Journey journey) {
    assertNotNull(journey);
    assertEquals(ComplexView.class.getName(), journey.type());
    assertEquals("Please fill the form", journey.statusMessage());
    assertEquals(ComplexView.class.getName(), journey.currentStepDefinitionId());
    assertEquals("form", journey.currentStepId());
  }

  @SneakyThrows
  private void assertStore(Map<String, Object> store, String journeyId) {
    assertNotNull(store);
    var componentsJsons = new HashMap<String, String>();

    var maxComponents = 20;

    for (int i = 0; i < maxComponents; i++) {
      var componentJson = assertComponent("component-" + i, store);
      componentsJsons.put("component-" + i, componentJson);
    }

    var componentsJson = "{";
    for (int i = 0; i < maxComponents; i++) {
      if (i > 0) componentsJson += ",";
      componentsJson += "\n    \"component-" + i + "\":" + componentsJsons.get("component-" + i);
    }
    componentsJson += "}";
    var json =
        new String(
                getClass().getResourceAsStream("complexform.json").readAllBytes(),
                StandardCharsets.UTF_8)
            .replace("\"----herethejourneyid----\"", journeyId)
            .replace("\"----herethecomponents----\"", componentsJson);
    JSONAssert.assertEquals(json, serializer.toJson(store), JSONCompareMode.STRICT);
  }

  private String assertComponent(String componentId, Map<String, Object> store) throws Exception {
    log.info("assertComponent: {}", componentId);
    var realJson = getJsonForComponent(store, componentId);
    // log.info("realJson: {}", realJson);
    var componentJson =
        new String(
            getClass().getResourceAsStream("complexform/" + componentId + ".json").readAllBytes(),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(componentJson, realJson, JSONCompareMode.STRICT);
    return componentJson;
  }

  private String getJsonForComponent(Map<String, Object> store, String componentId)
      throws Exception {
    Map<String, Object> steps = (Map<String, Object>) store.get("steps");
    Map<String, Object> step = (Map<String, Object>) steps.get("form");
    Map<String, Object> components = (Map<String, Object>) step.get("components");
    return serializer.toJson(components.get(componentId));
  }

  @SneakyThrows
  private void assertStep(Step step) {
    assertNotNull(step);
    assertEquals("form", step.id());
    assertEquals(ComplexView.class.getName(), step.type());
    assertNull(step.previousStepId());
    assertEquals("Complex view", step.name());
    assertNull(step.target());
  }
}
