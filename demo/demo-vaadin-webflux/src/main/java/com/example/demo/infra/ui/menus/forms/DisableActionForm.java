package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.HasStatus;
import lombok.Data;

@Data
@Title("Disable action")
public class DisableActionForm implements HasStatus {

  @EnabledIf("!active")
  @Action
  public void activate() {
    this.active = true;
  }

  @EnabledIf("active")
  @Action
  public void deactivate() {
    this.active = false;
  }

  @Ignored
  private boolean active;

  @RawContent
  private String msg = "Activate and Deactivate should be enabled or not according to the state.";


  @Override
  public Status getStatus() {
    return new Status(active?StatusType.SUCCESS:StatusType.DANGER, active?"Active":"Inactive");
  }
}
