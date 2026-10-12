package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;

/**
 * Implemented by the app class to hook the idle-session warning's "Stay signed in"
 * ({@code @App(idleTimeoutMinutes)}): called on the {@code _keep-alive} app-level action, e.g. to
 * refresh a server session or a token. Without it the action still reaches the server — which is
 * what keeps an ordinary servlet session alive — and does nothing else. Mateu does no
 * authentication: what "signed in" means is the app's.
 */
@Experimental("idle-session warning (3.0-alpha, E2 patterns)")
public interface KeepAliveHandler {

  void keepAlive(HttpRequest httpRequest);
}
