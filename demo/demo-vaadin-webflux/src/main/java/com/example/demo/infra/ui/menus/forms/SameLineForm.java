package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.SameLine;
import lombok.Data;

@Data
@Caption("Same line")
public class SameLineForm {

  private String name;

  @SameLine
  private int age;

  private String newLine;

  @SameLine private String sameLine;

  @SameLine private String sameLineAgain;

  private String fullWidth;
}
