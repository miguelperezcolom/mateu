package io.mateu.core.application.usecases.runaction;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

import io.mateu.core.application.usecases.RunStepUseCase;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.demo.SimpleForm;
import io.mateu.dtos.RunActionRq;
import io.mateu.dtos.SingleComponent;
import io.mateu.dtos.UIIncrement;
import java.nio.charset.StandardCharsets;
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
public class SubmitViewWith2FormsForm1Test {

  @Autowired RunStepUseCase runStepUseCase;
  @Autowired Serializer serializer;

  @Test
  @Disabled
  void formIsSubmitted() throws Throwable {
    // given
    var uiId = SimpleForm.class.getName();
    var journeyTypeId = "____home____";
    var journeyId = UUID.randomUUID().toString();
    var stepId = "x";
    var actionId = "submit";
    var componentType = SimpleForm.class.getName();
    var runActionRq = new RunActionRq(componentType, Map.of("name", "Miguel", "age", 55), Map.of());
    var serverHttpRequest = mock(ServerHttpRequest.class);
    var mono =
        runStepUseCase.runStep(
            journeyTypeId,
            journeyId,
            "form",
            stepId,
            "component-0",
            actionId,
            runActionRq,
            serverHttpRequest);

    // when
    var uiIncrement = mono.block();

    // then
    assertUIIncrement(uiIncrement);
  }

  @SneakyThrows
  private void assertUIIncrement(UIIncrement uiIncrement) {
    assertNotNull(uiIncrement);
    log.info(serializer.toJson(uiIncrement));
    var json =
        new String(
                getClass().getResourceAsStream("viewwith2forms-submit1.json").readAllBytes(),
                StandardCharsets.UTF_8)
            .replaceAll(
                "87d43efa-0b1a-4ef1-b4dc-f9517d2deb9e",
                ((SingleComponent) uiIncrement.uiFragments().get(0).content()).componentId());
    JSONAssert.assertEquals(json, serializer.toJson(uiIncrement), JSONCompareMode.STRICT);
  }
}
