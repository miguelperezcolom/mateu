package io.mateu.mdd.demoadminpanel.infra.in.ui.guidedprocessdrawer;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.EmbeddedView;

/**
 * Demo of the Redwood **Guided Process Drawer**: a toolbar action opens a short multi-step {@link
 * RequestAccessWizard} inside a {@link Drawer} — wrapped as an {@link EmbeddedView} so the wizard
 * runs as an independent embedded component and advances step by step inside the drawer, without
 * leaving the page underneath. For a subflow or a batch action (≤5 steps); a longer process uses the
 * full-page Guided Process (a {@code Wizard} route).
 */
@UI("/guided-process-drawer-demo")
@Title("Accesos")
@PlainText
public class GuidedProcessDrawerDemo {

  String hint = "Pulsa \"Solicitar acceso\" para abrir el asistente guiado en un drawer.";

  @Toolbar
  Drawer solicitarAcceso() {
    return Drawer.builder()
        .id("access-wizard-drawer")
        .headerTitle("Request access")
        .size(DrawerSize.m)
        .content(new EmbeddedView(new RequestAccessWizard()))
        .build();
  }
}
