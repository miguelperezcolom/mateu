package com.example.fluent;

import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.PageSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleFragmentProvider implements PageSupplier {
  @Override
  public Page getPage(HttpRequest httpRequest) {
    return Page.builder().title("Hola!").build();
  }
}
