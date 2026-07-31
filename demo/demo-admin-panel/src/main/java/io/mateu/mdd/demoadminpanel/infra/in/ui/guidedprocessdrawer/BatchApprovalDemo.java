package io.mateu.mdd.demoadminpanel.infra.in.ui.guidedprocessdrawer;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.EmbeddedView;

/**
 * Demo of a **batch action** via a Guided Process Drawer: a toolbar action opens the {@link
 * BatchApprovalWizard} in a drawer to review a set of selected items one step per item, without
 * leaving the page. The step pager in the drawer header tracks progress ("1 | 3" → "3 | 3").
 */
@UI("/batch-approval-demo")
@Title("Pending access requests")
@PlainText
public class BatchApprovalDemo {

  String hint = "3 requests are pending. Press \"Approve requests\" to review them one by one.";

  @Toolbar
  Drawer approveRequests() {
    return Drawer.builder()
        .id("batch-approval-drawer")
        .headerTitle("Approve requests")
        .size(DrawerSize.m)
        .content(new EmbeddedView(new BatchApprovalWizard()))
        .build();
  }
}
