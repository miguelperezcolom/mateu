package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.mdd.demoadminpanel.infra.in.ui.processes.Processes;
import io.mateu.mdd.demoadminpanel.infra.in.ui.wf.WorkflowDefinitions;
import io.mateu.uidl.annotations.Menu;

public class WorkflowMenu {

    @Menu
    WorkflowDefinitions definitions;

    @Menu
    Processes processes;

}
