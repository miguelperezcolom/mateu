package com.example.uis.apps;

import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HasMenu;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class SimpleApp implements App, HasMenu {
  @Override
  public List<Actionable> createMenu(HttpRequest httpRequest) {
    return List.of(new RouteLink("route", "label"));
  }
}
