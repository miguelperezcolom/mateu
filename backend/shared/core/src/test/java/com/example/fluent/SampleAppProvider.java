package com.example.fluent;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

@Route("/sample-app")
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
                new RouteLink("/sample-app/route_1", "Route 1"),
                new RouteLink("/sample-app/route_2", "Route 2"),
                new ContentLink("/sample-app/route_3", "Route 3", rq -> new Text("Hola!"))))
        .build();
  }
}
