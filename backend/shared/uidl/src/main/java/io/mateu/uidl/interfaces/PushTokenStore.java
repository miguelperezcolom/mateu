package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.push.PushToken;
import java.util.List;

/**
 * Where the phones' push tokens are kept (remote push, {@code @App(osNotifications = true)}): the
 * Mateu app registers its token with the reserved {@code _push-register} action and removes it with
 * {@code _push-unregister} (sign-out, the UI removed from the phone's list, permission revoked).
 *
 * <p>Mateu ships UI only: storage is the app's. Out of the box an in-memory store is used — per
 * process, bounded, LOST ON RESTART (Mateu logs a WARN the first time it uses it): after a restart
 * a phone receives nothing until the app registers again (it does each time it comes to the front).
 * Register a bean implementing this interface (a table) to keep the tokens.
 *
 * <p>{@code principal} is the name of the identity the host framework authenticated, never a value
 * from the phone. An anonymous caller's token is kept under {@code session:<X-Session-Id>} ({@code
 * PushNotifications.sendToSession}).
 */
@Experimental("remote push (3.0)")
public interface PushTokenStore {

  /**
   * Keeps {@code token} for {@code principal}. The same token, or another token of the same {@code
   * deviceId}, replaces the previous entry, whoever it belonged to: a phone has one user at a time.
   */
  void register(String principal, PushToken token);

  /** Forgets this token, whoever it was registered for. */
  void unregister(String token);

  /** The tokens of {@code principal}'s phones. */
  List<PushToken> tokensFor(String principal);
}
