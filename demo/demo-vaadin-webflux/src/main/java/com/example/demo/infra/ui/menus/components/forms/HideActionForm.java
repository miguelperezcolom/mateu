package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.HasStatus;
import lombok.Data;

@Data
@Title("Hide action")
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
