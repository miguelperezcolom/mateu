package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** In-memory data for the «Record master with page tabs» demo. */
public final class MasterTabsDb {

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Customer implements Identifiable {
    @ReadOnly String id;
    String name;
    String email;
    String city;

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Order implements Identifiable {
    @ReadOnly String id;
    @ReadOnly String customerId;
    String date;
    double amount;
    String status;

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return "Order " + id;
    }
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Invoice implements Identifiable {
    @ReadOnly String id;
    @ReadOnly String customerId;
    String date;
    double total;

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return "Invoice " + id;
    }
  }

  public static final List<Customer> CUSTOMERS = new ArrayList<>();
  public static final List<Order> ORDERS = new ArrayList<>();
  public static final List<Invoice> INVOICES = new ArrayList<>();
  public static final List<Invoice> PAYMENTS = new ArrayList<>();
  public static final AtomicInteger SEQ = new AtomicInteger(1000);

  static {
    String[] cities = {"Palma", "Madrid", "Lisboa", "Paris", "Berlin"};
    for (int i = 1; i <= 12; i++) {
      CUSTOMERS.add(
          new Customer("" + i, "Customer " + i, "c" + i + "@example.com", cities[i % cities.length]));
      for (int j = 1; j <= 23; j++) {
        ORDERS.add(
            new Order(
                i + "-" + j,
                "" + i,
                "2026-0" + (1 + j % 9) + "-1" + (j % 9),
                10.0 * j + i,
                j % 3 == 0 ? "SHIPPED" : "OPEN"));
      }
      for (int j = 1; j <= 4; j++) {
        INVOICES.add(new Invoice("F" + i + "-" + j, "" + i, "2026-0" + j + "-28", 100.0 * j + i));
        PAYMENTS.add(new Invoice("P" + i + "-" + j, "" + i, "2026-0" + j + "-30", 90.0 * j + i));
      }
    }
  }

  public static Customer customer(String id) {
    return CUSTOMERS.stream().filter(c -> c.id.equals(id)).findFirst().orElse(null);
  }

  private MasterTabsDb() {}
}
