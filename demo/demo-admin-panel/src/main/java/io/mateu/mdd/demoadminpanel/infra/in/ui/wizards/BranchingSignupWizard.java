package io.mateu.mdd.demoadminpanel.infra.in.ui.wizards;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * Demo of a branching wizard: the "Company details" step only applies when the account type chosen
 * in the first step is COMPANY — otherwise it is skipped in both directions and excluded from the
 * progress bar.
 */
@UI("/branching-wizard")
@Title("Signup (branching)")
public class BranchingSignupWizard extends Wizard {

  public enum AccountType {
    PERSONAL,
    COMPANY
  }

  public static class AccountTypeStep implements WizardStep {
    @NotNull public AccountType accountType = AccountType.PERSONAL;
    @NotEmpty public String email;
  }

  public static class CompanyDetailsStep implements WizardStep {
    @NotEmpty public String companyName;
    public String vatNumber;
  }

  public static class PlanStep implements WizardStep {
    @NotNull public Plan plan = Plan.FREE;
  }

  public enum Plan {
    FREE,
    PRO
  }

  public static class ResultStep implements WizardStep {
    @PlainText public String message = "Account created!";
  }

  AccountTypeStep account = new AccountTypeStep();
  CompanyDetailsStep company = new CompanyDetailsStep();
  PlanStep plan = new PlanStep();
  ResultStep result;

  @Override
  protected boolean stepApplies(String stepFieldName) {
    if ("company".equals(stepFieldName)) {
      return account != null && account.accountType == AccountType.COMPANY;
    }
    return true;
  }

  @WizardCompletionAction
  @Action(validationRequired = true)
  @Label("Create account")
  Object finish() {
    return null;
  }
}
