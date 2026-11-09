package io.mateu.explorer.examples.behaviour.liveheadervalues;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link LiveHeaderDemoApp} (a whole app, with its own header) in the Explorer page. */
public class LiveHeaderIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/live-header";
  }
}
