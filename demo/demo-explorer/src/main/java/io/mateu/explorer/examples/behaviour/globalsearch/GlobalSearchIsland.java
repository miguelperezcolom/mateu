package io.mateu.explorer.examples.behaviour.globalsearch;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link GlobalSearchDemoApp} (a whole app, with its own header) in the Explorer page. */
public class GlobalSearchIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/global-search";
  }
}
