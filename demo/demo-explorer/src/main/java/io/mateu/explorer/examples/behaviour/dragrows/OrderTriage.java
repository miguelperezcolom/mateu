package io.mateu.explorer.examples.behaviour.dragrows;

import io.mateu.explorer.examples.behaviour.listingdata.Order;
import io.mateu.explorer.examples.behaviour.listingdata.OrderStatus;
import io.mateu.explorer.examples.behaviour.listingdata.Orders;
import io.mateu.uidl.annotations.DragRows;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.DropZone;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * {@code @DragRows("order")}: the rows can be dragged — the selected ones, or the one under the
 * pointer. Each {@link DropZone} that accepts "order" runs its action with the dragged ids
 * ({@code _draggedIds}) and its own parameters — here, the status to move the orders to.
 */
@Title("Order triage")
@DragRows("order")
public class OrderTriage implements Listing<OrderTriage.Row>, HeaderSupplier {

  public record Row(String id, String customer, String city, OrderStatus status, Double amount) {}

  static final List<OrderStatus> TARGETS =
      List.of(OrderStatus.OPEN, OrderStatus.ON_HOLD, OrderStatus.SHIPPED);

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.from(
        Orders.ROWS.stream()
            .filter(o -> TARGETS.contains(o.status))
            .map(o -> new Row(o.id, o.customer, o.city, o.status, o.amount))
            .toList());
  }

  @Override
  public boolean selectionEnabled() {
    return true;
  }

  /** One drop zone per status, above the listing, with its current count. */
  @Override
  public List<Component> header(HttpRequest httpRequest) {
    var zones = new ArrayList<Component>();
    for (var status : TARGETS) {
      long count = Orders.ROWS.stream().filter(o -> o.status == status).count();
      zones.add(
          DropZone.builder()
              .id("zone-" + status.name())
              .accept("order")
              .actionId("moveOrders")
              .parameters(Map.of("status", status.name()))
              .title(label(status))
              .subtitle("Drop orders here")
              .content(List.of(new Text(count + " orders")))
              .style("flex: 1;")
              .build());
    }
    return List.of(HorizontalLayout.builder().content(zones).spacing(true).fullWidth(true).build());
  }

  @Override
  public boolean supportsAction(String actionId) {
    return "search".equals(actionId) || "moveOrders".equals(actionId);
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<>(Listing.super.actions(httpRequest));
    actions.add(Action.builder().id("moveOrders").build());
    return actions;
  }

  @Override
  @SuppressWarnings("unchecked")
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if (!"moveOrders".equals(actionId)) {
      return Listing.super.handleAction(actionId, httpRequest);
    }
    var parameters = httpRequest.runActionRq().parameters();
    var status = OrderStatus.valueOf(String.valueOf(parameters.get("status")));
    var ids = ((List<Object>) parameters.getOrDefault("_draggedIds", List.of())).stream().map(String::valueOf).toList();
    int moved = 0;
    for (Order order : Orders.ROWS) {
      if (ids.contains(order.id) && order.status != status) {
        order.status = status;
        moved++;
      }
    }
    // the page again (the zones' counts, the rows) and a message
    return List.of(this, Message.success(moved + " moved to " + label(status)));
  }

  private static String label(OrderStatus status) {
    var name = status.name().replace('_', ' ').toLowerCase();
    return Character.toUpperCase(name.charAt(0)) + name.substring(1);
  }
}
