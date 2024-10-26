package com.example.demo.infra.ui.menus.forms;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.VisibleIf;
import lombok.Data;

@Data
@Caption("Hide field")
public class HideFieldForm {

  private boolean show;

  @VisibleIf("show")
  private String whatever;
}
