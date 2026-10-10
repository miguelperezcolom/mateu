package io.mateu.mdd.demovbpms.infra.in.ui.financials;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Aggregate;
import io.mateu.uidl.annotations.DragRows;
import io.mateu.uidl.annotations.GroupBy;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.data.DropZone;
import io.mateu.uidl.data.GridTrack;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.ResponsiveGrid;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Folio windows (OPERA Cloud 26.3 user guide, 006 "Billing": up to eight windows per folio, and
 * charges are moved between windows by dragging them). The reservation's charges grouped by window
 * with subtotals; select some, drag them onto another window's card, and they move there.
 */
@UI("/folio-windows")
@Title("Folio windows")
@DragRows("charge")
public class FolioWindows implements Listing<FolioWindows.ChargeRow>, HeaderSupplier {

  static final List<String> PAYEES =
      List.of("Guest", "Guest (cash)", "Company (Acme Corp)", "Travel agent");

  public record ChargeRow(
      String id,
      @GroupBy String window,
      LocalDate date,
      String code,
      String description,
      @Aggregate(AggregateFunction.sum) BigDecimal amount) {}

  static Hotel.Reservation reservation() {
    return Hotel.RESERVATIONS.stream()
        .filter(x -> x.status == Hotel.ReservationStatus.IN_HOUSE)
        .findFirst()
        .orElseThrow();
  }

  static String windowLabel(int w) {
    return "Window " + w + " · " + PAYEES.get(Math.min(w, PAYEES.size()) - 1);
  }

  @Override
  public ListingData<ChargeRow> search(SearchRequest request, HttpRequest httpRequest) {
    var rows = new ArrayList<ChargeRow>();
    for (var c : Hotel.chargesOf(reservation().id)) {
      rows.add(
          new ChargeRow(
              c.id(), windowLabel(c.window()), c.date(), c.code(), c.description(),
              c.amount().add(c.tax())));
    }
    rows.sort((a, b) -> a.window().compareTo(b.window()) != 0 ? a.window().compareTo(b.window()) : a.date().compareTo(b.date()));
    return ListingData.from(rows);
  }

  @Override
  public boolean selectionEnabled() {
    return true;
  }

  /** The windows as drop targets: each card with its balance; dropping charges moves them. */
  @Override
  public List<Component> header(HttpRequest httpRequest) {
    var charges = Hotel.chargesOf(reservation().id);
    var cards = new ArrayList<Component>();
    for (int w = 1; w <= PAYEES.size(); w++) {
      final int window = w;
      var mine = charges.stream().filter(c -> c.window() == window).toList();
      var balance = mine.stream().map(c -> c.amount().add(c.tax())).reduce(BigDecimal.ZERO, BigDecimal::add);
      cards.add(
          DropZone.builder()
              .id("window" + w)
              .accept("charge")
              .actionId("moveCharges")
              .parameters(Map.of("window", w))
              .title("Window " + w)
              .subtitle(PAYEES.get(w - 1))
              .content(List.of(new Text("w" + w + "balance", balance + " € · " + mine.size() + " charges")))
              .build());
    }
    return List.of(
        new ResponsiveGrid("windows", Collections.nCopies(PAYEES.size(), GridTrack.fill()), null, cards, null, ""));
  }

  @Override
  public boolean supportsAction(String actionId) {
    return "search".equals(actionId) || "moveCharges".equals(actionId);
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<>(Listing.super.actions(httpRequest));
    actions.add(Action.builder().id("moveCharges").build());
    return actions;
  }

  @Override
  @SuppressWarnings("unchecked")
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if (!"moveCharges".equals(actionId)) return Listing.super.handleAction(actionId, httpRequest);
    var p = httpRequest.runActionRq().parameters();
    int window = Integer.parseInt(String.valueOf(p.get("window")));
    var ids = (List<Object>) p.getOrDefault("_draggedIds", List.of());
    int moved = 0;
    for (var id : ids) {
      var charge = Hotel.CHARGES.stream().filter(c -> c.id().equals(String.valueOf(id))).findFirst();
      if (charge.isPresent() && charge.get().window() != window) {
        var c = charge.get();
        Hotel.CHARGES.set(
            Hotel.CHARGES.indexOf(c),
            new Hotel.Charge(c.id(), c.reservationId(), window, c.date(), c.code(), c.description(), c.amount(), c.tax()));
        moved++;
      }
    }
    // the page again: the windows' balances (its rows reload like on opening)
    return List.of(
        this,
        new Message(moved + (moved == 1 ? " charge" : " charges") + " moved to " + windowLabel(window)));
  }
}
