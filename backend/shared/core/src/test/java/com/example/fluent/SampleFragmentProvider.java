package com.example.fluent;

import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleFragmentProvider implements FormSupplier {
  @Override
  public Form getForm(HttpRequest httpRequest) {
    return Form.builder().title("Hola!").build();
  }
}
