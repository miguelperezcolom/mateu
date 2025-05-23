package com.example.components;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;

public class AnnotatedComponent {

  @Action(type = ActionType.Main)
  String sayHello() {
    return "Hola";
  }
}
