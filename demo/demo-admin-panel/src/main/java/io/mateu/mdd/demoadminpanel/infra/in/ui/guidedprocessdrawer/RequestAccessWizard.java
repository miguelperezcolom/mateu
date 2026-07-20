package io.mateu.mdd.demoadminpanel.infra.in.ui.guidedprocessdrawer;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;

/**
 * A short guided process — request access in three steps — used to demo the Redwood **Guided
 * Process Drawer**: this wizard is embedded inside a {@link
 * io.mateu.mdd.demoadminpanel.infra.in.ui.guidedprocessdrawer.GuidedProcessDrawerDemo} drawer via
 * {@code EmbeddedView}, so it advances step by step inside the drawer.
 */
@UI("/request-access-wizard")
@Title("Request access")
@WizardProgress(WizardProgressStyle.STEPS)
public class RequestAccessWizard extends Wizard {

  public static class WhoStep implements WizardStep {
    @Label("Your name")
    public String name = "";

    @Label("Team")
    public String team = "";
  }

  public static class WhatStep implements WizardStep {
    @Label("System")
    public String system = "";

    @Label("Reason")
    public String reason = "";

    @WizardCompletionAction
    @Label("Request")
    public void request() {}
  }

  @PlainText
  public static class DoneStep implements WizardStep {
    public String message = "Access requested. You'll get an email when it's approved.";
  }

  public WhoStep who = new WhoStep();
  public WhatStep what = new WhatStep();
  public DoneStep done;
}
