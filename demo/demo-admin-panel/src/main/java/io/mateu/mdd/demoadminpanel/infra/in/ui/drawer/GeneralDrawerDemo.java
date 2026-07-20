package io.mateu.mdd.demoadminpanel.infra.in.ui.drawer;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.data.Text;

/**
 * Demo of the Redwood **General Drawer**: a toolbar action opens a read-only detail panel with the
 * four header extras — subtitle, a standard size, a maximize button, and previous/next-object
 * arrows. The drawer keeps the page underneath visible (info without losing context).
 */
@UI("/general-drawer-demo")
@Title("Directorio")
@PlainText
public class GeneralDrawerDemo {

  String hint = "Pulsa \"Ver ficha\" para abrir el General Drawer.";

  @Toolbar
  Drawer verFicha() {
    return Drawer.builder()
        .headerTitle("Ada Lovelace")
        .subtitle("Employee #100 · Engineering")
        .size(DrawerSize.l)
        .maximizable(true)
        .peerNav(new PeerNav(null, null, "Alan Turing", "/general-drawer-demo"))
        .content(
            new Text(
                "Read-only details: joined 2021, London office, mentor to 3 juniors. "
                    + "Use the ‹ › arrows to move across peers and ⤢ to widen the panel."))
        .build();
  }
}
