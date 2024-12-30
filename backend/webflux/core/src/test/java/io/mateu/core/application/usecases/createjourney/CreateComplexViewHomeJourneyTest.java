package io.mateu.core.application.usecases.createjourney;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

import io.mateu.core.application.usecases.CreateJourneyUseCase;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.demo.complexview.ComplexView;
import io.mateu.dtos.Component;
import io.mateu.dtos.JourneyCreationRq;
import io.mateu.dtos.UIIncrement;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Disabled;
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
  @Autowired SerializerService serializerService;

  @Test
  @Disabled
  void journeyIsCreated() throws Throwable {
    // given
    var uiId = ComplexView.class.getName();
    var journeyTypeId = "____home____";
    var journeyId = UUID.randomUUID().toString();
    var journeyCreationRq = new JourneyCreationRq(Map.of(), "");
    var serverHttpRequest = mock(ServerHttpRequest.class);
    var mono =
        createJourneyUseCase.createJourney(
            uiId, journeyTypeId, journeyId, journeyCreationRq, serverHttpRequest);

    // when
    var uiIncrement = mono.block();

    // then
    assertUIIncrement(uiIncrement);
  }

  @SneakyThrows
  private void assertUIIncrement(UIIncrement uiIncrement) {
    assertNotNull(uiIncrement);
    log.info(serializerService.toJson(uiIncrement));
    var componentsJsons = new HashMap<String, String>();

    var maxComponents = 20;

    for (int i = 0; i < maxComponents; i++) {
      var componentJson =
          assertComponent(
              "component-" + i,
              uiIncrement.uiFragments().get(0).components().get("component-" + i));
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
            .replace("\"----herethecomponents----\"", componentsJson);
    JSONAssert.assertEquals(json, serializerService.toJson(uiIncrement), JSONCompareMode.STRICT);
  }

  private String assertComponent(String componentId, Component component) throws Exception {
    log.info("assertComponent: {}", componentId);
    var realJson = getJsonForComponent(component);
    log.info("realJson: {}", realJson);
    var componentJson =
        new String(
            getClass().getResourceAsStream("complexform/" + componentId + ".json").readAllBytes(),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(componentJson, realJson, JSONCompareMode.STRICT);
    return componentJson;
  }

  private String getJsonForComponent(Component component) throws Exception {
    return serializerService.toJson(component);
  }
}
