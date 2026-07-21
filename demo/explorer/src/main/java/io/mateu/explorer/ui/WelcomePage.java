package io.mateu.explorer.ui;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import java.net.URI;

/**
 * The Explorer's landing page — a Welcome hero with an INDEX of the screens the tour covers. Each
 * demo screen adds one {@link Button} here (a CTA the Welcome archetype slots into the hero) whose
 * {@code @Action} navigates to its route. Add a new entry per screen we build.
 */
@UI("")
@Title("Mateu Explorer")
public class WelcomePage extends Welcome {

  Button foldout =
      Button.builder().label("Foldout — booking detail").actionId("openFoldout").build();

  Button dashboard =
      Button.builder().label("Dashboard — sales").actionId("openDashboard").build();

  @Override
  protected String heroTitle() {
    return "Mateu Explorer";
  }

  @Override
  protected String heroSubtitle() {
    return "A guided tour of Mateu's screens, rendered by the backend.";
  }

  @Action
  Object openFoldout() {
    return URI.create("/foldout");
  }

  @Action
  Object openDashboard() {
    return URI.create("/dashboard");
  }
}
