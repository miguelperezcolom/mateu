package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.VisibleIf;
import lombok.Data;

@Data
@Title("Hide field")
public class HideFieldForm {

  private boolean show;

  @VisibleIf("show")
  private String whatever;
}
