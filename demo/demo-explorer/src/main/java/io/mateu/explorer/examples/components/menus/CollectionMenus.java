package io.mateu.explorer.examples.components.menus;

import io.mateu.uidl.data.ContextMenu;
import io.mateu.uidl.data.Directory;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.MenuBar;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** The same menus in Java: menus are trees of Actionables — Menu, RouteLink… */
public class CollectionMenus implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                MenuBar.builder()
                    .option(
                        Menu.builder()
                            .label("Collections")
                            .submenu(
                                List.of(
                                    link("Kanban", "/components/visualisation/kanban"),
                                    link("Calendar", "/components/visualisation/calendar")))
                            .build())
                    .option(link("Home", "/home"))
                    .build(),
                ContextMenu.builder()
                    .activateOnLeftClick(true)
                    .menu(List.of(link("Open the Gantt entry", "/components/visualisation/gantt")))
                    .wrapped(new Text("Click this text for a context menu"))
                    .build(),
                Directory.builder()
                    .menu(
                        List.of(
                            Menu.builder()
                                .label("Overlays")
                                .submenu(
                                    List.of(
                                        link("Dialog", "/components/overlays/dialog"),
                                        link("Drawer", "/components/overlays/drawer")))
                                .build()))
                    .build()))
        .build();
  }

  static RouteLink link(String label, String route) {
    return RouteLink.builder().label(label).route(route).build();
  }
}
