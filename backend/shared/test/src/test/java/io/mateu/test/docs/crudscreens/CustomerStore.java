package io.mateu.test.docs.crudscreens;

import io.mateu.uidl.interfaces.CrudStore;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/** An in-memory store, one per test (contributed to the harness as a bean). */
public class CustomerStore implements CrudStore<Customer> {

  private final Map<String, Customer> db = new ConcurrentHashMap<>();

  public CustomerStore() {
    save(
        new Customer(
            "C-001", "Ana Ruiz", "ana@example.com", LocalDate.of(2021, 3, 1), "VIP", 5000, 0));
    save(new Customer("C-002", "Ben Ode", null, LocalDate.of(2023, 9, 15), null, 1000, 0));
  }

  @Override
  public Optional<Customer> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Customer customer) {
    // the creation form has no customerSince: the store fills it in
    var stored =
        customer.customerSince() != null
            ? customer
            : new Customer(
                customer.id(),
                customer.name(),
                customer.email(),
                LocalDate.now(),
                customer.internalNotes(),
                customer.creditLimit(),
                customer.openOrders());
    db.put(stored.id(), stored);
    return stored.id();
  }

  @Override
  public List<Customer> findAll() {
    return db.values().stream().sorted((a, b) -> a.id().compareTo(b.id())).toList();
  }

  @Override
  public void deleteAllById(List<String> ids) {
    ids.forEach(db::remove);
  }

  public String nextId() {
    return "C-%03d".formatted(db.size() + 1);
  }

  public int openOrdersOf(String customerId) {
    return "C-001".equals(customerId) ? 3 : 0;
  }
}
