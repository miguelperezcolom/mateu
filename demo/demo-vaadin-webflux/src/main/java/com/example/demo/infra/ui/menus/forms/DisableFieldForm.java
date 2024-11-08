package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Caption;
import io.mateu.uidl.annotations.EnabledIf;
import lombok.Data;

@Data
@Caption("Disable field")
public class DisableFieldForm {

  private boolean enable;

  @EnabledIf("enable")
  private String whatever;
}
