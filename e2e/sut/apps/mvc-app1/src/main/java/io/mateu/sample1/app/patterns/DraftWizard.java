package io.mateu.sample1.app.patterns;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.Draftable;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;

/**
 * Pattern gaps showcase: the transactional guided process — Save / Save and close (drafts), Skip on
 * an optional step, finishing early from the preferences step, and a cancelable before-step hook.
 */
@UI("/patterns/wizard")
@Title("Onboarding")
@WizardProgress(WizardProgressStyle.STEPS)
public class DraftWizard extends Wizard implements Draftable {

  public static class Contact implements WizardStep {
    @NotEmpty public String email = "ada@example.com";
    public String phone = "";
  }

  public static class Preferences implements WizardStep {
    public boolean newsletter = false;
    public String language = "English";
  }

  public static class Extras implements WizardStep {
    public String notes = "";
  }

  public static class Done implements WizardStep {
    @PlainText public String result = "";
  }

  Contact contact = new Contact();
  Preferences preferences = new Preferences();
  Extras extras = new Extras();
  Done done;

  @Override
  public Object saveDraft(HttpRequest httpRequest) {
    return Message.success("Draft saved for " + contact.email);
  }

  @Override
  protected boolean stepSkippable(String stepFieldName) {
    return "preferences".equals(stepFieldName) || "extras".equals(stepFieldName);
  }

  @Override
  protected Object beforeStepNavigate(String fromStep, String toStep, HttpRequest httpRequest) {
    if ("contact".equals(fromStep) && contact.email.endsWith("@blocked.test")) {
      return Message.error("That e-mail domain is not allowed");
    }
    return null;
  }

  @WizardCompletionAction(availableFromStep = "preferences")
  @Label("Finish now")
  Object finish() {
    done = new Done();
    done.result = "Welcome aboard, " + contact.email;
    return null;
  }
}
