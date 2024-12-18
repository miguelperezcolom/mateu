package com.example.demo.infra.ui.menus.forms;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Title("Web component")
public class WebComponentForm {

  private ModelViewer modelViewer = new ModelViewer();

}
