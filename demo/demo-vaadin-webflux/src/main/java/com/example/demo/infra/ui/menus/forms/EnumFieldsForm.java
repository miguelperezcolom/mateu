package com.example.demo.infra.ui.menus.forms;

import com.example.demo.domain.nfl.dtos.Conference;
import com.example.demo.domain.nfl.dtos.Division;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Section;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.UseRadioButtons;
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
