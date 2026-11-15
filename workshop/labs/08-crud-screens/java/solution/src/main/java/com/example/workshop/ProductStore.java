package com.example.workshop;

import io.mateu.uidl.interfaces.CrudStore;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The data-access port the CRUD reads and writes through. Here it is an in-memory map; in a real
 * app it talks to your database.
 *
 * <p>One shared instance: the view model is created fresh on every request, so the data has to
 * live somewhere that outlives it.
 */
public class ProductStore implements CrudStore<Product> {

  public static final ProductStore INSTANCE = new ProductStore();

  private final Map<String, Product> db = new ConcurrentHashMap<>();

  private ProductStore() {
    var added = LocalDate.of(2026, 1, 15);
    save(new Product("P-001", "Espresso machine", 249.0, 12, ProductStatus.Available, added));
    save(new Product("P-002", "Coffee grinder", 89.5, 30, ProductStatus.Available, added));
    save(new Product("P-003", "Milk frother", 39.9, 0, ProductStatus.OutOfStock, added));
    save(new Product("P-004", "Pour-over kettle", 59.0, 3, ProductStatus.Discontinued, added));
  }

  @Override
  public Optional<Product> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Product product) {
    // Workshop, lab 08: the creation form has no addedOn — the store fills it in
    var stored =
        product.addedOn() != null
            ? product
            : new Product(
                product.id(),
                product.name(),
                product.price(),
                product.stock(),
                product.status(),
                LocalDate.now());
    db.put(stored.id(), stored);
    return stored.id();
  }

  @Override
  public List<Product> findAll() {
    return db.values().stream().sorted((a, b) -> a.id().compareTo(b.id())).toList();
  }

  @Override
  public void deleteAllById(List<String> ids) {
    ids.forEach(db::remove);
  }

  /** Workshop, lab 08: the code New proposes — one more than the highest P-nnn. */
  public String nextId() {
    int highest =
        db.keySet().stream()
            .filter(id -> id.matches("P-\\d+"))
            .mapToInt(id -> Integer.parseInt(id.substring(2)))
            .max()
            .orElse(0);
    return "P-%03d".formatted(highest + 1);
  }
}
