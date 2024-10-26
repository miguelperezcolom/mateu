package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.RawContent;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.VisibleIf;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.Status;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.StatusType;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.HasStatus;
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
