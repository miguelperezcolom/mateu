package com.example.demoremote.ui.demoApp.menus.forms;

import com.example.demoremote.domains.nfl.dtos.Conference;
import com.example.demoremote.domains.nfl.dtos.Division;
import io.mateu.mdd.shared.annotations.*;
import lombok.Data;

@Data
@Caption("Enums")
public class EnumFieldsForm {

  @Section("Enums")
  @UseRadioButtons
  private Conference conference;

  private Division division;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + ", " + conference + ", " + division;
  }
}
