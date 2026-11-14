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

/**
 * The GitHub profile the session carries, read off Spring's OAuth2User attributes — a second
 * screen, so navigating shows the session holds across requests.
 */
@Title("Who am I")
public class WhoAmI implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    Map<String, Object> profile =
        httpRequest.getUserPrincipal() instanceof OAuth2AuthenticationToken token
            ? token.getPrincipal().getAttributes()
            : Map.of();
    return new VerticalLayout(
        new Text("title", "Your GitHub profile", TextContainer.h2),
        new Text("login", "Login: " + profile.getOrDefault("login", "—")),
        new Text("name", "Name: " + profile.getOrDefault("name", "—")),
        new Text("url", "Profile: " + profile.getOrDefault("html_url", "—")));
  }
}
