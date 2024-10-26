package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.EnabledIf;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.RawContent;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.Status;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.StatusType;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.HasStatus;
import lombok.Data;

@Data
@Caption("Disable action")
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
