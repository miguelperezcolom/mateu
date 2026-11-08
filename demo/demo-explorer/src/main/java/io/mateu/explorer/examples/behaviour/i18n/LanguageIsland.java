package io.mateu.explorer.examples.behaviour.i18n;

import io.mateu.explorer.examples.behaviour.embeddedapp.EmbeddedApp;

/** Embeds {@link I18nDemoApp} (a whole app, with its own header) in the Explorer page. */
public class LanguageIsland extends EmbeddedApp {

  @Override
  protected String baseUrl() {
    return "/apps/i18n";
  }
}
