package io.mateu.explorer.examples.behaviour.appcontext;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link AppContextDemoApp} (a whole app, with its own header) in the Explorer page. */
public class AppContextIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/app-context";
  }
}
