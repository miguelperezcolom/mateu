package com.example.demo.infra.ui.menus.forms;

import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.EnabledIf;
import lombok.Data;

@Data
@Caption("Disable field")
public class DisableFieldForm {

  private boolean enable;

  @EnabledIf("enable")
  private String whatever;
}
