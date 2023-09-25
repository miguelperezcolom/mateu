package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import lombok.Data;

@Data
@Caption("Booleans")
public class BooleanFieldsForm {

  @Section("Primitives")
  private boolean check;

  @UseRadioButtons private boolean usingRadioButtons;

  @Toggle private boolean toggle;

  @Section("Non primitives")
  private Boolean alsoCheck;

  @UseRadioButtons private Boolean alsoUsingRadioButtons;

  @Toggle private Boolean alsoToggle;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment =
        ""
            + check
            + ", "
            + usingRadioButtons
            + ", "
            + toggle
            + ", "
            + alsoCheck
            + ", "
            + alsoUsingRadioButtons
            + ", "
            + alsoToggle;
  }
}
