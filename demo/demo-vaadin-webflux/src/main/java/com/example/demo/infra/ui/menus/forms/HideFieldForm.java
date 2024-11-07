package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.Caption;
import io.mateu.uidl.core.annotations.VisibleIf;
import lombok.Data;

@Data
@Caption("Hide field")
public class HideFieldForm {

  private boolean show;

  @VisibleIf("show")
  private String whatever;
}
