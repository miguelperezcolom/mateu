package io.mateu.explorer.remote.identity;

import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * Prints the identity headers THIS request carried — who called (the host's server resolving a
 * micro frontend, or the browser) and with what. Never the token itself: only whether there was
 * one and its last characters.
 */
public abstract class IdentityEcho implements ComponentTreeSupplier {

  protected abstract String heading();

  @Override
  public Component component(HttpRequest httpRequest) {
    var lines = new ArrayList<Component>();
    lines.add(Text.builder().container(TextContainer.h4).text(heading()).build());
    lines.add(line("Authorization", masked(httpRequest.getHeaderValue("Authorization"))));
    lines.add(line("X-Demo-User", orNone(httpRequest.getHeaderValue("X-Demo-User"))));
    lines.add(
        line("X-Mateu-Correlation-Id", orNone(httpRequest.getHeaderValue("X-Mateu-Correlation-Id"))));
    lines.add(line("Asked by", askedBy(httpRequest)));
    return VerticalLayout.builder().content(List.copyOf(lines)).spacing(false).build();
  }

  private static Component line(String header, String value) {
    return Text.builder().container(TextContainer.p).text(header + ": " + value).build();
  }

  /** A host resolving a micro frontend server side stamps a correlation id; a browser does not. */
  private static String askedBy(HttpRequest httpRequest) {
    return httpRequest.getHeaderValue("X-Mateu-Correlation-Id") != null
        ? "the host's server (resolve = SERVER)"
        : "a browser";
  }

  private static String masked(String authorization) {
    if (authorization == null || authorization.isBlank()) {
      return "(none)";
    }
    var tail = authorization.length() <= 4 ? "" : authorization.substring(authorization.length() - 4);
    var scheme = authorization.contains(" ") ? authorization.substring(0, authorization.indexOf(' ')) : "?";
    return scheme + " …" + tail + " (received)";
  }

  private static String orNone(String value) {
    return value == null || value.isBlank() ? "(none)" : value;
  }
}
