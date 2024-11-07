package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.Ignored;
import io.mateu.uidl.core.annotations.RawContent;
import io.mateu.uidl.core.annotations.VisibleIf;
import io.mateu.uidl.core.data.Status;
import io.mateu.uidl.core.data.StatusType;
import io.mateu.uidl.core.interfaces.HasStatus;
import lombok.Data;

@Data
@Caption("Hide action")
public class HideActionForm implements HasStatus {

  @VisibleIf("!active")
  @Action
  public void activate() {
    this.active = true;
  }

  @VisibleIf("active")
  @Action
  public void deactivate() {
    this.active = false;
  }

  @Ignored
  private boolean active;

  @RawContent
  private String msg = "Activate and Deactivate should be visible or not according to the state.";


  @Override
  public Status getStatus() {
    return new Status(active?StatusType.SUCCESS:StatusType.DANGER, active?"Active":"Inactive");
  }
}
