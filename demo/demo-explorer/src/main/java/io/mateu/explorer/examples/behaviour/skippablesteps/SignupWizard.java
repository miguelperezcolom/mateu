package io.mateu.explorer.examples.behaviour.skippablesteps;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;

/**
 * Two hooks of the guided process:
 *
 * <ul>
 *   <li>{@link #stepSkippable} — the step is there, but a "Skip" button moves on without its
 *       required fields (unlike {@code stepApplies}, which removes a step);
 *   <li>{@link #beforeStepNavigate} — runs before EVERY move (next, back, skip, jump, completion);
 *       return null to allow it, anything else cancels it and is the answer.
 * </ul>
 */
@Title("Sign up")
public class SignupWizard extends Wizard {

  public static class Account implements WizardStep {
    @NotEmpty public String userName;
  }

  public static class Interests implements WizardStep {
    @NotEmpty public String topics;
  }

  public static class Finish implements WizardStep {
    public boolean acceptTerms = true;
  }

  public static class Welcome implements WizardStep {
    @PlainText public String message = "Welcome aboard!";
  }

  Account account = new Account();
  Interests interests = new Interests();
  Finish finish = new Finish();
  Welcome welcome;

  @Override
  protected boolean stepSkippable(String stepFieldName) {
    return "interests".equals(stepFieldName);
  }

  @Override
  protected Object beforeStepNavigate(String fromStep, String toStep, HttpRequest httpRequest) {
    if ("account".equals(fromStep) && "admin".equalsIgnoreCase(account.userName)) {
      return Message.error("'admin' is reserved — pick another user name");
    }
    return null;
  }

  @WizardCompletionAction
  @Action(validationRequired = true)
  @Label("Create account")
  Object create() {
    return null;
  }
}
