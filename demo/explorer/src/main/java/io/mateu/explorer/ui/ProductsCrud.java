package io.mateu.explorer.ui;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Explorer CRUD demo — the transactional backbone (listing + create/edit) under redwood-spectra. */
@UI("/products")
public class ProductsCrud extends AutoCrud<ProductsCrud.Product> {

  @Override
  public CrudStore<Product> store() {
    return new Repo();
  }

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Product implements Identifiable {
    String id;
    String name;
    String category;
    double price;
    int stock;

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static class Repo implements CrudStore<Product> {
    private static final Map<String, Product> db = new LinkedHashMap<>();

    static {
      db.put("p1", new Product("p1", "Laptop Pro 16", "Computers", 2499.0, 12));
      db.put("p2", new Product("p2", "27\" Monitor", "Displays", 349.0, 40));
      db.put("p3", new Product("p3", "Docking Station", "Accessories", 189.0, 25));
      db.put("p4", new Product("p4", "Mechanical Keyboard", "Accessories", 129.0, 60));
      db.put("p5", new Product("p5", "Wireless Mouse", "Accessories", 59.0, 120));
    }

    @Override
    public Optional<Product> findById(String id) {
      return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(Product entity) {
      if (entity.getId() == null || entity.getId().isBlank()) {
        entity.setId("p" + (db.size() + 1));
      }
      db.put(entity.getId(), entity);
      return entity.getId();
    }

    @Override
    public List<Product> findAll() {
      return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> ids) {
      ids.forEach(db::remove);
    }
  }
}
