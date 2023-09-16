package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.StyleClassNameConstants;
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
