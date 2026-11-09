package io.mateu.explorer.remote.identity;

import io.mateu.uidl.annotations.UI;

/** Registered in the Explorer as remote {@code id-none}, identity {@code none}. */
@UI("/id-none")
public class AnonymousIdentity extends IdentityEcho {

  @Override
  protected String heading() {
    return "identity = none";
  }
}
