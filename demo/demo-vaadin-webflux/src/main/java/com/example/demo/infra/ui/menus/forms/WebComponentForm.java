package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Caption;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Caption("Web component")
public class WebComponentForm {

  private ModelViewer modelViewer = new ModelViewer();

}
