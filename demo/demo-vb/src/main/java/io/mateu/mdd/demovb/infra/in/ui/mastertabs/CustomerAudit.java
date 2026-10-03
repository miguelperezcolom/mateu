package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/**
 * The Audit tab, behind the `audit` feature flag (routes.yaml `show: audit`). The flag is off in
 * this demo ({@link DemoFeatureFlags}), so the tab is not in the bar — but its URL still answers.
 */
@Title("Audit")
public class CustomerAudit {

  @ReadOnly String customerId;

  @ReadOnly String note = "Only for auditors";
}
