package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.Placeholder;
import io.mateu.core.domain.uidefinition.shared.annotations.ReadOnly;
import io.mateu.core.domain.uidefinition.shared.annotations.Section;
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
