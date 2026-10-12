package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.Draftable;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

/**
 * Walkthrough wizard (design/walkthrough/forms.md): the RAIL progress, a branch that only applies
 * to companies ({@code stepApplies}), a skippable step, a navigation guard ({@code
 * beforeStepNavigate}), drafts, and a completion whose result reads every step — values set in
 * earlier steps must still be there. Identical in every SUT app (the Wizard base class lives in
 * core, which the framework-agnostic sample1 module does not depend on).
 */
@UI("/walk-wizard")
@Title("Check-in wizard")
@WizardProgress(WizardProgressStyle.RAIL)
public class WalkWizard extends Wizard implements Draftable {

  public enum Kind {
    INDIVIDUAL,
    COMPANY
  }

  public static class Guest implements WizardStep {
    @NotEmpty public String name = "";
    public Kind kind = Kind.INDIVIDUAL;
  }

  public static class Company implements WizardStep {
    @NotEmpty public String companyName = "";
  }

  public static class Stay implements WizardStep {
    @Min(1)
    public int nights = 1;
  }

  public static class Extras implements WizardStep {
    public String notes = "";
  }

  public static class Done implements WizardStep {
    @PlainText public String summary = "";
  }

  Guest guest = new Guest();
  Company company = new Company();
  Stay stay = new Stay();
  Extras extras = new Extras();
  Done done;

  @Override
  protected boolean stepApplies(String stepFieldName) {
    return !"company".equals(stepFieldName) || guest.kind == Kind.COMPANY;
  }

  @Override
  protected boolean stepSkippable(String stepFieldName) {
    return "extras".equals(stepFieldName);
  }

  @Override
  protected Object beforeStepNavigate(String fromStep, String toStep, HttpRequest httpRequest) {
    if ("guest".equals(fromStep) && "blocked".equalsIgnoreCase(guest.name)) {
      return Message.error("That guest cannot check in");
    }
    return null;
  }

  @Override
  public Object saveDraft(HttpRequest httpRequest) {
    return Message.success("Draft saved for " + guest.name);
  }

  @WizardCompletionAction
  public Object checkIn() {
    done = new Done();
    done.summary =
        "Checked in "
            + guest.name
            + (guest.kind == Kind.COMPANY ? " for " + company.companyName : "")
            + ", "
            + stay.nights
            + " nights"
            + (extras.notes.isBlank() ? "" : ", notes: " + extras.notes);
    return null;
  }
}
