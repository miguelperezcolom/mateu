package com.example.fluent;

import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleFragmentProvider implements ComponentTreeSupplier {

  @Override
  public String id() {
    return "x";
  }

  @Override
  public Form getComponent(HttpRequest httpRequest) {
    return Form.builder().title("Hola!").build();
  }
}
