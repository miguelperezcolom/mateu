package io.mateu.explorer.examples.behaviour.themetoggle;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link ThemeDemoApp} (a whole app, with its own header) in the Explorer page. */
public class ThemeIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/theme";
  }
}
