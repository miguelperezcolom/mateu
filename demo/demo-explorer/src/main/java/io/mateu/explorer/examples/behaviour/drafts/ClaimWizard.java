package io.mateu.explorer.examples.behaviour.drafts;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.Draftable;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;

/**
 * A {@link Draftable} wizard gets "Save" and "Save and close" on every step: the user stops and
 * comes back later. {@link #resumeStep} tells Mateu where a fresh visit resumes.
 *
 * <p>Demo store: ONE draft in memory for everybody. A real app keeps one per user and record.
 */
@Title("Expense claim")
public class ClaimWizard extends Wizard implements Draftable {

  public static class Trip implements WizardStep {
    @NotEmpty public String purpose;
  }

  public static class Costs implements WizardStep {
    public Double hotel;
    public Double travel;
  }

  public static class Review implements WizardStep {
    public String comments;
  }

  public static class Sent implements WizardStep {
    @PlainText public String message = "Claim sent.";
  }

  Trip trip = new Trip();
  Costs costs = new Costs();
  Review review = new Review();
  Sent sent;

  /** The saved draft: the step left and the values typed so far. */
  record Draft(String step, String purpose, Double hotel, Double travel, String comments) {}

  static volatile Draft draft;

  @Override
  public Object saveDraft(HttpRequest httpRequest) {
    draft =
        new Draft(currentStepField().getName(), trip.purpose, costs.hotel, costs.travel, review.comments);
    return Message.success("Draft saved on step '" + draft.step() + "'");
  }

  /**
   * Where "Save and close" lands — Mateu has already called {@link #saveDraft}. A route navigates;
   * a {@code Message} would replace the "Draft saved" toast and land on {@code "/"}.
   */
  @Override
  public Object closeDraft(HttpRequest httpRequest) {
    return "/behaviour/wizards/drafts";
  }

  @Override
  public String resumeStep(HttpRequest httpRequest) {
    var saved = draft;
    if (saved == null) {
      return null;
    }
    trip.purpose = saved.purpose();
    costs.hotel = saved.hotel();
    costs.travel = saved.travel();
    review.comments = saved.comments();
    return saved.step();
  }

  @WizardCompletionAction
  @Action(validationRequired = true)
  @Label("Send claim")
  Object send() {
    draft = null;
    return null;
  }
}
