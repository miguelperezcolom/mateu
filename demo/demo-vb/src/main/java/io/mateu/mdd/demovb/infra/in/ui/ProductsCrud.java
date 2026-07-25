package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Fases 4–5 (listado + CRUD completo). {@code editInDrawer()} para capturar además el ciclo
 * drawer: New/row → fragment Add (Drawer), save → CloseModal + refresco del listado por evento.
 */
@UI("/products")
@Title("Products")
public class ProductsCrud extends AutoCrud<ProductsCrud.Product> {

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Product implements Identifiable {
    String id;
    @NotEmpty String name;
    String sku;
    String category;
    String supplier;

    @Min(0)
    double price;

    @Min(0)
    int stock;

    boolean active;

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  private static final List<Product> PRODUCTS =
      new ArrayList<>(
          List.of(
              new Product("1", "Laptop", "LP-100", "Computers", "Acme Corp", 1200, 14, true),
              new Product("2", "Mouse", "MS-210", "Peripherals", "Peritech", 25, 230, true),
              new Product("3", "Keyboard", "KB-305", "Peripherals", "Peritech", 45, 120, false)));

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudStore<Product> store() {
    return new CrudStore<>() {

      @Override
      public Optional<Product> findById(String id) {
        return PRODUCTS.stream().filter(p -> p.id().equals(id)).findFirst();
      }

      @Override
      public String save(Product entity) {
        if (entity.getId() == null || entity.getId().isBlank()) {
          entity.setId(UUID.randomUUID().toString());
          PRODUCTS.add(entity);
        } else {
          PRODUCTS.replaceAll(p -> p.id().equals(entity.id()) ? entity : p);
        }
        return entity.getId();
      }

      @Override
      public List<Product> findAll() {
        return PRODUCTS;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        PRODUCTS.removeIf(p -> selectedIds.contains(p.id()));
      }
    };
  }
}
