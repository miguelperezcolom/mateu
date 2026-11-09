package io.mateu.explorer.remote.identity;

import io.mateu.uidl.annotations.UI;

/** Registered in the Explorer as remote {@code id-forward}, identity {@code forward-authorization}. */
@UI("/id-forward")
public class ForwardedIdentity extends IdentityEcho {

  @Override
  protected String heading() {
    return "identity = forward-authorization";
  }
}
