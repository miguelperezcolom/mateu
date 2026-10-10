package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.data.GlobalSearchResult;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
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
// themeToggle: the header's light/dark switch (JET's inverted colour scheme on Redwood)
@io.mateu.uidl.annotations.App(value = io.mateu.uidl.fluent.AppVariant.HAMBURGUER_MENU, themeToggle = true)
// Chat de IA: sseUrl → el shell VB muestra el panel de conversación. Ruta RELATIVA same-origin (el
// chat VB antepone el base a la sseUrl) → ChatAgentController, que hace de proxy al agente local del
// demo (frontend/promo/local-agent.mjs, :8777): autora la definición Mateu y emite `render-screen`,
// y la pantalla aparece en ChatGenerate.
@io.mateu.uidl.annotations.AI(sse = "/agent/stream")
public class VbHome implements AppActionsSupplier, GlobalSearchSupplier {

  enum Hotel {
    Playa,
    Centro
  }

  @AppContext(label = "Hotel")
  Hotel hotel;

  @Menu WelcomePage welcome;

  // AI "chat → screen": open the chat, ask for a screen, it renders here (like the Vaadin demo).
  @Menu ChatGenerate aiScreen;

  // AI "prompt → screen": a button-driven variant of the same authoring.
  @Menu GenerateScreen generate;

  @Menu HelloPage hello;

  @Menu ProductsCrud products;

  @Menu StockCrud stock;

  @Menu BookingFoldout booking;

  @Menu io.mateu.mdd.demovb.infra.in.ui.checkout.CheckoutWizard checkout;

  @Menu RequisitionsOverview requisitions;

  @Menu ChairOverview chair;

  @Menu GestionMenu gestion;

  // «Record master with page tabs»: the listing (a row opens /customers/:customerId, an App(TABS)
  // whose tabs are its routes.yaml children) and the one-page variant (@Tab(key) + @Subresource)
  @Menu String customers = "/customers";

  @Menu String customerOverview = "/customer-overview/3";

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

  /** GlobalSearchSupplier: the Ask palette (Redwood) and the ⌘K palette (Vaadin) find these too. */
  @Override
  public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase();
    return List.of(
            new GlobalSearchResult("Laptop", "LP-100", "/products", "Products"),
            new GlobalSearchResult("Mouse", "MS-210", "/products", "Products"),
            new GlobalSearchResult("Ada Lovelace", "Customer 1", "/customers/1", "Customers"))
        .stream()
        .filter(r -> (r.label() + " " + r.description()).toLowerCase().contains(text))
        .toList();
  }

  /** An app-level floating action button: on every screen. */
  @Fab(icon = "vaadin:refresh", label = "Quick sync")
  public Message quickSync(HttpRequest httpRequest) {
    return new Message("Quick sync done");
  }

  public Message exportPdf() {
    return new Message("Exported as PDF");
  }

  public Message exportExcel() {
    return new Message("Exported as Excel");
  }
}
