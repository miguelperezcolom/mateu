package com.example.demo.infra.ui.menus.components.forms;

import com.example.demo.domain.nfl.dtos.Conference;
import com.example.demo.domain.nfl.dtos.Division;
import io.mateu.uidl.annotations.*;
import lombok.Data;

@Data
@Title("Enums")
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
