package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Caption;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Caption("Web component")
public class WebComponentForm {

  private ModelViewer modelViewer = new ModelViewer();
}
