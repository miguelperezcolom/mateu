package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.SameLine;
import io.mateu.uidl.annotations.Title;
import lombok.Data;

@Data
@Title("Same line")
public class SameLineForm {

  private String name;

  @SameLine
  private int age;

  private String newLine;

  @SameLine private String sameLine;

  @SameLine private String sameLineAgain;

  private String fullWidth;
}
