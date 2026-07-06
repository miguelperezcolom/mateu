package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Tabs;
import io.mateu.uidl.annotations.Title;

/**
 * Tabbed reference panel shown inside the {@link CheckInFormV4} drawer. Each secondary section of
 * the check-in is a tab (with an {@code alt+N} keyboard shortcut) so the receptionist can drill into
 * detail on demand — and only when needed — without leaving the main check-in form underneath.
 *
 * <p>The <b>Cardex</b> tab is marked {@link Tab#open() open=true}, so it is the one selected when the
 * drawer first opens (instead of the default first-declared tab). Reuses the exact same section
 * components as {@link CheckInFormV2}; here they live behind the drawer's tabs instead of stacked in
 * the page. Wrapped as a {@code ModelViewComponent} so this plain reflective form renders as the
 * drawer's content.
 */
@PlainText
@ReadOnly
@Tabs
@Title("")
public class CheckInReferenceDrawer {

  @Tab(value = "Cardex", shortcut = "alt+1", open = true)
  @Label("")
  CardexSection cardex = new CardexSection();

  @Tab(value = "Empresa", shortcut = "alt+2")
  @Label("")
  CompanyDataSection company = new CompanyDataSection();

  @Tab(value = "Tarjeta", shortcut = "alt+3")
  @Label("")
  CardDataSection card = new CardDataSection();

  @Tab(value = "Histórico", shortcut = "alt+4")
  @Label("")
  ClientHistorySection clientHistory = new ClientHistorySection();

  @Tab(value = "Preferencias", shortcut = "alt+5")
  @Label("")
  PreferencesSection preferences = new PreferencesSection();

  @Tab(value = "Importes", shortcut = "alt+6")
  @Label("")
  ImportesSection importes = new ImportesSection();

  @Tab(value = "Habitación", shortcut = "alt+7")
  @Label("")
  RoomInfoSection roomInfo = new RoomInfoSection();

  @Tab(value = "Historial", shortcut = "alt+8")
  @Label("")
  HistorialClienteSection historial = new HistorialClienteSection();

  @Tab(value = "Folios", shortcut = "alt+9")
  @Label("")
  FoliosSection folios = new FoliosSection();

  void populate(ReservationLine line) {
    cardex.populate(line);
    // Seed the embedded cardex with the lead guest so it shows data on first open.
    if (!line.getGuests().isEmpty()) {
      CardexView.prime(line.getGuests().get(0).getCardex());
    }
    company.populate(line);
    card.populate(line);
    clientHistory.populate(line);
    preferences.populate(line);
    importes.populate(line);
    roomInfo.populate(line);
    historial.populate(line);
    folios.populate(line);
  }
}
