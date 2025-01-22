package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.Title;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Title("Web component")
public class WebComponentForm {

  private ModelViewer modelViewer = new ModelViewer();

}
