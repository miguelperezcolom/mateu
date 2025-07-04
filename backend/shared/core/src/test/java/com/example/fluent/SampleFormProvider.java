package com.example.fluent;

import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleFormProvider implements ComponentTreeSupplier {

  @Override
  public String id() {
    return "sample-form";
  }

  @Override
  public Form getComponent(HttpRequest httpRequest) {
    return Form.builder()
        .favicon("fav_icon")
        .pageTitle("page_title")
        .title("title")
        .subtitle("subtitle")
        .build();
  }
}
