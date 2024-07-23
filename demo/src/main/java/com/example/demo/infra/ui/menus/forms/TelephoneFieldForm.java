package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
import io.mateu.core.domain.uidefinition.shared.data.TelephoneNumber;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Caption("Telephone field with prefix")
public class TelephoneFieldForm {

  @Section("Telephones")
  @NotNull
  private TelephoneNumber home;

  private TelephoneNumber work =
      TelephoneNumber.builder().prefix("+34").number("971123456").build();

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + home + ", " + work;
  }
}
