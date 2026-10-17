package io.mateu.sample1.app.journeys;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Aggregate;
import io.mateu.uidl.annotations.GroupBy;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;

/**
 * Totals and grouping on a CRUD listing (tests/journeys/listing.spec.ts): {@code @GroupBy region}
 * groups the rows with a subtotal per group, {@code @Aggregate} gives the footer totals — computed by
 * {@code CrudStore.summaries} over the whole FILTERED result, not the page. Read-only data.
 */
@UI("/j/sales")
@Title("Journey sales")
public class JSalesCrud extends AutoCrud<JSalesCrud.Sale> {

  public static class Sale implements Identifiable {
    public String id;
    @GroupBy public String region;
    public String product;

    @Aggregate(AggregateFunction.sum)
    public double amount;

    public Sale() {}

    Sale(String id, String region, String product, double amount) {
      this.id = id;
      this.region = region;
      this.product = product;
      this.amount = amount;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return id + " " + region + " " + product;
    }
  }

  static final List<Sale> SALES =
      List.of(
          new Sale("S-01", "North", "Chairs", 100),
          new Sale("S-02", "South", "Tables", 250),
          new Sale("S-03", "North", "Lamps", 40),
          new Sale("S-04", "South", "Chairs", 60),
          new Sale("S-05", "North", "Tables", 300));

  @Override
  public CrudStore<Sale> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Sale> findById(String id) {
        return SALES.stream().filter(s -> s.id.equals(id)).findFirst();
      }

      @Override
      public String save(Sale entity) {
        throw new UnsupportedOperationException("read-only fixture");
      }

      @Override
      public List<Sale> findAll() {
        return SALES;
      }

      @Override
      public void deleteAllById(List<String> ids) {
        throw new UnsupportedOperationException("read-only fixture");
      }
    };
  }
}
