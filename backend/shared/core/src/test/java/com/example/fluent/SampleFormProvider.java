package com.example.fluent;

import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.FormSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleFormProvider implements FormSupplier {

  @Override
  public Form getForm(HttpRequest httpRequest) {
    return Form.builder()
        .favicon("fav_icon")
        .pageTitle("page_title")
        .title("title")
        .subtitle("subtitle")
        .build();
  }
}
