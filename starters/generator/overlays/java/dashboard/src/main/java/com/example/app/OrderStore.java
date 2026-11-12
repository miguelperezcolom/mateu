package com.example.app;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * The orders, in memory. In a real app this is your database or an API; the dashboard and the
 * listing only ask it questions. One shared instance: the view models are created fresh on every
 * request, so the data has to live somewhere that outlives them.
 */
public class OrderStore {

  public static final OrderStore INSTANCE = new OrderStore();

  private final List<Order> orders = new ArrayList<>();

  private OrderStore() {
    var today = LocalDate.now();
    String[] customers = {"Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark"};
    String[] products = {"Espresso machine", "Coffee grinder", "Milk frother", "Pour-over kettle"};
    double[] prices = {249.0, 89.5, 39.9, 59.0};
    OrderStatus[] statuses = OrderStatus.values();
    for (int i = 0; i < 24; i++) {
      int p = i % products.length;
      orders.add(
          new Order(
              String.format("O-%03d", i + 1),
              customers[i % customers.length],
              products[p],
              today.minusDays(i * 7L),
              prices[p] * (1 + i % 3),
              statuses[i % statuses.length]));
    }
  }

  public List<Order> findAll() {
    return List.copyOf(orders);
  }

  public long count(OrderStatus status) {
    return orders.stream().filter(o -> o.status() == status).count();
  }

  /** What has been earned: the paid and shipped orders. */
  public double revenue() {
    return orders.stream().filter(OrderStore::earned).mapToDouble(Order::amount).sum();
  }

  /** {@link #revenue()} per month, for the months of {@link #lastSixMonths()}. */
  public List<Double> revenuePerMonth() {
    var today = LocalDate.now();
    var result = new ArrayList<Double>();
    for (int back = 5; back >= 0; back--) {
      var month = today.minusMonths(back);
      result.add(
          orders.stream()
              .filter(OrderStore::earned)
              .filter(
                  o ->
                      o.date().getYear() == month.getYear()
                          && o.date().getMonth() == month.getMonth())
              .mapToDouble(Order::amount)
              .sum());
    }
    return result;
  }

  /** The last six months, oldest first ("Jun", "Jul"…). */
  public static List<String> lastSixMonths() {
    var today = LocalDate.now();
    var result = new ArrayList<String>();
    for (int back = 5; back >= 0; back--) {
      var name = today.minusMonths(back).getMonth().name();
      result.add(name.charAt(0) + name.substring(1, 3).toLowerCase());
    }
    return result;
  }

  private static boolean earned(Order o) {
    return o.status() == OrderStatus.Paid || o.status() == OrderStatus.Shipped;
  }
}
