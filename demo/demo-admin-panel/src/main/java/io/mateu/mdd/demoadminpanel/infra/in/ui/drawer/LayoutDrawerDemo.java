package io.mateu.mdd.demoadminpanel.infra.in.ui.drawer;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.Text;

/**
 * Demo of the Redwood drawer **layout (push) mode**: instead of floating over the page with a
 * backdrop, a {@code .layout(true)} drawer docks to its edge and PUSHES the page content aside
 * (reflow) so both stay usable at once — non-modal.
 *
 * <p>"Ver detalles" opens a side (end) drawer that pushes the page horizontally; "Panel inferior"
 * opens a {@link DrawerPosition#bottom} drawer that pushes the page vertically.
 */
@UI("/layout-drawer-demo")
@Title("Layout drawer")
@PlainText
public class LayoutDrawerDemo {

  String hint =
      "Los drawers en modo layout (push) no flotan sobre la página: la empujan y ambos quedan "
          + "usables a la vez. Pulsa \"Ver detalles\" (empuje lateral) o \"Panel inferior\" "
          + "(empuje vertical).";

  Button verDetallesBtn = Button.builder().label("Ver detalles").actionId("verDetalles").build();
  Button panelInferiorBtn =
      Button.builder().label("Panel inferior").actionId("panelInferior").build();

  @Toolbar
  Drawer verDetalles() {
    return Drawer.builder()
        .id("layout-drawer")
        .headerTitle("Detalles")
        .size(DrawerSize.m)
        .layout(true)
        .content(
            new Text(
                "Drawer lateral en modo layout: la página se reflowó a la izquierda en lugar de "
                    + "quedar cubierta por un backdrop. No es modal — puedes seguir usando la "
                    + "página mientras el panel está abierto."))
        .build();
  }

  @Toolbar
  Drawer panelInferior() {
    return Drawer.builder()
        .id("layout-drawer-bottom")
        .headerTitle("Panel inferior")
        .position(DrawerPosition.bottom)
        .layout(true)
        .content(
            new Text(
                "Drawer inferior en modo layout: empuja la página hacia arriba (reflow vertical) "
                    + "en lugar de solaparla."))
        .build();
  }
}
