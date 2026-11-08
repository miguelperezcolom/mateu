package io.mateu.explorer.examples.behaviour.restlisting;

import io.mateu.explorer.examples.behaviour.listingdata.Order;
import io.mateu.explorer.examples.behaviour.listingdata.Orders;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * An ordinary REST endpoint — nothing Mateu about it. It searches, filters, sorts and pages on the
 * SERVER and answers {@code {content: [...], totalElements: n}}; the YAML listing reads that shape
 * with {@code itemsPath} / {@code totalPath}.
 */
@RestController
public class OrdersApi {

  @GetMapping("/explorer-api/orders")
  public Map<String, Object> orders(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "") String sort,
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "") String city) {
    var rows =
        Orders.ROWS.stream()
            .filter(o -> o.toString().toLowerCase().contains(search.toLowerCase()))
            .filter(o -> city.isBlank() || o.city.equalsIgnoreCase(city))
            .sorted(comparator(sort))
            .toList();
    int from = Math.min(page * size, rows.size());
    List<Order> content = rows.subList(from, Math.min(from + size, rows.size()));
    return Map.of("content", content, "totalElements", rows.size());
  }

  /** {@code sort=amount} or {@code sort=amount,desc}. */
  static Comparator<Order> comparator(String sort) {
    var parts = sort.split(",");
    Comparator<Order> by =
        switch (parts[0]) {
          case "customer" -> Comparator.comparing(o -> o.customer);
          case "city" -> Comparator.comparing(o -> o.city);
          case "amount" -> Comparator.comparing(o -> o.amount);
          case "date" -> Comparator.comparing(o -> o.date);
          default -> Comparator.comparing(o -> o.id);
        };
    return parts.length > 1 && "desc".equals(parts[1]) ? by.reversed() : by;
  }
}
