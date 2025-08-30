package com.example.components;

import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleApp implements AppSupplier {

  @Override
  public App getApp(HttpRequest httpRequest) {
    return App.builder().build();
  }
}
