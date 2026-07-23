package io.mateu.explorer.ui;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;

/** Explorer demo: a 2-step wizard under the redwood-spectra shell (oj-c fields + step progress). */
@UI("/wizard")
@Title("Wizard")
public class WizardDemo extends Wizard {

  GuestStep guest;
  StayStep stay;
  WizardDemoResult result;

  @WizardCompletionAction
  void complete() {
    result = new WizardDemoResult();
    result.summary = "Check-in for " + guest.name() + " · " + stay.nights() + " nights (" + stay.roomType() + ").";
  }

  public record GuestStep(String name, String email) implements WizardStep {}

  public record StayStep(int nights, String roomType) implements WizardStep {}

  @ReadOnly
  public static class WizardDemoResult implements WizardStep {
    String summary = "Done!";
  }
}
