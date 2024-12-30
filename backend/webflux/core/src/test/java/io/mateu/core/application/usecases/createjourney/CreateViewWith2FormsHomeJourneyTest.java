package io.mateu.core.application.usecases.createjourney;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

import io.mateu.core.application.usecases.CreateJourneyUseCase;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.demo.ViewWith2Forms;
import io.mateu.dtos.JourneyCreationRq;
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
public class CreateViewWith2FormsHomeJourneyTest {

  @Autowired CreateJourneyUseCase createJourneyUseCase;
  @Autowired SerializerService serializerService;

  @Test
  @Disabled
  void journeyIsCreated() throws Throwable {
    // given
    var uiId = ViewWith2Forms.class.getName();
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
    var json =
        new String(
            getClass().getResourceAsStream("viewwith2forms.json").readAllBytes(),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(json, serializerService.toJson(uiIncrement), JSONCompareMode.STRICT);
  }
}
