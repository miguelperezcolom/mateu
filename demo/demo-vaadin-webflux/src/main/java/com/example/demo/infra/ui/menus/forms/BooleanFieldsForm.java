package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Label;
import lombok.Data;

@Data
@Title("Booleans")
@FormColumns(2)
public class BooleanFieldsForm {

  @Section("Primitives")
  private boolean check;

  @UseRadioButtons
  private boolean usingRadioButtons;

  @Toggle
  private boolean toggle;

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
