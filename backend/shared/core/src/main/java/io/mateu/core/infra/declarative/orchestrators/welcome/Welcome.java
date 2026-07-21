package io.mateu.core.infra.declarative.orchestrators.welcome;

import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Welcome page: a friendly introduction to a flow — a big hero (title, subtitle, optional
 * background image) with call-to-action buttons, plus a grid of highlight tiles below.
 *
 * <ul>
 *   <li>{@link Button} fields become <b>call-to-action buttons</b> inside the hero. Their {@code
 *       actionId} runs the matching {@code @Action} method (return a {@code URI} to navigate).
 *   <li>Component fields annotated with {@link Panel} become <b>highlight tiles</b> on a responsive
 *       grid below.
 *   <li>Any other component field is placed on the grid as-is.
 * </ul>
 *
 * Override {@link #heroTitle()}, {@link #heroSubtitle()} and {@link #heroImage()} for the hero
 * chrome.
 */
public abstract class Welcome implements ComponentTreeSupplier {

  protected String heroTitle() {
    return null;
  }

  protected String heroSubtitle() {
    return null;
  }

  /** Optional background image URL for the hero. */
  protected String heroImage() {
    return null;
  }

  @Override
  public String style() {
    return null;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return WelcomeComposer.compose(this, id(), heroTitle(), heroSubtitle(), heroImage());
  }
}
