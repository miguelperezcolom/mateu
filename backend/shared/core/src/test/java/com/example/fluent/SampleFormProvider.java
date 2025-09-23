package com.example.fluent;

import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleFormProvider implements ComponentTreeSupplier {

  @Override
  public String id() {
    return "sample-form";
  }

  @Override
  public Form component(HttpRequest httpRequest) {
    return Form.builder().title("title").subtitle("subtitle").build();
  }
}
