package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.RawContent;
import io.mateu.uidl.annotations.Section;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
@Getter
// @KeycloakSecured(url = "http://keycloak.mateu.io", realm = "prueba", clientId = "cliente")
public class BackgroundOnTop {

  @Section(value = "", topImageUrl = "/myassets/background.svg")
  @RawContent
  String someContent =
      """

            <h1>Hello!</h1>

            <p>This is some content for the home page.</p>

            """;
}
