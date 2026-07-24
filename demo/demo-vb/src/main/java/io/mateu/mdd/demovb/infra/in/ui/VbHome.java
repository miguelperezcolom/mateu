package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Shell de la demo VB. Fase 6: menú con un GRUPO (submenú), selector de contexto de aplicación
 * (@AppContext — viaja en el appState de cada request) y acciones de cabecera
 * (AppActionsSupplier — botón simple + dropdown con hijos).
 */
@UI("")
@Title("VB Demo")
// HAMBURGUER_MENU explícito para exhibir el navigator-drawer del renderer VB
// (AUTO daría MENU_ON_TOP con este menú: opciones visibles en el header)
@io.mateu.uidl.annotations.App(io.mateu.uidl.fluent.AppVariant.HAMBURGUER_MENU)
public class VbHome implements AppActionsSupplier {

  enum Hotel {
    Playa,
    Centro
  }

  @AppContext(label = "Hotel")
  Hotel hotel;

  @Menu HelloPage hello;

  @Menu ProductsCrud products;

  @Menu GestionMenu gestion;

  @Override
  public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
    return List.of(
        new AppHeaderAction("syncNow", "Sync", "vaadin:refresh"),
        AppHeaderAction.menu(
            "Export",
            "vaadin:download",
            List.of(
                new AppHeaderAction("exportPdf", "As PDF"),
                new AppHeaderAction("exportExcel", "As Excel"))));
  }

  public Message syncNow(HttpRequest httpRequest) {
    var hotel = httpRequest.appContext("hotel");
    return new Message("Synced" + (hotel != null ? " @ " + hotel : ""));
  }

  public Message exportPdf() {
    return new Message("Exported as PDF");
  }

  public Message exportExcel() {
    return new Message("Exported as Excel");
  }
}
