package io.mateu.explorer.examples.behaviour.progressstyles;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.WizardCompletionAction;
import jakarta.validation.constraints.NotEmpty;

/** The same three-step wizard, drawn by each progress style (see the subclasses). */
public abstract class TripWizard extends Wizard {

  public static class Where implements WizardStep {
    @NotEmpty public String destination = "Lisbon";
  }

  public static class When implements WizardStep {
    public Integer nights = 3;
  }

  public static class Who implements WizardStep {
    public Integer travellers = 2;
  }

  public static class Booked implements WizardStep {
    @PlainText public String message = "Trip booked.";
  }

  Where where = new Where();
  When when = new When();
  Who who = new Who();
  Booked booked;

  @WizardCompletionAction
  @Action(validationRequired = true)
  @Label("Book")
  Object book() {
    return null;
  }
}
