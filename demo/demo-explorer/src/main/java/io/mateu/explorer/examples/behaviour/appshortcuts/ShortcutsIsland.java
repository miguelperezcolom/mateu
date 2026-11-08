package io.mateu.explorer.examples.behaviour.appshortcuts;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link ShortcutsDemoApp} (a whole app, with its own header) in the Explorer page. */
public class ShortcutsIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/shortcuts";
  }
}
