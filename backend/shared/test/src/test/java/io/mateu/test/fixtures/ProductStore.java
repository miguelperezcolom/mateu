package io.mateu.test.fixtures;

import io.mateu.uidl.interfaces.CrudStore;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/** An in-memory store, one per test (contributed to the harness as a bean). */
public class ProductStore implements CrudStore<Product> {

  private final Map<String, Product> db = new ConcurrentHashMap<>();

  public ProductStore() {
    save(new Product("P-001", "Espresso machine", 249.0, ProductStatus.Available));
    save(new Product("P-002", "Coffee grinder", 89.5, ProductStatus.Available));
    save(new Product("P-003", "Milk frother", 39.9, ProductStatus.OutOfStock));
    save(new Product("P-004", "Pour-over kettle", 59.0, ProductStatus.Discontinued));
  }

  @Override
  public Optional<Product> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Product product) {
    db.put(product.id(), product);
    return product.id();
  }

  @Override
  public List<Product> findAll() {
    return db.values().stream().sorted((a, b) -> a.id().compareTo(b.id())).toList();
  }

  @Override
  public void deleteAllById(List<String> ids) {
    ids.forEach(db::remove);
  }
}
