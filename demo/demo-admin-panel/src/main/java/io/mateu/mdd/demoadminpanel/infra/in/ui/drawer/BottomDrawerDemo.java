package io.mateu.mdd.demoadminpanel.infra.in.ui.drawer;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.data.Text;

/**
 * Demo of the Redwood **Bottom Drawer**: a toolbar action opens a full-width panel docked at the
 * bottom edge. It is {@code collapsible} — the ▾/▴ handle in the header shrinks it to its header
 * strip and expands it back (client-side), so the user keeps the panel handy without covering the
 * page.
 */
@UI("/bottom-drawer-demo")
@Title("Pedidos")
@PlainText
public class BottomDrawerDemo {

  String hint = "Pulsa \"Ver líneas\" para abrir el Bottom Drawer (colapsable con ▾).";

  @Toolbar
  Drawer verLineas() {
    return Drawer.builder()
        .headerTitle("Líneas del pedido #4471")
        .position(DrawerPosition.bottom)
        .collapsible(true)
        .content(
            new Text(
                "3 líneas · 240,00 € · usa el ▾ de la cabecera para colapsar el panel a su tira "
                    + "y ▴ para volver a expandirlo, sin perder de vista la página."))
        .build();
  }
}
