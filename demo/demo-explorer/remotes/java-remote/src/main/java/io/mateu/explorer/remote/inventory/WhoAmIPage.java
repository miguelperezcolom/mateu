package io.mateu.explorer.remote.inventory;

import io.mateu.explorer.remote.identity.IdentityEcho;

/**
 * What this remote received from the BROWSER when it loaded the screen through the shell's
 * RemoteMenu: a remote the shell's app names is trusted with the user's Bearer token (credential
 * scope), so an {@code Authorization} header shows up here when the browser holds one.
 */
public class WhoAmIPage extends IdentityEcho {

  @Override
  protected String heading() {
    return "Who am I? As seen by the Inventory remote";
  }
}
