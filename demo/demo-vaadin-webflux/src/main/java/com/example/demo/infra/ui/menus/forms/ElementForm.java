package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.core.annotations.Action;
import io.mateu.uidl.core.annotations.Caption;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Caption("Html element")
public class ElementForm {

  private ElementFormDiv div = new ElementFormDiv();

  @Action(visible = false)
  public void xx() {
    div.content = "Filled from xx";
  }

}
