package io.mateu.mdd.demoadminpanel.infra.in.ui.drawer;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import java.util.List;

/**
 * Demo of a **bottom drawer with a tab bar**: a {@link DrawerPosition#bottom} + {@code
 * .collapsible(true)} drawer whose {@code content} is a fluent {@link TabLayout}. The bottom drawer
 * then shows a tab strip along its top, so several supporting panels share the docked bottom area
 * (the ▾/▴ handle collapses it to its header strip). No new API — just a {@code TabLayout} as the
 * drawer content.
 */
@UI("/bottom-tabs-drawer-demo")
@Title("Pedido #4471")
@PlainText
public class BottomTabsDrawerDemo {

  String hint = "Pulsa \"Detalles\" para abrir el Bottom Drawer con pestañas (colapsable con ▾).";

  @Toolbar
  Drawer detalles() {
    TabLayout tabs =
        TabLayout.builder()
            .id("order-tabs")
            .tabs(
                List.of(
                    new Tab(
                        "Líneas",
                        new Text("3 líneas · Widget ×2, Gadget ×1 · 240,00 €")),
                    new Tab(
                        "Pagos",
                        new Text("Pagado 120,00 € · pendiente 120,00 € · tarjeta ····4242")),
                    new Tab(
                        "Envío",
                        new Text("Enviado el 12/03/2026 · seguimiento ES-99XX · entregado"))))
            .build();
    return Drawer.builder()
        .id("bottom-tabs-drawer")
        .headerTitle("Detalles del pedido #4471")
        .position(DrawerPosition.bottom)
        .collapsible(true)
        .content(tabs)
        .build();
  }
}
