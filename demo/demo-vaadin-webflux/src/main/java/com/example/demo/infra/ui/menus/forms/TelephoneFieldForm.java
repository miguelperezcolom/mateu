package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.TelephoneNumber;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Title("Telephone field with prefix")
public class TelephoneFieldForm {

  @Section("Telephones")
  @NotNull
  private TelephoneNumber home;

  private TelephoneNumber work =
      new TelephoneNumber("+34", "971123456");

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + home + ", " + work;
  }
}
