package io.mateu.core.infra.declarative.orchestrators.importwizard;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;

/** Result step of the {@link ImportWizard}: how many rows were imported and how many skipped. */
public class ImportResultStep implements WizardStep {

  @PlainText
  @Label("Imported")
  public int imported;

  @PlainText
  @Label("Skipped")
  public int skipped;
}
