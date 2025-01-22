package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Title("Html element")
public class ElementForm {

  private ElementFormDiv div = new ElementFormDiv();

  @Action(visible = false)
  public void xx() {
    div.content = "Filled from xx";
  }

}
