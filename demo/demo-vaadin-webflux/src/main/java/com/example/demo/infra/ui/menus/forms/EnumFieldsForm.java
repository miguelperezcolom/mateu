package com.example.demo.infra.ui.menus.forms;

import com.example.demo.domain.nfl.dtos.Conference;
import com.example.demo.domain.nfl.dtos.Division;
import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.annotations.Section;
import io.mateu.uidl.core.annotations.UseRadioButtons;
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
