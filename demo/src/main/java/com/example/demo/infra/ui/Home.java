package com.example.demo.infra.ui;

import io.mateu.domain.uidefinition.annotations.ExternalScripts;
import io.mateu.core.domain.uidefinition.shared.annotations.RawContent;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.domain.uidefinition.annotations.MateuUI;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
@Caption("")
@MateuUI("")
@ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
@Getter
// @KeycloakSecured(url = "http://keycloak.mateu.io", realm = "prueba", clientId = "cliente")
public class Home extends DemoApp {

  @Section(value = "", leftSideImageUrl = "/myassets/background.svg")
  @RawContent
  String someContent =
      """

            <h1>Hello!</h1>

            <p>This is some content for the home page.</p>

            """;
}
