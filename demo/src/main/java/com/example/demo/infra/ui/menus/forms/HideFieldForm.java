package com.example.demo.infra.ui.menus.forms;

import io.mateu.domain.uidefinition.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.VisibleIf;
import lombok.Data;

@Data
@Caption("Hide field")
public class HideFieldForm {

  private boolean show;

  @VisibleIf("show")
  private String whatever;
}
