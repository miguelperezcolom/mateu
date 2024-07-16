package com.example.demo.infra.ui.menus.forms;

import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.SameLine;
import io.mateu.core.domain.uidefinition.shared.annotations.StyleClassNames;
import io.mateu.core.domain.uidefinition.shared.interfaces.StyleClassNameConstants;
import lombok.Data;

@Data
@Caption("Same line")
public class SameLineForm {

  private String name;

  @SameLine
  @StyleClassNames(StyleClassNameConstants.ColDesktop2)
  private int age;

  private String newLine;

  @SameLine private String sameLine;

  @SameLine private String sameLineAgain;

  private String fullWidth;
}
