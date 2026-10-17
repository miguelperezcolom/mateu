package io.mateu.sample1.app.journeys;

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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Totals, grouping and dragging rows to a destination (tests/journeys/listing.spec.ts): the charges
 * are grouped by window ({@code @GroupBy}) with a summed amount ({@code @Aggregate}); the two
 * windows above the table are {@code DropZone}s, and dropping rows on one moves them there.
 */
@UI("/j/charges")
@Title("Journey charges")
@DragRows("charge")
public class JChargesListing implements Listing<JChargesListing.ChargeRow>, HeaderSupplier {

  public record ChargeRow(
      String id,
      @GroupBy String window,
      String description,
      @Aggregate(AggregateFunction.sum) double amount) {}

  record Charge(String id, String description, double amount, int window) {}

  static final List<Charge> CHARGES = new java.util.concurrent.CopyOnWriteArrayList<>();

  static {
    reset();
  }

  static void reset() {
    CHARGES.clear();
    CHARGES.add(new Charge("C-1", "Room night", 100, 1));
    CHARGES.add(new Charge("C-2", "Minibar", 12, 1));
    CHARGES.add(new Charge("C-3", "Spa", 80, 1));
    CHARGES.add(new Charge("C-4", "Parking", 20, 2));
  }

  static String windowLabel(int window) {
    return "Window " + window;
  }

  @Override
  public ListingData<ChargeRow> search(SearchRequest request, HttpRequest httpRequest) {
    var rows = new ArrayList<ChargeRow>();
    for (var c : CHARGES) {
      rows.add(new ChargeRow(c.id(), windowLabel(c.window()), c.description(), c.amount()));
    }
    // grouped by window: a custom listing orders its rows itself (AutoCrud does it for @GroupBy)
    rows.sort(
        java.util.Comparator.comparing(ChargeRow::window).thenComparing(ChargeRow::id));
    return ListingData.from(rows);
  }

  @Override
  public boolean selectionEnabled() {
    return true;
  }

  @Override
  public List<Component> header(HttpRequest httpRequest) {
    var cards = new ArrayList<Component>();
    for (int w = 1; w <= 2; w++) {
      final int window = w;
      var count = CHARGES.stream().filter(c -> c.window() == window).count();
      cards.add(
          DropZone.builder()
              .id("window" + w)
              .accept("charge")
              .actionId("moveCharges")
              .parameters(Map.of("window", w))
              .title(windowLabel(w))
              .content(List.of(new Text("w" + w + "count", count + " charges")))
              .build());
    }
    return List.of(
        new ResponsiveGrid(
            "windows", Collections.nCopies(2, GridTrack.fill()), null, cards, null, ""));
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
    if (!"moveCharges".equals(actionId)) {
      return Listing.super.handleAction(actionId, httpRequest);
    }
    var p = httpRequest.runActionRq().parameters();
    int window = Integer.parseInt(String.valueOf(p.get("window")));
    var ids = (List<Object>) p.getOrDefault("_draggedIds", List.of());
    int moved = 0;
    synchronized (CHARGES) {
      for (var id : ids) {
        for (int i = 0; i < CHARGES.size(); i++) {
          var c = CHARGES.get(i);
          if (c.id().equals(String.valueOf(id)) && c.window() != window) {
            CHARGES.set(i, new Charge(c.id(), c.description(), c.amount(), window));
            moved++;
          }
        }
      }
    }
    return List.of(
        this,
        new Message(moved + (moved == 1 ? " charge" : " charges") + " moved to " + windowLabel(window)));
  }
}
