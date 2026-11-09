package io.mateu.explorer.examples.behaviour.bulkactions;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.explorer.examples.behaviour.listingdata.Order;
import io.mateu.explorer.examples.behaviour.listingdata.OrderStatus;
import io.mateu.explorer.examples.behaviour.listingdata.Orders;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.CrudStore;
import java.util.List;

/**
 * A {@code @ListToolbarButton} method is a bulk action: its button needs a selection, and a
 * {@code List<Order>} parameter receives the selected rows. {@code confirmationRequired} asks first;
 * {@code @Toolbar} says how the button looks and {@code @Action} what the confirmation says.
 */
@Title("Orders — bulk actions")
public class BulkOrdersCrud extends AutoCrud<Order> {

  @Override
  public CrudStore<Order> store() {
    return Orders.store();
  }

  @ListToolbarButton
  @Label("Mark as shipped")
  public List<Object> markAsShipped(List<Order> selection) {
    selection.forEach(o -> setStatus(o.id, OrderStatus.SHIPPED));
    return changed(Message.success(selection.size() + " orders marked as shipped"));
  }

  @ListToolbarButton(confirmationRequired = true)
  @Label("Cancel orders")
  @Toolbar(buttonStyle = ButtonStyle.secondary, buttonColor = ButtonColor.error)
  @Action(
      confirmationTitle = "Cancel orders",
      confirmationMessage = "The selected orders will be cancelled.",
      confirmationText = "Cancel them",
      confirmationDenialText = "Keep them")
  public List<Object> cancelOrders(List<Order> selection) {
    selection.forEach(o -> setStatus(o.id, OrderStatus.CANCELLED));
    return changed(Message.warning(selection.size() + " orders cancelled"));
  }

  /**
   * A returned Message only toasts — the rows on screen would stay as they were — so the answer
   * also tells the listing its rows changed, and it re-runs its search in place.
   */
  private static List<Object> changed(Message message) {
    return List.of(message, UICommand.dispatchEvent(Crud.LISTING_CHANGED_EVENT));
  }

  private static void setStatus(String id, OrderStatus status) {
    Orders.ROWS.stream().filter(o -> o.id.equals(id)).forEach(o -> o.status = status);
  }
}
