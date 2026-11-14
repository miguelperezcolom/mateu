package io.mateu.demo.signin;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * What the server knows about the caller: GitHub's user attributes (the `github` profile's session)
 * or the access token's claims (the `keycloak` profile's bearer token) — a second screen, so
 * navigating shows the sign-in holds across requests.
 */
@Title("Who am I")
public class WhoAmI implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    Map<String, Object> profile =
        switch (httpRequest.getUserPrincipal()) {
          case OAuth2AuthenticationToken login -> login.getPrincipal().getAttributes();
          case JwtAuthenticationToken bearer -> bearer.getTokenAttributes();
          case null, default -> Map.of();
        };
    return new VerticalLayout(
        new Text("title", "Who am I", TextContainer.h2),
        new Text("login", "Login: " + profile.getOrDefault("login", profile.getOrDefault("preferred_username", "—"))),
        new Text("name", "Name: " + profile.getOrDefault("name", "—")),
        new Text("email", "E-mail: " + profile.getOrDefault("email", "—")));
  }
}
