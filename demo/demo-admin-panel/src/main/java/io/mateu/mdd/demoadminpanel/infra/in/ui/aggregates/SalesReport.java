package io.mateu.mdd.demoadminpanel.infra.in.ui.aggregates;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Aggregate;
import io.mateu.uidl.annotations.GroupBy;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Totals & row grouping demo (/aggregates-demo): the listing groups by region with per-group
 * subtotal rows and shows a totals footer computed over the WHOLE filtered set. Also carries a
 * bulk action (approve selected) to demo multi-row selection.
 */
@UI("/aggregates-demo")
@Title("Sales report")
public class SalesReport extends AutoCrud<SalesReport.Sale> {

  public static class Sale implements Identifiable {
    String id;
    @GroupBy String region;
    String product;

    @Aggregate(AggregateFunction.sum)
    @Stereotype(FieldStereotype.money)
    double amount;

    @Aggregate(AggregateFunction.count)
    String invoice;

    boolean approved;

    public Sale() {}

    public Sale(String region, String product, double amount, String invoice, boolean approved) {
      this.id = UUID.randomUUID().toString();
      this.region = region;
      this.product = product;
      this.amount = amount;
      this.invoice = invoice;
      this.approved = approved;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return region + " " + product + " " + invoice;
    }
  }

  private static final List<Sale> SALES = new ArrayList<>();

  static {
    SALES.add(new Sale("Norte", "Widget", 1200.50, "F-2026-001", true));
    SALES.add(new Sale("Norte", "Gadget", 340.00, "F-2026-002", false));
    SALES.add(new Sale("Norte", "Widget", 89.90, "F-2026-003", false));
    SALES.add(new Sale("Sur", "Widget", 2100.00, "F-2026-004", true));
    SALES.add(new Sale("Sur", "Gadget", 55.25, "F-2026-005", false));
    SALES.add(new Sale("Este", "Widget", 760.00, "F-2026-006", false));
    SALES.add(new Sale("Este", "Gadget", 430.10, "F-2026-007", true));
    SALES.add(new Sale("Este", "Widget", 15.75, null, false));
  }

  @ListToolbarButton
  @Label("Aprobar seleccionadas")
  public Message approve(List<Sale> selection, HttpRequest httpRequest) {
    selection.forEach(
        sale ->
            SALES.stream()
                .filter(stored -> stored.id().equals(sale.id()))
                .forEach(stored -> stored.approved = true));
    return new Message(selection.size() + " ventas aprobadas");
  }

  @Override
  public CrudStore<Sale> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Sale> findById(String id) {
        return SALES.stream().filter(sale -> sale.id().equals(id)).findFirst();
      }

      @Override
      public String save(Sale entity) {
        if (entity.id == null || entity.id.isBlank()) {
          entity.id = UUID.randomUUID().toString();
          SALES.add(entity);
        } else if (findById(entity.id).isPresent()) {
          SALES.replaceAll(sale -> sale.id().equals(entity.id()) ? entity : sale);
        } else {
          SALES.add(entity);
        }
        return entity.id;
      }

      @Override
      public List<Sale> findAll() {
        return SALES;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        SALES.removeIf(sale -> selectedIds.contains(sale.id()));
      }
    };
  }
}
