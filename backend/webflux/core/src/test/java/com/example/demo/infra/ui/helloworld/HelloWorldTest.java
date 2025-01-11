package com.example.demo.infra.ui.helloworld;

import io.mateu.dtos.ActionTargetDto;
import io.mateu.dtos.FormDto;
import io.mateu.dtos.GenericComponentDto;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.dtos.ViewDto;
import io.mateu.dtos.ViewPartDto;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest
@AutoConfigureWebTestClient
public class HelloWorldTest {

  @Autowired private WebTestClient webClient;

  @Test
  public void returnsUI() {

    UIDto expected =
        new UIDto(
            null,
            null,
            null,
            "Hello world",
            "",
            List.of(),
            "____home____",
            null,
            null,
            null,
            List.of());

    this.webClient
        .get()
        .uri("/helloworld/mateu/v3/ui")
        .accept(MediaType.APPLICATION_JSON)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(UIDto.class)
        .isEqualTo(expected);
  }

  @Test
  public void returnsHome() {

    UIIncrementDto expected =
        new UIIncrementDto(
            List.of(),
            List.of(),
            List.of(
                new UIFragmentDto(
                    ActionTargetDto.View,
                    "",
                    "",
                    "",
                    "",
                    new ViewDto(
                        new ViewPartDto(null, List.of()),
                        new ViewPartDto(null, List.of()),
                        new ViewPartDto(null, List.of("component-0")),
                        new ViewPartDto(null, List.of()),
                        new ViewPartDto(null, List.of())),
                    Map.of(
                        "component-0",
                        new GenericComponentDto(
                            new FormDto(
                                null,
                                "Hello world",
                                false,
                                null,
                                null,
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of(),
                                List.of(),
                                Map.of()),
                            "component-0",
                            "com.example.demo.testcase.demo.infra.primary.ui.helloworld.HelloWorld",
                            Map.of(),
                            Map.of(),
                            List.of())))));

    JourneyCreationRqDto rq = new JourneyCreationRqDto(Map.of(), "");

    var journeyId = UUID.randomUUID().toString();

    this.webClient
        .post()
        .uri("/helloworld/mateu/v3/journeys/____home____/" + journeyId)
        .accept(MediaType.APPLICATION_JSON)
        .bodyValue(rq)
        .exchange()
        .expectStatus()
        .isOk()
        .expectBody(UIIncrementDto.class)
        .isEqualTo(expected);
  }
}
