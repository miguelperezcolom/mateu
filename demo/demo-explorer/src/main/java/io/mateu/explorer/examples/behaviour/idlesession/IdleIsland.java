package io.mateu.explorer.examples.behaviour.idlesession;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link IdleDemoApp} (a whole app, with its own header) in the Explorer page. */
public class IdleIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/idle";
  }
}
