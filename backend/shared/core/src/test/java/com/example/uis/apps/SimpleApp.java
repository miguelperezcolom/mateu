package com.example.uis.apps;

import io.mateu.uidl.data.GoToRoute;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteTarget;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HasMenu;
import java.util.List;

public class SimpleApp implements App, HasMenu {
  @Override
  public List<Menu> createMenu() {
    return List.of(new Menu("label", new GoToRoute("route", RouteTarget.Top), List.of()));
  }
}
