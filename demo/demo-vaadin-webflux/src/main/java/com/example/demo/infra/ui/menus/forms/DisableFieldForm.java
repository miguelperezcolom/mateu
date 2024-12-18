package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.EnabledIf;
import io.mateu.uidl.annotations.Title;
import lombok.Data;

@Data
@Title("Disable field")
public class DisableFieldForm {

  private boolean enable;

  @EnabledIf("enable")
  private String whatever;
}
