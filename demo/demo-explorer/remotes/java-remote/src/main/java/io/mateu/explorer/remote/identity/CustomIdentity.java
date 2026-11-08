package io.mateu.explorer.remote.identity;

import io.mateu.uidl.annotations.UI;

/**
 * Registered in the Explorer as remote {@code id-custom}, identity {@code explorer-demo-user} — an
 * app-provided {@code RemoteIdentityStrategy} bean (token exchange, a service account… is the
 * app's own business).
 */
@UI("/id-custom")
public class CustomIdentity extends IdentityEcho {

  @Override
  protected String heading() {
    return "identity = explorer-demo-user (an app strategy)";
  }
}
