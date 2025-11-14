package com.example.components;

import io.mateu.uidl.annotations.Button;

public class AnnotatedComponent {

  @Button
  String sayHello() {
    return "Hola";
  }
}
