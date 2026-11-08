package io.mateu.explorer.examples.behaviour.sessionexpiry;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link SessionExpiryDemoApp} (a whole app, with its own header) in the Explorer page. */
public class SessionExpiryIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/session-expiry";
  }
}
