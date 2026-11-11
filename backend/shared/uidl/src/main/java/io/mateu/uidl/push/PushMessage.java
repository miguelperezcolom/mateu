package io.mateu.uidl.push;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.data.AppNotification;
import java.util.Map;
import lombok.Builder;

/**
 * What a push says: a {@code title}, an optional {@code text}, the {@code route} a tap opens (in
 * the UI the push came from) and an optional {@code id} that collapses repeats (the inbox entry
 * id). {@code data} is extra key/value data handed to the app with the push; Mateu adds {@code ui}
 * and {@code route} itself.
 */
@Experimental("remote push (3.0)")
@Builder(toBuilder = true)
public record PushMessage(
    String id, String title, String text, String route, Map<String, String> data) {

  public PushMessage {
    data = data != null ? Map.copyOf(data) : Map.of();
  }

  /** A push with a title and a text. */
  public static PushMessage of(String title, String text) {
    return new PushMessage(null, title, text, null, Map.of());
  }

  /** The same push, opening {@code route} on tap. */
  public PushMessage withRoute(String route) {
    return toBuilder().route(route).build();
  }

  /** The push an inbox entry becomes: its title and text, its route (or its first action's). */
  public static PushMessage of(AppNotification entry) {
    var route = entry.route();
    if (route == null || route.isBlank()) {
      route =
          entry.actions().stream()
              .map(a -> a.route())
              .filter(r -> r != null && !r.isBlank())
              .findFirst()
              .orElse(null);
    }
    return new PushMessage(entry.id(), entry.title(), entry.text(), route, Map.of());
  }
}
