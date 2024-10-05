package com.example.demo.infra.ui.menus.forms;

import com.example.demo.infra.ui.menus.othercomponents.MyDiv;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
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
