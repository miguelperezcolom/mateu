package com.example.demo.infra.ui;

import com.example.demo.infra.ui.menus.forms.BasicFieldsForm;
import com.example.demo.infra.ui.menus.forms.TextFieldsForm;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.ConsumesContextData;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.HasLogout;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.*;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Caption("")
@MateuUI("/secured")
@ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
@Getter
@Slf4j
@KeycloakSecured(url = "https://lemur-18.cloud-iam.com/auth", realm = "demomateu", clientId = "demo", jsUrl = "/js/keycloak.min.js")
public class HomeSecured implements ConsumesContextData, HasLogout {

  @MenuOption TextFieldsForm textFields;

  @MenuOption @Private BasicFieldsForm eyesOnly;

  @Section(value = "")
  @RawContent
  String someContent =
      """

            <h1>Hello!</h1>

            <p>This is a private area.</p>

            """;

  @RawContent
  String dataFromContext;

  @Override
  public void consume(Map<String, Object> context, ServerHttpRequest serverHttpRequest) {
    log.info("received context: {}", context);
    dataFromContext = "context data: " + context.toString();
  }

  @Override
  public String getLogoutUrl() {
    var post_logout_redirect_uri = "";
    //Base64.getUrlEncoder().encodeToString("/".getBytes(StandardCharsets.UTF_8));
    return "http://lemur-18.cloud-iam.com/auth/realms/demomateu/protocol/openid-connect/logout?" +
            "client_id=demo&post_logout_redirect_uri=" + post_logout_redirect_uri;
  }
}
