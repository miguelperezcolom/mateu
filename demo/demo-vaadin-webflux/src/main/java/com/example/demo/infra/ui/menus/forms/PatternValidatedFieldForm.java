package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.Placeholder;
import io.mateu.uidl.core.annotations.ReadOnly;
import io.mateu.uidl.core.annotations.Section;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class PatternValidatedFieldForm {

  @Section("Pattern protected")
  @NotEmpty
  @Pattern(regexp = "[0-9]*")
  @Placeholder("[0-9]*")
  private String zipCode;

  @Section("Assessment")
  @ReadOnly
  private String assessment;

  @Action
  public void assess() {
    assessment = "" + "" + zipCode;
  }

  public String toString() {
    return "Pattern";
  }
}
