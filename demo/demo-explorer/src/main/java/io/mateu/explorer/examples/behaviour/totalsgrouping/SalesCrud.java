package io.mateu.explorer.examples.behaviour.totalsgrouping;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Aggregate;
import io.mateu.uidl.annotations.GroupBy;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * {@code @GroupBy} groups the rows (each group with its subtotals), {@code @Aggregate} gives the
 * footer totals. Both are computed by {@code CrudStore.summaries} over the WHOLE filtered result —
 * not the visible page — so they stay right while you page and filter.
 */
@Title("Sales by region")
public class SalesCrud extends AutoCrud<SalesCrud.Sale> {

  public static class Sale implements Identifiable {
    public String id;
    @GroupBy public String region;
    public String product;

    @Aggregate(AggregateFunction.sum)
    public Integer units;

    @Aggregate(AggregateFunction.sum)
    public Double amount;

    public Sale() {}

    Sale(String id, String region, String product, Integer units, Double amount) {
      this.id = id;
      this.region = region;
      this.product = product;
      this.units = units;
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

  static final List<Sale> SALES = new ArrayList<>();

  static {
    String[] regions = {"North", "South", "East", "West"};
    String[] products = {"Chairs", "Tables", "Lamps", "Shelves", "Desks"};
    for (int i = 0; i < 50; i++) {
      int units = 1 + (i * 7) % 12;
      SALES.add(
          new Sale(
              "S-" + (101 + i),
              regions[(i * 3) % regions.length],
              products[i % products.length],
              units,
              units * (20.0 + (i * 13) % 90)));
    }
  }

  @Override
  public CrudStore<Sale> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Sale> findById(String id) {
        return SALES.stream().filter(s -> s.id.equals(id)).findFirst();
      }

      @Override
      public String save(Sale sale) {
        SALES.replaceAll(s -> s.id.equals(sale.id) ? sale : s);
        return sale.id;
      }

      @Override
      public List<Sale> findAll() {
        return List.copyOf(SALES);
      }

      @Override
      public void deleteAllById(List<String> ids) {
        SALES.removeIf(s -> ids.contains(s.id));
      }
    };
  }
}
