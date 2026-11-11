package io.mateu.uidl.push;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;

/**
 * What a {@link io.mateu.uidl.interfaces.PushSender} reports: how many pushes the service accepted
 * and the tokens it said are no longer valid (the app was uninstalled, notifications turned off) —
 * Mateu unregisters those from the {@link io.mateu.uidl.interfaces.PushTokenStore}.
 */
@Experimental("remote push (3.0)")
public record PushResult(int accepted, List<String> unregisteredTokens) {

  public PushResult {
    unregisteredTokens = unregisteredTokens != null ? List.copyOf(unregisteredTokens) : List.of();
  }

  /** Nothing sent. */
  public static PushResult none() {
    return new PushResult(0, List.of());
  }
}
