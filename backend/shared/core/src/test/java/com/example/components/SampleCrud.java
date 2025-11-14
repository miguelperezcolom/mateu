package com.example.components;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleCrud implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Listing.builder().build();
  }
}
