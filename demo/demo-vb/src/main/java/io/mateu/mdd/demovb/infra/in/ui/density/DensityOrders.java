package io.mateu.mdd.demovb.infra.in.ui.density;

import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** The data the two density cruds share ({@link AiryOrdersCrud}, {@link DenseOrdersCrud}). */
public final class DensityOrders {

  public enum Status {
    PENDING,
    IN_PROGRESS,
    SHIPPED,
    CANCELLED
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Order implements Identifiable {
    String id;
    String customer;
    LocalDate date;
    int lines;
    double total;
    Status status;

    @Override
    public String id() {
      return id;
    }
  }

  private static final List<Order> ORDERS = new ArrayList<>();

  static {
    var customers = List.of("Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark", "Wayne");
    for (int i = 1; i <= 20; i++) {
      ORDERS.add(
          new Order(
              "ORD-%03d".formatted(i),
              customers.get(i % customers.size()),
              LocalDate.of(2026, 9, 1).plusDays(i),
              1 + i % 7,
              Math.round((40 + i * 37.5) * 100) / 100.0,
              Status.values()[i % Status.values().length]));
    }
  }

  private DensityOrders() {}

  static CrudStore<Order> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Order> findById(String id) {
        return ORDERS.stream().filter(o -> o.id().equals(id)).findFirst();
      }

      @Override
      public String save(Order entity) {
        ORDERS.removeIf(o -> o.id().equals(entity.id()));
        ORDERS.add(entity);
        return entity.id();
      }

      @Override
      public List<Order> findAll() {
        return ORDERS;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        ORDERS.removeIf(o -> selectedIds.contains(o.id()));
      }
    };
  }
}
