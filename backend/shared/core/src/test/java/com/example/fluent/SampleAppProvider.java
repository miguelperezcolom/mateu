package com.example.fluent;

import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class SampleAppProvider implements AppSupplier {

  @Override
  public App getApp(HttpRequest httpRequest) {
    return App.builder()
        .favicon("fav_icon")
        .pageTitle("page_title")
        .title("title")
        .subtitle("subtitle")
        .variant(AppVariant.TABS)
        .menu(
            List.of(
                new Menu("Route 1", new RouteLink("route_1")),
                new Menu("Route 2", new RouteLink("route_2"))))
        .build();
  }
}
