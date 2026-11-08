package io.mateu.explorer.examples.archetypes.wizard;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.Draftable;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * The {@code Wizard} archetype: one {@link WizardStep} field per step, in order; the
 * penultimate step shows the {@code @WizardCompletionAction} and the last one is the result. This
 * one also shows the hooks:
 *
 * <ul>
 *   <li>{@link #stepApplies} — BRANCHING: the insurance step only applies to an international loan
 *       (skipped both ways and left out of the rail);
 *   <li>{@link #stepSkippable} — a Skip button on the optional notes step;
 *   <li>{@link #beforeStepNavigate} — a cancelable hook: a non-null answer stops the move;
 *   <li>{@link Draftable} — Save / Save and close;
 *   <li>{@code availableFromStep} — the completion action is offered early, from the notes step;
 *   <li>{@code @WizardProgress(RAIL)} — the sticky step rail (also BAR and STEPS).
 * </ul>
 */
@Title("Request a loan")
@WizardProgress(WizardProgressStyle.RAIL)
public class LoanRequestWizard extends Wizard implements Draftable {

  public enum Scope {
    NATIONAL,
    INTERNATIONAL
  }

  public static class Artwork implements WizardStep {
    @NotEmpty public String artwork = "Water Lilies";
    @NotNull public Scope scope = Scope.NATIONAL;
  }

  public static class Borrower implements WizardStep {
    @NotEmpty public String institution;
    public String contactEmail;
  }

  public static class Insurance implements WizardStep {
    @NotEmpty public String insurer;
    public String policyNumber;
  }

  public static class Notes implements WizardStep {
    public String remarks;
  }

  public static class Done implements WizardStep {
    @PlainText public String result = "";
  }

  // A step field must not share its name with a field of its own step (`artwork.artwork`): the
  // step's state is flattened and the two keys collide, silently losing the step's values.
  @Label("Artwork")
  Artwork work = new Artwork();
  Borrower borrower = new Borrower();
  Insurance insurance = new Insurance();
  Notes notes = new Notes();
  Done done;

  @Override
  protected boolean stepApplies(String stepFieldName) {
    return !"insurance".equals(stepFieldName) || work.scope == Scope.INTERNATIONAL;
  }

  @Override
  protected boolean stepSkippable(String stepFieldName) {
    return "notes".equals(stepFieldName);
  }

  @Override
  protected Object beforeStepNavigate(String fromStep, String toStep, HttpRequest httpRequest) {
    if ("borrower".equals(fromStep)
        && borrower.institution != null
        && borrower.institution.toLowerCase().contains("blocked")) {
      return Message.error("That institution is not on the lenders' register");
    }
    return null;
  }

  @Override
  public Object saveDraft(HttpRequest httpRequest) {
    return Message.success("Draft saved for “" + work.artwork + "”");
  }

  @WizardCompletionAction(availableFromStep = "notes")
  @Label("Send request")
  Object send() {
    done = new Done();
    done.result = "Request sent: “" + work.artwork + "” to " + borrower.institution + ".";
    return null;
  }
}
