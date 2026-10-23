package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A record whose edit page holds a TABLE: an order and its lines, a plain {@code List<Line>} with
 * no {@code @DetailFormCustomisation} (so the wire's default form position, {@code right}). On
 * Redwood every editable list of a form edits its rows in a dialog — "+" below the table, Edit /
 * Remove per row — whatever that position says.
 */
@UI("/purchase-orders")
@Title("Purchase orders")
public class PurchaseOrdersCrud extends AutoCrud<PurchaseOrdersCrud.PurchaseOrder> {

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Line {
    String product;
    int quantity;
    double price;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class PurchaseOrder implements Identifiable {
    @ReadOnly String id;
    String supplier;
    @HiddenInList List<Line> lines = new ArrayList<>();

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return id + " · " + supplier;
    }
  }

  private static final List<PurchaseOrder> ORDERS =
      new ArrayList<>(
          List.of(
              new PurchaseOrder(
                  "PO-1",
                  "Acme",
                  new ArrayList<>(List.of(new Line("Widget", 10, 9.90), new Line("Gadget", 2, 19.50)))),
              new PurchaseOrder("PO-2", "Globex", new ArrayList<>(List.of(new Line("Gizmo", 5, 4.25))))));

  @Override
  public CrudStore<PurchaseOrder> store() {
    return new CrudStore<>() {
      @Override
      public Optional<PurchaseOrder> findById(String id) {
        return ORDERS.stream().filter(order -> order.id().equals(id)).findFirst();
      }

      @Override
      public String save(PurchaseOrder entity) {
        if (entity.getId() == null || entity.getId().isBlank()) {
          entity.setId(UUID.randomUUID().toString());
          ORDERS.add(entity);
        } else {
          ORDERS.replaceAll(order -> order.id().equals(entity.id()) ? entity : order);
        }
        return entity.getId();
      }

      @Override
      public List<PurchaseOrder> findAll() {
        return ORDERS;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        ORDERS.removeIf(order -> selectedIds.contains(order.id()));
      }
    };
  }
}
