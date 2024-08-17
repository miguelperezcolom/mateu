package com.example.demo.infra.ui;

import io.mateu.core.domain.uidefinition.core.interfaces.ConsumesContextData;
import io.mateu.core.domain.uidefinition.shared.annotations.ExternalScripts;
import io.mateu.core.domain.uidefinition.shared.annotations.RawContent;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Caption("")
@MateuUI("")
@ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
@Getter
@Slf4j
// @KeycloakSecured(url = "http://keycloak.mateu.io", realm = "prueba", clientId = "cliente")
public class Home extends DemoApp implements ConsumesContextData {

  @Section(value = "", leftSideImageUrl = "/myassets/background.svg")
  @RawContent
  String someContent =
      """

            <h1>Hello!</h1>

            <p>This is some content for the home page.</p>

            """;

  @RawContent
  String dataFromContext;

  @Override
  public void consume(Map<String, Object> context, ServerHttpRequest serverHttpRequest) {
    log.info("received context: {}", context);
    dataFromContext = "context data: " + context.toString();
  }
}
