package com.example.demo.infra.ui.menus.forms;

import com.example.demo.domain.nfl.dtos.Conference;
import com.example.demo.domain.nfl.dtos.Division;
import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.UseRadioButtons;
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
