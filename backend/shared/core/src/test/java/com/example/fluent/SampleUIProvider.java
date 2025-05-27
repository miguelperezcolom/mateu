package com.example.fluent;

import io.mateu.uidl.fluent.UI;
import io.mateu.uidl.fluent.UISupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SampleUIProvider implements UISupplier {
  @Override
  public UI getUI(HttpRequest httpRequest) {
    return UI.builder().favicon("fav_icon").pageTitle("page_title").build();
  }
}
