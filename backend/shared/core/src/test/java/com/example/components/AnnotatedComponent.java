package com.example.components;

import io.mateu.uidl.annotations.Action;

public class AnnotatedComponent {

  @Action
  String sayHello() {
    return "Hola";
  }
}
