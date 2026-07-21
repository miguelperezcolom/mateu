package io.mateu.explorer.ui;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * The Explorer's landing page — a Welcome hero. An index (links to the other UIs) will be added
 * here later.
 */
@UI("")
@Title("Mateu Explorer")
public class WelcomePage extends Welcome {

  @Override
  protected String heroTitle() {
    return "Mateu Explorer";
  }

  @Override
  protected String heroSubtitle() {
    return "A guided tour of Mateu's screens, rendered by the backend.";
  }
}
