package io.mateu.explorer.examples.behaviour.headeractions;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link HeaderActionsDemoApp} (a whole app, with its own header) in the Explorer page. */
public class HeaderActionsIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/header-actions";
  }
}
