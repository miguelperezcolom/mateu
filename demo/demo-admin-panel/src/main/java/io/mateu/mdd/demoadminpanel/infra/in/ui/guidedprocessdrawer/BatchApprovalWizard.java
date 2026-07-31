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
 * Batch guided process — the Redwood **batch action** shape: a short process that walks the user
 * through a set of selected items <b>one step per item</b>, inside a {@link
 * io.mateu.uidl.data.Drawer}. Here three pending access requests are reviewed one at a time; the
 * step pager in the drawer header shows the progress ("2 | 3").
 *
 * <p>Each item is a step: the same {@link ReviewStep} type is reused across the {@code first} /
 * {@code second} / {@code third} step fields (one field = one step), so a batch of N items reads as
 * N review screens without N step classes. The batch size is fixed here because Mateu wizards
 * declare their steps as fields; a batch whose size is only known at runtime is the documented limit
 * of this pattern (a longer/dynamic flow uses the full-page Guided Process instead).
 */
@UI("/batch-approval-wizard")
@Title("Approve access requests")
@WizardProgress(WizardProgressStyle.STEPS)
public class BatchApprovalWizard extends Wizard {

  public enum Decision {
    APPROVE,
    REJECT
  }

  /** One reviewed item. Reused across every step field so each selected request is its own step. */
  public static class ReviewStep implements WizardStep {

    @PlainText
    @Label("Requester")
    public String requester;

    @PlainText
    @Label("System")
    public String system;

    @Label("Decision")
    public Decision decision = Decision.APPROVE;

    public ReviewStep() {}

    public ReviewStep(String requester, String system) {
      this.requester = requester;
      this.system = system;
    }

    // The completion button lives on the PENULTIMATE step (the last reviewed item, `third`); the
    // framework shows it there automatically even though the method is declared on the shared class.
    @WizardCompletionAction
    @Label("Apply decisions")
    public void apply() {}
  }

  @PlainText
  public static class DoneStep implements WizardStep {
    public String message = "Decisions applied to the 3 requests.";
  }

  public ReviewStep first = new ReviewStep("Ada Lovelace", "VPN");
  public ReviewStep second = new ReviewStep("Bob Stevens", "CRM");
  public ReviewStep third = new ReviewStep("Cleo Nardo", "Wiki");
  public DoneStep done;
}
