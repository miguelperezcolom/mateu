package com.acme.pms.ui;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.workflow.infra.in.ui.WorkflowMenu;

/**
 * The application's shell: its own screens and EventConductor's, side by side. {@link
 * WorkflowMenu} is the navigation contract EventConductor offers to embedders — definitions,
 * processes, steps, task contracts and analytics.
 */
@UI("")
@Title("Acme PMS")
public class PmsHome {

  @Menu FrontDesk frontDesk;

  @Menu
  @Label("Workflow")
  WorkflowMenu workflow;
}
