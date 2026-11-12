package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * A {@link Wizard}: each field holding a {@link WizardStep} is a step, in declaration order. The
 * PENULTIMATE step (here the review) shows the {@code @WizardCompletionAction} button; the LAST one
 * is the read-only result shown once it has run. {@link #stepApplies} branches: the company step
 * only applies to companies, and is skipped both ways (and left out of the progress) otherwise.
 * Values typed in any step survive going back and forth and reach the completion action.
 */
@Title("New request")
@WizardProgress(WizardProgressStyle.STEPS)
public class Intake extends Wizard {

  public enum RequesterKind {
    Individual,
    Company
  }

  public enum Category {
    Access,
    Equipment,
    Software,
    Other
  }

  public static class Applicant implements WizardStep {
    @NotEmpty public String name;
    @NotEmpty @Email public String email;
    @NotNull public RequesterKind kind = RequesterKind.Individual;
  }

  public static class CompanyDetails implements WizardStep {
    @NotEmpty public String companyName;
    public String vatNumber;
  }

  public static class Details implements WizardStep {
    @NotNull public Category category = Category.Access;
    @NotEmpty public String summary;

    @Stereotype(FieldStereotype.textarea)
    public String description;

    public boolean urgent;
  }

  /** Read-only: filled in from the previous steps just before it is shown. */
  @PlainText
  public static class Review implements WizardStep {
    public String requester;
    public String request;
    @Multiline public String description;
  }

  @PlainText
  public static class Submitted implements WizardStep {
    public String message;
  }

  Applicant applicant = new Applicant();
  CompanyDetails company = new CompanyDetails();
  Details details = new Details();
  Review review = new Review();
  Submitted result;

  @Override
  protected boolean stepApplies(String stepFieldName) {
    if ("company".equals(stepFieldName)) {
      return applicant != null && applicant.kind == RequesterKind.Company;
    }
    return true;
  }

  /** Runs before every move between steps: on the way to the review, it writes the summary. */
  @Override
  protected Object beforeStepNavigate(String fromStep, String toStep, HttpRequest httpRequest) {
    if ("review".equals(toStep)) {
      review.requester = requester() + " <" + applicant.email + ">";
      review.request =
          details.category + ": " + details.summary + (details.urgent ? " (urgent)" : "");
      review.description = details.description;
    }
    return null;
  }

  @WizardCompletionAction
  @Action(validationRequired = true)
  @Label("Submit request")
  Object submit() {
    var saved =
        RequestStore.INSTANCE.add(
            requester(), applicant.email, details.category, details.summary, details.urgent);
    result = new Submitted();
    result.message = "Request " + saved.id() + " submitted. You will find it under Requests.";
    return null;
  }

  private String requester() {
    return applicant.kind == RequesterKind.Company && company.companyName != null
        ? applicant.name + " (" + company.companyName + ")"
        : applicant.name;
  }
}
