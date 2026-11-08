package io.mateu.explorer.examples.behaviour.commandcenter;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link CommandCenterDemoApp} (a whole app, with its own header) in the Explorer page. */
public class CommandCenterIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/command-center";
  }
}
