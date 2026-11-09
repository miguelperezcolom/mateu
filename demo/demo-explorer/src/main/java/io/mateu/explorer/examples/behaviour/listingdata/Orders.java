package io.mateu.explorer.examples.behaviour.listingdata;

import io.mateu.uidl.interfaces.CrudStore;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * The in-memory data behind the Listings & CRUD examples: 50 orders of a small shop, generated
 * deterministically (the same rows on every boot), and a {@link CrudStore} over them.
 *
 * <p>The store implements only the four required methods — search, filters, sorting and paging all
 * come from {@code CrudStore.find}'s in-memory default. A real store pushes them to the database by
 * overriding {@code find}.
 */
public final class Orders {

  private static final String[] CUSTOMERS = {
    "Ada Lovelace", "Alan Turing", "Grace Hopper", "Linus Torvalds", "Margaret Hamilton",
    "Dennis Ritchie", "Barbara Liskov", "Ken Thompson", "Radia Perlman", "John Backus"
  };
  private static final String[] CITIES = {"Palma", "Madrid", "Barcelona", "Valencia", "Sevilla"};

  /** The rows, shared by every example of the group (edits in one show in the others). */
  public static final List<Order> ROWS = new CopyOnWriteArrayList<>(generate());

  private Orders() {}

  static List<Order> generate() {
    var rows = new ArrayList<Order>();
    var start = LocalDate.of(2026, 9, 1);
    for (int i = 0; i < 50; i++) {
      rows.add(
          new Order(
              "ORD-" + (1001 + i),
              CUSTOMERS[(i * 7) % CUSTOMERS.length],
              CITIES[(i * 3) % CITIES.length],
              OrderStatus.values()[(i * 3 + i / 4) % OrderStatus.values().length],
              start.plusDays((i * 11) % 60),
              Math.round((25 + (i * 37) % 480 + (i % 4) * 0.25) * 100) / 100.0,
              1 + (i * 13) % 9));
    }
    return rows;
  }

  /** A store over {@link #ROWS}. */
  public static CrudStore<Order> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Order> findById(String id) {
        return ROWS.stream().filter(o -> o.id.equals(id)).findFirst();
      }

      @Override
      public String save(Order order) {
        if (order.id == null || order.id.isBlank()) {
          order.id = "ORD-" + (1001 + ROWS.size());
          ROWS.add(order);
        } else if (findById(order.id).isPresent()) {
          ROWS.replaceAll(o -> o.id.equals(order.id) ? order : o);
        } else {
          ROWS.add(order);
        }
        return order.id;
      }

      @Override
      public List<Order> findAll() {
        return List.copyOf(ROWS);
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ROWS.removeIf(o -> ids.contains(o.id));
      }
    };
  }
}
