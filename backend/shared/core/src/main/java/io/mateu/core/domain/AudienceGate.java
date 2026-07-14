package io.mateu.core.domain;

import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Arrays;

/**
 * Decides whether an {@link Audience}-restricted element is shown for the current request: no
 * annotation → shown; no audience selected (the {@code "audience"} app-context value is unset or
 * blank) → shown (no projection active, full view); otherwise shown only when the declared values
 * contain the current audience. A UX projection aid, NOT access control — that's {@link Authorizer}
 * / {@code @EyesOnly}.
 */
public class AudienceGate {

  /** Whether the element carrying {@code audience} is visible under the current projection. */
  public static boolean visible(Audience audience, HttpRequest httpRequest) {
    if (audience == null) {
      return true;
    }
    var current = currentAudience(httpRequest);
    if (current == null) {
      return true; // no projection active → everything visible
    }
    return Arrays.asList(audience.value()).contains(current);
  }

  /** The current audience: the app-context value under "audience", or null when unset/blank. */
  private static String currentAudience(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return null;
    }
    var value = httpRequest.appContext("audience");
    if (value == null) {
      return null;
    }
    var text = String.valueOf(value);
    return text.isBlank() ? null : text;
  }
}
