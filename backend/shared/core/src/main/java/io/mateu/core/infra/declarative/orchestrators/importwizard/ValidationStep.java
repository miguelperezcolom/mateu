package io.mateu.core.infra.declarative.orchestrators.importwizard;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import java.util.ArrayList;
import java.util.List;

/**
 * Third (penultimate) step of the {@link ImportWizard}: read-only counts plus one {@link RowIssue}
 * per conversion failure or constraint violation, computed when entering the step. Carries the
 * {@code @WizardCompletionAction} button.
 */
public class ValidationStep implements WizardStep {

  @PlainText
  @Label("Valid rows")
  public int validRows;

  @PlainText
  @Label("Rows with problems")
  public int invalidRows;

  @ReadOnly
  @Label("Issues")
  public List<RowIssue> issues = new ArrayList<>();
}
