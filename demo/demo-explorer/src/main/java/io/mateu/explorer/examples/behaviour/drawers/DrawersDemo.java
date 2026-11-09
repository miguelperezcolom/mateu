package io.mateu.explorer.examples.behaviour.drawers;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;

/**
 * A {@link Drawer} returned from an action slides in from an edge of the viewport. The same record
 * gives the three drawer templates: the general one (subtitle, a size, maximize, peer arrows), the
 * bottom one (full width, collapsible) and a modeless one (no backdrop: the page stays usable).
 */
@Title("Drawers")
public class DrawersDemo {

  String note = "";

  @Button
  Drawer generalDrawer() {
    return Drawer.builder()
        .headerTitle("Order ORD-1003")
        .subtitle("Margaret Hamilton · Madrid")
        .size(DrawerSize.m)
        .maximizable(true)
        .peerNav(
            new PeerNav(
                "Dialogs", "/behaviour/overlays/dialogs", "Close with a result", "/behaviour/overlays/close-with-result"))
        .content(
            new VerticalLayout(
                new Text("Status: Open"), new Text("9 items · 99.50 €"), new Text("Placed on 2026-09-23")))
        .build();
  }

  @Button
  Drawer bottomDrawer() {
    return Drawer.builder()
        .headerTitle("Activity log")
        .position(DrawerPosition.bottom)
        .collapsible(true)
        .content(new Text("09:12 Order created · 09:40 Paid · 11:05 Picked"))
        .build();
  }

  @Button
  Drawer modelessDrawer() {
    return Drawer.builder()
        .headerTitle("Side notes")
        .size(DrawerSize.s)
        .modeless(true)
        .content(new Text("No backdrop: you can keep typing in the page behind."))
        .build();
  }
}
