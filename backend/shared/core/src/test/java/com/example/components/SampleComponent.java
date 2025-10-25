package com.example.components;

import io.mateu.uidl.data.Div;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleComponent implements ComponentTreeSupplier {
  @Override
  public Component component(HttpRequest httpRequest) {
    return Div.builder().build();
  }

  public String sayHello() {
    return "Hello World!";
  }
}
