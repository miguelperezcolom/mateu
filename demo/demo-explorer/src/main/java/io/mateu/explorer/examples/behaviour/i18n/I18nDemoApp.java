package io.mateu.explorer.examples.behaviour.i18n;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * A language switch on the app header (an {@code @AppContext} enum). {@link DemoLanguageTranslator}
 * makes it the request's locale; the texts come from the translation catalogues next to the YAML
 * ({@code type: Translations}).
 */
@UI("/apps/i18n")
@Title("${i18n.explorer.i18n.appTitle}")
@App
public class I18nDemoApp {

  @AppContext(label = "Language")
  DemoLanguage demoLanguage;

  @Menu Greeting greeting;
}
