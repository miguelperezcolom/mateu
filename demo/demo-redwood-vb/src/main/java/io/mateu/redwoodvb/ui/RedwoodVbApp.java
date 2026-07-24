package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Fase 6 — a complex app shell: a DEEP menu (the "Catálogo" submenu groups Products + Contacts),
 * an {@code @AppContext} selector (Entorno) on the header, and header actions (Sync + an Export
 * dropdown) via {@link AppActionsSupplier}.
 */
@UI("")
@Title("Mateu on Visual Builder")
@App(value = AppVariant.MENU_ON_TOP, themeToggle = true)
public class RedwoodVbApp implements AppActionsSupplier {

  @Menu Home home;
  @Menu Profile profile;
  @Menu Catalogo catalogo;
  @Menu BookingFoldout foldout;
  @Menu Reports reports;
  @Menu Settings settings;

  public enum Entorno {
    DEV,
    STAGING,
    PRODUCCION
  }

  @AppContext(label = "Entorno")
  Entorno entorno;

  @Override
  public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
    return List.of(
        new AppHeaderAction("syncNow", "Sync", "vaadin:refresh"),
        AppHeaderAction.menu(
            "Exportar",
            "vaadin:download",
            List.of(
                new AppHeaderAction("exportPdf", "PDF"),
                new AppHeaderAction("exportExcel", "Excel"))));
  }

  public Message syncNow() {
    return new Message("Sincronizado");
  }

  public Message exportPdf() {
    return new Message("Exportado a PDF");
  }

  public Message exportExcel() {
    return new Message("Exportado a Excel");
  }
}
