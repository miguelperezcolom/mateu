package com.example.fluent;

import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.PageSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class SamplePageProvider implements PageSupplier {

  @Override
  public Page getPage(HttpRequest httpRequest) {
    return Page.builder()
        .favicon("fav_icon")
        .pageTitle("page_title")
        .title("title")
        .subtitle("subtitle")
        .build();
  }
}
